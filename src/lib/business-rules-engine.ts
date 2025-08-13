// Business Rules Engine
// Senior Grants Operations Agent - Real Data Integration

export interface GrantEligibilityCriteria {
  organization_type: 'non_profit' | 'for_profit' | 'government' | 'individual';
  geographic_scope: string[];
  project_focus: string[];
  financial_capacity: {
    minimum_reserves: number;
    maximum_annual_revenue?: number;
  };
  track_record: {
    minimum_years: number;
    minimum_projects: number;
    success_rate?: number;
  };
  team_requirements: {
    minimum_team_size: number;
    required_roles: string[];
  };
}

export interface GrantPriorityScore {
  amount_suitability: number; // 0-30 points
  category_alignment: number; // 0-25 points
  geographic_focus: number; // 0-20 points
  success_probability: number; // 0-15 points
  deadline_urgency: number; // 0-10 points
  total_score: number; // 0-100 points
  priority_level: 'critical' | 'high' | 'medium' | 'low';
}

export interface ApplicationQualityScore {
  required_sections: number; // 0-25 points
  content_quality: number; // 0-30 points
  required_attachments: number; // 0-20 points
  compliance_check: number; // 0-25 points
  total_score: number; // 0-100 points
  quality_level: 'excellent' | 'good' | 'acceptable' | 'poor';
  missing_items: string[];
  improvement_suggestions: string[];
}

export interface GrantApplication {
  id: string;
  grant_id: string;
  organization_profile: {
    type: string;
    geographic_location: string;
    annual_revenue: number;
    years_operating: number;
    team_size: number;
    team_roles: string[];
    previous_projects: number;
    success_rate: number;
  };
  project_details: {
    title: string;
    description: string;
    category: string;
    geographic_scope: string[];
    timeline: number; // months
    budget: number;
  };
  application_content: {
    project_overview: string;
    objectives_outcomes: string;
    implementation_plan: string;
    budget_breakdown: string;
    risk_management: string;
    attachments: string[];
  };
  grant_details: {
    amount: number;
    category: string;
    deadline: string;
    eligibility_criteria: string[];
    required_documents: string[];
  };
}

class BusinessRulesEngine {
  private sgeProfile = {
    organization_type: 'non_profit' as const,
    geographic_focus: ['Victoria', 'Australia'],
    project_focus: ['documentary', 'arts_culture', 'youth', 'community', 'indigenous'],
    target_amount_range: { min: 10000, max: 100000 },
    preferred_organizations: ['Creative Australia', 'Screen Australia', 'VicScreen', 'Regional Arts Fund'],
    team_capabilities: ['documentary_filmmaking', 'community_engagement', 'youth_programs', 'arts_administration']
  };

  // Eligibility Validation
  validateEligibility(application: GrantApplication): {
    is_eligible: boolean;
    reasons: string[];
    missing_criteria: string[];
  } {
    const reasons: string[] = [];
    const missing_criteria: string[] = [];

    // Organization type check
    if (!this.checkOrganizationType(application.organization_profile.type)) {
      missing_criteria.push('Organization type not eligible');
      reasons.push(`Organization type '${application.organization_profile.type}' may not be eligible for this grant`);
    }

    // Geographic scope check
    if (!this.checkGeographicScope(application.project_details.geographic_scope)) {
      missing_criteria.push('Geographic scope mismatch');
      reasons.push('Project geographic scope does not align with grant requirements');
    }

    // Project focus check
    if (!this.checkProjectFocus(application.project_details.category)) {
      missing_criteria.push('Project category mismatch');
      reasons.push(`Project category '${application.project_details.category}' may not be eligible`);
    }

    // Financial capacity check
    if (!this.checkFinancialCapacity(application.organization_profile.annual_revenue)) {
      missing_criteria.push('Insufficient financial capacity');
      reasons.push('Organization may not meet financial capacity requirements');
    }

    // Track record check
    if (!this.checkTrackRecord(application.organization_profile.years_operating, application.organization_profile.previous_projects)) {
      missing_criteria.push('Insufficient track record');
      reasons.push('Organization may not meet minimum track record requirements');
    }

    // Team requirements check
    if (!this.checkTeamRequirements(application.organization_profile.team_size, application.organization_profile.team_roles)) {
      missing_criteria.push('Team requirements not met');
      reasons.push('Team size or composition may not meet grant requirements');
    }

    const is_eligible = missing_criteria.length === 0;

    return {
      is_eligible,
      reasons,
      missing_criteria
    };
  }

  // Priority Scoring
  calculatePriorityScore(application: GrantApplication): GrantPriorityScore {
    const amount_suitability = this.scoreAmountSuitability(application.grant_details.amount);
    const category_alignment = this.scoreCategoryAlignment(application.project_details.category);
    const geographic_focus = this.scoreGeographicFocus(application.project_details.geographic_scope);
    const success_probability = this.scoreSuccessProbability(application);
    const deadline_urgency = this.scoreDeadlineUrgency(application.grant_details.deadline);

    const total_score = amount_suitability + category_alignment + geographic_focus + success_probability + deadline_urgency;

    return {
      amount_suitability,
      category_alignment,
      geographic_focus,
      success_probability,
      deadline_urgency,
      total_score,
      priority_level: this.getPriorityLevel(total_score)
    };
  }

