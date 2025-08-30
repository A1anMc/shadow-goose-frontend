// SGE-Specific Grants Service
// Focused on SGE's actual business needs: media projects, cultural representation, social impact

import { centralAuthService } from '../auth-central';
import { configService } from '../config';
import { handleApiError } from '../error-handler';

import { logger } from '../logger';
import {
    SGEApplication,
    SGEBusinessMetrics,
    SGEDashboardData,
    SGEGrant,
    SGEGrantMatch,
    SGESearchFilters
} from '../types/sge-types';
import { sgeMLService } from './sge-ml-service';

export interface SGEGrantsServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export class SGEGrantsService {
  private config: SGEGrantsServiceConfig;

  constructor(config: SGEGrantsServiceConfig) {
    this.config = config;
  }

  // Get all SGE grants with ML enhancement
  async getSGEGrants(): Promise<SGEGrant[]> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/grants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grants || [];
    } catch (error) {
      logger.error('Error fetching SGE grants:', error);
      handleApiError(error, 'SGEGrantsService.getSGEGrants');
      return [];
    }
  }

  // Get SGE grant matches using ML
  async getSGEGrantMatches(): Promise<SGEGrantMatch[]> {
    try {
      const grants = await this.getSGEGrants();
      const matches = await sgeMLService.findSGEGrantMatches(grants);
      return matches;
    } catch (error) {
      logger.error('Error getting SGE grant matches:', error);
      handleApiError(error, 'SGEGrantsService.getSGEGrantMatches');
      return [];
    }
  }

  // Search SGE grants with filters
  async searchSGEGrants(filters: SGESearchFilters): Promise<SGEGrant[]> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/grants/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grants || [];
    } catch (error) {
      logger.error('Error searching SGE grants:', error);
      handleApiError(error, 'SGEGrantsService.searchSGEGrants');
      return [];
    }
  }

  // Get SGE grant by ID
  async getSGEGrantById(id: number): Promise<SGEGrant | null> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/grants/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.grant || null;
    } catch (error) {
      logger.error('Error fetching SGE grant by ID:', error);
      handleApiError(error, 'SGEGrantsService.getSGEGrantById');
      return null;
    }
  }

  // Get SGE applications
  async getSGEApplications(): Promise<SGEApplication[]> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.applications || [];
    } catch (error) {
      logger.error('Error fetching SGE applications:', error);
      handleApiError(error, 'SGEGrantsService.getSGEApplications');
      return [];
    }
  }

  // Get SGE application by ID
  async getSGEApplicationById(id: number): Promise<SGEApplication | null> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/applications/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.application || null;
    } catch (error) {
      logger.error('Error fetching SGE application by ID:', error);
      handleApiError(error, 'SGEGrantsService.getSGEApplicationById');
      return null;
    }
  }

  // Create SGE application
  async createSGEApplication(application: Partial<SGEApplication>): Promise<SGEApplication | null> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(application),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.application || null;
    } catch (error) {
      logger.error('Error creating SGE application:', error);
      handleApiError(error, 'SGEGrantsService.createSGEApplication');
      return null;
    }
  }

  // Update SGE application
  async updateSGEApplication(id: number, application: Partial<SGEApplication>): Promise<SGEApplication | null> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(application),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.application || null;
    } catch (error) {
      logger.error('Error updating SGE application:', error);
      handleApiError(error, 'SGEGrantsService.updateSGEApplication');
      return null;
    }
  }

  // Get SGE business metrics
  async getSGEBusinessMetrics(): Promise<SGEBusinessMetrics | null> {
    try {
      const applications = await this.getSGEApplications();
      const metrics = await sgeMLService.analyzeSGEBusinessMetrics(applications);
      return metrics;
    } catch (error) {
      logger.error('Error getting SGE business metrics:', error);
      handleApiError(error, 'SGEGrantsService.getSGEBusinessMetrics');
      return null;
    }
  }

  // Get SGE dashboard data
  async getSGEDashboardData(): Promise<SGEDashboardData | null> {
    try {
      const [grants, applications, metrics] = await Promise.all([
        this.getSGEGrants(),
        this.getSGEApplications(),
        this.getSGEBusinessMetrics()
      ]);

      // Get ML recommendations
      const grantMatches = await this.getSGEGrantMatches();
      const nextGrantsToApply = grantMatches.slice(0, 5).map(match => match.grant);

      const applicationsToOptimize = applications.filter(app =>
        app.completion_score && app.completion_score < 80
      ).slice(0, 5);

      const dashboardData: SGEDashboardData = {
        business_metrics: metrics || {
          metric_date: new Date().toISOString().split('T')[0],
          total_grants_discovered: 0,
          applications_submitted: 0,
          applications_pending: 0,
          applications_won: 0,
          success_rate: 0,
          funding_secured: 0,
          time_saved_hours: 0,
          media_projects_funded: 0,
          cultural_impact_projects: 0,
          social_impact_projects: 0,
          team_efficiency_score: 0
        },
        recent_grants: grants.slice(0, 10),
        active_applications: applications.filter(app =>
          ['draft', 'in_progress'].includes(app.status)
        ).slice(0, 10),
        upcoming_deadlines: [], // Would be populated from deadline tracking
        team_tasks: [], // Would be populated from task management
        ml_recommendations: {
          next_grants_to_apply: nextGrantsToApply,
          applications_to_optimize: applicationsToOptimize,
          team_improvements: [
            'Strengthen cultural consultation processes',
            'Enhance community engagement strategies',
            'Improve impact measurement frameworks'
          ],
          process_optimizations: [
            'Automate deadline tracking',
            'Streamline document management',
            'Enhance team collaboration workflows'
          ]
        }
      };

      return dashboardData;
    } catch (error) {
      logger.error('Error getting SGE dashboard data:', error);
      handleApiError(error, 'SGEGrantsService.getSGEDashboardData');
      return null;
    }
  }

  // Get SGE grant recommendations
  async getSGEGrantRecommendations(): Promise<SGEGrantMatch[]> {
    try {
      const matches = await this.getSGEGrantMatches();
      return matches.filter(match => match.match_score > 0.7); // Only high-quality matches
    } catch (error) {
      logger.error('Error getting SGE grant recommendations:', error);
      handleApiError(error, 'SGEGrantsService.getSGEGrantRecommendations');
      return [];
    }
  }

  // Update SGE grant status
  async updateSGEGrantStatus(grantId: number, status: string): Promise<boolean> {
    try {
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.config.baseUrl}/api/sge/grants/${grantId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error('Error updating SGE grant status:', error);
      handleApiError(error, 'SGEGrantsService.updateSGEGrantStatus');
      return false;
    }
  }

  // Get SGE grant statistics
  async getSGEGrantStats(): Promise<any> {
    try {
      const grants = await this.getSGEGrants();
      const applications = await this.getSGEApplications();

      const stats = {
        total_grants: grants.length,
        grants_by_status: {
          discovered: grants.filter(g => g.sge_status === 'discovered').length,
          researching: grants.filter(g => g.sge_status === 'researching').length,
          drafting: grants.filter(g => g.sge_status === 'drafting').length,
          submitted: grants.filter(g => g.sge_status === 'submitted').length,
          successful: grants.filter(g => g.sge_status === 'successful').length,
          unsuccessful: grants.filter(g => g.sge_status === 'unsuccessful').length
        },
        grants_by_media_type: {
          documentary: grants.filter(g => g.media_type === 'documentary').length,
          digital: grants.filter(g => g.media_type === 'digital').length,
          community: grants.filter(g => g.media_type === 'community').length,
          multicultural: grants.filter(g => g.media_type === 'multicultural').length
        },
        applications_by_status: {
          draft: applications.filter(a => a.status === 'draft').length,
          in_progress: applications.filter(a => a.status === 'in_progress').length,
          submitted: applications.filter(a => a.status === 'submitted').length,
          successful: applications.filter(a => a.status === 'successful').length,
          unsuccessful: applications.filter(a => a.status === 'unsuccessful').length
        },
        total_funding_available: grants.reduce((sum, g) => sum + (g.amount || 0), 0),
        average_grant_amount: grants.length > 0 ? grants.reduce((sum, g) => sum + (g.amount || 0), 0) / grants.length : 0
      };

      return stats;
    } catch (error) {
      logger.error('Error getting SGE grant stats:', error);
      handleApiError(error, 'SGEGrantsService.getSGEGrantStats');
      return {};
    }
  }

  // Private helper method to get auth token
  private async getAuthToken(): Promise<string> {
    const token = centralAuthService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }
}

// Export singleton instance
export const sgeGrantsService = new SGEGrantsService({
  baseUrl: configService.getApiUrl(),
  timeout: 10000,
  retryAttempts: 3
});
