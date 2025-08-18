// Real grants data - unified data pipeline integration

import { externalGrantsService } from './external-grants-service';
import { grantsDataPipeline } from './grants-data-pipeline';
import { liveDataMonitor } from './live-data-monitor';
import { liveDataValidator } from './live-data-validator';
import { successRateMonitor } from './success-rate-monitor';

export interface Grant {
  id: number | string;
  name: string;
  description: string;
  amount: number;
  category: string;
  deadline: string;
  status: 'open' | 'closed' | 'expired' | 'closing_soon' | 'closing_today' | 'planning';
  eligibility: string[];
  requirements: string[];
  success_score?: number;
  success_probability?: number;
  time_to_apply?: number;
  sdg_alignment?: string[];
  geographic_focus?: string[];
  application_url?: string;
  contact_info?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
  data_source?: 'api' | 'fallback' | 'mock' | 'real' | 'research' | 'creative_australia' | 'screen_australia' | 'vic_screen' | 'regional_arts';
  // New unified pipeline fields
  priority_score?: number;
  days_until_deadline?: number;
  sge_alignment_score?: number;
}

export interface GrantQuestion {
  id: string;
  question: string;
  type: 'budget' | 'creative' | 'impact' | 'legal' | 'technical' | 'general' | 'methodology' | 'timeline' | 'team' | 'sustainability';
  required: boolean;
  max_length?: number;
  options?: string[];
  help_text?: string;
  category: 'project_overview' | 'objectives' | 'methodology' | 'budget' | 'timeline' | 'team' | 'outcomes' | 'risk_management' | 'sustainability';
  assigned_to?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  answer?: string;
  last_updated?: string;
  updated_by?: number;
}

export interface TeamAssignment {
  id: number;
  application_id: number;
  question_id?: string;
  user_id: number;
  role: 'writer' | 'reviewer' | 'approver' | 'coordinator' | 'expert';
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  responsibilities: string[];
  permissions: string[];
}

export interface Collaborator {
  id: number;
  application_id: number;
  user_id: number;
  email: string;
  name: string;
  role: 'writer' | 'reviewer' | 'approver' | 'viewer';
  invited_at: string;
  accepted_at?: string;
  permissions: string[];
  last_active?: string;
}

export interface ApplicationProgress {
  total_questions: number;
  completed_questions: number;
  percentage_complete: number;
  sections_complete: string[];
  sections_pending: string[];
  estimated_completion_time?: string;
  last_activity?: string;
  next_deadline?: string;
}

export interface DeadlineReminder {
  id: number;
  application_id: number;
  type: 'draft' | 'review' | 'submission' | 'follow_up';
  due_date: string;
  reminder_date: string;
  sent: boolean;
  message: string;
  recipients: string[];
}

