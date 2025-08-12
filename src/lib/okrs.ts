export interface OKR {
  id: number;
  objective: string;
  description: string;
  keyResults: KeyResult[];
  projectId?: number;
  grantId?: number;
  targetDate: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: number;
  okr_id: number;
  description: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  last_updated: string;
}

export interface CreateOKRRequest {
  objective: string;
  description: string;
  keyResults: Omit<KeyResult, 'id' | 'okr_id' | 'progress' | 'status' | 'last_updated'>[];
  projectId?: number;
  grantId?: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
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

  // Get all OKRs
  async getOKRs(): Promise<OKR[]> {
    try {
      if (!this.baseUrl) {
        return this.getMockOKRs();
      }

      const response = await fetch(`${this.baseUrl}/api/okrs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OKRs');
      }

      const data = await response.json();
      return data.okrs || [];
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      return this.getMockOKRs();
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
      return this.getMockOKRs().filter(okr => okr.projectId === projectId);
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
  async getOKRStats(): Promise<OKRStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/okrs/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sge_auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OKR stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching OKR stats:', error);
      return this.getMockStats();
    }
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

  // Mock data for development
  private getMockOKRs(): OKR[] {
    return [
      {
        id: 1,
        objective: "Increase Youth Employment in Creative Industries",
        description: "Support young people in finding meaningful employment opportunities in the creative sector",
        keyResults: [
          {
            id: 1,
            okr_id: 1,
            description: "Place 500 young people in creative industry jobs",
            target: 500,
            current: 342,
            unit: "people",
            progress: 68.4,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 2,
            okr_id: 1,
            description: "Achieve 75% employment rate within 6 months",
            target: 75,
            current: 68.4,
            unit: "%",
            progress: 91.2,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 3,
            okr_id: 1,
            description: "Partner with 20 creative industry employers",
            target: 20,
            current: 15,
            unit: "employers",
            progress: 75,
            status: "at-risk",
            last_updated: "2025-08-11T10:30:00Z",
          },
        ],
        projectId: 1,
        grantId: 1,
        targetDate: "2025-12-31T23:59:59Z",
        status: "on-track",
        priority: "high",
        created_by: 1,
        created_at: "2025-01-15T00:00:00Z",
        updated_at: "2025-08-11T10:30:00Z",
      },
      {
        id: 2,
        objective: "Enhance Community Digital Literacy",
        description: "Improve digital skills and access to technology for underserved communities",
        keyResults: [
          {
            id: 4,
            okr_id: 2,
            description: "Train 1,000 community members in digital skills",
            target: 1000,
            current: 750,
            unit: "people",
            progress: 75,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 5,
            okr_id: 2,
            description: "Establish 5 community tech hubs",
            target: 5,
            current: 3,
            unit: "hubs",
            progress: 60,
            status: "at-risk",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 6,
            okr_id: 2,
            description: "Achieve 90% satisfaction rate from participants",
            target: 90,
            current: 87,
            unit: "%",
            progress: 96.7,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
        ],
        projectId: 2,
        targetDate: "2025-11-30T23:59:59Z",
        status: "at-risk",
        priority: "medium",
        created_by: 1,
        created_at: "2025-02-01T00:00:00Z",
        updated_at: "2025-08-11T10:30:00Z",
      },
      {
        id: 3,
        objective: "Reduce Environmental Impact Through Innovation",
        description: "Develop and implement sustainable solutions for environmental challenges",
        keyResults: [
          {
            id: 7,
            okr_id: 3,
            description: "Launch 10 environmental innovation projects",
            target: 10,
            current: 8,
            unit: "projects",
            progress: 80,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 8,
            okr_id: 3,
            description: "Reduce carbon footprint by 25%",
            target: 25,
            current: 18,
            unit: "%",
            progress: 72,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
          {
            id: 9,
            okr_id: 3,
            description: "Engage 500 community members in environmental initiatives",
            target: 500,
            current: 420,
            unit: "people",
            progress: 84,
            status: "on-track",
            last_updated: "2025-08-11T10:30:00Z",
          },
        ],
        projectId: 3,
        targetDate: "2025-10-31T23:59:59Z",
        status: "on-track",
        priority: "high",
        created_by: 1,
        created_at: "2025-03-01T00:00:00Z",
        updated_at: "2025-08-11T10:30:00Z",
      },
    ];
  }

  private getMockStats(): OKRStats {
    return {
      total_okrs: 3,
      on_track: 2,
      at_risk: 1,
      behind: 0,
      completed: 0,
      average_progress: 78.5,
      critical_okrs: 1,
    };
  }
}

export const okrService = new OKRService();
