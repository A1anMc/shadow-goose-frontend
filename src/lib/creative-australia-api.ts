import { apiMonitor } from './api-monitor';
import { monitorLogger } from './logger';

export interface CreativeAustraliaGrant {
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

export interface CreativeAustraliaResponse {
  grants: CreativeAustraliaGrant[];
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

class CreativeAustraliaAPIService {
  private baseUrl = 'https://creativeaustralia.gov.au/api';
  private apiKey: string | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.initializeAPI();
  }

  private async initializeAPI(): Promise<void> {
    try {
      this.apiKey = process.env.CREATIVE_AUSTRALIA_API_KEY || null;
      
      if (!this.apiKey) {
        monitorLogger.warn('Creative Australia API key not configured, using fallback data', 'initializeAPI');
      } else {
        monitorLogger.info('Creative Australia API initialized successfully', 'initializeAPI');
      }
    } catch (error) {
      monitorLogger.error('Failed to initialize Creative Australia API', 'initializeAPI', error as Error);
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

  async getGrants(criteria: GrantSearchCriteria = {}): Promise<CreativeAustraliaResponse> {
    try {
      const apiData = await apiMonitor.getData('creative-australia-grants', { 
        useFallback: true
      });

      if (apiData && apiData.grants) {
        monitorLogger.info('Retrieved grants from API monitor', 'getGrants', { count: apiData.grants.length });
        return apiData as CreativeAustraliaResponse;
      }

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
      const response = await this.makeRequest<CreativeAustraliaResponse>(endpoint);

      monitorLogger.info('Retrieved grants from Creative Australia API', 'getGrants', { 
        count: response.grants.length,
        total: response.total 
      });

      return response;
    } catch (error) {
      monitorLogger.warn('Creative Australia API failed, using fallback data', 'getGrants');
      
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

  async getGrantById(id: string): Promise<CreativeAustraliaGrant | null> {
    try {
      const endpoint = `/grants/${id}`;
      const grant = await this.makeRequest<CreativeAustraliaGrant>(endpoint);
      
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

  private async getFallbackGrants(criteria: GrantSearchCriteria): Promise<CreativeAustraliaGrant[]> {
    const fallbackGrants: CreativeAustraliaGrant[] = [
      {
        id: 'ca-001',
        title: 'Creative Australia Arts Project Funding',
        description: 'Support for innovative arts projects that engage communities and create cultural impact.',
        amount: { min: 10000, max: 100000, currency: 'AUD' },
        deadline: '2025-12-15',
        category: 'Arts Project',
        eligibility: ['Arts organizations', 'Individual artists', 'Community groups'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        industry: ['Arts', 'Culture', 'Community'],
        application_url: 'https://creativeaustralia.gov.au/grants/arts-project',
        contact_info: {
          email: 'arts@creativeaustralia.gov.au',
          phone: '+61 2 9215 9000',
          website: 'https://creativeaustralia.gov.au'
        },
        last_updated: '2025-08-27',
        status: 'open',
        tags: ['arts', 'community', 'culture', 'innovation'],
        requirements: ['Project proposal', 'Budget plan', 'Community engagement strategy'],
        success_rate: 35
      },
      {
        id: 'ca-002',
        title: 'Indigenous Arts Development Grant',
        description: 'Supporting Indigenous artists and cultural practitioners in developing their practice.',
        amount: { min: 5000, max: 50000, currency: 'AUD' },
        deadline: '2025-11-30',
        category: 'Indigenous Arts',
        eligibility: ['Indigenous artists', 'Indigenous organizations', 'Cultural practitioners'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        industry: ['Indigenous Arts', 'Culture', 'Heritage'],
        application_url: 'https://creativeaustralia.gov.au/grants/indigenous-arts',
        contact_info: {
          email: 'indigenous@creativeaustralia.gov.au',
          phone: '+61 2 9215 9000',
          website: 'https://creativeaustralia.gov.au'
        },
        last_updated: '2025-08-26',
        status: 'open',
        tags: ['indigenous', 'arts', 'culture', 'development'],
        requirements: ['Cultural consultation plan', 'Artist statement', 'Project timeline'],
        success_rate: 40
      },
      {
        id: 'ca-003',
        title: 'Regional Arts Development Program',
        description: 'Supporting arts and cultural development in regional and remote communities.',
        amount: { min: 2000, max: 25000, currency: 'AUD' },
        deadline: '2025-10-15',
        category: 'Regional Arts',
        eligibility: ['Regional organizations', 'Local councils', 'Community groups'],
        location: ['Regional NSW', 'Regional VIC', 'Regional QLD', 'Regional WA', 'Regional SA', 'Regional TAS'],
        industry: ['Regional Arts', 'Community Development', 'Culture'],
        application_url: 'https://creativeaustralia.gov.au/grants/regional-arts',
        contact_info: {
          email: 'regional@creativeaustralia.gov.au',
          phone: '+61 2 9215 9000',
          website: 'https://creativeaustralia.gov.au'
        },
        last_updated: '2025-08-25',
        status: 'open',
        tags: ['regional', 'arts', 'community', 'development'],
        requirements: ['Community consultation', 'Regional impact plan', 'Partnership agreements'],
        success_rate: 45
      }
    ];

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
      'Arts Project',
      'Indigenous Arts',
      'Regional Arts',
      'Music',
      'Theatre',
      'Visual Arts',
      'Literature',
      'Dance',
      'Community Arts',
      'Cultural Development'
    ];
  }

  private getFallbackIndustries(): string[] {
    return [
      'Arts',
      'Culture',
      'Music',
      'Theatre',
      'Visual Arts',
      'Literature',
      'Dance',
      'Community Development',
      'Indigenous Arts',
      'Regional Development'
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
      'Regional NSW',
      'Regional VIC',
      'Regional QLD',
      'Regional WA',
      'Regional SA',
      'Regional TAS'
    ];
  }

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

export const creativeAustraliaAPI = new CreativeAustraliaAPIService();
