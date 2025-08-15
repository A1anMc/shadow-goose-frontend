// Real grants data - unified data pipeline integration

import { grantsDataPipeline, UnifiedGrant } from './grants-data-pipeline';

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
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Get all available grants - UNIFIED DATA PIPELINE
  async getGrants(): Promise<{ grants: Grant[], dataSource: 'unified_pipeline' }> {
    try {
      // Use the unified data pipeline for real-time grant data
      const unifiedGrants = await grantsDataPipeline.getAllGrants();

      // Transform UnifiedGrant to Grant format for frontend compatibility
      const grants: Grant[] = unifiedGrants.map(unifiedGrant => ({
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
        // New unified pipeline fields
        priority_score: unifiedGrant.priority_score,
        days_until_deadline: unifiedGrant.days_until_deadline,
        sge_alignment_score: unifiedGrant.sge_alignment_score
      }));

      return {
        grants: grants,
        dataSource: 'unified_pipeline'
      };
    } catch (error) {
      console.error('Failed to fetch grants from unified pipeline:', error);
      throw new Error(`Unified grants pipeline failed: ${error}`);
    }
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

  // Get specific grant details
  async getGrant(id: number): Promise<Grant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grants/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grant');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching grant:', error);
      return null;
    }
  }

  // Search grants with filters - NO FALLBACK, ONLY REAL API
  async searchGrants(filters: GrantSearchFilters): Promise<{ grants: Grant[], dataSource: 'api' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot search real grants data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot search real grants data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Search grants API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.grants)) {
      throw new Error('Invalid search results structure from API');
    }

    const grants = data.grants || [];

    // Validate each grant has data_source === 'api'
    const invalidGrants = grants.filter(grant => grant.data_source !== 'api');
    if (invalidGrants.length > 0) {
      throw new Error(`Found ${invalidGrants.length} search results with non-API data source`);
    }

    // Mark API data with source indicator
    const grantsWithSource = grants.map(grant => ({
      ...grant,
      data_source: 'api' as const
    }));

    return {
      grants: grantsWithSource,
      dataSource: 'api'
    };
  }

  // Get AI-powered grant recommendations
  async getRecommendations(): Promise<GrantRecommendation[]> {
    if (!this.baseUrl) {
      console.warn('API URL not configured, using fallback recommendations');
      return this.getFallbackRecommendations();
    }

    try {
      const token = localStorage.getItem('sge_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/api/grants/recommendations`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        console.warn('Recommendations API failed, using fallback data');
        return this.getFallbackRecommendations();
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.recommendations)) {
        console.warn('Invalid recommendations data structure:', data);
        return this.getFallbackRecommendations();
      }

      return data.recommendations || [];
    } catch (error) {
      console.error('Error loading grants data:', error);
      return this.getFallbackRecommendations();
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


}

export const grantService = new GrantService();
