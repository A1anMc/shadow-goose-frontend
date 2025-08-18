// GRANTS SERVICE INTERFACE
// Defines the contract for all grants services across the application
// This ensures consistency and makes the system maintainable

import { BulletproofResponse, Grant, GrantRecommendation, GrantSearchFilters } from '../types/grants';

export interface IGrantsService {
  // Core grant operations
  getGrants(): Promise<Grant[]>;
  getGrantsWithSource(): Promise<BulletproofResponse<Grant[]>>;
  getGrantById(id: number | string): Promise<Grant | null>;
  searchGrants(filters: GrantSearchFilters): Promise<Grant[]>;
  searchGrantsWithFilters(filters: GrantSearchFilters): Promise<BulletproofResponse<Grant[]>>;

  // Grant applications
  getGrantApplications(): Promise<any[]>;
  getGrantApplicationById(id: number): Promise<any | null>;
  createGrantApplication(application: any): Promise<any>;
  updateGrantApplication(id: number, application: any): Promise<any>;
  deleteGrantApplication(id: number): Promise<boolean>;

  // Additional methods for backward compatibility
  getApplications(): Promise<any[]>;
  getApplication(id: number): Promise<any | null>;
  getGrant(id: number): Promise<Grant | null>;
  getApplicationAnswers(id: number): Promise<any[]>;
  getApplicationComments(id: number): Promise<any[]>;
  updateApplicationAnswer(id: number, answer: any): Promise<any>;
  addComment(id: number, comment: any): Promise<any>;
  submitApplication(id: number): Promise<boolean>;
  updateApplicationContent(id: number, content: any): Promise<any>;

  // Dashboard methods
  getHighPriorityGrants(): Promise<Grant[]>;
  getClosingSoonGrants(): Promise<Grant[]>;
  getPipelineStats(): Promise<any>;
  getPipelineHealth(): Promise<any>;

  // Project management methods
  getApplicationQuestions(id: number): Promise<any[]>;
  getTeamAssignments(id: number): Promise<any[]>;
  getCollaborators(id: number): Promise<any[]>;
  getApplicationProgress(id: number): Promise<any>;
  getAvailableTeamMembers(): Promise<any[]>;
  assignTeamMember(id: number, assignment: any): Promise<any>;
  inviteCollaborator(id: number, collaborator: any): Promise<any>;
  updateQuestionAnswer(id: number, questionId: string, answer: string): Promise<boolean>;

  // Grant recommendations
  getGrantRecommendations(): Promise<GrantRecommendation[]>;
  getGrantRecommendationsForUser(userId: number): Promise<GrantRecommendation[]>;

  // External sources
  getExternalSourcesStats(): Promise<{
    totalSources: number;
    enabledSources: number;
    totalGrants: number;
    lastSync: string;
    sourcesSynced: number;
  }>;

  // Health and status
  getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    errors: string[];
  }>;

  // Cache management
  clearCache(): Promise<void>;
  refreshCache(): Promise<void>;
}

// Service factory for creating the appropriate service implementation
export class GrantsServiceFactory {
  private static instance: IGrantsService | null = null;

  static getService(): IGrantsService {
    if (!GrantsServiceFactory.instance) {
      // Import and create the bulletproof service by default
      const { GrantsBulletproofService } = require('./grants-bulletproof.service');
      GrantsServiceFactory.instance = new GrantsBulletproofService();
    }
    return GrantsServiceFactory.instance!;
  }

  static setService(service: IGrantsService): void {
    GrantsServiceFactory.instance = service;
  }

  static reset(): void {
    GrantsServiceFactory.instance = null;
  }
}

// Export convenience function
export const getGrantsService = () => GrantsServiceFactory.getService();
