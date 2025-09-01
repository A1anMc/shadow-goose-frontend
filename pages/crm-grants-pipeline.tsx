import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../src/components/Layout';
import { logger } from '../src/lib/logger';
import { getGrantsService } from '../src/lib/services/grants-service';
import { Grant } from '../src/lib/types/grants';

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  conversion_rate: number;
  color: string;
}

interface PerformanceMetrics {
  total_pipeline_value: number;
  forecasted_revenue: number;
  overall_conversion_rate: number;
  average_deal_size: number;
  total_opportunities: number;
}

interface IndustryBreakdown {
  industry: string;
  pipeline_value: number;
  opportunity_count: number;
  success_rate: number;
}

export default function CRMGrantsPipeline() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [industryBreakdown, setIndustryBreakdown] = useState<IndustryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('90d');

  const grantService = useMemo(() => getGrantsService(), []);

  const calculatePipelineStages = useCallback((grantsData: Grant[]) => {
    const stages = [
      { stage: 'Planning', color: 'bg-gray-500' },
      { stage: 'Open', color: 'bg-blue-500' },
      { stage: 'Closing Soon', color: 'bg-yellow-500' },
      { stage: 'Closing Today', color: 'bg-orange-500' },
      { stage: 'Closed', color: 'bg-purple-500' }
    ];

    const stageData = stages.map((stage, index) => {
      const stageGrants = grantsData.filter(grant => {
        // Mock stage assignment based on grant properties
        if (index === 0) return grant.status === 'planning';
        if (index === 1) return grant.status === 'open';
        if (index === 2) return grant.status === 'closing_soon';
        if (index === 3) return grant.status === 'closing_today';
        if (index === 4) return grant.status === 'closed';
        return false;
      });

      const count = stageGrants.length;
             const value = stageGrants.reduce((sum, grant) => sum + (grant.amount || 0), 0);
      const conversion_rate = index === 0 ? 100 : 
        ((count / (grantsData.length || 1)) * 100);

      return {
        ...stage,
        count,
        value,
        conversion_rate: Math.round(conversion_rate * 10) / 10
      };
    });

    setPipelineStages(stageData);
  }, []);

  const calculatePerformanceMetrics = useCallback((grantsData: Grant[]) => {
         const total_pipeline_value = grantsData.reduce((sum, grant) => sum + (grant.amount || 0), 0);
    const forecasted_revenue = total_pipeline_value * 0.612; // 61.2% conversion rate like example
    const overall_conversion_rate = 61.2;
    const average_deal_size = grantsData.length > 0 ? total_pipeline_value / grantsData.length : 0;
    const total_opportunities = grantsData.length;

    setPerformanceMetrics({
      total_pipeline_value,
      forecasted_revenue,
      overall_conversion_rate,
      average_deal_size,
      total_opportunities
    });
  }, []);

  const calculateIndustryBreakdown = useCallback((grantsData: Grant[]) => {
    const industryMap = new Map<string, { value: number; count: number; success: number }>();

    grantsData.forEach(grant => {
      const industry = grant.category || 'Other';
      const current = industryMap.get(industry) || { value: 0, count: 0, success: 0 };
      
             current.value += grant.amount || 0;
      current.count += 1;
      if (grant.status === 'closed') current.success += 1;
      
      industryMap.set(industry, current);
    });

    const breakdown = Array.from(industryMap.entries()).map(([industry, data]) => ({
      industry,
      pipeline_value: data.value,
      opportunity_count: data.count,
      success_rate: data.count > 0 ? (data.success / data.count) * 100 : 0
    })).sort((a, b) => b.pipeline_value - a.pipeline_value);

    setIndustryBreakdown(breakdown);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const grantsData = await grantService.getGrantsWithSource();
      setGrants(grantsData.data);

      // Calculate all metrics
      calculatePipelineStages(grantsData.data);
      calculatePerformanceMetrics(grantsData.data);
      calculateIndustryBreakdown(grantsData.data);

    } catch (err) {
      logger.error('Error loading CRM pipeline data', { error: err instanceof Error ? err.message : String(err) });
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [grantService, calculatePipelineStages, calculatePerformanceMetrics, calculateIndustryBreakdown]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading CRM Pipeline Dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">CRM Grants Pipeline</h1>
                <p className="text-gray-600 mt-2">Track your grant opportunities and conversion rates</p>
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
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(performanceMetrics.total_pipeline_value / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Forecasted Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(performanceMetrics.forecasted_revenue / 1000000).toFixed(1)}M
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.overall_conversion_rate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {performanceMetrics.total_opportunities}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(performanceMetrics.average_deal_size / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Funnel</h3>
              <div className="space-y-4">
                                       {pipelineStages.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
                      <span className="font-medium text-gray-700">{stage.stage}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {stage.count} opportunities
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(stage.value / 1000).toFixed(0)}K
                      </span>
                      <span className="text-sm text-gray-500">
                        {stage.conversion_rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Breakdown</h3>
              <div className="space-y-3">
                {industryBreakdown.slice(0, 5).map((industry) => (
                  <div key={industry.industry} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{industry.industry}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {industry.opportunity_count} deals
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(industry.pipeline_value / 1000).toFixed(0)}K
                      </span>
                      <span className="text-sm text-gray-500">
                        {industry.success_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Opportunities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Opportunities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grant Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Closing Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grants.slice(0, 10).map((grant) => (
                    <tr key={grant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{grant.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {grant.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                 ${(grant.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grant.status === 'open' ? 'bg-green-100 text-green-800' :
                          grant.status === 'closing_soon' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
