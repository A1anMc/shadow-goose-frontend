import { sgeMetricsTracker, SGEGrants, SGEGrant } from './sge-grants-data';

export interface Grant {
  id: number | string;
  name: string;
  description: string;
  amount: number;
  category: string;
  deadline: string;
  status: 'open' | 'closed' | 'expired' | 'closing_soon' | 'planning';
  eligibility: string[];
  requirements: string[];
  success_score?: number;
  success_probability?: number;
  time_to_apply?: number;
  sdg_alignment?: string[];
  geographic_focus?: string[];
  application_url?: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
  data_source?: 'api' | 'fallback' | 'mock' | 'real' | 'research';
}

export interface GrantApplication {
  id: number;
  grant_id: number;
  user_id: number;
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
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GrantComment {
  id: number;
  application_id: number;
  author_id: number;
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

class GrantService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Get all available grants
  async getGrants(): Promise<{ grants: Grant[], dataSource: 'api' | 'fallback' | 'mock' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/grants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Grants API error:', errorData.detail || `Status: ${response.status}`);
        // Return fallback data with clear indicator
        return {
          grants: this.getFallbackGrants(),
          dataSource: 'fallback'
        };
      }

      const data = await response.json();
      const grants = data.grants || [];

      // Mark API data with source indicator
      const grantsWithSource = grants.map(grant => ({
        ...grant,
        data_source: 'api' as const
      }));

      return {
        grants: grantsWithSource,
        dataSource: 'api'
      };
    } catch (error) {
      console.error('Grants API failed:', error);
      return {
        grants: this.getFallbackGrants(),
        dataSource: 'fallback'
      };
    }
  }

  // SGE-specific grants data when API is unavailable
  private getFallbackGrants(): Grant[] {
    // Convert SGE grants to Grant interface
    return SGEGrants.map(sgeGrant => ({
      id: sgeGrant.id,
      name: sgeGrant.name,
      description: sgeGrant.description,
      amount: sgeGrant.amount,
      category: sgeGrant.category,
      deadline: sgeGrant.deadline,
      status: sgeGrant.status,
      eligibility: sgeGrant.eligibility,
      requirements: sgeGrant.requirements,
      success_probability: sgeGrant.success_probability,
      time_to_apply: sgeGrant.time_to_apply,
      sdg_alignment: sgeGrant.sdg_alignment,
      geographic_focus: sgeGrant.geographic_focus,
      application_url: sgeGrant.application_url,
      contact_info: sgeGrant.contact_info,
      created_at: sgeGrant.last_updated,
      updated_at: sgeGrant.last_updated,
      data_source: sgeGrant.data_source === 'demo' ? 'fallback' : sgeGrant.data_source
    }));
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

  // Search grants with filters
  async searchGrants(filters: GrantSearchFilters): Promise<{ grants: Grant[], dataSource: 'api' | 'fallback' | 'mock' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/grants/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        console.warn('Search grants API failed, using SGE fallback data');
        return {
          grants: this.getFallbackGrants(),
          dataSource: 'fallback'
        };
      }

      const data = await response.json();
      const grants = data.grants || [];

      // Mark API data with source indicator
      const grantsWithSource = grants.map(grant => ({
        ...grant,
        data_source: 'api' as const
      }));

      return {
        grants: grantsWithSource,
        dataSource: 'api'
      };
    } catch (error) {
      console.error('Search grants failed:', error);
      return {
        grants: this.getFallbackGrants(),
        dataSource: 'fallback'
      };
    }
  }

  // Get AI-powered grant recommendations
  async getRecommendations(): Promise<GrantRecommendation[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/grants/recommendations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to get recommendations: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  }

  // Get grant categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grants/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Arts & Culture', 'Community', 'Education', 'Youth', 'Environment', 'Health'];
    }
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

  // Add comment to application
  async addComment(applicationId: number, content: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grant-applications/${applicationId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding comment:', error);
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
