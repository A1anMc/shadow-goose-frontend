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

  // Get all SGE projects
  async getProjects(): Promise<SGEProject[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch projects: ${response.status}`);
    }

    return await response.json();
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
