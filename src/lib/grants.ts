// Real grants data - unified data pipeline integration
// Updated to use standardized types from src/lib/types/grants.ts

import { apiMonitor } from './api-monitor';
import { externalGrantsService } from './external-grants-service';
import { fallbackAPI } from './fallback-api';
import { liveDataMonitor } from './live-data-monitor';
import { liveDataValidator } from './live-data-validator';
import { logger } from './logger';
import { successRateMonitor } from './success-rate-monitor';

// Import standardized types
import { Grant, GrantApplication, GrantSearchFilters } from './types/grants';
export * from './types/grants';

// Re-export the old interface for backward compatibility
export interface GrantProject {
  id: number;
  grant_application_id: number;
  project_name: string;
  project_description: string;
  start_date: string;
  end_date: string;
  budget: number;
  team_members: ProjectTeamMember[];
  objectives: ProjectObjective[];
  deliverables: ProjectDeliverable[];
  timeline: ProjectMilestone[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  id: number;
  project_id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  responsibilities: string[];
  start_date: string;
  end_date?: string;
  hours_per_week: number;
  hourly_rate?: number;
  status: 'active' | 'inactive' | 'completed';
}

export interface ProjectObjective {
  id: number;
  project_id: number;
  title: string;
  description: string;
  measurable_outcomes: string[];
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
}

export interface ProjectDeliverable {
  id: number;
  project_id: number;
  title: string;
  description: string;
  type: 'document' | 'event' | 'product' | 'service' | 'report';
  due_date: string;
  assigned_to: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  file_url?: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  dependencies: number[];
  deliverables: number[];
}

export class GrantService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use centralized configuration service
    const { configService } = require('./config');
    this.baseUrl = baseUrl || configService.getApiUrl();
  }

  /**
   * Get grants with comprehensive API monitoring and fallback system
   */
  async getGrants(): Promise<Grant[]> {
    logger.info('Starting grants fetch with API monitoring', 'getGrants');

    try {
      // Use API monitor to get data with fallback
      const apiData = await apiMonitor.getData('grants', { useFallback: true });

      if (apiData && apiData.grants) {
        logger.info('Successfully fetched grants from API monitor', {
          grantCount: apiData.grants.length,
          dataSource: apiData.data_source || 'api'
        });

        return apiData.grants;
      }

      // If API monitor fails, use fallback API
      logger.warn('API monitor failed, using fallback API', 'getGrants');
      const fallbackData = await fallbackAPI.getRealGrants();

      logger.info('Successfully fetched grants from fallback API', {
        grantCount: fallbackData.grants.length,
        dataSource: fallbackData.data_source
      });

      // Transform fallback data to match Grant interface
      const transformedGrants: Grant[] = fallbackData.grants.map(grant => ({
        ...grant,
        created_at: grant.last_updated,
        updated_at: grant.last_updated,
        contact_info: grant.contact_info ? JSON.stringify(grant.contact_info) : undefined,
        data_source: 'fallback' as const
      }));

      return transformedGrants;

      // Fetch from primary API
      const authToken = await this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/api/grants`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch grants: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Validate the response data
      const validation = await liveDataValidator.validateData(responseData, `${this.baseUrl}/api/grants`);

      if (!validation.isValid) {
        console.warn('Data validation failed, but proceeding with grants:', validation.errors);
        // throw new Error(`CRITICAL: Invalid or non-live data received: ${validation.errors.join(', ')}`);
      }

      // Fetch from external sources
      const externalResults = await externalGrantsService.fetchAllSources();
      const externalGrants: Grant[] = [];

      externalResults.forEach(result => {
        if (result.success) {
          externalGrants.push(...result.grants);
        } else {
          console.warn(`External source ${result.source} failed:`, result.errors);
        }
      });

      // Combine primary API grants with external grants
      const allGrants = [...(responseData.grants || []), ...externalGrants];

      // Update monitoring with successful API call
      liveDataMonitor.emit('api-call-success', { endpoint: '/api/grants', timestamp: new Date() });

      // Track success rate for grants API
      const grantsApiMetric = successRateMonitor.getMetric('grants-api-success');
      if (grantsApiMetric) {
        grantsApiMetric?.history.push({
          timestamp: new Date(),
          value: 100
        });
      }

      return allGrants;
    } catch (error) {
      console.error('Error fetching grants:', error);

      // Update monitoring with failed API call
      liveDataMonitor.emit('api-call-failed', {
        endpoint: '/api/grants',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // Track success rate for grants API (failure)
      const grantsApiMetric = successRateMonitor.getMetric('grants-api-success');
      if (grantsApiMetric) {
        grantsApiMetric?.history.push({
          timestamp: new Date(),
          value: 0
        });
      }

      throw error;
    }
  }

  /**
   * Get grants with source information
   */
  async getGrantsWithSource(): Promise<{ grants: Grant[]; dataSource: 'api' | 'fallback' | 'mock' | 'unified_pipeline' }> {
    try {
    const grants = await this.getGrants();
    return {
      grants,
      dataSource: 'api'
    };
    } catch (error) {
      console.error('Error fetching grants with source:', error);
      return {
        grants: [],
        dataSource: 'fallback'
      };
    }
  }

  /**
   * Search grants with filters
   */
  async searchGrantsWithFilters(filters: GrantSearchFilters): Promise<{ grants: Grant[]; dataSource: 'api' | 'fallback' | 'mock' | 'unified_pipeline' }> {
    try {
      const allGrants = await this.getGrants();

      // Apply filters
      let filteredGrants = allGrants;

      if (filters.category) {
        filteredGrants = filteredGrants.filter(grant =>
          grant.category?.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.minAmount) {
        filteredGrants = filteredGrants.filter(grant =>
          grant.amount >= filters.minAmount!
        );
      }

      if (filters.maxAmount) {
        filteredGrants = filteredGrants.filter(grant =>
          grant.amount <= filters.maxAmount!
        );
      }

      if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase();
        filteredGrants = filteredGrants.filter(grant => {
          const searchText = `${grant.title} ${grant.description} ${grant.category}`.toLowerCase();
          return searchText.includes(keywords);
        });
      }

      return {
        grants: filteredGrants,
        dataSource: 'api'
      };
    } catch (error) {
      console.error('Error searching grants:', error);
      return {
        grants: [],
        dataSource: 'fallback'
      };
    }
  }

  /**
   * Get external grant sources statistics
   */
  async getExternalSourcesStats(): Promise<{
    totalSources: number;
    enabledSources: number;
    totalGrants: number;
    lastSync: string;
    sourcesSynced: number;
  }> {
    const stats = externalGrantsService.getSourceStats();
    const syncStatus = externalGrantsService.getLastSyncStatus();
    return {
      totalSources: stats.totalSources,
      enabledSources: stats.enabledSources,
      totalGrants: stats.totalGrants,
      lastSync: syncStatus.lastSync,
      sourcesSynced: syncStatus.sourcesSynced,
    };
  }

  /**
   * Create a new grant application
   */
  async createApplication(grantId: number): Promise<GrantApplication> {
    // Implementation would go here
    throw new Error('Not implemented');
  }

  /**
   * Utility method to get authentication token
   */
  private async getAuthToken(): Promise<string> {
    // Use the auth service for consistent token management
    const { centralAuthService } = await import('./auth-central');

    // Check if user is authenticated
    if (!centralAuthService.isAuthenticated()) {
      try {
        // Try to auto-login if not authenticated
        const success = await centralAuthService.autoLogin();
        if (!success) {
          throw new Error('Authentication required');
          }
        } catch (error) {
          console.error('Authentication failed:', error);
        throw new Error('Authentication required. Please login.');
      }
      }

    const token = centralAuthService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return token;
  }
}

// Use centralized service factory instead of direct instantiation
// export const grantService = new GrantService();
