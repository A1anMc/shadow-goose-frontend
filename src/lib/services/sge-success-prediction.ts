// SGE Application Success Prediction Engine
// Advanced ML-powered success prediction for SGE's specific context

import { SGEApplication, SGEGrant, SGESuccessPrediction } from '../types/sge-types';
import { sgeMLService } from './sge-ml-service';

export interface SGESuccessFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  sgeSpecific: boolean;
}

export interface SGESuccessPredictionConfig {
  baseSuccessRate: number;
  factorWeights: {
    mediaAlignment: number;
    culturalRelevance: number;
    impactClarity: number;
    teamStrength: number;
    budgetRealism: number;
    deadlineProximity: number;
    competitionLevel: number;
    trackRecord: number;
  };
  confidenceThreshold: number;
  minDataPoints: number;
}

export interface SGESuccessAnalysis {
  application: SGEApplication;
  grant: SGEGrant;
  prediction: SGESuccessPrediction;
  factors: SGESuccessFactor[];
  recommendations: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  improvementOpportunities: {
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

export interface SGESuccessTrends {
  overallSuccessRate: number;
  successRateByMediaType: Record<string, number>;
  successRateByGrantSize: Record<string, number>;
  successRateByCulturalFocus: Record<string, number>;
  topSuccessFactors: SGESuccessFactor[];
  commonFailureReasons: string[];
  improvementTrends: {
    factor: string;
    improvement: number;
    timeframe: string;
  }[];
}

export class SGESuccessPredictionEngine {
  private config: SGESuccessPredictionConfig;
  private historicalData: SGEApplication[] = [];

  constructor(config: SGESuccessPredictionConfig) {
    this.config = config;
  }

  // Predict success for a specific application
  async predictApplicationSuccess(application: SGEApplication, grant: SGEGrant): Promise<SGESuccessAnalysis> {
    try {
      // Calculate success probability
      const successProbability = await this.calculateSuccessProbability(application, grant);
      
      // Analyze success factors
      const factors = this.analyzeSuccessFactors(application, grant);
      
      // Generate SGE-specific prediction
      const prediction: SGESuccessPrediction = {
        probability: successProbability,
        sge_specific_factors: {
          media_alignment: this.calculateMediaAlignment(application, grant),
          cultural_relevance: this.calculateCulturalRelevance(application, grant),
          impact_clarity: this.calculateImpactClarity(application),
          team_strength: this.calculateTeamStrength(application),
          budget_realism: this.calculateBudgetRealism(application, grant)
        },
        recommendations: this.generateSuccessRecommendations(application, grant, factors),
        risk_factors: this.identifyRiskFactors(application, grant, factors)
      };

      // Generate comprehensive analysis
      const analysis: SGESuccessAnalysis = {
        application,
        grant,
        prediction,
        factors,
        recommendations: prediction.recommendations,
        riskAssessment: this.assessRisks(application, grant, factors),
        improvementOpportunities: this.identifyImprovementOpportunities(application, grant, factors)
      };

      return analysis;
    } catch (error) {
      console.error('Error predicting application success:', error);
      throw error;
    }
  }

  // Calculate overall success probability
  private async calculateSuccessProbability(application: SGEApplication, grant: SGEGrant): Promise<number> {
    let baseProbability = this.config.baseSuccessRate;

    // Adjust based on SGE-specific factors
    const mediaAlignment = this.calculateMediaAlignment(application, grant);
    const culturalRelevance = this.calculateCulturalRelevance(application, grant);
    const impactClarity = this.calculateImpactClarity(application);
    const teamStrength = this.calculateTeamStrength(application);
    const budgetRealism = this.calculateBudgetRealism(application, grant);

    // Weighted adjustment
    baseProbability += mediaAlignment * this.config.factorWeights.mediaAlignment;
    baseProbability += culturalRelevance * this.config.factorWeights.culturalRelevance;
    baseProbability += impactClarity * this.config.factorWeights.impactClarity;
    baseProbability += teamStrength * this.config.factorWeights.teamStrength;
    baseProbability += budgetRealism * this.config.factorWeights.budgetRealism;

    // Additional factors
    const deadlineProximity = this.calculateDeadlineProximity(grant);
    const competitionLevel = this.estimateCompetitionLevel(grant);
    const trackRecord = this.assessTrackRecord(application);

    baseProbability += deadlineProximity * this.config.factorWeights.deadlineProximity;
    baseProbability -= competitionLevel * this.config.factorWeights.competitionLevel;
    baseProbability += trackRecord * this.config.factorWeights.trackRecord;

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, baseProbability));
  }

