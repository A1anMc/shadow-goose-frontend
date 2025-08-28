import { apiMonitor } from './api-monitor';
import { monitorLogger } from './logger';

export interface ScreenAustraliaGrant {
  id: string;
  title: string;
  description: string;
  amount: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  category: string;
  eligibility: string[];
  location: string[];
  industry: string[];
  application_url: string;
  contact_info: {
    email: string;
    phone: string;
    website: string;
  };
  last_updated: string;
  status: 'open' | 'closed' | 'upcoming';
  tags: string[];
  requirements: string[];
  success_rate?: number;
}

export interface ScreenAustraliaResponse {
  grants: ScreenAustraliaGrant[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface GrantSearchCriteria {
  category?: string;
  location?: string[];
  amount_min?: number;
  amount_max?: number;
  deadline_after?: string;
  deadline_before?: string;
  industry?: string[];
  keywords?: string[];
  status?: 'open' | 'closed' | 'upcoming';
  page?: number;
  limit?: number;
}

class ScreenAustraliaAPIService {
  private baseUrl = 'https://screen.australia.gov.au/api';
  private apiKey: string | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializeAPI();
  }

  private async initializeAPI(): Promise<void> {
    try {
      // In a real implementation, this would be stored securely
      this.apiKey = process.env.SCREEN_AUSTRALIA_API_KEY || null;
      
      if (!this.apiKey) {
        monitorLogger.warn('Screen Australia API key not configured, using fallback data', 'initializeAPI');
      } else {
        monitorLogger.info('Screen Australia API initialized successfully', 'initializeAPI');
      }
    } catch (error) {
      monitorLogger.error('Failed to initialize Screen Australia API', 'initializeAPI', error as Error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      monitorLogger.debug('Returning cached data', 'makeRequest', { endpoint });
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      monitorLogger.info('API request successful', 'makeRequest', { endpoint, status: response.status });
      return data;
    } catch (error) {
      monitorLogger.error('API request failed', 'makeRequest', error as Error, { endpoint });
      throw error;
    }
  }

  async getGrants(criteria: GrantSearchCriteria = {}): Promise<ScreenAustraliaResponse> {
    try {
      // Try to get data from API monitor first
      const apiData = await apiMonitor.getData('screen-australia-grants', { 
        useFallback: true
      });

      if (apiData && apiData.grants) {
        monitorLogger.info('Retrieved grants from API monitor', 'getGrants', { count: apiData.grants.length });
        return apiData as ScreenAustraliaResponse;
      }

      // Fallback to direct API call
      const queryParams = new URLSearchParams();
      
      if (criteria.category) queryParams.append('category', criteria.category);
      if (criteria.location) queryParams.append('location', criteria.location.join(','));
      if (criteria.amount_min) queryParams.append('amount_min', criteria.amount_min.toString());
      if (criteria.amount_max) queryParams.append('amount_max', criteria.amount_max.toString());
      if (criteria.deadline_after) queryParams.append('deadline_after', criteria.deadline_after);
      if (criteria.deadline_before) queryParams.append('deadline_before', criteria.deadline_before);
      if (criteria.industry) queryParams.append('industry', criteria.industry.join(','));
      if (criteria.keywords) queryParams.append('keywords', criteria.keywords.join(','));
      if (criteria.status) queryParams.append('status', criteria.status);
      if (criteria.page) queryParams.append('page', criteria.page.toString());
      if (criteria.limit) queryParams.append('limit', criteria.limit.toString());

      const endpoint = `/grants?${queryParams.toString()}`;
      const response = await this.makeRequest<ScreenAustraliaResponse>(endpoint);

      monitorLogger.info('Retrieved grants from Screen Australia API', 'getGrants', { 
        count: response.grants.length,
        total: response.total 
      });

      return response;
    } catch (error) {
      monitorLogger.warn('Screen Australia API failed, using fallback data', 'getGrants');
      
      // Return fallback data
      const fallbackGrants = await this.getFallbackGrants(criteria);
      return {
        grants: fallbackGrants,
        total: fallbackGrants.length,
        page: 1,
        limit: fallbackGrants.length,
        has_more: false,
      };
    }
  }

  async getGrantById(id: string): Promise<ScreenAustraliaGrant | null> {
    try {
      const endpoint = `/grants/${id}`;
      const grant = await this.makeRequest<ScreenAustraliaGrant>(endpoint);
      
      monitorLogger.info('Retrieved grant by ID', 'getGrantById', { id });
      return grant;
    } catch (error) {
      monitorLogger.error('Failed to retrieve grant by ID', 'getGrantById', error as Error, { id });
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const endpoint = '/categories';
      const categories = await this.makeRequest<string[]>(endpoint);
      
      monitorLogger.info('Retrieved categories', 'getCategories', { count: categories.length });
      return categories;
    } catch (error) {
      monitorLogger.warn('Failed to retrieve categories, using fallback', 'getCategories');
      return this.getFallbackCategories();
    }
  }

  async getIndustries(): Promise<string[]> {
    try {
      const endpoint = '/industries';
      const industries = await this.makeRequest<string[]>(endpoint);
      
      monitorLogger.info('Retrieved industries', 'getIndustries', { count: industries.length });
      return industries;
    } catch (error) {
      monitorLogger.warn('Failed to retrieve industries, using fallback', 'getIndustries');
      return this.getFallbackIndustries();
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const endpoint = '/locations';
      const locations = await this.makeRequest<string[]>(endpoint);
      
      monitorLogger.info('Retrieved locations', 'getLocations', { count: locations.length });
      return locations;
    } catch (error) {
      monitorLogger.warn('Failed to retrieve locations, using fallback', 'getLocations');
      return this.getFallbackLocations();
    }
  }

  private async getFallbackGrants(criteria: GrantSearchCriteria): Promise<ScreenAustraliaGrant[]> {
    // Return realistic fallback data for Screen Australia grants
    const fallbackGrants: ScreenAustraliaGrant[] = [
      {
        id: 'sa-001',
        title: 'Screen Australia Feature Film Development',
        description: 'Support for the development of feature films with strong commercial potential and cultural significance.',
        amount: { min: 50000, max: 200000, currency: 'AUD' },
        deadline: '2025-12-31',
        category: 'Feature Film',
        eligibility: ['Australian filmmakers', 'Production companies', 'Screenwriters'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        industry: ['Film', 'Entertainment', 'Media'],
        application_url: 'https://screen.australia.gov.au/grants/feature-film-development',
        contact_info: {
          email: 'grants@screenaustralia.gov.au',
          phone: '+61 2 8113 5800',
          website: 'https://screen.australia.gov.au'
        },
        last_updated: '2025-08-27',
        status: 'open',
        tags: ['feature film', 'development', 'commercial'],
        requirements: ['Detailed treatment', 'Budget breakdown', 'Market analysis'],
        success_rate: 25
      },
      {
        id: 'sa-002',
        title: 'Documentary Production Funding',
        description: 'Funding for documentary projects that explore Australian stories and perspectives.',
        amount: { min: 25000, max: 150000, currency: 'AUD' },
        deadline: '2025-11-15',
        category: 'Documentary',
        eligibility: ['Documentary filmmakers', 'Production companies'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        industry: ['Documentary', 'Media', 'Education'],
        application_url: 'https://screen.australia.gov.au/grants/documentary-production',
        contact_info: {
          email: 'documentary@screenaustralia.gov.au',
          phone: '+61 2 8113 5800',
          website: 'https://screen.australia.gov.au'
        },
        last_updated: '2025-08-26',
        status: 'open',
        tags: ['documentary', 'Australian stories', 'production'],
        requirements: ['Treatment', 'Research plan', 'Distribution strategy'],
        success_rate: 30
      },
      {
        id: 'sa-003',
        title: 'Digital Media Innovation Grant',
        description: 'Support for innovative digital media projects including VR, AR, and interactive content.',
        amount: { min: 10000, max: 75000, currency: 'AUD' },
        deadline: '2025-10-30',
        category: 'Digital Media',
        eligibility: ['Digital media creators', 'Technology companies', 'Content developers'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        industry: ['Digital Media', 'Technology', 'VR/AR'],
        application_url: 'https://screen.australia.gov.au/grants/digital-media-innovation',
        contact_info: {
          email: 'digital@screenaustralia.gov.au',
          phone: '+61 2 8113 5800',
          website: 'https://screen.australia.gov.au'
        },
        last_updated: '2025-08-25',
        status: 'open',
        tags: ['digital media', 'innovation', 'VR', 'AR'],
        requirements: ['Project proposal', 'Technical specifications', 'Market potential'],
        success_rate: 20
      }
    ];

    // Apply filters based on criteria
    return fallbackGrants.filter(grant => {
      if (criteria.category && grant.category !== criteria.category) return false;
      if (criteria.location && !criteria.location.some(loc => grant.location.includes(loc))) return false;
      if (criteria.amount_min && grant.amount.max < criteria.amount_min) return false;
      if (criteria.amount_max && grant.amount.min > criteria.amount_max) return false;
      if (criteria.status && grant.status !== criteria.status) return false;
      if (criteria.industry && !criteria.industry.some(ind => grant.industry.includes(ind))) return false;
      if (criteria.keywords) {
        const grantText = `${grant.title} ${grant.description} ${grant.tags.join(' ')}`.toLowerCase();
        if (!criteria.keywords.some(keyword => grantText.includes(keyword.toLowerCase()))) return false;
      }
      return true;
    });
  }

  private getFallbackCategories(): string[] {
    return [
      'Feature Film',
      'Documentary',
      'Television',
      'Digital Media',
      'Short Film',
      'Animation',
      'Children\'s Content',
      'Indigenous Content',
      'Regional Content',
      'International Co-production'
    ];
  }

  private getFallbackIndustries(): string[] {
    return [
      'Film',
      'Television',
      'Digital Media',
      'Animation',
      'Documentary',
      'Entertainment',
      'Media',
      'Technology',
      'VR/AR',
      'Content Creation'
    ];
  }

  private getFallbackLocations(): string[] {
    return [
      'NSW',
      'VIC',
      'QLD',
      'WA',
      'SA',
      'TAS',
      'NT',
      'ACT',
      'National',
      'International'
    ];
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    monitorLogger.info('Cache cleared', 'clearCache');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const screenAustraliaAPI = new ScreenAustraliaAPIService();
