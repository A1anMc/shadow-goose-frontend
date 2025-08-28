// Relationship Impact Tracker Service
// SGE V3 GIIS - Stakeholder Relationship Management

import {
    InteractionQuality,
    RelationshipAPIResponse,
    RelationshipDashboardData,
    RelationshipEvent,
    RelationshipEventForm,
    RelationshipListResponse,
    RelationshipSearchFilters,
    RelationshipStage,
    RelationshipTag,
    RelationshipTimeline,
    RelationshipUserRole,
    StakeholderCategory,
    StakeholderListResponse,
    StakeholderProfile,
    StakeholderProfileForm,
    StakeholderType
} from './types/relationship-types';

class RelationshipService {
  private baseUrl: string;
  private authToken: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RelationshipAPIResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/relationships${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      // Merge with options headers if provided
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Relationship service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Relationship Events
  async createEvent(eventData: RelationshipEventForm): Promise<RelationshipAPIResponse<RelationshipEvent>> {
    return this.request<RelationshipEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getEvents(filters?: RelationshipSearchFilters, page = 1, limit = 20): Promise<RelationshipAPIResponse<RelationshipListResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    return this.request<RelationshipListResponse>(`/events?${params.toString()}`);
  }

  async getEvent(id: number): Promise<RelationshipAPIResponse<RelationshipEvent>> {
    return this.request<RelationshipEvent>(`/events/${id}`);
  }

  async updateEvent(id: number, eventData: Partial<RelationshipEventForm>): Promise<RelationshipAPIResponse<RelationshipEvent>> {
    return this.request<RelationshipEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: number): Promise<RelationshipAPIResponse<void>> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Stakeholder Profiles
  async createStakeholder(stakeholderData: StakeholderProfileForm): Promise<RelationshipAPIResponse<StakeholderProfile>> {
    return this.request<StakeholderProfile>('/stakeholders', {
      method: 'POST',
      body: JSON.stringify(stakeholderData),
    });
  }

  async getStakeholders(filters?: RelationshipSearchFilters, page = 1, limit = 20): Promise<RelationshipAPIResponse<StakeholderListResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    params.append('page', String(page));
    params.append('limit', String(limit));

    return this.request<StakeholderListResponse>(`/stakeholders?${params.toString()}`);
  }

  async getStakeholder(id: number): Promise<RelationshipAPIResponse<StakeholderProfile>> {
    return this.request<StakeholderProfile>(`/stakeholders/${id}`);
  }