  // Calculate media alignment score
  private calculateMediaAlignment(application: SGEApplication, grant: SGEGrant): number {
    if (!application.media_type || !grant.media_type) return 0.5;

    const mediaTypeMap: { [key: string]: string[] } = {
      'documentary': ['documentary', 'film', 'video', 'media'],
      'digital': ['digital', 'online', 'web', 'interactive'],
      'community': ['community', 'local', 'grassroots', 'engagement'],
      'multicultural': ['multicultural', 'diversity', 'cultural', 'inclusive']
    };

    const appTypes = mediaTypeMap[application.media_type] || [];
    const grantTypes = mediaTypeMap[grant.media_type] || [];

    const intersection = appTypes.filter(type => grantTypes.includes(type));
    return intersection.length > 0 ? 1 : 0.3;
  }

  // Calculate cultural relevance score
  private calculateCulturalRelevance(application: SGEApplication, grant: SGEGrant): number {
    const appCultures = application.cultural_elements || [];
    const grantCultures = grant.cultural_representation || [];

    if (appCultures.length === 0 || grantCultures.length === 0) return 0.5;

    const intersection = appCultures.filter(culture => grantCultures.includes(culture));
    return intersection.length / Math.max(appCultures.length, grantCultures.length);
  }

  // Calculate impact clarity score
  private calculateImpactClarity(application: SGEApplication): number {
    let score = 0.5;
    const socialImpact = application.social_impact || [];

    // Check for specific impact areas
    if (socialImpact.length > 0) score += 0.2;
    if (socialImpact.length >= 3) score += 0.1;

    // Check for measurable outcomes
    const hasMeasurableOutcomes = socialImpact.some(impact => 
      impact.toLowerCase().includes('measure') || 
      impact.toLowerCase().includes('metric') ||
      impact.toLowerCase().includes('target')
    );
    if (hasMeasurableOutcomes) score += 0.2;

    return Math.min(1, score);
  }

  // Calculate team strength score
  private calculateTeamStrength(application: SGEApplication): number {
    const teamMembers = application.team_members || [];
    if (teamMembers.length === 0) return 0.3;

    let score = 0.5;

    // Check for diverse roles
    const roles = teamMembers.map(member => member.role);
    const uniqueRoles = new Set(roles);
    if (uniqueRoles.size >= 3) score += 0.2;

    // Check for cultural expertise
    const hasCulturalExpertise = teamMembers.some(member => 
      member.cultural_background && member.cultural_background.length > 0
    );
    if (hasCulturalExpertise) score += 0.2;

    // Check for media expertise
    const hasMediaExpertise = teamMembers.some(member => 
      member.media_expertise && member.media_expertise.length > 0
    );
    if (hasMediaExpertise) score += 0.1;

    return Math.min(1, score);
  }

  // Calculate budget realism score
  private calculateBudgetRealism(application: SGEApplication, grant: SGEGrant): number {
    if (!application.budget_amount || !grant.amount) return 0.5;

    const budgetRatio = application.budget_amount / grant.amount;

    if (budgetRatio >= 0.8 && budgetRatio <= 1.2) return 1.0; // Perfect match
    if (budgetRatio >= 0.6 && budgetRatio <= 1.4) return 0.8; // Good match
    if (budgetRatio >= 0.4 && budgetRatio <= 1.6) return 0.6; // Acceptable match
    return 0.3; // Poor match
  }