  // Quality Assessment
  assessApplicationQuality(application: GrantApplication): ApplicationQualityScore {
    const required_sections = this.scoreRequiredSections(application.application_content);
    const content_quality = this.scoreContentQuality(application.application_content);
    const required_attachments = this.scoreRequiredAttachments(application.application_content.attachments, application.grant_details.required_documents);
    const compliance_check = this.scoreComplianceCheck(application);

    const total_score = required_sections + content_quality + required_attachments + compliance_check;

    const missing_items = this.getMissingItems(application);
    const improvement_suggestions = this.getImprovementSuggestions(application, total_score);

    return {
      required_sections,
      content_quality,
      required_attachments,
      compliance_check,
      total_score,
      quality_level: this.getQualityLevel(total_score),
      missing_items,
      improvement_suggestions
    };
  }

  // Success Prediction
  predictSuccessProbability(application: GrantApplication): {
    probability: number;
    factors: string[];
    risk_factors: string[];
  } {
    let probability = 0.5; // Base probability
    const factors: string[] = [];
    const risk_factors: string[] = [];

    // Positive factors
    if (application.organization_profile.success_rate > 0.8) {
      probability += 0.15;
      factors.push('High historical success rate');
    }

    if (application.organization_profile.years_operating >= 5) {
      probability += 0.1;
      factors.push('Established track record');
    }

    if (this.sgeProfile.project_focus.includes(application.project_details.category)) {
      probability += 0.1;
      factors.push('Strong category alignment');
    }

    if (application.grant_details.amount >= this.sgeProfile.target_amount_range.min && 
        application.grant_details.amount <= this.sgeProfile.target_amount_range.max) {
      probability += 0.1;
      factors.push('Optimal grant amount');
    }

    // Risk factors
    if (application.organization_profile.team_size < 3) {
      probability -= 0.1;
      risk_factors.push('Small team size');
    }

    if (application.project_details.timeline > 24) {
      probability -= 0.05;
      risk_factors.push('Long project timeline');
    }

    if (application.organization_profile.annual_revenue < 100000) {
      probability -= 0.05;
      risk_factors.push('Low annual revenue');
    }

    // Cap probability between 0 and 1
    probability = Math.max(0, Math.min(1, probability));

    return {
      probability,
      factors,
      risk_factors
    };
  }

  // Submission Readiness Check
  checkSubmissionReadiness(application: GrantApplication): {
    is_ready: boolean;
    readiness_score: number;
    missing_requirements: string[];
    recommendations: string[];
  } {
    const eligibility = this.validateEligibility(application);
    const quality = this.assessApplicationQuality(application);
    const successPrediction = this.predictSuccessProbability(application);

    const missing_requirements: string[] = [
      ...eligibility.missing_criteria,
      ...quality.missing_items
    ];

    const recommendations: string[] = [
      ...quality.improvement_suggestions
    ];

    // Additional readiness checks
    if (quality.total_score < 85) {
      missing_requirements.push('Application quality below threshold');
      recommendations.push('Improve application quality before submission');
    }

    if (successPrediction.probability < 0.6) {
      missing_requirements.push('Low success probability');
      recommendations.push('Consider improving application or targeting different grants');
    }

    const readiness_score = (quality.total_score + (successPrediction.probability * 100)) / 2;
    const is_ready = eligibility.is_eligible && quality.total_score >= 85 && successPrediction.probability >= 0.6;

    return {
      is_ready,
      readiness_score,
      missing_requirements,
      recommendations
    };
  }

  // Private helper methods
  private checkOrganizationType(type: string): boolean {
    const eligibleTypes = ['non_profit', 'for_profit', 'government'];
    return eligibleTypes.includes(type);
  }

  private checkGeographicScope(scope: string[]): boolean {
    return scope.some(area => 
      this.sgeProfile.geographic_focus.some(focus => 
        area.toLowerCase().includes(focus.toLowerCase())
      )
    );
  }

  private checkProjectFocus(category: string): boolean {
    return this.sgeProfile.project_focus.includes(category);
  }

  private checkFinancialCapacity(revenue: number): boolean {
    return revenue >= 50000; // Minimum $50K annual revenue
  }

  private checkTrackRecord(years: number, projects: number): boolean {
    return years >= 2 && projects >= 3;
  }

  private checkTeamRequirements(size: number, roles: string[]): boolean {
    return size >= 2 && roles.length >= 2;
  }

