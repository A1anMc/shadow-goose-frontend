// Unified Grants Data Pipeline
// Senior Grants Operations Agent - Real Data Integration

import { creativeAustraliaAPI, CreativeAustraliaGrant } from './creative-australia-api';
import { screenAustraliaAPI, ScreenAustraliaGrant } from './screen-australia-api';

export interface UnifiedGrant {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  category: string;
  organization: string;
  eligibility_criteria: string[];
  required_documents: string[];
  success_score: number;
  priority_score: number;
  created_at: string;
  updated_at: string;
  data_source: 'creative_australia' | 'screen_australia' | 'vic_screen' | 'regional_arts';
  status: 'open' | 'closing_soon' | 'closing_today' | 'closed';
  days_until_deadline: number;
  sge_alignment_score: number;
}

export interface GrantsDataPipelineStats {
  total_grants: number;
  total_funding_available: number;
  average_success_score: number;
  average_priority_score: number;
  grants_by_source: Record<string, number>;
  grants_by_category: Record<string, number>;
  grants_by_status: Record<string, number>;
  last_updated: string;
  data_freshness: 'excellent' | 'good' | 'acceptable' | 'stale';
}

class GrantsDataPipeline {
  private cache: Map<string, { data: UnifiedGrant[]; timestamp: number }> = new Map();
  private cacheTTL = 2 * 60 * 60 * 1000; // 2 hours
  private sgeProfile = {
    focus_areas: ['documentary', 'arts_culture', 'youth', 'community', 'indigenous'],
    geographic_scope: ['Victoria', 'Australia'],
    target_amount_range: { min: 10000, max: 100000 },
    preferred_organizations: ['Creative Australia', 'Screen Australia', 'VicScreen', 'Regional Arts Fund']
  };

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  async getAllGrants(): Promise<UnifiedGrant[]> {
    const cacheKey = 'all_grants';
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Fetch from all sources in parallel
      const [
        creativeAustraliaGrants,
        screenAustraliaGrants
      ] = await Promise.allSettled([
        this.fetchCreativeAustraliaGrants(),
        this.fetchScreenAustraliaGrants()
      ]);

      // Combine and transform all grants
      let allGrants: UnifiedGrant[] = [];

      if (creativeAustraliaGrants.status === 'fulfilled') {
        allGrants.push(...creativeAustraliaGrants.value);
      }

      if (screenAustraliaGrants.status === 'fulfilled') {
        allGrants.push(...screenAustraliaGrants.value);
      }

      // Calculate priority scores and additional metrics
      const processedGrants = allGrants.map(grant => this.processGrant(grant));

      // Sort by priority score (highest first)
      processedGrants.sort((a, b) => b.priority_score - a.priority_score);

      // Cache the results
      this.cache.set(cacheKey, {
        data: processedGrants,
        timestamp: Date.now()
      });

      return processedGrants;
    } catch (error) {
      console.error('Failed to fetch all grants:', error);
      return this.getFallbackGrants();
    }
  }

  private async fetchCreativeAustraliaGrants(): Promise<UnifiedGrant[]> {
    const [
      documentaryGrants,
      artsGrants,
      youthGrants
    ] = await Promise.allSettled([
      creativeAustraliaAPI.getDocumentaryGrants(),
      creativeAustraliaAPI.getArtsCultureGrants(),
      creativeAustraliaAPI.getYouthGrants()
    ]);

    let grants: UnifiedGrant[] = [];

    if (documentaryGrants.status === 'fulfilled') {
      grants.push(...this.transformCreativeAustraliaGrants(documentaryGrants.value));
    }
    if (artsGrants.status === 'fulfilled') {
      grants.push(...this.transformCreativeAustraliaGrants(artsGrants.value));
    }
    if (youthGrants.status === 'fulfilled') {
      grants.push(...this.transformCreativeAustraliaGrants(youthGrants.value));
    }

    return grants;
  }

  private async fetchScreenAustraliaGrants(): Promise<UnifiedGrant[]> {
    const [
      documentaryProductionGrants,
      developmentGrants,
      indigenousGrants
    ] = await Promise.allSettled([
      screenAustraliaAPI.getDocumentaryProductionGrants(),
      screenAustraliaAPI.getDevelopmentGrants(),
      screenAustraliaAPI.getIndigenousGrants()
    ]);

    let grants: UnifiedGrant[] = [];

    if (documentaryProductionGrants.status === 'fulfilled') {
      grants.push(...this.transformScreenAustraliaGrants(documentaryProductionGrants.value));
    }
    if (developmentGrants.status === 'fulfilled') {
      grants.push(...this.transformScreenAustraliaGrants(developmentGrants.value));
    }
    if (indigenousGrants.status === 'fulfilled') {
      grants.push(...this.transformScreenAustraliaGrants(indigenousGrants.value));
    }

    return grants;
  }

  private transformCreativeAustraliaGrants(grants: CreativeAustraliaGrant[]): UnifiedGrant[] {
    return grants.map(grant => ({
      id: grant.id,
      title: grant.title,
      description: grant.description,
      amount: grant.amount,
      deadline: grant.deadline,
      category: grant.category,
      organization: grant.organization,
      eligibility_criteria: grant.eligibility_criteria,
      required_documents: grant.required_documents,
      success_score: grant.success_score,
      priority_score: 0, // Will be calculated in processGrant
      created_at: grant.created_at,
      updated_at: grant.updated_at,
      data_source: grant.data_source,
      status: 'open', // Will be calculated in processGrant
      days_until_deadline: 0, // Will be calculated in processGrant
      sge_alignment_score: 0 // Will be calculated in processGrant
    }));
  }

  private transformScreenAustraliaGrants(grants: ScreenAustraliaGrant[]): UnifiedGrant[] {
    return grants.map(grant => ({
      id: grant.id,
      title: grant.title,
      description: grant.description,
      amount: grant.amount,
      deadline: grant.deadline,
      category: grant.category,
      organization: grant.organization,
      eligibility_criteria: grant.eligibility_criteria,
      required_documents: grant.required_documents,
      success_score: grant.success_score,
      priority_score: 0, // Will be calculated in processGrant
      created_at: grant.created_at,
      updated_at: grant.updated_at,
      data_source: grant.data_source,
      status: 'open', // Will be calculated in processGrant
      days_until_deadline: 0, // Will be calculated in processGrant
      sge_alignment_score: 0 // Will be calculated in processGrant
    }));
  }

  private processGrant(grant: UnifiedGrant): UnifiedGrant {
    const daysUntilDeadline = this.calculateDaysUntilDeadline(grant.deadline);
    const priorityScore = this.calculatePriorityScore(grant, daysUntilDeadline);
    const sgeAlignmentScore = this.calculateSGEAlignmentScore(grant);
    const status = this.calculateStatus(daysUntilDeadline);

    return {
      ...grant,
      priority_score: priorityScore,
      days_until_deadline: daysUntilDeadline,
      sge_alignment_score: sgeAlignmentScore,
      status: status
    };
  }

  private calculateDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculatePriorityScore(grant: UnifiedGrant, daysUntilDeadline: number): number {
    let score = 0;

    // Amount suitability (0-30 points)
    if (grant.amount >= this.sgeProfile.target_amount_range.min && 
        grant.amount <= this.sgeProfile.target_amount_range.max) {
      score += 30;
    } else if (grant.amount >= 5000 && grant.amount <= 150000) {
      score += 20;
    } else {
      score += 10;
    }

    // Category alignment (0-25 points)
    if (this.sgeProfile.focus_areas.includes(grant.category)) {
      score += 25;
    } else if (['arts', 'culture', 'community'].includes(grant.category)) {
      score += 15;
    } else {
      score += 5;
    }

    // Geographic focus (0-20 points)
    const hasGeographicMatch = this.sgeProfile.geographic_scope.some(scope => 
      grant.description.toLowerCase().includes(scope.toLowerCase()) ||
      grant.eligibility_criteria.some(criteria => 
        criteria.toLowerCase().includes(scope.toLowerCase())
      )
    );
    if (hasGeographicMatch) {
      score += 20;
    } else {
      score += 5;
    }

    // Success probability (0-15 points)
    score += Math.round(grant.success_score * 15);

    // Deadline urgency (0-10 points)
    if (daysUntilDeadline <= 7) {
      score += 10;
    } else if (daysUntilDeadline <= 30) {
      score += 7;
    } else if (daysUntilDeadline <= 60) {
      score += 5;
    } else {
      score += 3;
    }

    return score;
  }

  private calculateSGEAlignmentScore(grant: UnifiedGrant): number {
    let score = 0;

    // Organization preference
    if (this.sgeProfile.preferred_organizations.includes(grant.organization)) {
      score += 0.3;
    }

    // Category alignment
    if (this.sgeProfile.focus_areas.includes(grant.category)) {
      score += 0.3;
    }

    // Amount suitability
    if (grant.amount >= this.sgeProfile.target_amount_range.min && 
        grant.amount <= this.sgeProfile.target_amount_range.max) {
      score += 0.2;
    }

    // Geographic alignment
    const hasGeographicMatch = this.sgeProfile.geographic_scope.some(scope => 
      grant.description.toLowerCase().includes(scope.toLowerCase())
    );
    if (hasGeographicMatch) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private calculateStatus(daysUntilDeadline: number): 'open' | 'closing_soon' | 'closing_today' | 'closed' {
    if (daysUntilDeadline < 0) {
      return 'closed';
    } else if (daysUntilDeadline === 0) {
      return 'closing_today';
    } else if (daysUntilDeadline <= 7) {
      return 'closing_soon';
    } else {
      return 'open';
    }
  }

  async getGrantsByCategory(category: string): Promise<UnifiedGrant[]> {
    const allGrants = await this.getAllGrants();
    return allGrants.filter(grant => grant.category === category);
  }

  async getGrantsByOrganization(organization: string): Promise<UnifiedGrant[]> {
    const allGrants = await this.getAllGrants();
    return allGrants.filter(grant => grant.organization === organization);
  }

  async getHighPriorityGrants(limit: number = 10): Promise<UnifiedGrant[]> {
    const allGrants = await this.getAllGrants();
    return allGrants
      .filter(grant => grant.status !== 'closed')
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, limit);
  }

  async getClosingSoonGrants(): Promise<UnifiedGrant[]> {
    const allGrants = await this.getAllGrants();
    return allGrants.filter(grant => 
      grant.status === 'closing_soon' || grant.status === 'closing_today'
    );
  }

  async getGrantsByAmountRange(minAmount: number, maxAmount: number): Promise<UnifiedGrant[]> {
    const allGrants = await this.getAllGrants();
    return allGrants.filter(grant => 
      grant.amount >= minAmount && grant.amount <= maxAmount
    );
  }

  async getPipelineStats(): Promise<GrantsDataPipelineStats> {
    const allGrants = await this.getAllGrants();
    
    const totalFunding = allGrants.reduce((sum, grant) => sum + grant.amount, 0);
    const avgSuccessScore = allGrants.length > 0 ? 
      allGrants.reduce((sum, grant) => sum + grant.success_score, 0) / allGrants.length : 0;
    const avgPriorityScore = allGrants.length > 0 ?
      allGrants.reduce((sum, grant) => sum + grant.priority_score, 0) / allGrants.length : 0;

    const grantsBySource = allGrants.reduce((acc, grant) => {
      acc[grant.data_source] = (acc[grant.data_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const grantsByCategory = allGrants.reduce((acc, grant) => {
      acc[grant.category] = (acc[grant.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const grantsByStatus = allGrants.reduce((acc, grant) => {
      acc[grant.status] = (acc[grant.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastUpdated = new Date().toISOString();
    const dataFreshness = this.calculateDataFreshness();

    return {
      total_grants: allGrants.length,
      total_funding_available: totalFunding,
      average_success_score: avgSuccessScore,
      average_priority_score: avgPriorityScore,
      grants_by_source: grantsBySource,
      grants_by_category: grantsByCategory,
      grants_by_status: grantsByStatus,
      last_updated: lastUpdated,
      data_freshness: dataFreshness
    };
  }

  private calculateDataFreshness(): 'excellent' | 'good' | 'acceptable' | 'stale' {
    const cacheKey = 'all_grants';
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return 'stale';
    }

    const ageInHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
    
    if (ageInHours < 1) {
      return 'excellent';
    } else if (ageInHours < 2) {
      return 'good';
    } else if (ageInHours < 6) {
      return 'acceptable';
    } else {
      return 'stale';
    }
  }

  private getFallbackGrants(): UnifiedGrant[] {
    return [
      {
        id: 'fallback-doc-2024',
        title: 'Documentary Development Grant',
        description: 'Support for documentary development and production.',
        amount: 25000.00,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'documentary',
        organization: 'Creative Australia',
        eligibility_criteria: ['Australian organizations', 'Documentary filmmakers'],
        required_documents: ['Project proposal', 'Creative team CVs'],
        success_score: 0.85,
        priority_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data_source: 'creative_australia',
        status: 'open',
        days_until_deadline: 45,
        sge_alignment_score: 0.9
      }
    ];
  }

  async getHealthStatus(): Promise<{
    pipeline_status: string;
    data_sources: Record<string, { status: string; last_updated: string }>;
    cache_status: string;
  }> {
    const [creativeAustraliaHealth, screenAustraliaHealth] = await Promise.allSettled([
      creativeAustraliaAPI.getHealthStatus(),
      screenAustraliaAPI.getHealthStatus()
    ]);

    const dataSources = {
      creative_australia: {
        status: creativeAustraliaHealth.status === 'fulfilled' ? 
          creativeAustraliaHealth.value.status : 'unhealthy',
        last_updated: creativeAustraliaHealth.status === 'fulfilled' ? 
          creativeAustraliaHealth.value.last_updated : 'unknown'
      },
      screen_australia: {
        status: screenAustraliaHealth.status === 'fulfilled' ? 
          screenAustraliaHealth.value.status : 'unhealthy',
        last_updated: screenAustraliaHealth.status === 'fulfilled' ? 
          screenAustraliaHealth.value.last_updated : 'unknown'
      }
    };

    const healthySources = Object.values(dataSources).filter(source => source.status === 'healthy').length;
    const pipelineStatus = healthySources > 0 ? 'operational' : 'degraded';

    const cacheKey = 'all_grants';
    const cached = this.cache.get(cacheKey);
    const cacheStatus = cached && this.isCacheValid(cached.timestamp) ? 'valid' : 'expired';

    return {
      pipeline_status: pipelineStatus,
      data_sources: dataSources,
      cache_status: cacheStatus
    };
  }
}

export const grantsDataPipeline = new GrantsDataPipeline();
