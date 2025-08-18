// SGE Grant Discovery & Matching Engine
// Advanced ML-powered grant discovery for SGE's specific needs

import { SGEGrant, SGEProfile, SGEGrantMatch, SGESearchFilters } from '../types/sge-types';
import { sgeMLService } from './sge-ml-service';

export interface SGEGrantSource {
  id: string;
  name: string;
  baseUrl: string;
  apiEndpoint?: string;
  categories: string[];
  mediaTypes: string[];
  culturalFocus: boolean;
  socialImpact: boolean;
  lastUpdated: string;
  isActive: boolean;
}

export interface SGEGrantDiscoveryConfig {
  sources: SGEGrantSource[];
  refreshInterval: number; // minutes
  maxResults: number;
  minMatchScore: number;
}

export interface SGEGrantDiscoveryResult {
  grants: SGEGrant[];
  totalFound: number;
  sourcesSearched: number;
  matchDistribution: {
    high: number; // 80%+
    medium: number; // 60-79%
    low: number; // 40-59%
  };
  recommendations: string[];
  nextRefresh: string;
}

export class SGEGrantDiscoveryEngine {
  private config: SGEGrantDiscoveryConfig;
  private sgeProfile: SGEProfile;
  private discoveredGrants: Map<string, SGEGrant> = new Map();
  private lastRefresh: Date = new Date();

  constructor(config: SGEGrantDiscoveryConfig, sgeProfile: SGEProfile) {
    this.config = config;
    this.sgeProfile = sgeProfile;
  }

