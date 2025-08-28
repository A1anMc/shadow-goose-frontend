import { creativeAustraliaAPI, CreativeAustraliaGrant } from './creative-australia-api';
import { fallbackAPI } from './fallback-api';
import { monitorLogger } from './logger';
import { screenAustraliaAPI, ScreenAustraliaGrant } from './screen-australia-api';

export interface GrantMatchingCriteria {
  industry: string[];
  location: string[];
  fundingAmount: {
    min: number;
    max: number;
  };
  eligibility: string[];
  deadline: Date;
  keywords: string[];
  category?: string;
  status?: 'open' | 'closed' | 'upcoming';
}

export interface GrantMatch {
  grant: UnifiedGrant;
  matchScore: number; // 0-100
  matchReasons: string[];
  priority: 'high' | 'medium' | 'low';
  source: 'screen_australia' | 'creative_australia' | 'fallback';
}

export interface UnifiedGrant {
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
  source: 'screen_australia' | 'creative_australia' | 'fallback';
}

export interface DiscoveryResult {
  matches: GrantMatch[];
  totalFound: number;
  searchCriteria: GrantMatchingCriteria;
  searchTime: number;
  sources: string[];
}

class GrantDiscoveryEngine {
  private readonly WEIGHTS = {
    industry: 25,
    location: 20,
    amount: 15,
    deadline: 15,
    keywords: 15,
    category: 10
  };

  private readonly PRIORITY_THRESHOLDS = {
    high: 80,
    medium: 60,
    low: 40
  };

  constructor() {
    monitorLogger.info('Grant Discovery Engine initialized', 'constructor');
  }

  async discoverGrants(criteria: GrantMatchingCriteria): Promise<DiscoveryResult> {
    const startTime = Date.now();
    monitorLogger.info('Starting grant discovery', 'discoverGrants', { criteria });

    try {
      // Fetch grants from all sources
      const [screenGrants, creativeGrants, fallbackGrants] = await Promise.allSettled([
        this.fetchScreenAustraliaGrants(criteria),
        this.fetchCreativeAustraliaGrants(criteria),
        this.fetchFallbackGrants(criteria)
      ]);

      // Unify and process grants
      const allGrants: UnifiedGrant[] = [];
      
      if (screenGrants.status === 'fulfilled') {
        allGrants.push(...this.unifyScreenAustraliaGrants(screenGrants.value));
      }
      
      if (creativeGrants.status === 'fulfilled') {
        allGrants.push(...this.unifyCreativeAustraliaGrants(creativeGrants.value));
      }
      
      if (fallbackGrants.status === 'fulfilled') {
        allGrants.push(...this.unifyFallbackGrants(fallbackGrants.value));
      }

      // Calculate matches
      const matches = this.calculateMatches(allGrants, criteria);
      
      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      const searchTime = Date.now() - startTime;
      const sources = this.getActiveSources(screenGrants, creativeGrants, fallbackGrants);

      monitorLogger.info('Grant discovery completed', 'discoverGrants', {
        totalFound: allGrants.length,
        matchesFound: matches.length,
        searchTime,
        sources
      });

      return {
        matches,
        totalFound: allGrants.length,
        searchCriteria: criteria,
        searchTime,
        sources
      };
    } catch (error) {
      monitorLogger.error('Grant discovery failed', 'discoverGrants', error as Error);
      throw error;
    }
  }

  private async fetchScreenAustraliaGrants(criteria: GrantMatchingCriteria): Promise<ScreenAustraliaGrant[]> {
    try {
      const response = await screenAustraliaAPI.getGrants({
        category: criteria.category,
        location: criteria.location,
        amount_min: criteria.fundingAmount.min,
        amount_max: criteria.fundingAmount.max,
        industry: criteria.industry,
        keywords: criteria.keywords,
        status: criteria.status
      });
      return response.grants;
    } catch (error) {
      monitorLogger.warn('Failed to fetch Screen Australia grants', 'fetchScreenAustraliaGrants');
      return [];
    }
  }

  private async fetchCreativeAustraliaGrants(criteria: GrantMatchingCriteria): Promise<CreativeAustraliaGrant[]> {
    try {
      const response = await creativeAustraliaAPI.getGrants({
        category: criteria.category,
        location: criteria.location,
        amount_min: criteria.fundingAmount.min,
        amount_max: criteria.fundingAmount.max,
        industry: criteria.industry,
        keywords: criteria.keywords,
        status: criteria.status
      });
      return response.grants;
    } catch (error) {
      monitorLogger.warn('Failed to fetch Creative Australia grants', 'fetchCreativeAustraliaGrants');
      return [];
    }
  }

