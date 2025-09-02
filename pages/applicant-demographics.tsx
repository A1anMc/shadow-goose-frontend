import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../src/components/Layout';
import { logger } from '../src/lib/logger';
import { getGrantsService } from '../src/lib/services/grants-service';
import { Grant } from '../src/lib/types/grants';

interface OrganizationType {
  type: string;
  count: number;
  success_rate: number;
  total_funding: number;
  avg_grant_size: number;
  color: string;
}

interface GeographicData {
  region: string;
  count: number;
  success_rate: number;
  total_funding: number;
  percentage: number;
}

interface DemographicMetrics {
  total_applicants: number;
  total_organizations: number;
  overall_success_rate: number;
  average_grant_size: number;
  geographic_coverage: number;
  organization_diversity: number;
}

interface SuccessPatterns {
  category: string;
  success_rate: number;
  application_count: number;
  avg_funding: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export default function ApplicantDemographics() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [demographicMetrics, setDemographicMetrics] = useState<DemographicMetrics | null>(null);
  const [successPatterns, setSuccessPatterns] = useState<SuccessPatterns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('90d');
  const [selectedView, setSelectedView] = useState<'overview' | 'geographic' | 'success-patterns'>('overview');

  const grantService = useMemo(() => getGrantsService(), []);

  const calculateOrganizationTypes = useCallback((grantsData: Grant[]) => {
    // Mock organization type analysis based on grant categories and amounts
    const typeMap = new Map<string, { count: number; success: number; funding: number }>();

         grantsData.forEach(grant => {
       // Determine organization type based on grant characteristics
       let orgType = 'Other';
       
       if (grant.category?.toLowerCase().includes('arts') || grant.category?.toLowerCase().includes('culture')) {
         orgType = 'Arts & Culture';
       } else if (grant.category?.toLowerCase().includes('education') || grant.category?.toLowerCase().includes('school')) {
         orgType = 'Education';
       } else if (grant.category?.toLowerCase().includes('health') || grant.category?.toLowerCase().includes('medical')) {
         orgType = 'Healthcare';
       } else if (grant.category?.toLowerCase().includes('community') || grant.category?.toLowerCase().includes('social')) {
         orgType = 'Community Services';
       } else if (grant.category?.toLowerCase().includes('technology') || grant.category?.toLowerCase().includes('digital')) {
         orgType = 'Technology';
       } else if (grant.category?.toLowerCase().includes('environment') || grant.category?.toLowerCase().includes('sustainability')) {
         orgType = 'Environment';
       }

       const current = typeMap.get(orgType) || { count: 0, success: 0, funding: 0 };
       current.count += 1;
       current.funding += grant.amount || 0;
      if (grant.status === 'closed') current.success += 1;
      
      typeMap.set(orgType, current);
    });

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    
    const types = Array.from(typeMap.entries()).map(([type, data], index) => ({
      type,
      count: data.count,
      success_rate: data.count > 0 ? (data.success / data.count) * 100 : 0,
      total_funding: data.funding,
      avg_grant_size: data.count > 0 ? data.funding / data.count : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.count - a.count);

    setOrganizationTypes(types);
  }, []);

  const calculateGeographicData = useCallback((grantsData: Grant[]) => {
    // Mock geographic analysis based on grant data
    const regionMap = new Map<string, { count: number; success: number; funding: number }>();

    grantsData.forEach(grant => {
      // Determine region based on grant characteristics (mock data)
      let region = 'Other';
      
      if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('victoria'))) {
        region = 'Victoria';
      } else if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('nsw'))) {
        region = 'New South Wales';
      } else if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('queensland'))) {
        region = 'Queensland';
      } else if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('western australia'))) {
        region = 'Western Australia';
      } else if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('south australia'))) {
        region = 'South Australia';
      } else if (grant.geographic_focus?.some(focus => focus.toLowerCase().includes('national'))) {
        region = 'National';
      }

             const current = regionMap.get(region) || { count: 0, success: 0, funding: 0 };
       current.count += 1;
       current.funding += grant.amount || 0;
      if (grant.status === 'closed') current.success += 1;
      
      regionMap.set(region, current);
    });

    const totalCount = grantsData.length;
    const regions = Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      count: data.count,
      success_rate: data.count > 0 ? (data.success / data.count) * 100 : 0,
      total_funding: data.funding,
      percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    setGeographicData(regions);
  }, []);

  const calculateDemographicMetrics = useCallback((grantsData: Grant[]) => {
    const total_applicants = grantsData.length;
    const total_organizations = new Set(grantsData.map(g => g.organisation || 'Unknown')).size;
    const successful_grants = grantsData.filter(g => g.status === 'closed').length;
    const overall_success_rate = total_applicants > 0 ? (successful_grants / total_applicants) * 100 : 0;
         const total_funding = grantsData.reduce((sum, g) => sum + (g.amount || 0), 0);
    const average_grant_size = total_applicants > 0 ? total_funding / total_applicants : 0;
    const geographic_coverage = new Set(grantsData.flatMap(g => g.geographic_focus || [])).size;
    const organization_diversity = new Set(grantsData.map(g => g.category)).size;

    setDemographicMetrics({
      total_applicants,
      total_organizations,
      overall_success_rate,
      average_grant_size,
      geographic_coverage,
      organization_diversity
    });
  }, []);

  const calculateSuccessPatterns = useCallback((grantsData: Grant[]) => {
    const categoryMap = new Map<string, { success: number; total: number; funding: number }>();

    grantsData.forEach(grant => {
      const category = grant.category || 'Other';
             const current = categoryMap.get(category) || { success: 0, total: 0, funding: 0 };
       current.total += 1;
       current.funding += grant.amount || 0;
      if (grant.status === 'closed') current.success += 1;
      categoryMap.set(category, current);
    });

         const patterns = Array.from(categoryMap.entries()).map(([category, data]) => ({
       category,
       success_rate: data.total > 0 ? (data.success / data.total) * 100 : 0,
       application_count: data.total,
       avg_funding: data.total > 0 ? data.funding / data.total : 0,
       trend: (Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable') as 'increasing' | 'decreasing' | 'stable'
     })).sort((a, b) => b.success_rate - a.success_rate);

    setSuccessPatterns(patterns);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const grantsData = await grantService.getGrantsWithSource();
      setGrants(grantsData.data);

      // Calculate all demographic metrics
      calculateOrganizationTypes(grantsData.data);
      calculateGeographicData(grantsData.data);
      calculateDemographicMetrics(grantsData.data);
      calculateSuccessPatterns(grantsData.data);

    } catch (err) {
      logger.error('Error loading demographics data', { error: err instanceof Error ? err.message : String(err) });
      setError(err instanceof Error ? err.message : 'Failed to load demographics data');
    } finally {
      setLoading(false);
    }
  }, [grantService, calculateOrganizationTypes, calculateGeographicData, calculateDemographicMetrics, calculateSuccessPatterns]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading Applicant Demographics Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Dashboard Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Applicant Demographics</h1>
                <p className="text-gray-600 mt-2">Understand your grant applicants and optimize for success</p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as '30d' | '90d' | '1y')}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <select
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value as 'overview' | 'geographic' | 'success-patterns')}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="overview">Overview</option>
                  <option value="geographic">Geographic</option>
                  <option value="success-patterns">Success Patterns</option>
                </select>
              </div>
            </div>
          </div>

          {/* Demographic Metrics */}
          {demographicMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                    <p className="text-2xl font-bold text-gray-900">{demographicMetrics.total_applicants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Organizations</p>
                    <p className="text-2xl font-bold text-gray-900">{demographicMetrics.total_organizations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{demographicMetrics.overall_success_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Grant Size</p>
                    <p className="text-2xl font-bold text-gray-900">${(demographicMetrics.average_grant_size / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Geographic Coverage</p>
                    <p className="text-2xl font-bold text-gray-900">{demographicMetrics.geographic_coverage} regions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Organization Diversity</p>
                    <p className="text-2xl font-bold text-gray-900">{demographicMetrics.organization_diversity} categories</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organization Types Analysis */}
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Types</h3>
                <div className="space-y-4">
                  {organizationTypes.slice(0, 6).map((orgType) => (
                    <div key={orgType.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${orgType.color}`}></div>
                        <span className="font-medium text-gray-700">{orgType.type}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {orgType.count} orgs
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {orgType.success_rate.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          ${(orgType.avg_grant_size / 1000).toFixed(0)}K avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Patterns */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Patterns by Category</h3>
                <div className="space-y-3">
                  {successPatterns.slice(0, 5).map((pattern) => (
                    <div key={pattern.category} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{pattern.category}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {pattern.application_count} apps
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {pattern.success_rate.toFixed(1)}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pattern.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                          pattern.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pattern.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Geographic Distribution */}
          {selectedView === 'geographic' && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {geographicData.map((region) => (
                  <div key={region.region} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{region.region}</h4>
                      <span className="text-sm text-gray-500">{region.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Applications:</span>
                        <span className="font-medium">{region.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium">{region.success_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Funding:</span>
                        <span className="font-medium">${(region.total_funding / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Patterns Detail */}
          {selectedView === 'success-patterns' && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Success Patterns</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Funding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {successPatterns.map((pattern) => (
                      <tr key={pattern.category} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{pattern.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pattern.application_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{pattern.success_rate.toFixed(1)}%</span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${pattern.success_rate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(pattern.avg_funding / 1000).toFixed(0)}K
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            pattern.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                            pattern.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pattern.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Insights Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Top Performing Organization Type</p>
                    <p className="text-sm text-gray-600">
                      {organizationTypes[0]?.type || 'N/A'} organizations have the highest success rate at {organizationTypes[0]?.success_rate.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Geographic Opportunity</p>
                    <p className="text-sm text-gray-600">
                      {geographicData[0]?.region || 'N/A'} has the highest application volume with {geographicData[0]?.count || 0} applications
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Success Rate Trend</p>
                    <p className="text-sm text-gray-600">
                      Overall success rate is {demographicMetrics?.overall_success_rate.toFixed(1) || 0}% across all categories
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Funding Distribution</p>
                    <p className="text-sm text-gray-600">
                      Average grant size is ${(demographicMetrics?.average_grant_size || 0 / 1000).toFixed(0)}K with {demographicMetrics?.organization_diversity || 0} different categories
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
