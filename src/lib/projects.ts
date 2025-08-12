import { authService } from './auth';

export interface SGEProject {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  amount?: number;
  baseline_data?: BaselineData;
  current_data?: CurrentData;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface BaselineData {
  start_date: string;
  target_participants: number;
  target_outcomes: string[];
  initial_funding: number;
  geographic_area: string;
  target_demographics: string[];
  key_indicators: KeyIndicator[];
}

export interface CurrentData {
  current_participants: number;
  current_outcomes: string[];
  current_funding: number;
  progress_percentage: number;
  last_updated: string;
  key_metrics: KeyMetric[];
}

export interface KeyIndicator {
  id: number;
  name: string;
  description: string;
  baseline_value: number;
  target_value: number;
  unit: string;
  category: 'participant' | 'outcome' | 'financial' | 'impact';
}

export interface KeyMetric {
  indicator_id: number;
  current_value: number;
  progress_percentage: number;
  last_measured: string;
  notes: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  baseline_data: Omit<BaselineData, 'key_indicators'>;
  key_indicators: Omit<KeyIndicator, 'id'>[];
}

class SGEProjectService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Get all SGE projects with improved authentication
  async getProjects(): Promise<SGEProject[]> {
    if (!this.baseUrl) {
      console.warn('API URL not configured, using fallback projects');
      return this.getFallbackProjects();
    }

    try {
      const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects`);

      if (!response.ok) {
        throw new Error(`Projects API failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.projects)) {
        throw new Error('Invalid projects data structure');
      }

      return data.projects;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return this.getFallbackProjects();
    }
  }

  // Fallback projects when API is unavailable
  private getFallbackProjects(): SGEProject[] {
    return [
      {
        id: 1,
        name: "Youth Employment Series",
        description: "Documentary series focusing on youth employment challenges and solutions",
        status: "active",
        amount: 75000,
        baseline_data: {
          start_date: "2024-01-15",
          target_participants: 500,
          target_outcomes: ["Increased awareness", "Policy influence", "Community engagement"],
          initial_funding: 75000,
          geographic_area: "Regional Victoria",
          target_demographics: ["Youth 18-25", "Employers", "Policy makers"],
          key_indicators: [
            {
              id: 1,
              name: "Youth Engagement",
              description: "Number of youth participants",
              baseline_value: 0,
              target_value: 500,
              unit: "participants",
              category: "participant"
            }
          ]
        },
        current_data: {
          current_participants: 320,
          current_outcomes: ["Increased awareness", "Community engagement"],
          current_funding: 75000,
          progress_percentage: 64,
          last_updated: "2024-08-12",
          key_metrics: [
            {
              indicator_id: 1,
              current_value: 320,
              progress_percentage: 64,
              last_measured: "2024-08-12",
              notes: "Strong community response"
            }
          ]
        },
        created_by: 1,
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-08-12T00:00:00Z"
      },
      {
        id: 2,
        name: "Community Health Series",
        description: "Health awareness and education content for regional communities",
        status: "active",
        amount: 50000,
        baseline_data: {
          start_date: "2024-03-01",
          target_participants: 1000,
          target_outcomes: ["Health literacy", "Behavioral change", "Access to services"],
          initial_funding: 50000,
          geographic_area: "Regional Australia",
          target_demographics: ["General public", "Healthcare workers", "Community leaders"],
          key_indicators: [
            {
              id: 2,
              name: "Health Literacy",
              description: "Health knowledge improvement",
              baseline_value: 0,
              target_value: 1000,
              unit: "participants",
              category: "outcome"
            }
          ]
        },
        current_data: {
          current_participants: 750,
          current_outcomes: ["Health literacy", "Behavioral change"],
          current_funding: 50000,
          progress_percentage: 75,
          last_updated: "2024-08-12",
          key_metrics: [
            {
              indicator_id: 2,
              current_value: 750,
              progress_percentage: 75,
              last_measured: "2024-08-12",
              notes: "Excellent community engagement"
            }
          ]
        },
        created_by: 1,
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-08-12T00:00:00Z"
      },
      {
        id: 3,
        name: "Digital Literacy Project",
        description: "Digital skills training and content creation for underserved communities",
        status: "active",
        amount: 60000,
        baseline_data: {
          start_date: "2024-02-15",
          target_participants: 300,
          target_outcomes: ["Digital skills", "Content creation", "Employment opportunities"],
          initial_funding: 60000,
          geographic_area: "Regional Victoria",
          target_demographics: ["Adults 25-65", "Unemployed", "Career changers"],
          key_indicators: [
            {
              id: 3,
              name: "Digital Skills",
              description: "Participants with improved digital skills",
              baseline_value: 0,
              target_value: 300,
              unit: "participants",
              category: "outcome"
            }
          ]
        },
        current_data: {
          current_participants: 180,
          current_outcomes: ["Digital skills", "Content creation"],
          current_funding: 60000,
          progress_percentage: 60,
          last_updated: "2024-08-12",
          key_metrics: [
            {
              indicator_id: 3,
              current_value: 180,
              progress_percentage: 60,
              last_measured: "2024-08-12",
              notes: "Steady progress, strong participant retention"
            }
          ]
        },
        created_by: 1,
        created_at: "2024-02-15T00:00:00Z",
        updated_at: "2024-08-12T00:00:00Z"
      }
    ];
  }

  // Get specific SGE project
  async getProject(id: number): Promise<SGEProject | null> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch project: ${response.status}`);
    }

    return await response.json();
  }

  // Create new SGE project
  async createProject(projectData: CreateProjectRequest): Promise<SGEProject | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects`, {
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

  // Update SGE project
  async updateProject(id: number, updates: Partial<SGEProject>): Promise<SGEProject | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  // Update project current data (progress tracking)
  async updateCurrentData(projectId: number, currentData: Partial<CurrentData>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/current-data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentData),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating current data:', error);
      return false;
    }
  }

  // Get project statistics
  async getProjectStats(): Promise<{
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    total_participants: number;
    total_funding: number;
    average_progress: number;
  }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    // Get all projects and calculate stats
    const projects = await this.getProjects();

    const total_projects = projects.length;
    const active_projects = projects.filter(p => p.status === 'active').length;
    const completed_projects = projects.filter(p => p.status === 'completed').length;

    // Calculate totals from project data
    const total_participants = projects.reduce((sum, p) => {
      return sum + (p.current_data?.current_participants || 0);
    }, 0);

    const total_funding = projects.reduce((sum, p) => {
      return sum + (p.current_data?.current_funding || 0);
    }, 0);

    const average_progress = projects.length > 0
      ? projects.reduce((sum, p) => sum + (p.current_data?.progress_percentage || 0), 0) / projects.length
      : 0;

    return {
      total_projects,
      active_projects,
      completed_projects,
      total_participants,
      total_funding,
      average_progress: Math.round(average_progress * 10) / 10, // Round to 1 decimal place
    };
  }

  // Export project data
  async exportProjectData(projectId: number, format: 'pdf' | 'csv' | 'excel'): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export project data');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting project data:', error);
      return null;
    }
  }
}

export const sgeProjectService = new SGEProjectService();
