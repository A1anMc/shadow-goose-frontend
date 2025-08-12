import { Grant, GrantApplication, GrantRecommendation, GrantSearchFilters } from './grants';

class GrantServiceFixed {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shadow-goose-api.onrender.com';

  // Get all available grants - NO FALLBACK, ONLY REAL API
  async getGrants(): Promise<{ grants: Grant[], dataSource: 'api' }> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot fetch real grants data');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot fetch real grants data');
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
      throw new Error(`Grants API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data || !Array.isArray(data.grants)) {
      throw new Error('Invalid grants data structure from API');
    }

    const grants = data.grants || [];

    // Validate each grant has data_source === 'api'
    const invalidGrants = grants.filter(grant => grant.data_source !== 'api');
    if (invalidGrants.length > 0) {
      throw new Error(`Found ${invalidGrants.length} grants with non-API data source`);
    }

    // Mark API data with source indicator
    const grantsWithSource = grants.map(grant => ({
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
    const invalidGrants = grants.filter(grant => grant.data_source !== 'api');
    if (invalidGrants.length > 0) {
      throw new Error(`Found ${invalidGrants.length} search results with non-API data source`);
    }

    // Mark API data with source indicator
    const grantsWithSource = grants.map(grant => ({
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

    if (!data || !Array.isArray(data.recommendations)) {
      throw new Error('Invalid recommendations data structure from API');
    }

    return data.recommendations || [];
  }

  // Get grant categories - NO FALLBACK, ONLY REAL API
  async getCategories(): Promise<string[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real grant categories');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real grant categories');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grants/categories`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Categories API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.categories)) {
      throw new Error('Invalid categories data structure from API');
    }

    return data.categories || [];
  }

  // Get applications - NO FALLBACK, ONLY REAL API
  async getApplications(): Promise<GrantApplication[]> {
    if (!this.baseUrl) {
      throw new Error('API URL not configured - cannot get real applications');
    }

    const token = localStorage.getItem('sge_auth_token');
    if (!token) {
      throw new Error('Authentication required - cannot get real applications');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${this.baseUrl}/api/grant-applications`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Applications API failed: ${errorData.detail || `Status: ${response.status}`}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.applications)) {
      throw new Error('Invalid applications data structure from API');
    }

    return data.applications || [];
  }
}

export const grantServiceFixed = new GrantServiceFixed();
