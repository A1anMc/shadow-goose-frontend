/**
 * OKR (Objectives & Key Results) Service
 * Comprehensive OKR management integrated with impact measurement frameworks
 */

import {
    OKRAlert,
    OKRCheckIn,
    OKRDashboard,
    OKRGrantMapping,
    OKRInitiative,
    OKRKeyResult,
    OKRMeasurement,
    OKRObjective,
    OKRPerformanceMetrics,
    OKRProjectMapping,
    OKRRelationshipMapping,
    OKRReport,
    OKRWorkflow
} from './types/okr-types';

export class OKRService {
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
  // OBJECTIVES MANAGEMENT
  // ============================================================================

  /**
   * Create new OKR objective
   */
  async createObjective(objective: Omit<OKRObjective, 'id' | 'created_at' | 'updated_at'>): Promise<OKRObjective> {
    const response = await this.request<OKRObjective>('/okr/objectives', {
      method: 'POST',
      body: JSON.stringify(objective)
    });
    return response.data;
  }

  /**
   * Get OKR objectives with filters
   */
  async getObjectives(filters?: {
    category?: string;
    status?: string;
    owner?: string;
    date_range?: { start: string; end: string };
  }): Promise<OKRObjective[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owner) params.append('owner', filters.owner);
    if (filters?.date_range) {
      params.append('start_date', filters.date_range.start);
      params.append('end_date', filters.date_range.end);
    }