  private scoreAmountSuitability(amount: number): number {
    if (amount >= this.sgeProfile.target_amount_range.min && 
        amount <= this.sgeProfile.target_amount_range.max) {
      return 30;
    } else if (amount >= 5000 && amount <= 150000) {
      return 20;
    } else {
      return 10;
    }
  }

  private scoreCategoryAlignment(category: string): number {
    if (this.sgeProfile.project_focus.includes(category)) {
      return 25;
    } else if (['arts', 'culture', 'community'].includes(category)) {
      return 15;
    } else {
      return 5;
    }
  }

  private scoreGeographicFocus(scope: string[]): number {
    const hasGeographicMatch = scope.some(area => 
      this.sgeProfile.geographic_focus.some(focus => 
        area.toLowerCase().includes(focus.toLowerCase())
      )
    );
    return hasGeographicMatch ? 20 : 5;
  }

  private scoreSuccessProbability(application: GrantApplication): number {
    const prediction = this.predictSuccessProbability(application);
    return Math.round(prediction.probability * 15);
  }

  private scoreDeadlineUrgency(deadline: string): number {
    const daysUntilDeadline = this.calculateDaysUntilDeadline(deadline);
    if (daysUntilDeadline <= 7) {
      return 10;
    } else if (daysUntilDeadline <= 30) {
      return 7;
    } else if (daysUntilDeadline <= 60) {
      return 5;
    } else {
      return 3;
    }
  }

  private scoreRequiredSections(content: any): number {
    const requiredSections = [
      'project_overview',
      'objectives_outcomes',
      'implementation_plan',
      'budget_breakdown',
      'risk_management'
    ];

    let score = 0;
    for (const section of requiredSections) {
      if (content[section] && content[section].trim().length > 0) {
        score += 5;
      }
    }
    return score;
  }

  private scoreContentQuality(content: any): number {
    const wordCounts = {
      project_overview: 500,
      objectives_outcomes: 300,
      implementation_plan: 800,
      budget_breakdown: 200,
      risk_management: 300
    };

    let score = 0;
    for (const [section, minWords] of Object.entries(wordCounts)) {
      if (content[section]) {
        const actualWords = content[section].split(' ').length;
        if (actualWords >= minWords) {
          score += 6;
        } else if (actualWords >= minWords * 0.7) {
          score += 4;
        } else if (actualWords >= minWords * 0.5) {
          score += 2;
        }
      }
    }
    return score;
  }

  private scoreRequiredAttachments(attachments: string[], required: string[]): number {
    let score = 0;
    for (const requiredDoc of required) {
      if (attachments.some(att => att.toLowerCase().includes(requiredDoc.toLowerCase()))) {
        score += 5;
      }
    }
    return Math.min(score, 20);
  }

  private scoreComplianceCheck(application: GrantApplication): number {
    let score = 0;
    
    // Basic compliance checks
    if (application.project_details.budget <= application.grant_details.amount) {
      score += 5;
    }
    
    if (this.calculateDaysUntilDeadline(application.grant_details.deadline) > 0) {
      score += 5;
    }
    
    if (application.organization_profile.years_operating >= 2) {
      score += 5;
    }
    
    if (application.organization_profile.team_size >= 2) {
      score += 5;
    }
    
    if (application.project_details.timeline <= 24) {
      score += 5;
    }
    
    return score;
  }

  private getMissingItems(application: GrantApplication): string[] {
    const missing: string[] = [];
    const content = application.application_content;
    
    if (!content.project_overview || content.project_overview.trim().length < 100) {
      missing.push('Project overview (minimum 100 words)');
    }
    
    if (!content.objectives_outcomes || content.objectives_outcomes.trim().length < 100) {
      missing.push('Objectives and outcomes (minimum 100 words)');
    }
    
    if (!content.implementation_plan || content.implementation_plan.trim().length < 200) {
      missing.push('Implementation plan (minimum 200 words)');
    }
    
    if (!content.budget_breakdown || content.budget_breakdown.trim().length < 50) {
      missing.push('Budget breakdown (minimum 50 words)');
    }
    
    if (!content.risk_management || content.risk_management.trim().length < 100) {
      missing.push('Risk management (minimum 100 words)');
    }
    
    return missing;
  }

  private getImprovementSuggestions(application: GrantApplication, qualityScore: number): string[] {
    const suggestions: string[] = [];
    
    if (qualityScore < 85) {
      suggestions.push('Improve application completeness and detail');
    }
    
    if (application.project_details.timeline > 24) {
      suggestions.push('Consider reducing project timeline for better feasibility');
    }
    
    if (application.organization_profile.team_size < 3) {
      suggestions.push('Consider expanding team size for project credibility');
    }
    
    if (application.project_details.budget > application.grant_details.amount * 1.5) {
      suggestions.push('Review budget to ensure it aligns with grant amount');
    }
    
    return suggestions;
  }

  private getPriorityLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 85) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private getQualityLevel(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'acceptable';
    return 'poor';
  }

  private calculateDaysUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const businessRulesEngine = new BusinessRulesEngine();
