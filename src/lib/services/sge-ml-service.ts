// SGE-Specific ML Service
// Focused on SGE's actual business needs: media projects, cultural representation, social impact

import {
  SGEGrant,
  SGEApplication,
  SGEProfile,
  SGEGrantMatch,
  SGESuccessPrediction,
  SGEEnhancedStory,
  SGESearchFilters,
  SGEBusinessMetrics
} from '../types/sge-types';

export interface SGEMLConfig {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  sgeProfile: SGEProfile;
}

export interface SGEMLRequest {
  modelType: 'grant_matching' | 'success_prediction' | 'content_optimization' | 'impact_enhancement';
  inputData: any;
  options?: {
    includeConfidence?: boolean;
    includeFactors?: boolean;
    includeRecommendations?: boolean;
    sgeSpecific?: boolean;
  };
}

export interface SGEMLResponse {
  success: boolean;
  prediction: any;
  confidence?: number;
  factors?: string[];
  recommendations?: string[];
  sgeAlignment?: {
    mediaFit: number;
    culturalFit: number;
    impactFit: number;
    teamFit: number;
  };
  error?: string;
}

export class SGEMLService {
  private config: SGEMLConfig;
  private sgeProfile: SGEProfile;

  constructor(config: SGEMLConfig) {
    this.config = config;
    this.sgeProfile = config.sgeProfile;
  }

  // SGE Grant Matching Engine
  async findSGEGrantMatches(grants: SGEGrant[]): Promise<SGEGrantMatch[]> {
    try {
      const matches: SGEGrantMatch[] = [];

      for (const grant of grants) {
        const matchScore = this.calculateSGEMatchScore(grant);
        const sgeAlignment = this.calculateSGEAlignment(grant);
        const successProbability = await this.predictSGESuccess(grant);

        if (matchScore > 0.6) { // Only include good matches
          matches.push({
            grant,
            match_score: matchScore,
            sge_alignment: sgeAlignment,
            recommended_approach: this.generateSGERecommendations(grant),
            success_probability: successProbability
          });
        }
      }

      // Sort by match score descending
      return matches.sort((a, b) => b.match_score - a.match_score);
    } catch (error) {
      console.error('Error in SGE grant matching:', error);
      return [];
    }
  }

