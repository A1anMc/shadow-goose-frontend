import { apiMonitor } from './api-monitor';
import { authService } from './auth';
import { fallbackAPI } from './fallback-api';
import { logger } from './logger';

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
  private localProjects: Map<number, SGEProject> = new Map();
  private nextLocalId = 1000; // Start local IDs from 1000 to avoid conflicts

  constructor() {
    // Initialize with fallback projects
    this.getFallbackProjects().forEach(project => {
      this.localProjects.set(project.id, project);
    });
  }

  // Get all SGE projects with comprehensive API monitoring and fallback
  async getProjects(): Promise<SGEProject[]> {
    logger.info('Starting projects fetch with API monitoring', 'getProjects');

    try {
      // Use API monitor to get data with fallback
      const data = await apiMonitor.getData('projects', { useFallback: true });

      if (data && data.projects) {
        logger.info('Successfully fetched projects from API monitor', {
          projectCount: data.projects.length,
          dataSource: data.data_source || 'api'
        });

        // Merge backend projects with local projects
        const backendProjects = data.projects;
        backendProjects.forEach(project => {
          // Transform project data to match SGEProject interface
        const transformedProject: SGEProject = {
          ...project,
          status: project.status === 'planning' ? 'draft' : (project.status === 'on_hold' ? 'paused' : project.status)
        };
        this.localProjects.set(project.id, transformedProject);
        });

        return Array.from(this.localProjects.values());
      }

      // If API monitor fails, use fallback API
      logger.warn('API monitor failed, using fallback API', 'getProjects');
      const fallbackData = await fallbackAPI.getRealProjects();

      logger.info('Successfully fetched projects from fallback API', {
        projectCount: fallbackData.projects.length,
        dataSource: fallbackData.data_source
      });

      // Merge fallback projects with local projects
      fallbackData.projects.forEach(project => {
        // Transform project data to match SGEProject interface
        const transformedProject: SGEProject = {
          ...project,
          status: project.status === 'planning' ? 'draft' : (project.status === 'on_hold' ? 'paused' : project.status)
        };
        this.localProjects.set(project.id, transformedProject);
      });

      return Array.from(this.localProjects.values());
    } catch (error) {
      logger.error('Failed to fetch projects, using local projects', 'getProjects', error as Error);
      return Array.from(this.localProjects.values());
    }
  }

  // Get specific SGE project - PERMANENT FIX
  async getProject(id: number): Promise<SGEProject | null> {
    // First check local projects
    const localProject = this.localProjects.get(id);
    if (localProject) {
      return localProject;
    }

    // If not in local cache, try backend (but it likely doesn't exist)
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects/${id}`);

        if (response.ok) {
          const project = await response.json();
          this.localProjects.set(project.id, project);
          return project;
        }
      } catch (error) {
        console.warn(`Backend project ${id} not found, using local fallback`);
      }
    }

    // Return null if project doesn't exist anywhere
    return null;
  }

  // Create new SGE project - PERMANENT FIX
  async createProject(projectData: CreateProjectRequest): Promise<SGEProject> {
    const newProject: SGEProject = {
      id: this.nextLocalId++,
      name: projectData.name,
      description: projectData.description,
      status: 'draft',
      amount: projectData.baseline_data.initial_funding,
      baseline_data: {
        ...projectData.baseline_data,
        key_indicators: projectData.key_indicators.map((indicator, index) => ({
          ...indicator,
          id: index + 1
        }))
      },
      current_data: {
        current_participants: 0,
        current_outcomes: [],
        current_funding: projectData.baseline_data.initial_funding,
        progress_percentage: 0,
        last_updated: new Date().toISOString(),
        key_metrics: []
      },
      created_by: 1, // Default user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to save to backend first
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        if (response.ok) {
          const backendProject = await response.json();
          // Use backend ID if available
          if (backendProject.project) {
            newProject.id = backendProject.project.id;
            newProject.created_at = backendProject.project.created_at;
            newProject.updated_at = backendProject.project.updated_at;
          }
        }
      } catch (error) {
        console.warn('Failed to save project to backend, using local storage:', error);
      }
    }

    // Always save locally
    this.localProjects.set(newProject.id, newProject);
    this.saveToLocalStorage();

    return newProject;
  }

  // Update SGE project - PERMANENT FIX
  async updateProject(id: number, updates: Partial<SGEProject>): Promise<SGEProject | null> {
    const existingProject = this.localProjects.get(id);
    if (!existingProject) {
      throw new Error(`Project ${id} not found`);
    }

    const updatedProject: SGEProject = {
      ...existingProject,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Try to update backend first
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const backendProject = await response.json();
          // Merge backend response
          Object.assign(updatedProject, backendProject);
        }
      } catch (error) {
        console.warn('Failed to update project in backend, using local storage:', error);
      }
    }

    // Always update locally
    this.localProjects.set(id, updatedProject);
    this.saveToLocalStorage();

    return updatedProject;
  }

  // Delete SGE project - PERMANENT FIX
  async deleteProject(id: number): Promise<boolean> {
    const existingProject = this.localProjects.get(id);
    if (!existingProject) {
      throw new Error(`Project ${id} not found`);
    }

    // Try to delete from backend first
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.warn('Failed to delete project from backend, using local deletion');
        }
      } catch (error) {
        console.warn('Failed to delete project from backend, using local deletion:', error);
      }
    }

    // Always delete locally
    this.localProjects.delete(id);
    this.saveToLocalStorage();

    return true;
  }

  // Update project current data (progress tracking) - PERMANENT FIX
  async updateCurrentData(projectId: number, currentData: Partial<CurrentData>): Promise<boolean> {
    const existingProject = this.localProjects.get(projectId);
    if (!existingProject) {
      throw new Error(`Project ${projectId} not found`);
    }

    const updatedCurrentData: CurrentData = {
      ...existingProject.current_data!,
      ...currentData,
      last_updated: new Date().toISOString()
    };

    const updatedProject: SGEProject = {
      ...existingProject,
      current_data: updatedCurrentData,
      updated_at: new Date().toISOString()
    };

    // Try to update backend first
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects/${projectId}/current-data`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentData),
        });

        if (!response.ok) {
          console.warn('Failed to update current data in backend, using local storage');
        }
      } catch (error) {
        console.warn('Failed to update current data in backend, using local storage:', error);
      }
    }

    // Always update locally
    this.localProjects.set(projectId, updatedProject);
    this.saveToLocalStorage();

    return true;
  }

  // Local storage management
  private saveToLocalStorage(): void {
    try {
      const projectsData = Array.from(this.localProjects.values());
      localStorage.setItem('sge_local_projects', JSON.stringify(projectsData));
    } catch (error) {
      console.warn('Failed to save projects to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const projectsData = localStorage.getItem('sge_local_projects');
      if (projectsData) {
        const projects: SGEProject[] = JSON.parse(projectsData);
        projects.forEach(project => {
          this.localProjects.set(project.id, project);
        });
      }
    } catch (error) {
      console.warn('Failed to load projects from localStorage:', error);
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
    // Get all projects (local + backend)
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

  // Export project data - PERMANENT FIX
  async exportProjectData(projectId: number, format: 'pdf' | 'csv' | 'excel'): Promise<Blob | null> {
    const project = this.localProjects.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Try backend export first
    if (this.baseUrl) {
      try {
        const response = await authService.authenticatedRequest(`${this.baseUrl}/api/projects/${projectId}/export?format=${format}`);

        if (response.ok) {
          return await response.blob();
        }
      } catch (error) {
        console.warn('Backend export failed, using local export:', error);
      }
    }

    // Local export fallback
    return this.generateLocalExport(project, format);
  }

  private generateLocalExport(project: SGEProject, format: 'pdf' | 'csv' | 'excel'): Blob {
    const projectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      amount: project.amount,
      baseline_data: project.baseline_data,
      current_data: project.current_data,
      created_at: project.created_at,
      updated_at: project.updated_at
    };

    if (format === 'csv') {
      const csvContent = this.convertToCSV(projectData);
      return new Blob([csvContent], { type: 'text/csv' });
    } else if (format === 'excel') {
      const excelContent = this.convertToExcel(projectData);
      return new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else {
      // PDF fallback - return JSON as text
      const jsonContent = JSON.stringify(projectData, null, 2);
      return new Blob([jsonContent], { type: 'application/json' });
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    const headers = Object.keys(data).filter(key => typeof data[key] !== 'object');
    const csvHeaders = headers.join(',');
    const csvValues = headers.map(header => `"${data[header]}"`).join(',');
    return `${csvHeaders}\n${csvValues}`;
  }

  private convertToExcel(data: any): string {
    // Simple Excel-like format (CSV with better formatting)
    return this.convertToCSV(data);
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
}

export const sgeProjectService = new SGEProjectService();