  // Discover new grants from all sources
  async discoverNewGrants(): Promise<SGEGrantDiscoveryResult> {
    try {
      const allGrants: SGEGrant[] = [];
      let totalFound = 0;
      let sourcesSearched = 0;

      // Search each active source
      for (const source of this.config.sources.filter(s => s.isActive)) {
        try {
          const sourceGrants = await this.searchSource(source);
          allGrants.push(...sourceGrants);
          totalFound += sourceGrants.length;
          sourcesSearched++;
        } catch (error) {
          console.error(`Error searching source ${source.name}:`, error);
        }
      }

      // Apply ML matching and filtering
      const matchedGrants = await this.applyMLMatching(allGrants);
      
      // Filter by minimum match score
      const filteredGrants = matchedGrants.filter(grant => 
        (grant.sge_alignment_score || 0) >= this.config.minMatchScore
      );

      // Sort by SGE alignment score
      const sortedGrants = filteredGrants.sort((a, b) => 
        (b.sge_alignment_score || 0) - (a.sge_alignment_score || 0)
      );

      // Limit results
      const limitedGrants = sortedGrants.slice(0, this.config.maxResults);

      // Update discovered grants cache
      limitedGrants.forEach(grant => {
        this.discoveredGrants.set(grant.id.toString(), grant);
      });

      // Calculate match distribution
      const matchDistribution = this.calculateMatchDistribution(limitedGrants);

      // Generate recommendations
      const recommendations = this.generateDiscoveryRecommendations(limitedGrants);

      this.lastRefresh = new Date();

      return {
        grants: limitedGrants,
        totalFound,
        sourcesSearched,
        matchDistribution,
        recommendations,
        nextRefresh: new Date(Date.now() + this.config.refreshInterval * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error in grant discovery:', error);
      throw error;
    }
  }

  // Search a specific grant source
  private async searchSource(source: SGEGrantSource): Promise<SGEGrant[]> {
    // This would integrate with actual grant APIs
    // For now, we'll simulate with SGE-specific mock data
    return this.generateSGESpecificGrants(source);
  }

  // Generate SGE-specific mock grants
  private generateSGESpecificGrants(source: SGEGrantSource): SGEGrant[] {
    const grants: SGEGrant[] = [];

    // Documentary grants
    if (source.mediaTypes.includes('documentary')) {
      grants.push({
        id: Math.floor(Math.random() * 10000),
        title: 'Documentary Development Grant - Cultural Stories',
        organization: source.name,
        amount: 25000 + Math.floor(Math.random() * 50000),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'documentary',
        status: 'open',
        description: 'Support for documentary projects that explore cultural diversity and community stories.',
        eligibility: 'Australian filmmakers, cultural organizations',
        requirements: 'Project proposal, budget, cultural consultation plan',
        application_url: `${source.baseUrl}/apply/documentary`,
        contact_info: 'grants@example.org',
        media_type: 'documentary',
        target_audience: ['general public', 'cultural communities'],
        social_impact_areas: ['cultural representation', 'community engagement'],
        cultural_representation: ['multicultural', 'indigenous'],
        diversity_focus: true,
        sge_status: 'discovered',
        team_assigned: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Digital media grants
    if (source.mediaTypes.includes('digital')) {
      grants.push({
        id: Math.floor(Math.random() * 10000),
        title: 'Digital Innovation Grant - Community Engagement',
        organization: source.name,
        amount: 15000 + Math.floor(Math.random() * 30000),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'digital',
        status: 'open',
        description: 'Funding for digital media projects that engage diverse communities.',
        eligibility: 'Digital media creators, community organizations',
        requirements: 'Digital strategy, community engagement plan',
        application_url: `${source.baseUrl}/apply/digital`,
        contact_info: 'digital@example.org',
        media_type: 'digital',
        target_audience: ['online communities', 'youth'],
        social_impact_areas: ['digital inclusion', 'community connection'],
        cultural_representation: ['diverse voices'],
        diversity_focus: true,
        sge_status: 'discovered',
        team_assigned: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Community engagement grants
    if (source.culturalFocus) {
      grants.push({
        id: Math.floor(Math.random() * 10000),
        title: 'Community Cultural Grant - Storytelling',
        organization: source.name,
        amount: 10000 + Math.floor(Math.random() * 20000),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'community',
        status: 'open',
        description: 'Support for community-based cultural storytelling projects.',
        eligibility: 'Community groups, cultural organizations',
        requirements: 'Community consultation, cultural plan',
        application_url: `${source.baseUrl}/apply/community`,
        contact_info: 'community@example.org',
        media_type: 'community',
        target_audience: ['local communities', 'cultural groups'],
        social_impact_areas: ['community cohesion', 'cultural preservation'],
        cultural_representation: ['indigenous', 'multicultural'],
        diversity_focus: true,
        sge_status: 'discovered',
        team_assigned: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Multicultural grants
    if (source.culturalFocus) {
      grants.push({
        id: Math.floor(Math.random() * 10000),
        title: 'Multicultural Media Grant - Diverse Voices',
        organization: source.name,
        amount: 20000 + Math.floor(Math.random() * 40000),
        deadline: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'multicultural',
        status: 'open',
        description: 'Funding for media projects that amplify diverse cultural voices.',
        eligibility: 'Multicultural organizations, diverse creators',
        requirements: 'Cultural authenticity plan, diverse team',
        application_url: `${source.baseUrl}/apply/multicultural`,
        contact_info: 'multicultural@example.org',
        media_type: 'multicultural',
        target_audience: ['diverse communities', 'general public'],
        social_impact_areas: ['cultural understanding', 'social inclusion'],
        cultural_representation: ['multicultural', 'diverse voices'],
        diversity_focus: true,
        sge_status: 'discovered',
        team_assigned: [],
        notes: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return grants;
  }

  // Apply ML matching to discovered grants
  private async applyMLMatching(grants: SGEGrant[]): Promise<SGEGrant[]> {
    const matchedGrants: SGEGrant[] = [];

    for (const grant of grants) {
      try {
        // Get ML match score
        const matchScore = sgeMLService.calculateSGEMatchScore(grant);
        
        // Get success prediction
        const successProbability = await sgeMLService.predictSGESuccess(grant);
        
        // Get SGE recommendations
        const recommendations = sgeMLService.generateSGERecommendations(grant);

        // Update grant with ML insights
        const enhancedGrant: SGEGrant = {
          ...grant,
          sge_alignment_score: matchScore * 100, // Convert to percentage
          success_prediction: successProbability * 100,
          sge_recommendations: recommendations,
          ml_analysis: {
            matchScore,
            successProbability,
            recommendations,
            analysisDate: new Date().toISOString()
          }
        };

        matchedGrants.push(enhancedGrant);
      } catch (error) {
        console.error(`Error applying ML matching to grant ${grant.id}:`, error);
        // Add grant without ML enhancements
        matchedGrants.push(grant);
      }
    }

    return matchedGrants;
  }

  // Calculate match distribution
  private calculateMatchDistribution(grants: SGEGrant[]): { high: number; medium: number; low: number } {
    let high = 0, medium = 0, low = 0;

    grants.forEach(grant => {
      const score = grant.sge_alignment_score || 0;
      if (score >= 80) high++;
      else if (score >= 60) medium++;
      else if (score >= 40) low++;
    });

    return { high, medium, low };
  }

  // Generate discovery recommendations
  private generateDiscoveryRecommendations(grants: SGEGrant[]): string[] {
    const recommendations: string[] = [];

    // Analyze grant distribution
    const mediaTypes = grants.map(g => g.media_type).filter(Boolean);
    const culturalGrants = grants.filter(g => g.cultural_representation && g.cultural_representation.length > 0);
    const impactGrants = grants.filter(g => g.social_impact_areas && g.social_impact_areas.length > 0);

    // Media type recommendations
    if (mediaTypes.length > 0) {
      const typeCounts = mediaTypes.reduce((acc, type) => {
        acc[type!] = (acc[type!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommon = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0];
      if (mostCommon) {
        recommendations.push(`Focus on ${mostCommon[0]} grants - ${mostCommon[1]} opportunities available`);
      }
    }

    // Cultural focus recommendations
    if (culturalGrants.length > 0) {
      recommendations.push(`${culturalGrants.length} grants with strong cultural representation focus`);
    }

    // Social impact recommendations
    if (impactGrants.length > 0) {
      recommendations.push(`${impactGrants.length} grants aligned with social impact goals`);
    }

    // Deadline recommendations
    const upcomingDeadlines = grants.filter(g => {
      const deadline = new Date(g.deadline);
      const now = new Date();
      const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30 && daysLeft > 0;
    });

    if (upcomingDeadlines.length > 0) {
      recommendations.push(`${upcomingDeadlines.length} grants with deadlines within 30 days`);
    }

    // High-scoring recommendations
    const highScoring = grants.filter(g => (g.sge_alignment_score || 0) >= 80);
    if (highScoring.length > 0) {
      recommendations.push(`${highScoring.length} grants with excellent SGE alignment (80%+)`);
    }

    return recommendations;
  }

  // Search grants with filters
  async searchGrants(filters: SGESearchFilters): Promise<SGEGrant[]> {
    try {
      // Get all discovered grants
      const allGrants = Array.from(this.discoveredGrants.values());

      // Apply filters
      let filteredGrants = allGrants;

      if (filters.media_type && filters.media_type.length > 0) {
        filteredGrants = filteredGrants.filter(g => 
          g.media_type && filters.media_type!.includes(g.media_type)
        );
      }

      if (filters.target_audience && filters.target_audience.length > 0) {
        filteredGrants = filteredGrants.filter(g => 
          g.target_audience && g.target_audience.some(audience => 
            filters.target_audience!.includes(audience)
          )
        );
      }

      if (filters.social_impact_areas && filters.social_impact_areas.length > 0) {
        filteredGrants = filteredGrants.filter(g => 
          g.social_impact_areas && g.social_impact_areas.some(impact => 
            filters.social_impact_areas!.includes(impact)
          )
        );
      }

      if (filters.cultural_representation && filters.cultural_representation.length > 0) {
        filteredGrants = filteredGrants.filter(g => 
          g.cultural_representation && g.cultural_representation.some(culture => 
            filters.cultural_representation!.includes(culture)
          )
        );
      }

      if (filters.diversity_focus !== undefined) {
        filteredGrants = filteredGrants.filter(g => g.diversity_focus === filters.diversity_focus);
      }

      if (filters.min_amount) {
        filteredGrants = filteredGrants.filter(g => g.amount >= filters.min_amount!);
      }

      if (filters.max_amount) {
        filteredGrants = filteredGrants.filter(g => g.amount <= filters.max_amount!);
      }

      if (filters.deadline_before) {
        filteredGrants = filteredGrants.filter(g => g.deadline <= filters.deadline_before!);
      }

      if (filters.sge_status && filters.sge_status.length > 0) {
        filteredGrants = filteredGrants.filter(g => 
          g.sge_status && filters.sge_status!.includes(g.sge_status)
        );
      }

      // Sort by SGE alignment score
      return filteredGrants.sort((a, b) => 
        (b.sge_alignment_score || 0) - (a.sge_alignment_score || 0)
      );
    } catch (error) {
      console.error('Error searching grants:', error);
      return [];
    }
  }

  // Get discovery statistics
  getDiscoveryStats(): {
    totalDiscovered: number;
    lastRefresh: string;
    sourcesActive: number;
    averageMatchScore: number;
    topCategories: string[];
  } {
    const grants = Array.from(this.discoveredGrants.values());
    const totalDiscovered = grants.length;
    
    const averageMatchScore = grants.length > 0 
      ? grants.reduce((sum, g) => sum + (g.sge_alignment_score || 0), 0) / grants.length 
      : 0;

    const categories = grants.map(g => g.category).filter(Boolean);
    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat!] = (acc[cat!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    const sourcesActive = this.config.sources.filter(s => s.isActive).length;

    return {
      totalDiscovered,
      lastRefresh: this.lastRefresh.toISOString(),
      sourcesActive,
      averageMatchScore,
      topCategories
    };
  }
}

// Default SGE grant sources
export const defaultSGEGrantSources: SGEGrantSource[] = [
  {
    id: 'screen-australia',
    name: 'Screen Australia',
    baseUrl: 'https://www.screenaustralia.gov.au',
    categories: ['documentary', 'digital', 'multicultural'],
    mediaTypes: ['documentary', 'digital'],
    culturalFocus: true,
    socialImpact: true,
    lastUpdated: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'creative-australia',
    name: 'Creative Australia',
    baseUrl: 'https://creative.gov.au',
    categories: ['arts', 'cultural', 'community'],
    mediaTypes: ['documentary', 'community', 'multicultural'],
    culturalFocus: true,
    socialImpact: true,
    lastUpdated: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'vicscreen',
    name: 'VicScreen',
    baseUrl: 'https://vicscreen.vic.gov.au',
    categories: ['documentary', 'digital', 'cultural'],
    mediaTypes: ['documentary', 'digital', 'community'],
    culturalFocus: true,
    socialImpact: true,
    lastUpdated: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'regional-arts-fund',
    name: 'Regional Arts Fund',
    baseUrl: 'https://regionalarts.com.au',
    categories: ['community', 'cultural', 'regional'],
    mediaTypes: ['community', 'multicultural'],
    culturalFocus: true,
    socialImpact: true,
    lastUpdated: new Date().toISOString(),
    isActive: true
  }
];

// Export singleton instance
export const sgeGrantDiscoveryEngine = new SGEGrantDiscoveryEngine(
  {
    sources: defaultSGEGrantSources,
    refreshInterval: 60, // 1 hour
    maxResults: 100,
    minMatchScore: 40
  },
  {
    media_focus: 'documentary',
    target_communities: ['diverse australian communities', 'multicultural communities', 'indigenous communities'],
    social_impact_areas: ['cultural representation', 'community engagement', 'social cohesion', 'diversity inclusion'],
    cultural_representation: ['multicultural', 'indigenous', 'diverse voices', 'cultural authenticity'],
    budget_range: [10000, 200000],
    team_capabilities: ['documentary production', 'cultural consultation', 'community engagement', 'impact measurement']
  }
);