  // Calculate SGE-specific match score
  calculateSGEMatchScore(grant: SGEGrant): number {
    let score = 0;
    let factors = 0;

    // Media type alignment (40% weight)
    if (grant.media_type && this.sgeProfile.media_focus) {
      const mediaMatch = this.calculateMediaTypeMatch(grant.media_type, this.sgeProfile.media_focus);
      score += mediaMatch * 0.4;
      factors++;
    }

    // Cultural representation alignment (25% weight)
    if (grant.cultural_representation && this.sgeProfile.cultural_representation.length > 0) {
      const culturalMatch = this.calculateCulturalMatch(grant.cultural_representation, this.sgeProfile.cultural_representation);
      score += culturalMatch * 0.25;
      factors++;
    }

    // Social impact alignment (20% weight)
    if (grant.social_impact_areas && this.sgeProfile.social_impact_areas.length > 0) {
      const impactMatch = this.calculateImpactMatch(grant.social_impact_areas, this.sgeProfile.social_impact_areas);
      score += impactMatch * 0.2;
      factors++;
    }

    // Budget range alignment (15% weight)
    if (grant.amount && this.sgeProfile.budget_range) {
      const budgetMatch = this.calculateBudgetMatch(grant.amount, this.sgeProfile.budget_range);
      score += budgetMatch * 0.15;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  // Calculate SGE alignment breakdown
  private calculateSGEAlignment(grant: SGEGrant) {
    return {
      mediaFit: grant.media_type ? this.calculateMediaTypeMatch(grant.media_type, this.sgeProfile.media_focus) : 0,
      culturalFit: grant.cultural_representation ? this.calculateCulturalMatch(grant.cultural_representation, this.sgeProfile.cultural_representation) : 0,
      impactFit: grant.social_impact_areas ? this.calculateImpactMatch(grant.social_impact_areas, this.sgeProfile.social_impact_areas) : 0,
      teamFit: this.calculateTeamFit(grant)
    };
  }

  // Media type matching
  private calculateMediaTypeMatch(grantMediaType: string, sgeMediaFocus: string): number {
    const mediaTypeMap: { [key: string]: string[] } = {
      'documentary': ['documentary', 'film', 'video', 'media'],
      'digital': ['digital', 'online', 'web', 'interactive'],
      'community': ['community', 'local', 'grassroots', 'engagement'],
      'multicultural': ['multicultural', 'diversity', 'cultural', 'inclusive']
    };

    const sgeTypes = mediaTypeMap[sgeMediaFocus] || [];
    const grantTypes = mediaTypeMap[grantMediaType] || [];

    const intersection = sgeTypes.filter(type => grantTypes.includes(type));
    return intersection.length > 0 ? 1 : 0.3; // Partial match for related types
  }

  // Cultural representation matching
  private calculateCulturalMatch(grantCultures: string[], sgeCultures: string[]): number {
    const intersection = grantCultures.filter(culture => sgeCultures.includes(culture));
    return intersection.length / Math.max(grantCultures.length, sgeCultures.length);
  }

  // Social impact matching
  private calculateImpactMatch(grantImpacts: string[], sgeImpacts: string[]): number {
    const intersection = grantImpacts.filter(impact => sgeImpacts.includes(impact));
    return intersection.length / Math.max(grantImpacts.length, sgeImpacts.length);
  }

  // Budget range matching
  private calculateBudgetMatch(grantAmount: number, budgetRange: [number, number]): number {
    const [min, max] = budgetRange;
    if (grantAmount >= min && grantAmount <= max) {
      return 1; // Perfect match
    } else if (grantAmount >= min * 0.8 && grantAmount <= max * 1.2) {
      return 0.8; // Close match
    } else {
      return 0.3; // Poor match
    }
  }

  // Team capability matching
  private calculateTeamFit(grant: SGEGrant): number {
    // This would be enhanced with actual team capability data
    return 0.7; // Default reasonable fit
  }

  // SGE Success Prediction
  async predictSGESuccess(grant: SGEGrant): Promise<number> {
    try {
      // Base success probability based on SGE-specific factors
      let baseProbability = 0.5;

      // Adjust based on SGE alignment score
      if (grant.sge_alignment_score) {
        baseProbability += (grant.sge_alignment_score / 100) * 0.3;
      }

      // Adjust based on media type alignment
      if (grant.media_type && this.sgeProfile.media_focus) {
        const mediaMatch = this.calculateMediaTypeMatch(grant.media_type, this.sgeProfile.media_focus);
        baseProbability += mediaMatch * 0.2;
      }

      // Adjust based on cultural representation
      if (grant.cultural_representation && this.sgeProfile.cultural_representation.length > 0) {
        const culturalMatch = this.calculateCulturalMatch(grant.cultural_representation, this.sgeProfile.cultural_representation);
        baseProbability += culturalMatch * 0.15;
      }

      // Adjust based on diversity focus
      if (grant.diversity_focus) {
        baseProbability += 0.1;
      }

      return Math.min(Math.max(baseProbability, 0), 1); // Clamp between 0 and 1
    } catch (error) {
      console.error('Error in SGE success prediction:', error);
      return 0.5; // Default probability
    }
  }

  // Generate SGE-specific recommendations
  generateSGERecommendations(grant: SGEGrant): string[] {
    const recommendations: string[] = [];

    // Media-specific recommendations
    if (grant.media_type === 'documentary') {
      recommendations.push('Focus on storytelling and community impact');
      recommendations.push('Include diverse voices and perspectives');
    } else if (grant.media_type === 'digital') {
      recommendations.push('Emphasize innovation and digital engagement');
      recommendations.push('Highlight interactive and participatory elements');
    } else if (grant.media_type === 'community') {
      recommendations.push('Demonstrate strong community partnerships');
      recommendations.push('Show clear community engagement strategy');
    } else if (grant.media_type === 'multicultural') {
      recommendations.push('Highlight cultural authenticity and representation');
      recommendations.push('Include cultural consultation and partnerships');
    }

    // Cultural representation recommendations
    if (grant.cultural_representation && grant.cultural_representation.length > 0) {
      recommendations.push('Ensure authentic cultural representation');
      recommendations.push('Include cultural advisors and community input');
    }

    // Social impact recommendations
    if (grant.social_impact_areas && grant.social_impact_areas.length > 0) {
      recommendations.push('Quantify social impact with measurable outcomes');
      recommendations.push('Include community feedback and evaluation');
    }

    // Diversity focus recommendations
    if (grant.diversity_focus) {
      recommendations.push('Demonstrate commitment to diversity and inclusion');
      recommendations.push('Include diverse team and stakeholder representation');
    }

    return recommendations;
  }

  // SGE Content Optimization
  async optimizeSGEContent(content: string, targetFramework: string): Promise<SGEEnhancedStory> {
    try {
      // Enhanced narrative with SGE focus
      const enhancedNarrative = this.enhanceSGENarrative(content);

      // Generate SGE-specific impact metrics
      const impactMetrics = this.generateSGEImpactMetrics(content);

      // Identify cultural elements
      const culturalElements = this.identifyCulturalElements(content);

      // Generate community stories
      const communityStories = this.generateCommunityStories(content);

      // Generate recommendations
      const recommendations = this.generateContentRecommendations(content, targetFramework);

      return {
        original_narrative: content,
        enhanced_narrative: enhancedNarrative,
        impact_metrics: impactMetrics,
        cultural_elements: culturalElements,
        community_stories: communityStories,
        recommendations: recommendations
      };
    } catch (error) {
      console.error('Error in SGE content optimization:', error);
      return {
        original_narrative: content,
        enhanced_narrative: content,
        impact_metrics: [],
        cultural_elements: [],
        community_stories: [],
        recommendations: []
      };
    }
  }

  // Enhance SGE narrative
  private enhanceSGENarrative(content: string): string {
    // Add SGE-specific enhancements
    let enhanced = content;

    // Add cultural context if missing
    if (!enhanced.toLowerCase().includes('cultural') && !enhanced.toLowerCase().includes('diversity')) {
      enhanced += '\n\nThis project demonstrates SGE\'s commitment to cultural representation and diverse storytelling.';
    }

    // Add social impact context if missing
    if (!enhanced.toLowerCase().includes('impact') && !enhanced.toLowerCase().includes('community')) {
      enhanced += '\n\nThe project will create meaningful social impact through community engagement and authentic storytelling.';
    }

    // Add media expertise context if missing
    if (!enhanced.toLowerCase().includes('media') && !enhanced.toLowerCase().includes('storytelling')) {
      enhanced += '\n\nSGE brings extensive media expertise and storytelling capabilities to deliver this project successfully.';
    }

    return enhanced;
  }

  // Generate SGE impact metrics
  private generateSGEImpactMetrics(content: string): any[] {
    const metrics = [];

    // Community engagement metrics
    if (content.toLowerCase().includes('community')) {
      metrics.push({
        metric: 'Community Engagement',
        value: 85,
        unit: '%',
        description: 'Expected community participation rate',
        cultural_context: 'Diverse community representation'
      });
    }

    // Cultural representation metrics
    if (content.toLowerCase().includes('cultural') || content.toLowerCase().includes('diversity')) {
      metrics.push({
        metric: 'Cultural Representation',
        value: 90,
        unit: '%',
        description: 'Cultural authenticity and representation',
        cultural_context: 'Authentic cultural storytelling'
      });
    }

    // Media reach metrics
    metrics.push({
      metric: 'Media Reach',
      value: 10000,
      unit: 'viewers',
      description: 'Expected audience reach',
      cultural_context: 'Diverse audience engagement'
    });

    return metrics;
  }

  // Identify cultural elements
  private identifyCulturalElements(content: string): any[] {
    const elements = [];

    // Look for cultural references
    const culturalKeywords = ['cultural', 'diversity', 'multicultural', 'indigenous', 'community'];
    culturalKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        elements.push({
          element: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          description: `Strong ${keyword} focus in project`,
          cultural_significance: `Demonstrates commitment to ${keyword} representation`,
          representation_accuracy: 0.9
        });
      }
    });

