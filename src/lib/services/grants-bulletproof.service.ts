// BULLETPROOF GRANTS SERVICE IMPLEMENTATION
// Uses centralized services and standardized types for consistency
// This prevents the issues we've been experiencing

import { centralAuthService } from '../auth-central';
import { configService } from '../config';
import { BulletproofResponse, Grant, GrantRecommendation, GrantSearchFilters } from '../types/grants';
import { IGrantsService } from './grants-service';

export class GrantsBulletproofService implements IGrantsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = configService.getApiRetries();
  private readonly RETRY_DELAY = 1000; // 1 second

  // Core grant operations
  async getGrants(): Promise<Grant[]> {
    const result = await this.getGrantsWithSource();
    return result.data;
  }

  async getGrantsWithSource(): Promise<BulletproofResponse<Grant[]>> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Layer 1: Try primary API with authentication
      console.log('🔍 Layer 1: Attempting primary API...');
      const primaryResult = await this.tryPrimaryAPI();
      if (primaryResult.success && primaryResult.grants) {
        return {
          data: primaryResult.grants,
          source: 'primary',
          timestamp: new Date().toISOString(),
          reliability: 95,
          errors: []
        };
      }
      errors.push(`Primary API failed: ${primaryResult.error}`);

      // Layer 2: Try cached data
      console.log('🔍 Layer 2: Attempting cached data...');
      const cachedResult = await this.tryCachedData();
      if (cachedResult.success && cachedResult.grants) {
        return {
          data: cachedResult.grants,
          source: 'cache',
          timestamp: new Date().toISOString(),
          reliability: 85,
          errors: errors
        };
      }
      errors.push(`Cache failed: ${cachedResult.error}`);

      // Layer 3: Try fallback API (no auth)
      console.log('🔍 Layer 3: Attempting fallback API...');
      const fallbackResult = await this.tryFallbackAPI();
      if (fallbackResult.success && fallbackResult.grants) {
        return {
          data: fallbackResult.grants,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          reliability: 70,
          errors: errors
        };
      }
      errors.push(`Fallback API failed: ${fallbackResult.error}`);

      // NO MOCK DATA - If all real sources fail, throw error
      console.error('💥 All real data sources failed');
      throw new Error(`All real data sources failed: ${errors.join(', ')}`);

    } catch (error) {
      console.error('💥 All real data sources failed, cannot provide grants');
      throw new Error(`Cannot load grants: All real data sources are unavailable. Please try again later.`);
    }
  }

  async getGrantById(id: number): Promise<Grant | null> {
    const allGrants = await this.getGrants();
    return allGrants.find(g => g.id === id) || null;
  }

  async searchGrants(filters: GrantSearchFilters): Promise<Grant[]> {
    const result = await this.searchGrantsWithFilters(filters);
    return result.data;
  }

  async searchGrantsWithFilters(filters: GrantSearchFilters): Promise<BulletproofResponse<Grant[]>> {
    const allGrants = await this.getGrantsWithSource();
    
    // Apply filters to the grants
    let filteredGrants = allGrants.data;

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

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredGrants = filteredGrants.filter(grant =>
        grant.title.toLowerCase().includes(term) ||
        grant.description.toLowerCase().includes(term)
      );
    }

    return {
      ...allGrants,
      data: filteredGrants
    };
  }

  // Grant applications (placeholder implementations)
  async getGrantApplications(): Promise<any[]> {
    return [];
  }

  async getGrantApplicationById(id: number): Promise<any | null> {
    return null;
  }

  async createGrantApplication(application: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateGrantApplication(id: number, application: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async deleteGrantApplication(id: number): Promise<boolean> {
    throw new Error('Not implemented');
  }

  // Additional methods for backward compatibility
  async getApplications(): Promise<any[]> {
    return this.getGrantApplications();
  }

  async getApplication(id: number): Promise<any | null> {
    return this.getGrantApplicationById(id);
  }

  async getGrant(id: number): Promise<Grant | null> {
    return this.getGrantById(id);
  }

  async getApplicationAnswers(id: number): Promise<any[]> {
    return [];
  }

  async getApplicationComments(id: number): Promise<any[]> {
    return [];
  }

  async updateApplicationAnswer(id: number, answer: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async addComment(id: number, comment: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async submitApplication(id: number): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async updateApplicationContent(id: number, content: any): Promise<any> {
    throw new Error('Not implemented');
  }

  // Dashboard methods
  async getHighPriorityGrants(): Promise<Grant[]> {
    const allGrants = await this.getGrants();
    return allGrants.filter(grant => (grant.priority_score || 0) > 7);
  }

  async getClosingSoonGrants(): Promise<Grant[]> {
    const allGrants = await this.getGrants();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return allGrants.filter(grant => {
      const deadline = new Date(grant.deadline);
      return deadline <= thirtyDaysFromNow && deadline >= now;
    });
  }

  async getPipelineStats(): Promise<any> {
    return {
      totalGrants: 0,
      activeApplications: 0,
      completedApplications: 0,
      successRate: 0
    };
  }

  async getPipelineHealth(): Promise<any> {
    return {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      errors: []
    };
  }

  // Project management methods
  async getApplicationQuestions(id: number): Promise<any[]> {
    return [];
  }

  async getTeamAssignments(id: number): Promise<any[]> {
    return [];
  }

  async getCollaborators(id: number): Promise<any[]> {
    return [];
  }

  async getApplicationProgress(id: number): Promise<any> {
    return {
      total_questions: 0,
      completed_questions: 0,
      percentage_complete: 0
    };
  }

  async getAvailableTeamMembers(): Promise<any[]> {
    return [];
  }

  async assignTeamMember(id: number, assignment: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async inviteCollaborator(id: number, collaborator: any): Promise<any> {
    throw new Error('Not implemented');
  }

  async updateQuestionAnswer(id: number, questionId: string, answer: string): Promise<boolean> {
    throw new Error('Not implemented');
  }

  // Grant recommendations (placeholder implementations)
  async getGrantRecommendations(): Promise<GrantRecommendation[]> {
    return [];
  }

  async getGrantRecommendationsForUser(userId: number): Promise<GrantRecommendation[]> {
    return [];
  }

  // External sources (placeholder implementations)
  async getExternalSourcesStats(): Promise<{
    totalSources: number;
    enabledSources: number;
    totalGrants: number;
    lastSync: string;
    sourcesSynced: number;
  }> {
    return {
      totalSources: 0,
      enabledSources: 0,
      totalGrants: 0,
      lastSync: new Date().toISOString(),
      sourcesSynced: 0
    };
  }

  // Health and status
  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${configService.getApiUrl()}/health`);
      if (response.ok) {
        return {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          errors: []
        };
      } else {
        return {
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          errors: [`Health check failed: ${response.status}`]
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  async refreshCache(): Promise<void> {
    await this.clearCache();
    await this.getGrantsWithSource(); // This will populate the cache
  }

  // Private helper methods

  private async tryPrimaryAPI(): Promise<{ success: boolean; grants?: Grant[]; error?: string }> {
    try {
      // Get authentication token
      const token = centralAuthService.getToken();
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      // Make API request with retries
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(`${configService.getApiUrl()}/api/grants`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(configService.getApiTimeout())
          });

          if (response.ok) {
            const data = await response.json();
            const grants = data.grants || [];
            
            // Cache successful response
            this.cache.set('grants', {
              data: grants,
              timestamp: Date.now()
            });

            return { success: true, grants };
          } else {
            return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (error) {
          if (attempt === this.MAX_RETRIES) {
            throw error;
          }
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
      
      // If we get here, all retries failed
      return { success: false, error: 'All retry attempts failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async tryCachedData(): Promise<{ success: boolean; grants?: Grant[]; error?: string }> {
    try {
      const cached = this.cache.get('grants');
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return { success: true, grants: cached.data };
      }
      return { success: false, error: 'No valid cached data' };
    } catch (error) {
      return { success: false, error: 'Cache access failed' };
    }
  }

  private async tryFallbackAPI(): Promise<{ success: boolean; grants?: Grant[]; error?: string }> {
    try {
      const response = await fetch(`${configService.getApiUrl()}/api/grants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        const grants = data.grants || [];
        return { success: true, grants };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: 'Fallback API failed' };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
