export interface OKR {
  id: number;
  objective: string;
  objective_description?: string;
  key_results: KeyResult[];
  status: 'active' | 'completed' | 'draft' | 'paused';
  created_at: string;
  updated_at: string;
  deadline?: string;
  progress_percentage: number;
}

export interface KeyResult {
  id: number;
  okr_id: number;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  progress_percentage: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  deadline?: string;
  last_updated: string;
  notes?: string;
}

export interface CreateOKRRequest {
  objective: string;
  objective_description?: string;
  key_results: Omit<KeyResult, 'id' | 'okr_id' | 'progress_percentage' | 'status' | 'last_updated'>[];
  deadline?: string;
}

export interface UpdateOKRRequest {
  objective?: string;
  description?: string;
  targetDate?: string;
  status?: 'on-track' | 'at-risk' | 'behind' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateKeyResultRequest {
  current: number;
  notes?: string;
}

export interface OKRStats {
  total_okrs: number;
  on_track: number;
  at_risk: number;
  behind: number;
  completed: number;
  average_progress: number;
  critical_okrs: number;
}

class OKRService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // SGE Strategic OKRs - Real Data
  private getSGEStrategicOKRs(): OKR[] {
    return [
      {
        id: 1,
        objective: "Establish 3 different media assets",
        objective_description: "Create diverse media platforms for SGE's impact-driven content",
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-08-12T00:00:00Z',
        deadline: '2024-12-31',
        progress_percentage: 45,
        key_results: [
          {
            id: 1,
            okr_id: 1,
            description: "1 new project (TV) ready for distribution within 6 months",
            target_value: 1,
            current_value: 0,
            unit: "projects",
            progress_percentage: 0,
            status: 'behind',
            deadline: '2024-06-30',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "TV project in development phase"
          },
          {
            id: 2,
            okr_id: 1,
            description: "1 online asset, Youtube channel, 1 episode within 5 months",
            target_value: 1,
            current_value: 1,
            unit: "channels",
            progress_percentage: 100,
            status: 'completed',
            deadline: '2024-05-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "YouTube channel established with first episode"
          },
          {
            id: 3,
            okr_id: 1,
            description: "1 asset commissioned within 12 months",
            target_value: 1,
            current_value: 0,
            unit: "assets",
            progress_percentage: 0,
            status: 'on_track',
            deadline: '2024-12-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Commissioning discussions in progress"
          }
        ]
      },
      {
        id: 2,
        objective: "An online data warehouse/system to streamline collection and maintenance of data across all projects which the entire team is operating efficiently",
        objective_description: "Implement comprehensive data management system for SGE operations",
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-08-12T00:00:00Z',
        deadline: '2024-12-31',
        progress_percentage: 75,
        key_results: [
          {
            id: 4,
            okr_id: 2,
            description: "Have an online data system which tracks progress of projects including budgets, contact details, etc.",
            target_value: 1,
            current_value: 1,
            unit: "systems",
            progress_percentage: 100,
            status: 'completed',
            deadline: '2024-06-30',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "SGE Impact Dashboard operational"
          },
          {
            id: 5,
            okr_id: 2,
            description: "Have an operational and efficient system of storing data from public platforms e.g. Instagram, YouTube, Facebook, Linkedin",
            target_value: 1,
            current_value: 0.8,
            unit: "systems",
            progress_percentage: 80,
            status: 'on_track',
            deadline: '2024-08-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Social media integration in development"
          },
          {
            id: 6,
            okr_id: 2,
            description: "Have a task-management system which is operational and efficient that the entire team is operating regularly (dual-track agile workflow)",
            target_value: 1,
            current_value: 0.6,
            unit: "systems",
            progress_percentage: 60,
            status: 'at_risk',
            deadline: '2024-09-30',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Agile workflow implementation in progress"
          }
        ]
      },
      {
        id: 3,
        objective: "To establish consistent and efficient processes across communications and workplace health and safety",
        objective_description: "Standardize operational processes for team efficiency and safety",
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-08-12T00:00:00Z',
        deadline: '2024-12-31',
        progress_percentage: 35,
        key_results: [
          {
            id: 7,
            okr_id: 3,
            description: "Increase employee satisfaction by 0.5 (1 - 5, 3 is satisfied) over 3 months",
            target_value: 3.5,
            current_value: 3.2,
            unit: "score",
            progress_percentage: 64,
            status: 'on_track',
            deadline: '2024-03-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Employee satisfaction improving"
          },
          {
            id: 8,
            okr_id: 3,
            description: "Within 6 months, returning a level 3 in workplace inter-relations and delivery, peer performance based review",
            target_value: 3,
            current_value: 2.5,
            unit: "level",
            progress_percentage: 83,
            status: 'on_track',
            deadline: '2024-06-30',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Peer review system established"
          },
          {
            id: 9,
            okr_id: 3,
            description: "Have one project complete all the checkpoints for a deliverable and result in a media product (documented)(Template checklist of things we need to do)",
            target_value: 1,
            current_value: 0,
            unit: "projects",
            progress_percentage: 0,
            status: 'behind',
            deadline: '2024-12-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Checklist template in development"
          }
        ]
      },
      {
        id: 4,
        objective: "Increase the visibility and engagement of the company",
        objective_description: "Enhance SGE's brand presence and industry recognition",
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-08-12T00:00:00Z',
        deadline: '2024-12-31',
        progress_percentage: 25,
        key_results: [
          {
            id: 10,
            okr_id: 4,
            description: "Increase following/ viewership of our social channels by 200% (4 months)",
            target_value: 200,
            current_value: 50,
            unit: "%",
            progress_percentage: 25,
            status: 'behind',
            deadline: '2024-04-30',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Social media growth strategy in development"
          },
          {
            id: 11,
            okr_id: 4,
            description: "Acquire 3 spotlight posts/interviews, where Shadow Goose Ent is featured- through podcasts, crossposting and industry recognition. (8-12 months)",
            target_value: 3,
            current_value: 0,
            unit: "features",
            progress_percentage: 0,
            status: 'on_track',
            deadline: '2024-12-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Media outreach strategy in planning"
          },
          {
            id: 12,
            okr_id: 4,
            description: "Increase in person appearances at relevant media and industry events- therefore increasing brand awareness. (Aim to have at least 1 member of the shadow goose team present at, at least 15 film/media events across 12 months)",
            target_value: 15,
            current_value: 3,
            unit: "events",
            progress_percentage: 20,
            status: 'at_risk',
            deadline: '2024-12-31',
            last_updated: '2024-08-12T00:00:00Z',
            notes: "Event attendance tracking established"
          }
        ]
      }
    ];
  }