  async updateStakeholder(id: number, stakeholderData: Partial<StakeholderProfileForm>): Promise<RelationshipAPIResponse<StakeholderProfile>> {
    return this.request<StakeholderProfile>(`/stakeholders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stakeholderData),
    });
  }

  async deleteStakeholder(id: number): Promise<RelationshipAPIResponse<void>> {
    return this.request<void>(`/stakeholders/${id}`, {
      method: 'DELETE',
    });
  }

  // Relationship Timeline
  async getTimeline(stakeholderId: number): Promise<RelationshipAPIResponse<RelationshipTimeline[]>> {
    return this.request<RelationshipTimeline[]>(`/stakeholders/${stakeholderId}/timeline`);
  }

  async addTimelineEntry(stakeholderId: number, entry: Partial<RelationshipTimeline>): Promise<RelationshipAPIResponse<RelationshipTimeline>> {
    return this.request<RelationshipTimeline>(`/stakeholders/${stakeholderId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // Dashboard Data
  async getDashboardData(): Promise<RelationshipAPIResponse<RelationshipDashboardData>> {
    return this.request<RelationshipDashboardData>('/dashboard');
  }

  // Tags
  async getTags(): Promise<RelationshipAPIResponse<RelationshipTag[]>> {
    return this.request<RelationshipTag[]>('/tags');
  }

  async createTag(tagData: Partial<RelationshipTag>): Promise<RelationshipAPIResponse<RelationshipTag>> {
    return this.request<RelationshipTag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  // User Roles and Permissions
  async getUserRoles(stakeholderId: number): Promise<RelationshipAPIResponse<RelationshipUserRole[]>> {
    return this.request<RelationshipUserRole[]>(`/stakeholders/${stakeholderId}/roles`);
  }

  async assignUserRole(stakeholderId: number, roleData: Partial<RelationshipUserRole>): Promise<RelationshipAPIResponse<RelationshipUserRole>> {
    return this.request<RelationshipUserRole>(`/stakeholders/${stakeholderId}/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  // Health Score Calculations
  calculateHealthScore(
    interactionQuality: InteractionQuality,
    outcomeRating: number,
    interactionFrequency: string,
    totalInteractions: number
  ): number {
    let score = 50; // Base score

    // Interaction quality impact
    switch (interactionQuality) {
      case 'excellent':
        score += 30;
        break;
      case 'good':
        score += 20;
        break;
      case 'neutral':
        score += 0;
        break;
      case 'poor':
        score -= 20;
        break;
      case 'critical':
        score -= 40;
        break;
    }

    // Outcome rating impact (1-5 scale)
    score += (outcomeRating - 3) * 10;

    // Interaction frequency impact
    switch (interactionFrequency) {
      case 'weekly':
        score += 10;
        break;
      case 'monthly':
        score += 5;
        break;
      case 'quarterly':
        score += 0;
        break;
      case 'yearly':
        score -= 10;
        break;
      case 'as_needed':
        score -= 5;
        break;
    }

    // Total interactions impact (diminishing returns)
    if (totalInteractions > 0) {
      score += Math.min(totalInteractions * 2, 20);
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Relationship Stage Progression
  determineRelationshipStage(healthScore: number, totalInteractions: number): RelationshipStage {
    if (healthScore >= 80 && totalInteractions >= 5) {
      return 'partnership';
    } else if (healthScore >= 60 && totalInteractions >= 3) {
      return 'active_engagement';
    } else if (healthScore >= 40) {
      return 'maintenance';
    } else if (healthScore >= 20) {
      return 'stagnant';
    } else {
      return 'at_risk';
    }
  }

  // Follow-up Reminders
  async getUpcomingFollowUps(daysAhead = 30): Promise<RelationshipAPIResponse<RelationshipEvent[]>> {
    return this.request<RelationshipEvent[]>(`/events/follow-ups?days=${daysAhead}`);
  }

  // Export Functions
  async exportStakeholders(format: 'csv' | 'excel' = 'csv'): Promise<RelationshipAPIResponse<string>> {
    return this.request<string>(`/stakeholders/export?format=${format}`);
  }

  async exportEvents(format: 'csv' | 'excel' = 'csv'): Promise<RelationshipAPIResponse<string>> {
    return this.request<string>(`/events/export?format=${format}`);
  }

  // Analytics and Reporting
  async getHealthAnalytics(): Promise<RelationshipAPIResponse<any>> {
    return this.request<any>('/analytics/health');
  }

  async getStageAnalytics(): Promise<RelationshipAPIResponse<any>> {
    return this.request<any>('/analytics/stages');
  }

  async getPriorityAnalytics(): Promise<RelationshipAPIResponse<any>> {
    return this.request<any>('/analytics/priorities');
  }

  // Search and Filter Helpers
  async searchStakeholders(query: string): Promise<RelationshipAPIResponse<StakeholderProfile[]>> {
    return this.request<StakeholderProfile[]>(`/stakeholders/search?q=${encodeURIComponent(query)}`);
  }

  async getStakeholdersByType(type: StakeholderType): Promise<RelationshipAPIResponse<StakeholderProfile[]>> {
    return this.request<StakeholderProfile[]>(`/stakeholders/type/${type}`);
  }

  async getStakeholdersByCategory(category: StakeholderCategory): Promise<RelationshipAPIResponse<StakeholderProfile[]>> {
    return this.request<StakeholderProfile[]>(`/stakeholders/category/${category}`);
  }

  // Bulk Operations
  async bulkUpdateStakeholders(updates: Array<{ id: number; data: Partial<StakeholderProfileForm> }>): Promise<RelationshipAPIResponse<StakeholderProfile[]>> {
    return this.request<StakeholderProfile[]>('/stakeholders/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async bulkCreateEvents(events: RelationshipEventForm[]): Promise<RelationshipAPIResponse<RelationshipEvent[]>> {
    return this.request<RelationshipEvent[]>('/events/bulk-create', {
      method: 'POST',
      body: JSON.stringify(events),
    });
  }
}

// Export singleton instance
export const relationshipService = new RelationshipService();
