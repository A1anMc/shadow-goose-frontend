// BULLETPROOF GRANTS SERVICE - NEVER BREAKS
// This service implements multiple layers of reliability to ensure grants always load

import { Grant, GrantApplication, GrantRecommendation, GrantSearchFilters } from './grants';

interface BulletproofResponse<T> {
  data: T;
  source: 'primary' | 'fallback' | 'cache' | 'mock';
  timestamp: string;
  reliability: number; // 0-100
  errors: string[];
}

class BulletproofGrantService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api.onrender.com';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  // PRIMARY METHOD - NEVER FAILS
  async getGrants(): Promise<BulletproofResponse<Grant[]>> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Layer 1: Try primary API with authentication
      console.log('🔍 Layer 1: Attempting primary API...');
      const primaryResult = await this.tryPrimaryAPI();
      if (primaryResult.success) {
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
      if (cachedResult.success) {
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
      if (fallbackResult.success) {
        return {
          data: fallbackResult.grants,
          source: 'fallback',
          timestamp: new Date().toISOString(),
          reliability: 70,
          errors: errors
        };
      }
      errors.push(`Fallback API failed: ${fallbackResult.error}`);

      // Layer 4: Return mock data (NEVER FAILS)
      console.log('🔍 Layer 4: Using mock data...');
      const mockGrants = this.getMockGrants();
      return {
        data: mockGrants,
        source: 'mock',
        timestamp: new Date().toISOString(),
        reliability: 50,
        errors: errors
      };

    } catch (error) {
      console.error('💥 All layers failed, using emergency mock data');
      const mockGrants = this.getMockGrants();
      return {
        data: mockGrants,
        source: 'mock',
        timestamp: new Date().toISOString(),
        reliability: 30,
        errors: [...errors, `Emergency fallback: ${error}`]
      };
    }
  }

  // Layer 1: Primary API with authentication
  private async tryPrimaryAPI(): Promise<{ success: boolean; grants?: Grant[]; error?: string }> {
    try {
      // Get authentication token
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      // Make API request with retries
      for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(`${this.baseUrl}/api/grants`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
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
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Layer 2: Cached data
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

  // Layer 3: Fallback API (no authentication)
  private async tryFallbackAPI(): Promise<{ success: boolean; grants?: Grant[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/grants`, {
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

  // Layer 4: Mock data (NEVER FAILS)
  private getMockGrants(): Grant[] {
    return [
      {
        id: 1,
        title: "Screen Australia - Feature Film Production",
        description: "Support for Australian feature film production",
        amount: 500000,
        deadline: "2025-12-31",
        category: "Film & Television",
        eligibility: "Australian filmmakers",
        status: "open",
        data_source: "mock"
      },
      {
        id: 2,
        title: "Creative Australia - Arts Projects",
        description: "Funding for innovative arts projects",
        amount: 100000,
        deadline: "2025-11-30",
        category: "Arts & Culture",
        eligibility: "Australian artists and organizations",
        status: "open",
        data_source: "mock"
      },
      {
        id: 3,
        title: "VicScreen - Digital Games",
        description: "Support for digital games development",
        amount: 250000,
        deadline: "2025-10-31",
        category: "Digital Media",
        eligibility: "Victorian game developers",
        status: "open",
        data_source: "mock"
      }
    ];
  }

  // Authentication helper with multiple fallbacks
  private async getAuthToken(): Promise<string | null> {
    try {
      // Method 1: Try auth service
      const { authService } = await import('./auth');
      if (authService.isAuthenticated()) {
        return authService.getToken();
      }

      // Method 2: Try auto-login
      const loginSuccess = await authService.autoLogin();
      if (loginSuccess) {
        return authService.getToken();
      }

      // Method 3: Try localStorage directly
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('sge_auth_token');
        if (token) return token;
      }

      return null;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Search grants with same bulletproof approach
  async searchGrants(filters: GrantSearchFilters): Promise<BulletproofResponse<Grant[]>> {
    const allGrants = await this.getGrants();
    
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

  // Get grant by ID with bulletproof approach
  async getGrantById(id: number): Promise<BulletproofResponse<Grant | null>> {
    const allGrants = await this.getGrants();
    const grant = allGrants.data.find(g => g.id === id);
    
    return {
      ...allGrants,
      data: grant || null
    };
  }
}

// Export singleton instance
export const bulletproofGrantService = new BulletproofGrantService();
