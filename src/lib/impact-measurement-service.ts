/**
 * Impact Measurement Service
 * Comprehensive service for measuring and tracking impact across multiple frameworks
 */

import {
  SDG_GOALS,
  VICTORIAN_OUTCOMES,
  CEMP_PRINCIPLES,
  ProjectImpactMapping,
  SDGMapping,
  VictorianMapping,
  CEMPMapping,
  ImpactMeasurement,
  ImpactStory,
  ImpactReport,
  TripleBottomLine,
  SDGSummary,
  VictorianSummary,
  CEMPSummary
} from './types/impact-frameworks';

export class ImpactMeasurementService {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.authToken = null;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  // ============================================================================
  // FRAMEWORK DATA ACCESS
  // ============================================================================

  /**
   * Get all SDG goals
   */
  getSDGGoals() {
    return SDG_GOALS;
  }

  /**
   * Get SDG goal by ID
   */
  getSDGGoal(goalId: number) {
    return SDG_GOALS.find(goal => goal.id === goalId);
  }

  /**
   * Get all Victorian Government outcomes
   */
  getVictorianOutcomes() {
    return VICTORIAN_OUTCOMES;
  }

  /**
   * Get Victorian outcomes by department
   */
  getVictorianOutcomesByDepartment(department: 'DFFH' | 'DJPR' | 'CreativeVic' | 'Other') {
    return VICTORIAN_OUTCOMES.filter(outcome => outcome.department === department);
  }

  /**
   * Get all CEMP principles
   */
  getCEMPPrinciples() {
    return CEMP_PRINCIPLES;
  }

  /**
   * Get CEMP principle by ID
   */
  getCEMPPrinciple(principleId: string) {
    return CEMP_PRINCIPLES.find(principle => principle.id === principleId);
  }

  // ============================================================================
  // PROJECT IMPACT MAPPING
  // ============================================================================