  private async fetchFallbackGrants(criteria: GrantMatchingCriteria): Promise<any[]> {
    try {
      const grants = await fallbackAPI.getRealGrants();
      return grants.grants || [];
    } catch (error) {
      monitorLogger.warn('Failed to fetch fallback grants', 'fetchFallbackGrants');
      return [];
    }
  }

  private unifyScreenAustraliaGrants(grants: ScreenAustraliaGrant[]): UnifiedGrant[] {
    return grants.map(grant => ({
      id: `sa-${grant.id}`,
      title: grant.title,
      description: grant.description,
      amount: grant.amount,
      deadline: grant.deadline,
      category: grant.category,
      eligibility: grant.eligibility,
      location: grant.location,
      industry: grant.industry,
      application_url: grant.application_url,
      contact_info: grant.contact_info,
      last_updated: grant.last_updated,
      status: grant.status,
      tags: grant.tags,
      requirements: grant.requirements,
      success_rate: grant.success_rate,
      source: 'screen_australia' as const
    }));
  }

  private unifyCreativeAustraliaGrants(grants: CreativeAustraliaGrant[]): UnifiedGrant[] {
    return grants.map(grant => ({
      id: `ca-${grant.id}`,
      title: grant.title,
      description: grant.description,
      amount: grant.amount,
      deadline: grant.deadline,
      category: grant.category,
      eligibility: grant.eligibility,
      location: grant.location,
      industry: grant.industry,
      application_url: grant.application_url,
      contact_info: grant.contact_info,
      last_updated: grant.last_updated,
      status: grant.status,
      tags: grant.tags,
      requirements: grant.requirements,
      success_rate: grant.success_rate,
      source: 'creative_australia' as const
    }));
  }

  private unifyFallbackGrants(grants: any[]): UnifiedGrant[] {
    return grants.map(grant => ({
      id: `fb-${grant.id}`,
      title: grant.title,
      description: grant.description,
      amount: {
        min: grant.amount_min || grant.amount || 0,
        max: grant.amount_max || grant.amount || 0,
        currency: 'AUD'
      },
      deadline: grant.deadline || grant.closing_date,
      category: grant.category || 'General',
      eligibility: grant.eligibility || [],
      location: grant.location || ['National'],
      industry: grant.industry || ['General'],
      application_url: grant.application_url || grant.url,
      contact_info: {
        email: grant.contact_email || '',
        phone: grant.contact_phone || '',
        website: grant.website || ''
      },
      last_updated: grant.last_updated || new Date().toISOString(),
      status: grant.status || 'open',
      tags: grant.tags || [],
      requirements: grant.requirements || [],
      success_rate: grant.success_rate,
      source: 'fallback' as const
    }));
  }

  private calculateMatches(grants: UnifiedGrant[], criteria: GrantMatchingCriteria): GrantMatch[] {
    return grants.map(grant => {
      const matchScore = this.calculateMatchScore(grant, criteria);
      const matchReasons = this.getMatchReasons(grant, criteria);
      const priority = this.determinePriority(matchScore);

      return {
        grant,
        matchScore,
        matchReasons,
        priority,
        source: grant.source
      };
    }).filter(match => match.matchScore > 0);
  }

  private calculateMatchScore(grant: UnifiedGrant, criteria: GrantMatchingCriteria): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Industry matching
    if (criteria.industry.length > 0) {
      const industryScore = this.calculateIndustryMatch(grant.industry, criteria.industry);
      totalScore += industryScore * this.WEIGHTS.industry;
      totalWeight += this.WEIGHTS.industry;
    }

    // Location matching
    if (criteria.location.length > 0) {
      const locationScore = this.calculateLocationMatch(grant.location, criteria.location);
      totalScore += locationScore * this.WEIGHTS.location;
      totalWeight += this.WEIGHTS.location;
    }

    // Amount matching
    const amountScore = this.calculateAmountMatch(grant.amount, criteria.fundingAmount);
    totalScore += amountScore * this.WEIGHTS.amount;
    totalWeight += this.WEIGHTS.amount;

    // Deadline matching
    const deadlineScore = this.calculateDeadlineMatch(grant.deadline, criteria.deadline);
    totalScore += deadlineScore * this.WEIGHTS.deadline;
    totalWeight += this.WEIGHTS.deadline;

    // Keywords matching
    if (criteria.keywords.length > 0) {
      const keywordScore = this.calculateKeywordMatch(grant, criteria.keywords);
      totalScore += keywordScore * this.WEIGHTS.keywords;
      totalWeight += this.WEIGHTS.keywords;
    }