    const response = await this.request<OKRObjective[]>(`/okr/objectives?${params.toString()}`);
    return response.data;
  }

  /**
   * Get single OKR objective with key results
   */
  async getObjective(objectiveId: string): Promise<OKRObjective & { key_results: OKRKeyResult[] }> {
    const response = await this.request<OKRObjective & { key_results: OKRKeyResult[] }>(`/okr/objectives/${objectiveId}`);
    return response.data;
  }

  /**
   * Update OKR objective
   */
  async updateObjective(objectiveId: string, updates: Partial<OKRObjective>): Promise<OKRObjective> {
    const response = await this.request<OKRObjective>(`/okr/objectives/${objectiveId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  /**
   * Delete OKR objective
   */
  async deleteObjective(objectiveId: string): Promise<void> {
    await this.request(`/okr/objectives/${objectiveId}`, {
      method: 'DELETE'
    });
  }

  // ============================================================================
  // KEY RESULTS MANAGEMENT
  // ============================================================================

  /**
   * Create new key result
   */
  async createKeyResult(keyResult: Omit<OKRKeyResult, 'id' | 'created_at' | 'updated_at'>): Promise<OKRKeyResult> {
    const response = await this.request<OKRKeyResult>('/okr/key-results', {
      method: 'POST',
      body: JSON.stringify(keyResult)
    });
    return response.data;
  }

  /**
   * Get key results for objective
   */
  async getKeyResults(objectiveId: string): Promise<OKRKeyResult[]> {
    const response = await this.request<OKRKeyResult[]>(`/okr/key-results?objective_id=${objectiveId}`);
    return response.data;
  }

  /**
   * Update key result
   */
  async updateKeyResult(keyResultId: string, updates: Partial<OKRKeyResult>): Promise<OKRKeyResult> {
    const response = await this.request<OKRKeyResult>(`/okr/key-results/${keyResultId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  /**
   * Update key result progress
   */
  async updateKeyResultProgress(keyResultId: string, currentValue: number, notes?: string): Promise<OKRKeyResult> {
    const response = await this.request<OKRKeyResult>(`/okr/key-results/${keyResultId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ current_value: currentValue, notes })
    });
    return response.data;
  }

  // ============================================================================
  // INITIATIVES MANAGEMENT
  // ============================================================================

  /**
   * Create new initiative
   */
  async createInitiative(initiative: Omit<OKRInitiative, 'id' | 'created_at' | 'updated_at'>): Promise<OKRInitiative> {
    const response = await this.request<OKRInitiative>('/okr/initiatives', {
      method: 'POST',
      body: JSON.stringify(initiative)
    });
    return response.data;
  }

  /**
   * Get initiatives for objective
   */
  async getInitiatives(objectiveId: string): Promise<OKRInitiative[]> {
    const response = await this.request<OKRInitiative[]>(`/okr/initiatives?objective_id=${objectiveId}`);
    return response.data;
  }

  /**
   * Update initiative
   */
  async updateInitiative(initiativeId: string, updates: Partial<OKRInitiative>): Promise<OKRInitiative> {
    const response = await this.request<OKRInitiative>(`/okr/initiatives/${initiativeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  // ============================================================================
  // CHECK-INS & MEASUREMENTS
  // ============================================================================

  /**
   * Create check-in
   */
  async createCheckIn(checkIn: Omit<OKRCheckIn, 'id' | 'created_at'>): Promise<OKRCheckIn> {
    const response = await this.request<OKRCheckIn>('/okr/check-ins', {
      method: 'POST',
      body: JSON.stringify(checkIn)
    });
    return response.data;
  }

  /**
   * Get check-ins for OKR
   */
  async getCheckIns(okrId: string): Promise<OKRCheckIn[]> {
    const response = await this.request<OKRCheckIn[]>(`/okr/check-ins?okr_id=${okrId}`);
    return response.data;
  }

  /**
   * Record measurement
   */
  async recordMeasurement(measurement: Omit<OKRMeasurement, 'id' | 'created_at'>): Promise<OKRMeasurement> {
    const response = await this.request<OKRMeasurement>('/okr/measurements', {
      method: 'POST',
      body: JSON.stringify(measurement)
    });
    return response.data;
  }

  /**
   * Get measurements for key result
   */
  async getMeasurements(keyResultId: string): Promise<OKRMeasurement[]> {
    const response = await this.request<OKRMeasurement[]>(`/okr/measurements?key_result_id=${keyResultId}`);
    return response.data;
  }

  // ============================================================================
  // DASHBOARD & REPORTING
  // ============================================================================

  /**
   * Get OKR dashboard
   */
  async getDashboard(): Promise<OKRDashboard> {
    const response = await this.request<OKRDashboard>('/okr/dashboard');
    return response.data;
  }

  /**
   * Generate OKR report
   */
  async generateReport(startDate: string, endDate: string, filters?: {
    categories?: string[];
    owners?: string[];
    status?: string[];
  }): Promise<OKRReport> {
    const response = await this.request<OKRReport>('/okr/reports', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        filters
      })
    });
    return response.data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<OKRPerformanceMetrics> {
    const response = await this.request<OKRPerformanceMetrics>('/okr/performance-metrics');
    return response.data;
  }

  // ============================================================================
  // INTEGRATION MAPPINGS
  // ============================================================================

  /**
   * Map OKR to project
   */
  async mapToProject(mapping: Omit<OKRProjectMapping, 'id' | 'created_at'>): Promise<OKRProjectMapping> {
    const response = await this.request<OKRProjectMapping>('/okr/project-mappings', {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  /**
   * Get project mappings for OKR
   */
  async getProjectMappings(okrId: string): Promise<OKRProjectMapping[]> {
    const response = await this.request<OKRProjectMapping[]>(`/okr/project-mappings?okr_id=${okrId}`);
    return response.data;
  }

  /**
   * Map OKR to grant
   */
  async mapToGrant(mapping: Omit<OKRGrantMapping, 'id' | 'created_at'>): Promise<OKRGrantMapping> {
    const response = await this.request<OKRGrantMapping>('/okr/grant-mappings', {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  /**
   * Get grant mappings for OKR
   */
  async getGrantMappings(okrId: string): Promise<OKRGrantMapping[]> {
    const response = await this.request<OKRGrantMapping[]>(`/okr/grant-mappings?okr_id=${okrId}`);
    return response.data;
  }

  /**
   * Map OKR to relationship
   */
  async mapToRelationship(mapping: Omit<OKRRelationshipMapping, 'id' | 'created_at'>): Promise<OKRRelationshipMapping> {
    const response = await this.request<OKRRelationshipMapping>('/okr/relationship-mappings', {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  /**
   * Get relationship mappings for OKR
   */
  async getRelationshipMappings(okrId: string): Promise<OKRRelationshipMapping[]> {
    const response = await this.request<OKRRelationshipMapping[]>(`/okr/relationship-mappings?okr_id=${okrId}`);
    return response.data;
  }

  // ============================================================================
  // ALERTS & NOTIFICATIONS
  // ============================================================================

  /**
   * Get active alerts
   */
  async getAlerts(): Promise<OKRAlert[]> {
    const response = await this.request<OKRAlert[]>('/okr/alerts');
    return response.data;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<OKRAlert> {
    const response = await this.request<OKRAlert>(`/okr/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
      body: JSON.stringify({ acknowledged_by: acknowledgedBy })
    });
    return response.data;
  }

  // ============================================================================
  // WORKFLOW & APPROVALS
  // ============================================================================

  /**
   * Get workflow for OKR
   */
  async getWorkflow(okrId: string): Promise<OKRWorkflow> {
    const response = await this.request<OKRWorkflow>(`/okr/workflows/${okrId}`);
    return response.data;
  }

  /**
   * Update workflow stage
   */
  async updateWorkflowStage(okrId: string, stage: string, status: string, notes?: string): Promise<OKRWorkflow> {
    const response = await this.request<OKRWorkflow>(`/okr/workflows/${okrId}/stages`, {
      method: 'PUT',
      body: JSON.stringify({ stage, status, notes })
    });
    return response.data;
  }

  /**
   * Approve OKR
   */
  async approveOKR(okrId: string, approver: string, comments?: string): Promise<OKRWorkflow> {
    const response = await this.request<OKRWorkflow>(`/okr/workflows/${okrId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver, comments })
    });
    return response.data;
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Calculate OKR progress
   */
  async calculateProgress(okrId: string): Promise<{
    objective_progress: number;
    key_results_progress: number[];
    overall_progress: number;
    status: string;
  }> {
    const response = await this.request<{
      objective_progress: number;
      key_results_progress: number[];
      overall_progress: number;
      status: string;
    }>(`/okr/analytics/progress/${okrId}`);
    return response.data;
  }

  /**
   * Get impact framework alignment
   */
  async getImpactAlignment(okrId: string): Promise<{
    sdg_alignment: number;
    victorian_alignment: number;
    cemp_alignment: number;
    triple_bottom_line_alignment: number;
    overall_alignment: number;
  }> {
    const response = await this.request<{
      sdg_alignment: number;
      victorian_alignment: number;
      cemp_alignment: number;
      triple_bottom_line_alignment: number;
      overall_alignment: number;
    }>(`/okr/analytics/impact-alignment/${okrId}`);
    return response.data;
  }

  /**
   * Get team performance insights
   */
  async getTeamInsights(): Promise<{
    engagement_score: number;
    completion_rate: number;
    average_progress: number;
    top_performers: string[];
    areas_for_improvement: string[];
  }> {
    const response = await this.request<{
      engagement_score: number;
      completion_rate: number;
      average_progress: number;
      top_performers: string[];
      areas_for_improvement: string[];
    }>('/okr/analytics/team-insights');
    return response.data;
  }

  // ============================================================================
  // EXPORT & INTEGRATION
  // ============================================================================

  /**
   * Export OKR data
   */
  async exportOKRs(format: 'pdf' | 'excel' | 'csv' | 'json', filters?: {
    date_range?: { start: string; end: string };
    categories?: string[];
    status?: string[];
    owners?: string[];
  }): Promise<Blob> {
    const response = await this.request<Blob>('/okr/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
      headers: {
        'Accept': this.getAcceptHeader(format)
      }
    });
    return response.data;
  }

  /**
   * Import OKR data
   */
  async importOKRs(file: File): Promise<{
    imported_objectives: number;
    imported_key_results: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request<{
      imported_objectives: number;
      imported_key_results: number;
      errors: string[];
    }>('/okr/import', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.baseUrl}/api${endpoint}`;
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
    return { data: data as T };
  }

  private getAcceptHeader(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/json';
    }
  }
}

// Export singleton instance
export const okrService = new OKRService();
