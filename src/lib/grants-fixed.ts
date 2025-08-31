import { Grant, GrantSearchFilters, GrantRecommendation } from './grants';

interface GrantWithSource extends Grant {
  data_source: 'api';
}

export class GrantsService {
  private baseUrl: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || null;
  }

  // Get all grants - NO FALLBACK, ONLY REAL API
  async getAllGrants(): Promise<{ grants: Grant[], dataSource: 'api' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real grants data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real grants data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Get grants API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.grants)) {
      throw new Error('Invalid grants data structure from API');
    }

    const grants = data.grants || [];

    // Validate each grant has data_source === 'api'
    const invalidGrants = grants.filter((grant: GrantWithSource) => grant.data_source !== 'api');
    if (invalidGrants.length > 0) {
      throw new Error(`Found ${invalidGrants.length} grants with non-API data source`);
    }

    // Mark API data with source indicator
    const grantsWithSource = grants.map((grant: GrantWithSource) => ({
      ...grant,
      data_source: 'api' as const
    }));

    return {
      grants: grantsWithSource,
      dataSource: 'api'
    };
  }

  // Search grants with filters - NO FALLBACK, ONLY REAL API
  async searchGrants(filters: GrantSearchFilters): Promise<{ grants: Grant[], dataSource: 'api' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot search real grants data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot search real grants data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Search grants API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.grants)) {
      throw new Error('Invalid search results structure from API');
    }

    const grants = data.grants || [];

    // Validate each grant has data_source === 'api'
    const invalidGrants = grants.filter((grant: GrantWithSource) => grant.data_source !== 'api');
    if (invalidGrants.length > 0) {
      throw new Error(`Found ${invalidGrants.length} search results with non-API data source`);
    }

    // Mark API data with source indicator
    const grantsWithSource = grants.map((grant: GrantWithSource) => ({
      ...grant,
      data_source: 'api' as const
    }));

    return {
      grants: grantsWithSource,
      dataSource: 'api'
    };
  }

  // Get AI-powered grant recommendations - NO FALLBACK, ONLY REAL API
  async getRecommendations(): Promise<GrantRecommendation[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real AI recommendations');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real AI recommendations');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/recommendations`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Recommendations API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.recommendations)) {
      throw new Error('Invalid recommendations data structure from API');
    }

    return data.recommendations || [];
  }

  // Get grant by ID - NO FALLBACK, ONLY REAL API
  async getGrantById(id: string): Promise<Grant> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real grant data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real grant data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Get grant API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !data.grant) {
      throw new Error('Invalid grant data structure from API');
    }

    return data.grant;
  }

  // Get grant categories - NO FALLBACK, ONLY REAL API
  async getCategories(): Promise<string[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real categories data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real categories data');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/categories`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Get categories API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.categories)) {
      throw new Error('Invalid categories data structure from API');
    }

    return data.categories || [];
  }

  // Get success metrics - NO FALLBACK, ONLY REAL API
  async getSuccessMetrics(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real success metrics');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real success metrics');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/success-metrics`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Get success metrics API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !data.metrics) {
      throw new Error('Invalid success metrics data structure from API');
    }

    return data.metrics;
  }
}

export const grantsService = new GrantsService();
