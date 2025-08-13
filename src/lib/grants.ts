// Real grants data - no fallbacks

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

  // Get all available grants - NO FALLBACK, ONLY REAL API
  async getGrants(): Promise<{ grants: Grant[], dataSource: 'api' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot fetch real grants data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot fetch real grants data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Grants API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.grants)) {
      throw new Error('Invalid grants data structure from API');
    }

    const grants = data.grants || [];

    // Add data_source if not present (for backward compatibility)
    const grantsWithSource = grants.map(grant => ({
      ...grant,
      data_source: grant.data_source || 'api' as const
    }));

    return {
      grants: grantsWithSource,
      dataSource: 'api'
    };
  }

  // No fallback data - only real API data

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

  // No fallback recommendations - only real API data

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