  // Calculate deadline proximity factor
  private calculateDeadlineProximity(grant: SGEGrant): number {
    const deadline = new Date(grant.deadline);
    const now = new Date();
    const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysLeft <= 7) return 0.9; // Very urgent
    if (daysLeft <= 14) return 0.7; // Urgent
    if (daysLeft <= 30) return 0.5; // Moderate
    if (daysLeft <= 60) return 0.3; // Low urgency
    return 0.1; // Very low urgency
  }

  // Estimate competition level
  private estimateCompetitionLevel(grant: SGEGrant): number {
    // This would be enhanced with actual competition data
    // For now, estimate based on grant characteristics
    let competition = 0.5;

    if (grant.amount && grant.amount > 50000) competition += 0.2; // Higher competition for larger grants
    if (grant.diversity_focus) competition -= 0.1; // Lower competition for diversity-focused grants
    if (grant.media_type === 'documentary') competition += 0.1; // Higher competition for documentary grants

    return Math.max(0, Math.min(1, competition));
  }

  // Assess track record
  private assessTrackRecord(application: SGEApplication): number {
    // This would be enhanced with actual historical data
    // For now, provide a baseline score
    return 0.6; // Moderate track record
  }

  // Analyze success factors
  private analyzeSuccessFactors(application: SGEApplication, grant: SGEGrant): SGESuccessFactor[] {
    const factors: SGESuccessFactor[] = [];

    // Media alignment factor
    const mediaAlignment = this.calculateMediaAlignment(application, grant);
    factors.push({
      factor: 'Media Alignment',
      weight: this.config.factorWeights.mediaAlignment,
      impact: mediaAlignment > 0.7 ? 'positive' : mediaAlignment < 0.4 ? 'negative' : 'neutral',
      description: `Media type alignment between application (${application.media_type}) and grant (${grant.media_type})`,
      sgeSpecific: true
    });

    // Cultural relevance factor
    const culturalRelevance = this.calculateCulturalRelevance(application, grant);
    factors.push({
      factor: 'Cultural Relevance',
      weight: this.config.factorWeights.culturalRelevance,
      impact: culturalRelevance > 0.7 ? 'positive' : culturalRelevance < 0.4 ? 'negative' : 'neutral',
      description: 'Cultural representation alignment between application and grant requirements',
      sgeSpecific: true
    });

    // Impact clarity factor
    const impactClarity = this.calculateImpactClarity(application);
    factors.push({
      factor: 'Impact Clarity',
      weight: this.config.factorWeights.impactClarity,
      impact: impactClarity > 0.7 ? 'positive' : impactClarity < 0.4 ? 'negative' : 'neutral',
      description: 'Clarity and measurability of social impact outcomes',
      sgeSpecific: true
    });

    // Team strength factor
    const teamStrength = this.calculateTeamStrength(application);
    factors.push({
      factor: 'Team Strength',
      weight: this.config.factorWeights.teamStrength,
      impact: teamStrength > 0.7 ? 'positive' : teamStrength < 0.4 ? 'negative' : 'neutral',
      description: 'Team composition and expertise alignment with project requirements',
      sgeSpecific: true
    });

    // Budget realism factor
    const budgetRealism = this.calculateBudgetRealism(application, grant);
    factors.push({
      factor: 'Budget Realism',
      weight: this.config.factorWeights.budgetRealism,
      impact: budgetRealism > 0.7 ? 'positive' : budgetRealism < 0.4 ? 'negative' : 'neutral',
      description: 'Budget alignment with grant amount and project scope',
      sgeSpecific: false
    });

    return factors;
  }

  // Generate success recommendations
  private generateSuccessRecommendations(application: SGEApplication, grant: SGEGrant, factors: SGESuccessFactor[]): string[] {
    const recommendations: string[] = [];

    // Media alignment recommendations
    const mediaFactor = factors.find(f => f.factor === 'Media Alignment');
    if (mediaFactor && mediaFactor.impact === 'negative') {
      recommendations.push('Strengthen media type alignment with grant requirements');
      recommendations.push('Consider adapting project format to better match grant focus');
    }

    // Cultural relevance recommendations
    const culturalFactor = factors.find(f => f.factor === 'Cultural Relevance');
    if (culturalFactor && culturalFactor.impact === 'negative') {
      recommendations.push('Enhance cultural representation elements in project description');
      recommendations.push('Include cultural consultation and community input');
    }

    // Impact clarity recommendations
    const impactFactor = factors.find(f => f.factor === 'Impact Clarity');
    if (impactFactor && impactFactor.impact === 'negative') {
      recommendations.push('Add specific, measurable impact outcomes');
      recommendations.push('Include evaluation and measurement strategies');
    }

    // Team strength recommendations
    const teamFactor = factors.find(f => f.factor === 'Team Strength');
    if (teamFactor && teamFactor.impact === 'negative') {
      recommendations.push('Strengthen team composition with relevant expertise');
      recommendations.push('Include cultural advisors and community representatives');
    }

    // Budget recommendations
    const budgetFactor = factors.find(f => f.factor === 'Budget Realism');
    if (budgetFactor && budgetFactor.impact === 'negative') {
      recommendations.push('Review and adjust budget to align with grant amount');
      recommendations.push('Provide detailed budget breakdown and justification');
    }

    // General SGE recommendations
    recommendations.push('Emphasize SGE\'s track record in cultural storytelling');
    recommendations.push('Highlight community engagement and consultation processes');
    recommendations.push('Demonstrate commitment to diverse representation');

    return recommendations;
  }

  // Identify risk factors
  private identifyRiskFactors(application: SGEApplication, grant: SGEGrant, factors: SGESuccessFactor[]): string[] {
    const risks: string[] = [];

    // High-risk factors
    factors.forEach(factor => {
      if (factor.impact === 'negative' && factor.weight > 0.15) {
        risks.push(`High risk: ${factor.factor} - ${factor.description}`);
      }
    });

    // Specific SGE risks
    if (!application.cultural_elements || application.cultural_elements.length === 0) {
      risks.push('Missing cultural representation elements');
    }

    if (!application.social_impact || application.social_impact.length === 0) {
      risks.push('Lack of clear social impact outcomes');
    }

    if (!application.team_members || application.team_members.length === 0) {
      risks.push('Insufficient team composition');
    }

    // Deadline risks
    const deadline = new Date(grant.deadline);
    const now = new Date();
    const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysLeft <= 7) {
      risks.push('Very tight deadline - may affect application quality');
    }

    return risks;
  }

  // Assess risks by category
  private assessRisks(application: SGEApplication, grant: SGEGrant, factors: SGESuccessFactor[]): {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  } {
    const highRisk: string[] = [];
    const mediumRisk: string[] = [];
    const lowRisk: string[] = [];

    factors.forEach(factor => {
      if (factor.impact === 'negative') {
        if (factor.weight > 0.15) {
          highRisk.push(`${factor.factor}: ${factor.description}`);
        } else if (factor.weight > 0.08) {
          mediumRisk.push(`${factor.factor}: ${factor.description}`);
        } else {
          lowRisk.push(`${factor.factor}: ${factor.description}`);
        }
      }
    });

    return { highRisk, mediumRisk, lowRisk };
  }

  // Identify improvement opportunities
  private identifyImprovementOpportunities(application: SGEApplication, grant: SGEGrant, factors: SGESuccessFactor[]): {
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
  } {
    const quickWins: string[] = [];
    const mediumTerm: string[] = [];
    const longTerm: string[] = [];

    // Quick wins (can be implemented immediately)
    if (application.completion_score && application.completion_score < 80) {
      quickWins.push('Complete missing application sections');
    }
    quickWins.push('Review and refine project description');
    quickWins.push('Add specific impact metrics');

    // Medium term (1-2 weeks)
    mediumTerm.push('Strengthen team composition if needed');
    mediumTerm.push('Enhance cultural consultation processes');
    mediumTerm.push('Develop detailed budget breakdown');

    // Long term (ongoing)
    longTerm.push('Build track record in target media type');
    longTerm.push('Develop relationships with cultural communities');
    longTerm.push('Establish evaluation and measurement frameworks');

    return { quickWins, mediumTerm, longTerm };
  }

  // Analyze success trends
  analyzeSuccessTrends(): SGESuccessTrends {
    // This would analyze historical data
    // For now, provide baseline trends
    return {
      overallSuccessRate: 0.65,
      successRateByMediaType: {
        documentary: 0.70,
        digital: 0.60,
        community: 0.75,
        multicultural: 0.80
      },
      successRateByGrantSize: {
        small: 0.70, // <$25k
        medium: 0.65, // $25k-$75k
        large: 0.55 // >$75k
      },
      successRateByCulturalFocus: {
        high: 0.80,
        medium: 0.65,
        low: 0.50
      },
      topSuccessFactors: [
        {
          factor: 'Cultural Relevance',
          weight: 0.25,
          impact: 'positive',
          description: 'Strong cultural representation alignment',
          sgeSpecific: true
        },
        {
          factor: 'Team Strength',
          weight: 0.20,
          impact: 'positive',
          description: 'Diverse team with relevant expertise',
          sgeSpecific: true
        }
      ],
      commonFailureReasons: [
        'Insufficient cultural representation',
        'Weak social impact outcomes',
        'Poor budget alignment',
        'Incomplete application'
      ],
      improvementTrends: [
        {
          factor: 'Cultural Relevance',
          improvement: 15,
          timeframe: '6 months'
        },
        {
          factor: 'Team Strength',
          improvement: 10,
          timeframe: '3 months'
        }
      ]
    };
  }

  // Add historical data for learning
  addHistoricalData(applications: SGEApplication[]): void {
    this.historicalData.push(...applications);
  }

  // Get prediction confidence
  getPredictionConfidence(application: SGEApplication): number {
    // Confidence based on available data points
    const dataPoints = this.historicalData.length;
    if (dataPoints >= this.config.minDataPoints) {
      return Math.min(0.95, 0.5 + (dataPoints / 100) * 0.45);
    }
    return 0.5; // Baseline confidence
  }
}

// Default configuration
export const defaultSGESuccessPredictionConfig: SGESuccessPredictionConfig = {
  baseSuccessRate: 0.65,
  factorWeights: {
    mediaAlignment: 0.20,
    culturalRelevance: 0.25,
    impactClarity: 0.15,
    teamStrength: 0.20,
    budgetRealism: 0.10,
    deadlineProximity: 0.05,
    competitionLevel: 0.03,
    trackRecord: 0.02
  },
  confidenceThreshold: 0.7,
  minDataPoints: 10
};

// Export singleton instance
export const sgeSuccessPredictionEngine = new SGESuccessPredictionEngine(defaultSGESuccessPredictionConfig);