export interface GrantProject {
  id: number;
  grant_application_id: number;
  project_name: string;
  project_description: string;
  start_date: string;
  end_date: string;
  budget: number;
  team_members: ProjectTeamMember[];
  objectives: ProjectObjective[];
  deliverables: ProjectDeliverable[];
  timeline: ProjectMilestone[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  id: number;
  project_id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  responsibilities: string[];
  start_date: string;
  end_date?: string;
  hours_per_week: number;
  hourly_rate?: number;
  status: 'active' | 'inactive' | 'completed';
}

export interface ProjectObjective {
  id: number;
  project_id: number;
  title: string;
  description: string;
  measurable_outcomes: string[];
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
}

export interface ProjectDeliverable {
  id: number;
  project_id: number;
  title: string;
  description: string;
  type: 'document' | 'event' | 'product' | 'service' | 'report';
  due_date: string;
  assigned_to: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  file_url?: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  dependencies: number[];
  deliverables: number[];
}

export interface GrantApplication {
  id: number;
  grant_id: number;
  user_id: number;
  title?: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: number;
  answers: GrantAnswer[];
  comments: GrantComment[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  // Enhanced project management fields
  project_id?: number; // Link to SGE project
  team_assignments: TeamAssignment[];
  questions: GrantQuestion[];
  progress: ApplicationProgress;
  collaborators: Collaborator[];
  workflow_stage: 'planning' | 'writing' | 'review' | 'approval' | 'submission';
  deadline_reminders: DeadlineReminder[];
}

export interface GrantAnswer {
  id: number;
  application_id: number;
  question: string;
  answer: string;
  author_id: number;
  author?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GrantComment {
  id: number;
  application_id: number;
  author_id: number;
  author?: string;
  content: string;
  created_at: string;
}

export interface GrantSearchFilters {
  category?: string;
  min_amount?: number;
  max_amount?: number;
  keywords?: string;
  deadline_before?: string;
  status?: string;
}

export interface GrantRecommendation {
  grant: Grant;
  match_score: number;
  reasons: string[];
  success_probability: number;
}

export class GrantService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://shadow-goose-api.onrender.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get grants with live data validation and external sources
   */
  async getGrants(): Promise<Grant[]> {
    try {
      // Validate we have live data before proceeding
      const systemHealth = liveDataValidator.getSystemHealth();
      // Temporarily allow grants to load even if live data validation hasn't run yet
      if (!systemHealth.liveDataAvailable && systemHealth.lastValidation !== null) {
        throw new Error('CRITICAL: No live data available. System requires live data sources.');
      }

      // Fetch from primary API
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/api/grants`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch grants: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response data
      const validation = await liveDataValidator.validateData(data, `${this.baseUrl}/api/grants`);

      if (!validation.isValid || !validation.isLiveData) {
        throw new Error(`CRITICAL: Invalid or non-live data received: ${validation.errors.join(', ')}`);
      }

      // Fetch from external sources
      const externalResults = await externalGrantsService.fetchAllSources();
      const externalGrants: Grant[] = [];
      
      externalResults.forEach(result => {
        if (result.success) {
          externalGrants.push(...result.grants);
        } else {
          console.warn(`External source ${result.source} failed:`, result.errors);
        }
      });

      // Combine primary API grants with external grants
      const allGrants = [...(data.grants || []), ...externalGrants];

      // Update monitoring with successful API call
      liveDataMonitor.emit('api-call-success', { endpoint: '/api/grants', timestamp: new Date() });

      // Track success rate for grants API
      const grantsApiMetric = successRateMonitor.getMetric('grants-api-success');
      if (grantsApiMetric) {
        grantsApiMetric.history.push({
          timestamp: new Date(),
          value: 100
        });
      }

      return allGrants;
    } catch (error) {
      console.error('Error fetching grants:', error);

      // Update monitoring with failed API call
      liveDataMonitor.emit('api-call-failed', {
        endpoint: '/api/grants',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // Track success rate for grants API (failure)
      const grantsApiMetric = successRateMonitor.getMetric('grants-api-success');
      if (grantsApiMetric) {
        grantsApiMetric.history.push({
          timestamp: new Date(),
          value: 0
        });
      }

      // NEVER fall back to test data - throw error instead
      throw new Error(`CRITICAL: Failed to fetch live grants data. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get grants with data source information (for backward compatibility)
   */
  async getGrantsWithSource(): Promise<{ grants: Grant[], dataSource: string }> {
    const grants = await this.getGrants();
    return {
      grants,
      dataSource: 'api'
    };
  }

  /**
   * Get external grant sources statistics
   */
  async getExternalSourcesStats(): Promise<{
    totalSources: number;
    enabledSources: number;
    totalGrants: number;
    lastSync: string;
    sourcesSynced: number;
  }> {
    const stats = externalGrantsService.getSourceStats();
    const syncStatus = externalGrantsService.getLastSyncStatus();
    
    return {
      ...stats,
      lastSync: syncStatus.lastSync,
      sourcesSynced: syncStatus.sourcesSynced
    };
  }

  /**
   * Get grants from specific external source
   */
  async getGrantsFromSource(sourceId: string): Promise<Grant[]> {
    const result = await externalGrantsService.fetchFromSource(sourceId);
    if (!result.success) {
      throw new Error(`Failed to fetch from ${sourceId}: ${result.errors.join(', ')}`);
    }
    return result.grants;
  }

  // Get high priority grants from unified pipeline
  async getHighPriorityGrants(limit: number = 10): Promise<Grant[]> {
    try {
      const unifiedGrants = await grantsDataPipeline.getHighPriorityGrants(limit);

      return unifiedGrants.map(unifiedGrant => ({
        id: unifiedGrant.id,
        name: unifiedGrant.title,
        description: unifiedGrant.description,
        amount: unifiedGrant.amount,
        category: unifiedGrant.category,
        deadline: unifiedGrant.deadline,
        status: unifiedGrant.status,
        eligibility: unifiedGrant.eligibility_criteria,
        requirements: unifiedGrant.required_documents,
        success_score: unifiedGrant.success_score,
        success_probability: unifiedGrant.success_score,
        time_to_apply: unifiedGrant.days_until_deadline,
        organization: unifiedGrant.organization || 'Unknown Organization',
        created_at: unifiedGrant.created_at,
        updated_at: unifiedGrant.updated_at,
        data_source: unifiedGrant.data_source,
        priority_score: unifiedGrant.priority_score,
        days_until_deadline: unifiedGrant.days_until_deadline,
        sge_alignment_score: unifiedGrant.sge_alignment_score
      }));
    } catch (error) {
      console.error('Failed to fetch high priority grants:', error);
      return [];
    }
  }

  // Get closing soon grants
  async getClosingSoonGrants(): Promise<Grant[]> {
    try {
      const unifiedGrants = await grantsDataPipeline.getClosingSoonGrants();

      return unifiedGrants.map(unifiedGrant => ({
        id: unifiedGrant.id,
        name: unifiedGrant.title,
        description: unifiedGrant.description,
        amount: unifiedGrant.amount,
        category: unifiedGrant.category,
        deadline: unifiedGrant.deadline,
        status: unifiedGrant.status,
        eligibility: unifiedGrant.eligibility_criteria,
        requirements: unifiedGrant.required_documents,
        success_score: unifiedGrant.success_score,
        success_probability: unifiedGrant.success_score,
        time_to_apply: unifiedGrant.days_until_deadline,
        organization: unifiedGrant.organization || 'Unknown Organization',
        created_at: unifiedGrant.created_at,
        updated_at: unifiedGrant.updated_at,
        data_source: unifiedGrant.data_source,
        priority_score: unifiedGrant.priority_score,
        days_until_deadline: unifiedGrant.days_until_deadline,
        sge_alignment_score: unifiedGrant.sge_alignment_score
      }));
    } catch (error) {
      console.error('Failed to fetch closing soon grants:', error);
      return [];
    }
  }

  // Get pipeline statistics
  async getPipelineStats(): Promise<any> {
    try {
      return await grantsDataPipeline.getPipelineStats();
    } catch (error) {
      console.error('Failed to fetch pipeline stats:', error);
      return null;
    }
  }

  // Get pipeline health status
  async getPipelineHealth(): Promise<any> {
    try {
      return await grantsDataPipeline.getHealthStatus();
    } catch (error) {
      console.error('Failed to fetch pipeline health:', error);
      return null;
    }
  }

  /**
   * Get a specific grant with live data validation
   */
  async getGrant(id: number | string): Promise<Grant | null> {
    try {
      // Validate we have live data before proceeding
      const systemHealth = liveDataValidator.getSystemHealth();
      if (!systemHealth.liveDataAvailable) {
        throw new Error('CRITICAL: No live data available. System requires live data sources.');
      }

      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const response = await fetch(`${this.baseUrl}/api/grants/${numericId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grant');
      }

      const data = await response.json();

      // Validate the response data
      const validation = await liveDataValidator.validateData(data, `${this.baseUrl}/api/grants/${numericId}`);

      if (!validation.isValid || !validation.isLiveData) {
        throw new Error(`CRITICAL: Invalid or non-live data received: ${validation.errors.join(', ')}`);
      }

      // Update monitoring with successful API call
      liveDataMonitor.emit('api-call-success', { endpoint: `/api/grants/${numericId}`, timestamp: new Date() });

      return data;
    } catch (error) {
      console.error('Error fetching grant from API:', error);

      // Update monitoring with failed API call
      liveDataMonitor.emit('api-call-failed', {
        endpoint: `/api/grants/${id}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // NEVER fall back to test data - throw error instead
      throw new Error(`CRITICAL: Failed to fetch live grant data. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search grants with live data validation
   */
  async searchGrants(query: string, filters?: GrantSearchFilters): Promise<Grant[]> {
    try {
      // Validate we have live data before proceeding
      const systemHealth = liveDataValidator.getSystemHealth();
      if (!systemHealth.liveDataAvailable) {
        throw new Error('CRITICAL: No live data available. System requires live data sources.');
      }

      const response = await fetch(`${this.baseUrl}/api/grants/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search grants: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response data
      const validation = await liveDataValidator.validateData(data, `${this.baseUrl}/api/grants/search`);

      if (!validation.isValid || !validation.isLiveData) {
        throw new Error(`CRITICAL: Invalid or non-live data received: ${validation.errors.join(', ')}`);
      }

      // Update monitoring with successful API call
      liveDataMonitor.emit('api-call-success', { endpoint: '/api/grants/search', timestamp: new Date() });

      return data.grants || [];
    } catch (error) {
      console.error('Error searching grants:', error);

      // Update monitoring with failed API call
      liveDataMonitor.emit('api-call-failed', {
        endpoint: '/api/grants/search',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // NEVER fall back to test data - throw error instead
      throw new Error(`CRITICAL: Failed to search live grants data. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search grants with filters (for backward compatibility)
   */
  async searchGrantsWithFilters(filters: GrantSearchFilters): Promise<{ grants: Grant[], dataSource: 'api' }> {
    const grants = await this.searchGrants('', filters);
    return {
      grants,
      dataSource: 'api'
    };
  }

  /**
   * Get grant recommendations with live data validation
   */
  async getRecommendations(): Promise<GrantRecommendation[]> {
    try {
      // Validate we have live data before proceeding
      const systemHealth = liveDataValidator.getSystemHealth();
      if (!systemHealth.liveDataAvailable) {
        throw new Error('CRITICAL: No live data available. System requires live data sources.');
      }

      const response = await fetch(`${this.baseUrl}/api/grants/recommendations`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the response data
      const validation = await liveDataValidator.validateData(data, `${this.baseUrl}/api/grants/recommendations`);

      if (!validation.isValid || !validation.isLiveData) {
        throw new Error(`CRITICAL: Invalid or non-live data received: ${validation.errors.join(', ')}`);
      }

      // Update monitoring with successful API call
      liveDataMonitor.emit('api-call-success', { endpoint: '/api/grants/recommendations', timestamp: new Date() });

      return data.recommendations || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);

      // Update monitoring with failed API call
      liveDataMonitor.emit('api-call-failed', {
        endpoint: '/api/grants/recommendations',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // NEVER fall back to test data - throw error instead
      throw new Error(`CRITICAL: Failed to fetch live recommendations data. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback recommendations for when API is unavailable
  private getFallbackRecommendations(): GrantRecommendation[] {
    return [];
  }

  // Get grant categories - only real API data
  async getCategories(): Promise<string[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot fetch real categories');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot fetch real categories');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/categories`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Categories API failed');
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.categories)) {
      throw new Error('Invalid categories data structure from API');
    }

    return data.categories || [];
  }

  // Get user's grant applications
  async getApplications(): Promise<GrantApplication[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      return data.applications || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Failed to fetch grant applications');
    }
  }

  // Create new grant application
  async createApplication(grantId: number): Promise<GrantApplication | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grant_id: grantId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating application:', error);
      return null;
    }
  }

  // Update application answers
  async updateAnswers(applicationId: number, answers: GrantAnswer[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating answers:', error);
      return false;
    }
  }



  // Submit application
  async submitApplication(applicationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error submitting application:', error);
      return false;
    }
  }

  // Get specific application
  async getApplication(applicationId: number): Promise<GrantApplication | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application:', error);
      return null;
    }
  }



  // Update application content
  async updateApplicationContent(applicationId: number, content: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating application content:', error);
      return false;
    }
  }

  // Get application answers
  async getApplicationAnswers(applicationId: number): Promise<GrantAnswer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/answers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application answers');
      }

      const data = await response.json();
      return data.answers || [];
    } catch (error) {
      console.error('Error fetching application answers:', error);
      return [];
    }
  }

  // Get application comments
  async getApplicationComments(applicationId: number): Promise<GrantComment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application comments');
      }

      const data = await response.json();
      return data.comments || [];
    } catch (error) {
      console.error('Error fetching application comments:', error);
      return [];
    }
  }

  // Update application answer
  async updateApplicationAnswer(
    applicationId: number,
    question: string,
    answer: string,
    author: string
  ): Promise<GrantAnswer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer, author }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application answer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating application answer:', error);
      return null;
    }
  }

  // Add comment to application
  async addComment(
    applicationId: number,
    content: string,
    author: string
  ): Promise<GrantComment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  // Get application statistics
  async getApplicationStats(): Promise<{
    total_applications: number;
    submitted: number;
    approved: number;
    rejected: number;
    draft: number;
    success_rate: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch grant statistics');
    }
  }

  // Enhanced project management methods

  // Create project from grant application
  async createProjectFromApplication(applicationId: number, projectData: Partial<GrantProject>): Promise<GrantProject | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  // Assign team members to questions
  async assignTeamMember(applicationId: number, assignment: Partial<TeamAssignment>): Promise<TeamAssignment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) {
        throw new Error('Failed to assign team member');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning team member:', error);
      return null;
    }
  }

  // Get team assignments for an application
  async getTeamAssignments(applicationId: number): Promise<TeamAssignment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team assignments');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching team assignments:', error);
      return [];
    }
  }

  // Update question answer
  async updateQuestionAnswer(applicationId: number, questionId: string, answer: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating question answer:', error);
      return false;
    }
  }

  // Get application questions
  async getApplicationQuestions(applicationId: number): Promise<GrantQuestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application questions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application questions:', error);
      return [];
    }
  }

  // Invite collaborator
  async inviteCollaborator(applicationId: number, collaboratorData: Partial<Collaborator>): Promise<Collaborator | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/collaborators`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collaboratorData),
      });

      if (!response.ok) {
        throw new Error('Failed to invite collaborator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      return null;
    }
  }

  // Get application collaborators
  async getCollaborators(applicationId: number): Promise<Collaborator[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collaborators');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      return [];
    }
  }

  // Get application progress
  async getApplicationProgress(applicationId: number): Promise<ApplicationProgress | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch application progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application progress:', error);
      return null;
    }
  }

  // Set deadline reminder
  async setDeadlineReminder(applicationId: number, reminder: Partial<DeadlineReminder>): Promise<DeadlineReminder | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      });

      if (!response.ok) {
        throw new Error('Failed to set deadline reminder');
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting deadline reminder:', error);
      return null;
    }
  }

