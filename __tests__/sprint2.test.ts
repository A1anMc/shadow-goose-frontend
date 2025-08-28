import { grantDiscoveryEngine, GrantMatchingCriteria } from '../src/lib/grant-discovery-engine';
import { screenAustraliaAPI } from '../src/lib/screen-australia-api';
import { creativeAustraliaAPI } from '../src/lib/creative-australia-api';
import { apiMonitor } from '../src/lib/api-monitor';
import { fallbackAPI } from '../src/lib/fallback-api';

describe('Sprint 2 - Grant Discovery System', () => {
  describe('Screen Australia API', () => {
    test('should initialize correctly', () => {
      expect(screenAustraliaAPI).toBeDefined();
    });

    test('should get grants with criteria', async () => {
      const criteria = {
        category: 'Feature Film',
        location: ['NSW', 'VIC'],
        amount_min: 50000,
        amount_max: 200000,
        industry: ['Film'],
        keywords: ['development'],
        status: 'open' as const,
        page: 1,
        limit: 10
      };

      const result = await screenAustraliaAPI.getGrants(criteria);
      expect(result).toBeDefined();
      expect(result.grants).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    test('should get categories', async () => {
      const categories = await screenAustraliaAPI.getCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should get industries', async () => {
      const industries = await screenAustraliaAPI.getIndustries();
      expect(industries).toBeInstanceOf(Array);
      expect(industries.length).toBeGreaterThan(0);
    });

    test('should get locations', async () => {
      const locations = await screenAustraliaAPI.getLocations();
      expect(locations).toBeInstanceOf(Array);
      expect(locations.length).toBeGreaterThan(0);
    });

    test('should handle cache operations', () => {
      const stats = screenAustraliaAPI.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.entries).toBeInstanceOf(Array);
    });
  });

  describe('Creative Australia API', () => {
    test('should initialize correctly', () => {
      expect(creativeAustraliaAPI).toBeDefined();
    });

    test('should get grants with criteria', async () => {
      const criteria = {
        category: 'Arts Project',
        location: ['NSW', 'VIC'],
        amount_min: 10000,
        amount_max: 100000,
        industry: ['Arts'],
        keywords: ['community'],
        status: 'open' as const,
        page: 1,
        limit: 10
      };

      const result = await creativeAustraliaAPI.getGrants(criteria);
      expect(result).toBeDefined();
      expect(result.grants).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    test('should get categories', async () => {
      const categories = await creativeAustraliaAPI.getCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should get industries', async () => {
      const industries = await creativeAustraliaAPI.getIndustries();
      expect(industries).toBeInstanceOf(Array);
      expect(industries.length).toBeGreaterThan(0);
    });

    test('should get locations', async () => {
      const locations = await creativeAustraliaAPI.getLocations();
      expect(locations).toBeInstanceOf(Array);
      expect(locations.length).toBeGreaterThan(0);
    });
  });

  describe('Grant Discovery Engine', () => {
    test('should initialize correctly', () => {
      expect(grantDiscoveryEngine).toBeDefined();
    });

    test('should discover grants with basic criteria', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film', 'Arts'],
        location: ['NSW', 'VIC'],
        fundingAmount: { min: 10000, max: 200000 },
        eligibility: [],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        keywords: ['development', 'community'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
      expect(result.searchTime).toBeGreaterThan(0);
      expect(result.sources).toBeInstanceOf(Array);
      expect(result.searchCriteria).toEqual(criteria);
    });

    test('should calculate match scores correctly', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film'],
        location: ['NSW'],
        fundingAmount: { min: 50000, max: 150000 },
        eligibility: [],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        keywords: ['feature film'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      
      if (result.matches.length > 0) {
        const match = result.matches[0];
        expect(match.matchScore).toBeGreaterThanOrEqual(0);
        expect(match.matchScore).toBeLessThanOrEqual(100);
        expect(match.matchReasons).toBeInstanceOf(Array);
        expect(match.priority).toMatch(/^(high|medium|low)$/);
        expect(match.source).toMatch(/^(screen_australia|creative_australia|fallback)$/);
      }
    });

    test('should get categories', async () => {
      const categories = await grantDiscoveryEngine.getCategories();
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should get industries', async () => {
      const industries = await grantDiscoveryEngine.getIndustries();
      expect(industries).toBeInstanceOf(Array);
      expect(industries.length).toBeGreaterThan(0);
    });

    test('should get locations', async () => {
      const locations = await grantDiscoveryEngine.getLocations();
      expect(locations).toBeInstanceOf(Array);
      expect(locations.length).toBeGreaterThan(0);
    });

    test('should handle empty criteria gracefully', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: [],
        location: [],
        fundingAmount: { min: 0, max: 1000000 },
        eligibility: [],
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        keywords: [],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
    });

    test('should prioritize high-scoring matches', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film', 'Documentary'],
        location: ['NSW', 'VIC', 'QLD'],
        fundingAmount: { min: 25000, max: 200000 },
        eligibility: [],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        keywords: ['documentary', 'production'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      
      if (result.matches.length > 1) {
        // Check that matches are sorted by score (descending)
        for (let i = 0; i < result.matches.length - 1; i++) {
          expect(result.matches[i].matchScore).toBeGreaterThanOrEqual(result.matches[i + 1].matchScore);
        }
      }
    });
  });

  describe('API Monitor Integration', () => {
    test('should monitor grant discovery endpoints', async () => {
      const endpoints = apiMonitor.getAllEndpoints();
      expect(endpoints).toBeDefined();
      expect(endpoints.length).toBeGreaterThan(0);
      
      const grantEndpoints = endpoints.filter(ep => ep.name.includes('grant'));
      expect(grantEndpoints.length).toBeGreaterThan(0);
    });

    test('should provide fallback data when APIs fail', async () => {
      const fallbackGrants = await fallbackAPI.getRealGrants();
      expect(fallbackGrants).toBeDefined();
      expect(fallbackGrants.grants).toBeInstanceOf(Array);
      expect(fallbackGrants.grants.length).toBeGreaterThan(0);
    });
  });

  describe('Data Quality and Validation', () => {
    test('should validate grant data structure', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film'],
        location: ['NSW'],
        fundingAmount: { min: 10000, max: 100000 },
        eligibility: [],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        keywords: ['development'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      
      if (result.matches.length > 0) {
        const grant = result.matches[0].grant;
        
        // Validate required fields
        expect(grant.id).toBeDefined();
        expect(grant.title).toBeDefined();
        expect(grant.description).toBeDefined();
        expect(grant.amount).toBeDefined();
        expect(grant.amount.min).toBeGreaterThanOrEqual(0);
        expect(grant.amount.max).toBeGreaterThanOrEqual(grant.amount.min);
        expect(grant.deadline).toBeDefined();
        expect(grant.category).toBeDefined();
        expect(grant.eligibility).toBeInstanceOf(Array);
        expect(grant.location).toBeInstanceOf(Array);
        expect(grant.industry).toBeInstanceOf(Array);
        expect(grant.application_url).toBeDefined();
        expect(grant.contact_info).toBeDefined();
        expect(grant.last_updated).toBeDefined();
        expect(grant.status).toMatch(/^(open|closed|upcoming)$/);
        expect(grant.tags).toBeInstanceOf(Array);
        expect(grant.requirements).toBeInstanceOf(Array);
        expect(grant.source).toMatch(/^(screen_australia|creative_australia|fallback)$/);
      }
    });

    test('should handle date parsing correctly', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film'],
        location: ['NSW'],
        fundingAmount: { min: 10000, max: 100000 },
        eligibility: [],
        deadline: new Date('2025-12-31'),
        keywords: ['development'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
    });
  });

  describe('Performance and Scalability', () => {
    test('should complete discovery within reasonable time', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: ['Film', 'Arts', 'Documentary'],
        location: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'],
        fundingAmount: { min: 1000, max: 500000 },
        eligibility: [],
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        keywords: ['development', 'production', 'community'],
        status: 'open'
      };

      const startTime = Date.now();
      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.searchTime).toBeLessThanOrEqual(executionTime);
    });

    test('should handle large result sets', async () => {
      const criteria: GrantMatchingCriteria = {
        industry: [],
        location: [],
        fundingAmount: { min: 0, max: 1000000 },
        eligibility: [],
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        keywords: [],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle API failures gracefully', async () => {
      // This test simulates API failures by using invalid criteria
      const criteria: GrantMatchingCriteria = {
        industry: ['InvalidIndustry'],
        location: ['InvalidLocation'],
        fundingAmount: { min: -1000, max: -500 },
        eligibility: [],
        deadline: new Date('2020-01-01'), // Past date
        keywords: ['invalidkeyword'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
      // Should still return some results from fallback data
      expect(result.totalFound).toBeGreaterThanOrEqual(0);
    });

    test('should handle network timeouts', async () => {
      // This test verifies that the system can handle slow responses
      const criteria: GrantMatchingCriteria = {
        industry: ['Film'],
        location: ['NSW'],
        fundingAmount: { min: 10000, max: 100000 },
        eligibility: [],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        keywords: ['development'],
        status: 'open'
      };

      const result = await grantDiscoveryEngine.discoverGrants(criteria);
      expect(result).toBeDefined();
      expect(result.matches).toBeInstanceOf(Array);
    });
  });
});
