export interface SGEProject {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  baseline_data: BaselineData;
  current_data: CurrentData;
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

  // Mock data for development
  private getMockProjects(): SGEProject[] {
    return [
      {
        id: 1,
        name: "Youth Employment Initiative",
        description: "Supporting young people in finding meaningful employment opportunities",
        status: 'active',
        baseline_data: {
          start_date: '2024-01-15',
          target_participants: 500,
          target_outcomes: ['Employment placement', 'Skills development', 'Career guidance'],
          initial_funding: 250000,
          geographic_area: 'Greater Sydney',
          target_demographics: ['Youth 18-25', 'Unemployed', 'Low-income'],
          key_indicators: [
            {
              id: 1,
              name: 'Employment Rate',
              description: 'Percentage of participants employed within 6 months',
              baseline_value: 0,
              target_value: 75,
              unit: '%',
              category: 'outcome'
            }
          ]
        },
        current_data: {
          current_participants: 342,
          current_outcomes: ['Employment placement', 'Skills development'],
          current_funding: 180000,
          progress_percentage: 68.4,
          last_updated: '2024-08-11T10:30:00Z',
          key_metrics: [
            {
              indicator_id: 1,
              current_value: 68.4,
              progress_percentage: 68.4,
              last_measured: '2024-08-11T10:30:00Z',
              notes: 'Strong progress in employment outcomes'
            }
          ]
        },
        created_by: 1,
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-08-11T10:30:00Z'
      },
      {
        id: 2,
        name: "Community Health Program",
        description: "Improving health outcomes in underserved communities",
        status: 'active',
        baseline_data: {
          start_date: '2024-03-01',
          target_participants: 300,
          target_outcomes: ['Health awareness', 'Preventive care', 'Community support'],
          initial_funding: 150000,
          geographic_area: 'Western Sydney',
          target_demographics: ['Families', 'Elderly', 'Low-income'],
          key_indicators: [
            {
              id: 2,
              name: 'Health Literacy Score',
              description: 'Average health literacy assessment score',
              baseline_value: 45,
              target_value: 80,
              unit: '/100',
              category: 'outcome'
            }
          ]
        },
        current_data: {
          current_participants: 187,
          current_outcomes: ['Health awareness', 'Preventive care'],
          current_funding: 95000,
          progress_percentage: 62.3,
          last_updated: '2024-08-11T09:15:00Z',
          key_metrics: [
            {
              indicator_id: 2,
              current_value: 62.3,
              progress_percentage: 62.3,
              last_measured: '2024-08-11T09:15:00Z',
              notes: 'Steady improvement in health literacy'
            }
          ]
        },
        created_by: 1,
        created_at: '2024-03-01T10:00:00Z',
        updated_at: '2024-08-11T09:15:00Z'
      }
    ];
  }

  private getMockStats() {
    const projects = this.getMockProjects();
    return {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      completed_projects: projects.filter(p => p.status === 'completed').length,
      total_participants: projects.reduce((sum, p) => sum + p.current_data.current_participants, 0),
      total_funding: projects.reduce((sum, p) => sum + p.current_data.current_funding, 0),
      average_progress: projects.length > 0
        ? projects.reduce((sum, p) => sum + p.current_data.progress_percentage, 0) / projects.length
        : 0
    };
  }

  // Get all SGE projects
  async getProjects(): Promise<SGEProject[]> {
    try {
      // For development, return mock data if API is not available
      if (!this.baseUrl) {
        return this.getMockProjects();
      }

      const response = await fetch(`${this.baseUrl}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return mock data as fallback
      return this.getMockProjects();
    }
  }

  // Get single SGE project
  async getProject(id: number): Promise<SGEProject | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
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
    try {
      // For development, return mock stats if API is not available
      if (!this.baseUrl) {
        return this.getMockStats();
      }

      const response = await fetch(`${this.baseUrl}/api/projects/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project stats:', error);
      // Return mock stats as fallback
      return this.getMockStats();
    }
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