  /**
   * Create or update project impact mapping
   */
  async createProjectMapping(projectId: string, mapping: Omit<ProjectImpactMapping, 'project_id'>): Promise<ProjectImpactMapping> {
    const response = await this.request<ProjectImpactMapping>('/project-mappings', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ...mapping
      })
    });
    return response.data;
  }

  /**
   * Get project impact mapping
   */
  async getProjectMapping(projectId: string): Promise<ProjectImpactMapping | null> {
    try {
      const response = await this.request<ProjectImpactMapping>(`/project-mappings/${projectId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update project mapping
   */
  async updateProjectMapping(projectId: string, mapping: Partial<ProjectImpactMapping>): Promise<ProjectImpactMapping> {
    const response = await this.request<ProjectImpactMapping>(`/project-mappings/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  // ============================================================================
  // SDG MAPPING
  // ============================================================================

  /**
   * Add SDG mapping to project
   */
  async addSDGMapping(projectId: string, mapping: SDGMapping): Promise<SDGMapping> {
    const response = await this.request<SDGMapping>('/sdg-mappings', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ...mapping
      })
    });
    return response.data;
  }

  /**
   * Get SDG mappings for project
   */
  async getSDGMappings(projectId: string): Promise<SDGMapping[]> {
    const response = await this.request<SDGMapping[]>(`/sdg-mappings?project_id=${projectId}`);
    return response.data;
  }

  /**
   * Calculate SDG contribution score
   */
  calculateSDGContribution(mappings: SDGMapping[]): number {
    if (mappings.length === 0) return 0;
    
    const totalContribution = mappings.reduce((sum, mapping) => {
      return sum + mapping.contribution_percentage;
    }, 0);
    
    return totalContribution / mappings.length;
  }

  // ============================================================================
  // VICTORIAN GOVERNMENT MAPPING
  // ============================================================================

  /**
   * Add Victorian Government mapping to project
   */
  async addVictorianMapping(projectId: string, mapping: VictorianMapping): Promise<VictorianMapping> {
    const response = await this.request<VictorianMapping>('/victorian-mappings', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ...mapping
      })
    });
    return response.data;
  }

  /**
   * Get Victorian mappings for project
   */
  async getVictorianMappings(projectId: string): Promise<VictorianMapping[]> {
    const response = await this.request<VictorianMapping[]>(`/victorian-mappings?project_id=${projectId}`);
    return response.data;
  }

  /**
   * Calculate Victorian Government contribution score
   */
  calculateVictorianContribution(mappings: VictorianMapping[]): number {
    if (mappings.length === 0) return 0;
    
    const totalContribution = mappings.reduce((sum, mapping) => {
      return sum + mapping.contribution_percentage;
    }, 0);
    
    return totalContribution / mappings.length;
  }

  // ============================================================================
  // CEMP MAPPING
  // ============================================================================

  /**
   * Add CEMP mapping to project
   */
  async addCEMPMapping(projectId: string, mapping: CEMPMapping): Promise<CEMPMapping> {
    const response = await this.request<CEMPMapping>('/cemp-mappings', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        ...mapping
      })
    });
    return response.data;
  }

  /**
   * Get CEMP mappings for project
   */
  async getCEMPMappings(projectId: string): Promise<CEMPMapping[]> {
    const response = await this.request<CEMPMapping[]>(`/cemp-mappings?project_id=${projectId}`);
    return response.data;
  }

  /**
   * Calculate CEMP score
   */
  calculateCEMPScore(mappings: CEMPMapping[]): number {
    if (mappings.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    mappings.forEach(mapping => {
      const principle = this.getCEMPPrinciple(mapping.principle.id);
      if (principle) {
        const score = (mapping.current_value / mapping.target_value) * 100;
        totalScore += score * principle.weight;
        totalWeight += principle.weight;
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // ============================================================================
  // IMPACT MEASUREMENTS
  // ============================================================================

  /**
   * Record impact measurement
   */
  async recordMeasurement(measurement: Omit<ImpactMeasurement, 'id' | 'created_at'>): Promise<ImpactMeasurement> {
    const response = await this.request<ImpactMeasurement>('/impact-measurements', {
      method: 'POST',
      body: JSON.stringify(measurement)
    });
    return response.data;
  }

  /**
   * Get impact measurements for project
   */
  async getProjectMeasurements(projectId: string, framework?: string): Promise<ImpactMeasurement[]> {
    const params = new URLSearchParams({ project_id: projectId });
    if (framework) params.append('framework', framework);
    
    const response = await this.request<ImpactMeasurement[]>(`/impact-measurements?${params.toString()}`);
    return response.data;
  }

  /**
   * Update impact measurement
   */
  async updateMeasurement(measurementId: string, updates: Partial<ImpactMeasurement>): Promise<ImpactMeasurement> {
    const response = await this.request<ImpactMeasurement>(`/impact-measurements/${measurementId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  // ============================================================================
  // IMPACT STORIES
  // ============================================================================

  /**
   * Create impact story
   */
  async createImpactStory(story: Omit<ImpactStory, 'id' | 'created_at' | 'updated_at'>): Promise<ImpactStory> {
    const response = await this.request<ImpactStory>('/impact-stories', {
      method: 'POST',
      body: JSON.stringify(story)
    });
    return response.data;
  }

  /**
   * Get impact stories for project
   */
  async getProjectStories(projectId: string, category?: string): Promise<ImpactStory[]> {
    const params = new URLSearchParams({ project_id: projectId });
    if (category) params.append('category', category);
    
    const response = await this.request<ImpactStory[]>(`/impact-stories?${params.toString()}`);
    return response.data;
  }

  /**
   * Update impact story
   */
  async updateImpactStory(storyId: string, updates: Partial<ImpactStory>): Promise<ImpactStory> {
    const response = await this.request<ImpactStory>(`/impact-stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  // ============================================================================
  // TRIPLE BOTTOM LINE
  // ============================================================================

  /**
   * Calculate triple bottom line impact
   */
  async calculateTripleBottomLine(projectId: string): Promise<TripleBottomLine> {
    const [sdgMappings, victorianMappings, cempMappings, measurements] = await Promise.all([
      this.getSDGMappings(projectId),
      this.getVictorianMappings(projectId),
      this.getCEMPMappings(projectId),
      this.getProjectMeasurements(projectId)
    ]);

    // Calculate social impact
    const socialImpact = {
      employment_created: this.calculateEmploymentImpact(measurements),
      skills_developed: this.calculateSkillsImpact(measurements),
      community_engagement: this.calculateCommunityEngagement(measurements, cempMappings),
      social_cohesion: this.calculateSocialCohesion(sdgMappings),
      health_improvements: this.calculateHealthImpact(measurements)
    };

    // Calculate economic impact
    const economicImpact = {
      jobs_created: this.calculateJobsCreated(measurements),
      income_generated: this.calculateIncomeGenerated(measurements),
      local_spending: this.calculateLocalSpending(measurements),
      business_development: this.calculateBusinessDevelopment(victorianMappings),
      economic_multiplier: this.calculateEconomicMultiplier(measurements)
    };

    // Calculate environmental impact
    const environmentalImpact = {
      carbon_reduction: this.calculateCarbonReduction(measurements),
      waste_reduction: this.calculateWasteReduction(measurements),
      energy_efficiency: this.calculateEnergyEfficiency(measurements),
      biodiversity_improvement: this.calculateBiodiversityImpact(measurements),
      sustainable_practices: this.calculateSustainablePractices(measurements)
    };

    return {
      social_impact: socialImpact,
      economic_impact: economicImpact,
      environmental_impact: environmentalImpact
    };
  }

  // ============================================================================
  // IMPACT REPORTS
  // ============================================================================

  /**
   * Generate comprehensive impact report
   */
  async generateImpactReport(projectId: string, startDate: string, endDate: string): Promise<ImpactReport> {
    const [
      sdgMappings,
      victorianMappings,
      cempMappings,
      measurements,
      stories,
      tripleBottomLine
    ] = await Promise.all([
      this.getSDGMappings(projectId),
      this.getVictorianMappings(projectId),
      this.getCEMPMappings(projectId),
      this.getProjectMeasurements(projectId),
      this.getProjectStories(projectId),
      this.calculateTripleBottomLine(projectId)
    ]);

    // Generate summaries
    const sdgSummary = this.generateSDGSummary(sdgMappings);
    const victorianSummary = this.generateVictorianSummary(victorianMappings);
    const cempSummary = this.generateCEMPSummary(cempMappings);

    // Generate recommendations
    const recommendations = this.generateRecommendations(sdgMappings, victorianMappings, cempMappings);

    const report: ImpactReport = {
      id: `report_${projectId}_${Date.now()}`,
      project_id: projectId,
      report_period: { start_date: startDate, end_date: endDate },
      frameworks: {
        sdg_summary: sdgSummary,
        victorian_summary: victorianSummary,
        cemp_summary: cempSummary,
        triple_bottom_line: tripleBottomLine
      },
      stories,
      metrics: measurements,
      recommendations,
      generated_at: new Date().toISOString(),
      generated_by: 'Impact Measurement Service'
    };

    return report;
  }

  /**
   * Export impact report as PDF
   */
  async exportReportAsPDF(report: ImpactReport): Promise<Blob> {
    const response = await this.request<Blob>('/export/pdf', {
      method: 'POST',
      body: JSON.stringify(report),
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return response.data;
  }

  /**
   * Export impact report as Excel
   */
  async exportReportAsExcel(report: ImpactReport): Promise<Blob> {
    const response = await this.request<Blob>('/export/excel', {
      method: 'POST',
      body: JSON.stringify(report),
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    return response.data;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.baseUrl}/api/impact${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  }

  // Calculation helper methods
  private calculateEmploymentImpact(measurements: ImpactMeasurement[]): number {
    const employmentMeasurements = measurements.filter(m => 
      m.indicator_id.includes('employment') || m.indicator_id.includes('job')
    );
    return employmentMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateSkillsImpact(measurements: ImpactMeasurement[]): number {
    const skillsMeasurements = measurements.filter(m => 
      m.indicator_id.includes('skill') || m.indicator_id.includes('training')
    );
    return skillsMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateCommunityEngagement(measurements: ImpactMeasurement[], cempMappings: CEMPMapping[]): number {
    const engagementMeasurements = measurements.filter(m => 
      m.indicator_id.includes('engagement') || m.indicator_id.includes('participation')
    );
    const measurementScore = engagementMeasurements.reduce((sum, m) => sum + m.value, 0);
    const cempScore = this.calculateCEMPScore(cempMappings);
    return (measurementScore + cempScore) / 2;
  }

  private calculateSocialCohesion(sdgMappings: SDGMapping[]): number {
    const cohesionMappings = sdgMappings.filter(m => 
      m.sdg_goal.id === 10 || m.sdg_goal.id === 16 // Reduced Inequalities, Peace & Justice
    );
    return this.calculateSDGContribution(cohesionMappings);
  }

  private calculateHealthImpact(measurements: ImpactMeasurement[]): number {
    const healthMeasurements = measurements.filter(m => 
      m.indicator_id.includes('health') || m.indicator_id.includes('wellbeing')
    );
    return healthMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateJobsCreated(measurements: ImpactMeasurement[]): number {
    const jobMeasurements = measurements.filter(m => 
      m.indicator_id.includes('job') && m.indicator_id.includes('created')
    );
    return jobMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateIncomeGenerated(measurements: ImpactMeasurement[]): number {
    const incomeMeasurements = measurements.filter(m => 
      m.indicator_id.includes('income') || m.indicator_id.includes('revenue')
    );
    return incomeMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateLocalSpending(measurements: ImpactMeasurement[]): number {
    const spendingMeasurements = measurements.filter(m => 
      m.indicator_id.includes('spending') || m.indicator_id.includes('expenditure')
    );
    return spendingMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateBusinessDevelopment(victorianMappings: VictorianMapping[]): number {
    const businessMappings = victorianMappings.filter(m => 
      m.outcome.department === 'DJPR'
    );
    return this.calculateVictorianContribution(businessMappings);
  }

  private calculateEconomicMultiplier(measurements: ImpactMeasurement[]): number {
    // Simplified economic multiplier calculation
    const directImpact = this.calculateIncomeGenerated(measurements);
    return directImpact * 1.5; // Assume 1.5x multiplier
  }

  private calculateCarbonReduction(measurements: ImpactMeasurement[]): number {
    const carbonMeasurements = measurements.filter(m => 
      m.indicator_id.includes('carbon') || m.indicator_id.includes('emission')
    );
    return carbonMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateWasteReduction(measurements: ImpactMeasurement[]): number {
    const wasteMeasurements = measurements.filter(m => 
      m.indicator_id.includes('waste') || m.indicator_id.includes('recycling')
    );
    return wasteMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateEnergyEfficiency(measurements: ImpactMeasurement[]): number {
    const energyMeasurements = measurements.filter(m => 
      m.indicator_id.includes('energy') || m.indicator_id.includes('efficiency')
    );
    return energyMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateBiodiversityImpact(measurements: ImpactMeasurement[]): number {
    const biodiversityMeasurements = measurements.filter(m => 
      m.indicator_id.includes('biodiversity') || m.indicator_id.includes('environment')
    );
    return biodiversityMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private calculateSustainablePractices(measurements: ImpactMeasurement[]): number {
    const sustainabilityMeasurements = measurements.filter(m => 
      m.indicator_id.includes('sustainable') || m.indicator_id.includes('green')
    );
    return sustainabilityMeasurements.reduce((sum, m) => sum + m.value, 0);
  }

  private generateSDGSummary(sdgMappings: SDGMapping[]): SDGSummary {
    const uniqueGoals = [...new Set(sdgMappings.map(m => m.sdg_goal.id))];
    const goalsImpacted = uniqueGoals.length;
    const targetsAchieved = sdgMappings.length;
    const indicatorsMeasured = sdgMappings.length;
    const overallProgress = this.calculateSDGContribution(sdgMappings);
    
    const topContributingGoals = uniqueGoals
      .map(goalId => SDG_GOALS.find(g => g.id === goalId))
      .filter(Boolean)
      .slice(0, 5);

    return {
      goals_impacted: goalsImpacted,
      targets_achieved: targetsAchieved,
      indicators_measured: indicatorsMeasured,
      overall_progress: overallProgress,
      top_contributing_goals: topContributingGoals
    };
  }

  private generateVictorianSummary(victorianMappings: VictorianMapping[]): VictorianSummary {
    const uniqueOutcomes = [...new Set(victorianMappings.map(m => m.outcome.id))];
    const outcomesImpacted = uniqueOutcomes.length;
    const indicatorsAchieved = victorianMappings.length;
    const overallProgress = this.calculateVictorianContribution(victorianMappings);
    
    const departmentBreakdown = victorianMappings.reduce((acc, mapping) => {
      const dept = mapping.outcome.department;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      outcomes_impacted: outcomesImpacted,
      indicators_achieved: indicatorsAchieved,
      overall_progress: overallProgress,
      department_breakdown: departmentBreakdown
    };
  }

  private generateCEMPSummary(cempMappings: CEMPMapping[]): CEMPSummary {
    const uniquePrinciples = [...new Set(cempMappings.map(m => m.principle.id))];
    const principlesImplemented = uniquePrinciples.length;
    const indicatorsAchieved = cempMappings.length;
    const overallScore = this.calculateCEMPScore(cempMappings);
    
    const principleScores = uniquePrinciples.reduce((acc, principleId) => {
      const principleMappings = cempMappings.filter(m => m.principle.id === principleId);
      acc[principleId] = this.calculateCEMPScore(principleMappings);
      return acc;
    }, {} as Record<string, number>);

    return {
      principles_implemented: principlesImplemented,
      indicators_achieved: indicatorsAchieved,
      overall_score: overallScore,
      principle_scores: principleScores
    };
  }

  private generateRecommendations(
    sdgMappings: SDGMapping[],
    victorianMappings: VictorianMapping[],
    cempMappings: CEMPMapping[]
  ): string[] {
    const recommendations: string[] = [];

    // SDG recommendations
    if (sdgMappings.length < 3) {
      recommendations.push('Consider mapping to additional SDG goals to demonstrate broader impact');
    }

    // Victorian Government recommendations
    if (victorianMappings.length === 0) {
      recommendations.push('Map project outcomes to Victorian Government frameworks for better alignment');
    }

    // CEMP recommendations
    const cempScore = this.calculateCEMPScore(cempMappings);
    if (cempScore < 70) {
      recommendations.push('Strengthen community engagement practices to improve CEMP score');
    }

    return recommendations;
  }
}

// Export singleton instance
export const impactMeasurementService = new ImpactMeasurementService();