  // Get all OKRs
  async getOKRs(): Promise<OKR[]> {
    if (!this.baseUrl) {
      // Return SGE strategic OKRs as fallback
      return this.getSGEStrategicOKRs();
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/okrs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        // Return SGE strategic OKRs if API fails
        return this.getSGEStrategicOKRs();
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      // Return SGE strategic OKRs as fallback
      return this.getSGEStrategicOKRs();
    }
  }

  // Get OKR by ID
  async getOKR(id: number): Promise<OKR | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OKR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OKR:', error);
      return null;
    }
  }

  // Get OKRs by project
  async getOKRsByProject(projectId: number): Promise<OKR[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project OKRs');
      }

      const data = await response.json();
      return data.okrs || [];
    } catch (error) {
      console.error('Error fetching project OKRs:', error);
      return this.getSGEStrategicOKRs();
    }
  }

  // Create new OKR
  async createOKR(okrData: CreateOKRRequest): Promise<OKR | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(okrData),
      });

      if (!response.ok) {
        throw new Error('Failed to create OKR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating OKR:', error);
      return null;
    }
  }

  // Update OKR
  async updateOKR(id: number, updates: UpdateOKRRequest): Promise<OKR | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update OKR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating OKR:', error);
      return null;
    }
  }

  // Update key result
  async updateKeyResult(okrId: number, keyResultId: number, updates: UpdateKeyResultRequest): Promise<KeyResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs/${okrId}/key-results/${keyResultId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update key result');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating key result:', error);
      return null;
    }
  }

  // Get OKR statistics
  async getOKRStats(): Promise<{
    total_okrs: number;
    active_okrs: number;
    completed_okrs: number;
    on_track_okrs: number;
    at_risk_okrs: number;
    behind_okrs: number;
    average_progress: number;
  }> {
    const okrs = await this.getOKRs();

    const total_okrs = okrs.length;
    const active_okrs = okrs.filter(o => o.status === 'active').length;
    const completed_okrs = okrs.filter(o => o.status === 'completed').length;

    // Count key results by status
    let on_track_count = 0;
    let at_risk_count = 0;
    let behind_count = 0;

    okrs.forEach(okr => {
      okr.key_results.forEach(kr => {
        switch (kr.status) {
          case 'on_track':
            on_track_count++;
            break;
          case 'at_risk':
            at_risk_count++;
            break;
          case 'behind':
            behind_count++;
            break;
        }
      });
    });

    const average_progress = okrs.length > 0
      ? okrs.reduce((sum, okr) => sum + okr.progress_percentage, 0) / okrs.length
      : 0;

    return {
      total_okrs,
      active_okrs,
      completed_okrs,
      on_track_okrs: on_track_count,
      at_risk_okrs: at_risk_count,
      behind_okrs: behind_count,
      average_progress: Math.round(average_progress * 10) / 10,
    };
  }

  // Delete OKR
  async deleteOKR(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting OKR:', error);
      return false;
    }
  }




}

export const okrService = new OKRService();