    // Category matching
    if (criteria.category) {
      const categoryScore = this.calculateCategoryMatch(grant.category, criteria.category);
      totalScore += categoryScore * this.WEIGHTS.category;
      totalWeight += this.WEIGHTS.category;
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  }

  private calculateIndustryMatch(grantIndustries: string[], criteriaIndustries: string[]): number {
    const grantIndustrySet = new Set(grantIndustries.map(i => i.toLowerCase()));
    const criteriaIndustrySet = new Set(criteriaIndustries.map(i => i.toLowerCase()));
    
    const intersection = new Set(Array.from(grantIndustrySet).filter(x => criteriaIndustrySet.has(x)));
    const union = new Set([...Array.from(grantIndustrySet), ...Array.from(criteriaIndustrySet)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateLocationMatch(grantLocations: string[], criteriaLocations: string[]): number {
    const grantLocationSet = new Set(grantLocations.map(l => l.toLowerCase()));
    const criteriaLocationSet = new Set(criteriaLocations.map(l => l.toLowerCase()));
    
    // Check for exact matches
    const exactMatches = new Set(Array.from(grantLocationSet).filter(x => criteriaLocationSet.has(x)));
    if (exactMatches.size > 0) return 1.0;
    
    // Check for national coverage
    if (grantLocationSet.has('national') || grantLocationSet.has('australia')) return 0.8;
    
    // Check for regional coverage
    if (grantLocationSet.has('regional')) return 0.6;
    
    return 0;
  }

  private calculateAmountMatch(grantAmount: { min: number; max: number }, criteriaAmount: { min: number; max: number }): number {
    const grantMid = (grantAmount.min + grantAmount.max) / 2;
    const criteriaMid = (criteriaAmount.min + criteriaAmount.max) / 2;
    
    // Perfect match if grant range overlaps with criteria range
    if (grantAmount.min <= criteriaAmount.max && grantAmount.max >= criteriaAmount.min) {
      return 1.0;
    }
    
    // Calculate distance from ideal range
    const distance = Math.abs(grantMid - criteriaMid);
    const maxDistance = Math.max(criteriaAmount.max - criteriaAmount.min, 10000);
    
    return Math.max(0, 1 - (distance / maxDistance));
  }

  private calculateDeadlineMatch(grantDeadline: string, criteriaDeadline: Date): number {
    const grantDate = new Date(grantDeadline);
    const now = new Date();
    const daysUntilGrantDeadline = (grantDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Prefer grants with more time (up to 90 days)
    if (daysUntilGrantDeadline < 0) return 0; // Past deadline
    if (daysUntilGrantDeadline <= 7) return 0.3; // Very urgent
    if (daysUntilGrantDeadline <= 30) return 0.6; // Urgent
    if (daysUntilGrantDeadline <= 90) return 1.0; // Ideal
    if (daysUntilGrantDeadline <= 180) return 0.8; // Good
    return 0.5; // Far future
  }

  private calculateKeywordMatch(grant: UnifiedGrant, keywords: string[]): number {
    const grantText = `${grant.title} ${grant.description} ${grant.tags.join(' ')}`.toLowerCase();
    const keywordMatches = keywords.filter(keyword => 
      grantText.includes(keyword.toLowerCase())
    );
    
    return keywords.length > 0 ? keywordMatches.length / keywords.length : 0;
  }

  private calculateCategoryMatch(grantCategory: string, criteriaCategory: string): number {
    return grantCategory.toLowerCase() === criteriaCategory.toLowerCase() ? 1.0 : 0;
  }

  private getMatchReasons(grant: UnifiedGrant, criteria: GrantMatchingCriteria): string[] {
    const reasons: string[] = [];
    
    // Industry match
    if (criteria.industry.length > 0) {
      const industryMatch = this.calculateIndustryMatch(grant.industry, criteria.industry);
      if (industryMatch > 0.5) {
        reasons.push(`Industry match: ${Math.round(industryMatch * 100)}%`);
      }
    }
    
    // Location match
    if (criteria.location.length > 0) {
      const locationMatch = this.calculateLocationMatch(grant.location, criteria.location);
      if (locationMatch > 0.5) {
        reasons.push(`Location match: ${Math.round(locationMatch * 100)}%`);
      }
    }
    
    // Amount match
    const amountMatch = this.calculateAmountMatch(grant.amount, criteria.fundingAmount);
    if (amountMatch > 0.7) {
      reasons.push(`Funding amount suitable: $${grant.amount.min.toLocaleString()} - $${grant.amount.max.toLocaleString()}`);
    }
    
    // Deadline urgency
    const deadlineMatch = this.calculateDeadlineMatch(grant.deadline, criteria.deadline);
    if (deadlineMatch > 0.8) {
      reasons.push('Deadline provides adequate time');
    } else if (deadlineMatch > 0.5) {
      reasons.push('Deadline approaching - apply soon');
    }
    
    // Keywords
    if (criteria.keywords.length > 0) {
      const keywordMatch = this.calculateKeywordMatch(grant, criteria.keywords);
      if (keywordMatch > 0.3) {
        reasons.push(`Keyword relevance: ${Math.round(keywordMatch * 100)}%`);
      }
    }
    
    return reasons;
  }

  private determinePriority(matchScore: number): 'high' | 'medium' | 'low' {
    if (matchScore >= this.PRIORITY_THRESHOLDS.high) return 'high';
    if (matchScore >= this.PRIORITY_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  private getActiveSources(screenGrants: PromiseSettledResult<ScreenAustraliaGrant[]>, 
                          creativeGrants: PromiseSettledResult<CreativeAustraliaGrant[]>, 
                          fallbackGrants: PromiseSettledResult<any[]>): string[] {
    const sources: string[] = [];
    
    if (screenGrants.status === 'fulfilled' && screenGrants.value.length > 0) {
      sources.push('Screen Australia');
    }
    
    if (creativeGrants.status === 'fulfilled' && creativeGrants.value.length > 0) {
      sources.push('Creative Australia');
    }
    
    if (fallbackGrants.status === 'fulfilled' && fallbackGrants.value.length > 0) {
      sources.push('Fallback API');
    }
    
    return sources;
  }

  // Utility methods for external use
  async getGrantById(id: string): Promise<UnifiedGrant | null> {
    try {
      if (id.startsWith('sa-')) {
        const grant = await screenAustraliaAPI.getGrantById(id.substring(3));
        return grant ? this.unifyScreenAustraliaGrants([grant])[0] : null;
      } else if (id.startsWith('ca-')) {
        const grant = await creativeAustraliaAPI.getGrantById(id.substring(3));
        return grant ? this.unifyCreativeAustraliaGrants([grant])[0] : null;
      } else {
        // Try fallback
        const grants = await fallbackAPI.getRealGrants();
        const grant = grants.grants.find(g => g.id === id.substring(3));
        return grant ? this.unifyFallbackGrants([grant])[0] : null;
      }
    } catch (error) {
      monitorLogger.error('Failed to get grant by ID', 'getGrantById', error as Error, { id });
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const [screenCategories, creativeCategories] = await Promise.allSettled([
        screenAustraliaAPI.getCategories(),
        creativeAustraliaAPI.getCategories()
      ]);
      
      const categories = new Set<string>();
      
      if (screenCategories.status === 'fulfilled') {
        screenCategories.value.forEach(cat => categories.add(cat));
      }
      
      if (creativeCategories.status === 'fulfilled') {
        creativeCategories.value.forEach(cat => categories.add(cat));
      }
      
      return Array.from(categories).sort();
    } catch (error) {
      monitorLogger.error('Failed to get categories', 'getCategories', error as Error);
      return [];
    }
  }

  async getIndustries(): Promise<string[]> {
    try {
      const [screenIndustries, creativeIndustries] = await Promise.allSettled([
        screenAustraliaAPI.getIndustries(),
        creativeAustraliaAPI.getIndustries()
      ]);
      
      const industries = new Set<string>();
      
      if (screenIndustries.status === 'fulfilled') {
        screenIndustries.value.forEach(ind => industries.add(ind));
      }
      
      if (creativeIndustries.status === 'fulfilled') {
        creativeIndustries.value.forEach(ind => industries.add(ind));
      }
      
      return Array.from(industries).sort();
    } catch (error) {
      monitorLogger.error('Failed to get industries', 'getIndustries', error as Error);
      return [];
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const [screenLocations, creativeLocations] = await Promise.allSettled([
        screenAustraliaAPI.getLocations(),
        creativeAustraliaAPI.getLocations()
      ]);
      
      const locations = new Set<string>();
      
      if (screenLocations.status === 'fulfilled') {
        screenLocations.value.forEach(loc => locations.add(loc));
      }
      
      if (creativeLocations.status === 'fulfilled') {
        creativeLocations.value.forEach(loc => locations.add(loc));
      }
      
      return Array.from(locations).sort();
    } catch (error) {
      monitorLogger.error('Failed to get locations', 'getLocations', error as Error);
      return [];
    }
  }
}

export const grantDiscoveryEngine = new GrantDiscoveryEngine();