    return elements;
  }

  // Generate community stories
  private generateCommunityStories(content: string): any[] {
    const stories = [];

    if (content.toLowerCase().includes('community')) {
      stories.push({
        title: 'Community Impact Story',
        narrative: 'This project will amplify community voices and create meaningful connections through authentic storytelling.',
        community: 'Diverse Australian communities',
        impact: 'Increased representation and understanding',
        cultural_context: 'Cultural authenticity and community engagement'
      });
    }

    return stories;
  }

  // Generate content recommendations
  private generateContentRecommendations(content: string, targetFramework: string): string[] {
    const recommendations = [];

    // Framework-specific recommendations
    if (targetFramework.toLowerCase().includes('un sdg')) {
      recommendations.push('Align content with specific UN Sustainable Development Goals');
      recommendations.push('Include measurable impact indicators');
    }

    if (targetFramework.toLowerCase().includes('vic government')) {
      recommendations.push('Emphasize Victorian cultural and creative priorities');
      recommendations.push('Include local community engagement strategies');
    }

    // General SGE recommendations
    recommendations.push('Strengthen cultural representation elements');
    recommendations.push('Add specific community impact measures');
    recommendations.push('Include diverse stakeholder perspectives');

    return recommendations;
  }

  // SGE Business Metrics Analysis
  async analyzeSGEBusinessMetrics(applications: SGEApplication[]): Promise<SGEBusinessMetrics> {
    try {
      const totalApplications = applications.length;
      const submittedApplications = applications.filter(app => app.status === 'submitted').length;
      const pendingApplications = applications.filter(app => app.status === 'in_progress').length;
      const wonApplications = applications.filter(app => app.status === 'successful').length;

      const successRate = totalApplications > 0 ? (wonApplications / totalApplications) * 100 : 0;

      const mediaProjects = applications.filter(app => app.media_type && ['documentary', 'digital', 'community', 'multicultural'].includes(app.media_type)).length;
      const culturalProjects = applications.filter(app => app.cultural_elements && app.cultural_elements.length > 0).length;
      const impactProjects = applications.filter(app => app.social_impact && app.social_impact.length > 0).length;

      return {
        metric_date: new Date().toISOString().split('T')[0],
        total_grants_discovered: 0, // Would be populated from grant discovery
        applications_submitted: submittedApplications,
        applications_pending: pendingApplications,
        applications_won: wonApplications,
        success_rate: successRate,
        funding_secured: 0, // Would be calculated from won applications
        time_saved_hours: 0, // Would be calculated from efficiency gains
        media_projects_funded: mediaProjects,
        cultural_impact_projects: culturalProjects,
        social_impact_projects: impactProjects,
        team_efficiency_score: 0.8 // Would be calculated from team performance
      };
    } catch (error) {
      console.error('Error in SGE business metrics analysis:', error);
      return {
        metric_date: new Date().toISOString().split('T')[0],
        total_grants_discovered: 0,
        applications_submitted: 0,
        applications_pending: 0,
        applications_won: 0,
        success_rate: 0,
        funding_secured: 0,
        time_saved_hours: 0,
        media_projects_funded: 0,
        cultural_impact_projects: 0,
        social_impact_projects: 0,
        team_efficiency_score: 0
      };
    }
  }
}

// Default SGE Profile
export const defaultSGEProfile: SGEProfile = {
  media_focus: 'documentary',
  target_communities: ['diverse australian communities', 'multicultural communities', 'indigenous communities'],
  social_impact_areas: ['cultural representation', 'community engagement', 'social cohesion', 'diversity inclusion'],
  cultural_representation: ['multicultural', 'indigenous', 'diverse voices', 'cultural authenticity'],
  budget_range: [10000, 200000],
  team_capabilities: ['documentary production', 'cultural consultation', 'community engagement', 'impact measurement']
};

// Export singleton instance
export const sgeMLService = new SGEMLService({
  apiEndpoint: process.env.NEXT_PUBLIC_ML_API_ENDPOINT || 'http://localhost:3001/api/ml',
  timeout: 10000,
  retryAttempts: 3,
  sgeProfile: defaultSGEProfile
});
