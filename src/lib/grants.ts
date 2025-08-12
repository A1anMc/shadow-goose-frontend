export interface Grant {
  id: number;
  name: string;
  description: string;
  amount: number;
  category: string;
  deadline: string;
  status: 'open' | 'closed' | 'expired';
  eligibility: string[];
  requirements: string[];
  success_score?: number;
  created_at: string;
  updated_at: string;
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
  async getGrants(): Promise<Grant[]> {
    try {
      if (!this.baseUrl) {
        return this.getMockGrants();
      }

      const response = await fetch(`${this.baseUrl}/api/grants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch grants');
      }

      const data = await response.json();
      return data.grants || [];
    } catch (error) {
      console.error('Error fetching grants:', error);
      return this.getMockGrants();
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

  // Search grants with filters
  async searchGrants(filters: GrantSearchFilters): Promise<Grant[]> {
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
        throw new Error('Failed to search grants');
      }

      const data = await response.json();
      return data.grants || [];
    } catch (error) {
      console.error('Error searching grants:', error);
      return this.getMockGrants();
    }
  }

  // Get AI-powered grant recommendations
  async getRecommendations(): Promise<GrantRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grants/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getMockRecommendations();
    }
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
      return this.getMockApplications();
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
      return this.getMockStats();
    }
  }

  // Mock data for development
  private getMockGrants(): Grant[] {
    return [
      {
        id: 1,
        name: "Victorian Creative Industries Grant",
        description: "Supporting creative projects in Victoria",
        amount: 50000,
        category: "Arts & Culture",
        deadline: "2025-09-15T23:59:59Z",
        status: "open",
        eligibility: ["Victoria-based organizations", "Creative projects", "Community impact"],
        requirements: ["Project proposal", "Budget breakdown", "Timeline"],
        success_score: 85,
        created_at: "2025-08-01T00:00:00Z",
        updated_at: "2025-08-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Community Impact Fund",
        description: "Funding for community development projects",
        amount: 25000,
        category: "Community",
        deadline: "2025-10-01T23:59:59Z",
        status: "open",
        eligibility: ["Community organizations", "Non-profit status", "Local impact"],
        requirements: ["Community consultation", "Impact assessment", "Partnerships"],
        success_score: 92,
        created_at: "2025-08-01T00:00:00Z",
        updated_at: "2025-08-01T00:00:00Z",
      },
      {
        id: 3,
        name: "Youth Innovation Grant",
        description: "Supporting youth-led innovative projects",
        amount: 15000,
        category: "Youth",
        deadline: "2025-11-15T23:59:59Z",
        status: "open",
        eligibility: ["Youth-led projects", "Innovation focus", "Ages 18-30"],
        requirements: ["Innovation proposal", "Youth engagement", "Scalability plan"],
        success_score: 78,
        created_at: "2025-08-01T00:00:00Z",
        updated_at: "2025-08-01T00:00:00Z",
      },
    ];
  }

  private getMockApplications(): GrantApplication[] {
    return [
      {
        id: 1,
        grant_id: 1,
        user_id: 1,
        status: "in_progress",
        priority: "high",
        assigned_to: 1,
        answers: [
          {
            id: 1,
            application_id: 1,
            question: "Describe your project",
            answer: "Youth employment initiative supporting young people in creative industries",
            author_id: 1,
            version: 1,
            created_at: "2025-08-10T10:00:00Z",
            updated_at: "2025-08-10T10:00:00Z",
          },
        ],
        comments: [
          {
            id: 1,
            application_id: 1,
            author_id: 1,
            content: "Great start! Let's add more detail about the creative industries focus.",
            created_at: "2025-08-10T11:00:00Z",
          },
        ],
        created_at: "2025-08-10T09:00:00Z",
        updated_at: "2025-08-10T11:00:00Z",
      },
    ];
  }

  private getMockRecommendations(): GrantRecommendation[] {
    return [
      {
        grant: this.getMockGrants()[0],
        match_score: 95,
        reasons: ["Perfect fit for creative industries", "Strong community impact", "Youth focus"],
        success_probability: 85,
      },
      {
        grant: this.getMockGrants()[1],
        match_score: 88,
        reasons: ["Community development focus", "Good funding amount", "Clear requirements"],
        success_probability: 92,
      },
    ];
  }

  private getMockStats() {
    return {
      total_applications: 5,
      submitted: 2,
      approved: 1,
      rejected: 0,
      draft: 3,
      success_rate: 50,
    };
  }
}

export const grantService = new GrantService();