  // Get projects linked to grants
  async getGrantProjects(grantId: number): Promise<GrantProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grants/${grantId}/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grant projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching grant projects:', error);
      return [];
    }
  }

  // Link application to existing project
  async linkToProject(applicationId: number, projectId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/link-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error linking to project:', error);
      return false;
    }
  }

  // Get available team members for assignment
  async getAvailableTeamMembers(): Promise<Array<{ id: number; name: string; email: string; skills: string[]; availability: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/team/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  // Get question templates by grant type
  async getQuestionTemplates(grantCategory: string): Promise<GrantQuestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-questions/templates/${grantCategory}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question templates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching question templates:', error);
      return this.getDefaultQuestionTemplates(grantCategory);
    }
  }

  // Default question templates when API is unavailable
  private getDefaultQuestionTemplates(grantCategory: string): GrantQuestion[] {
    const baseQuestions: GrantQuestion[] = [
      {
        id: 'project_overview',
        question: 'Provide a comprehensive overview of your project',
        type: 'general',
        required: true,
        max_length: 1000,
        category: 'project_overview',
        help_text: 'Describe your project in detail, including its purpose, scope, and expected impact',
        status: 'pending'
      },
      {
        id: 'objectives',
        question: 'What are the main objectives of your project?',
        type: 'impact',
        required: true,
        max_length: 800,
        category: 'objectives',
        help_text: 'List specific, measurable objectives with clear timelines',
        status: 'pending'
      },
      {
        id: 'methodology',
        question: 'How will you implement this project?',
        type: 'methodology',
        required: true,
        max_length: 1000,
        category: 'methodology',
        help_text: 'Describe your approach, methods, and implementation strategy',
        status: 'pending'
      },
      {
        id: 'budget',
        question: 'Provide a detailed budget breakdown',
        type: 'budget',
        required: true,
        max_length: 600,
        category: 'budget',
        help_text: 'Break down costs by category with justification for each item',
        status: 'pending'
      },
      {
        id: 'timeline',
        question: 'What is your project timeline?',
        type: 'timeline',
        required: true,
        max_length: 500,
        category: 'timeline',
        help_text: 'Provide key milestones and deadlines',
        status: 'pending'
      },
      {
        id: 'team',
        question: 'Who will be involved in this project?',
        type: 'team',
        required: true,
        max_length: 600,
        category: 'team',
        help_text: 'Describe team members, roles, and qualifications',
        status: 'pending'
      },
      {
        id: 'outcomes',
        question: 'What outcomes do you expect to achieve?',
        type: 'impact',
        required: true,
        max_length: 800,
        category: 'outcomes',
        help_text: 'Describe measurable outcomes and impact metrics',
        status: 'pending'
      },
      {
        id: 'risk_management',
        question: 'What risks do you anticipate and how will you manage them?',
        type: 'general',
        required: true,
        max_length: 600,
        category: 'risk_management',
        help_text: 'Identify potential risks and mitigation strategies',
        status: 'pending'
      },
      {
        id: 'sustainability',
        question: 'How will this project be sustainable beyond the grant period?',
        type: 'sustainability',
        required: true,
        max_length: 600,
        category: 'sustainability',
        help_text: 'Explain long-term viability and ongoing support',
        status: 'pending'
      }
    ];

    // Add category-specific questions
    if (grantCategory === 'arts_culture') {
      baseQuestions.push({
        id: 'community_engagement',
        question: 'How will you engage the community in your arts project?',
        type: 'general',
        required: true,
        max_length: 500,
        category: 'methodology',
        help_text: 'Describe community participation and engagement strategies',
        status: 'pending'
      });
    }

    if (grantCategory === 'documentary') {
      baseQuestions.push({
        id: 'distribution_strategy',
        question: 'What is your distribution and audience reach strategy?',
        type: 'general',
        required: true,
        max_length: 500,
        category: 'outcomes',
        help_text: 'Explain how you will reach your target audience',
        status: 'pending'
      });
    }

    return baseQuestions;
  }

  /**
   * Utility method to get authentication token
   */
  private async getAuthToken(): Promise<string> {
    // Use the auth service for consistent token management
    const { authService } = await import('./auth');
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      try {
        // Try to auto-login if not authenticated
        const success = await authService.autoLogin();
        if (!success) {
          throw new Error('Authentication required');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        throw new Error('Authentication required. Please login.');
      }
    }
    
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return token;
  }
}

export const grantService = new GrantService();
