import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SuccessRateDashboard from '../src/components/SuccessRateDashboard';
import { getGrantsService } from '../src/lib/services/grants-service';
import { Grant } from '../src/lib/types/grants';

interface PipelineStats {
  total_grants: number;
  total_funding_available: number;
  average_success_score: number;
  average_priority_score: number;
  grants_by_source: Record<string, number>;
  grants_by_category: Record<string, number>;
  grants_by_status: Record<string, number>;
  last_updated: string;
  data_freshness: 'excellent' | 'good' | 'acceptable' | 'stale';
}

interface PipelineHealth {
  pipeline_status: string;
  data_sources: Record<string, { status: string; last_updated: string }>;
  cache_status: string;
}

export default function GrantsDashboard() {
  const router = useRouter();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [highPriorityGrants, setHighPriorityGrants] = useState<Grant[]>([]);
  const [closingSoonGrants, setClosingSoonGrants] = useState<Grant[]>([]);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'high-priority' | 'closing-soon' | 'all-grants'>('overview');

  const grantService = useMemo(() => getGrantsService(), []);

  const loadGrantsData = async () => {
    try {
      setLoading(true);
      const grantsData = await grantService.getGrantsWithSource();
      setGrants(grantsData.data);
    } catch (error) {
      console.error('Error loading grants:', error);
      setError('Failed to load grants data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load grants data using the new method
      await loadGrantsData();

      // Load other data
      const [highPriorityData, closingSoonData, statsData, healthData] = await Promise.allSettled([
        grantService.getHighPriorityGrants(),
        grantService.getClosingSoonGrants(),
        grantService.getPipelineStats(),
        grantService.getPipelineHealth()
      ]);

      if (highPriorityData.status === 'fulfilled') {
        setHighPriorityGrants(highPriorityData.value);
      }

      if (closingSoonData.status === 'fulfilled') {
        setClosingSoonGrants(closingSoonData.value);
      }

      if (statsData.status === 'fulfilled') {
        setPipelineStats(statsData.value);
      }

      if (healthData.status === 'fulfilled') {
        setPipelineHealth(healthData.value);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [grantService, loadGrantsData]);

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closing_soon': return 'text-orange-600 bg-orange-100';
      case 'closing_today': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDataFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'acceptable': return 'text-yellow-600';
      case 'stale': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPipelineStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-time Grants Dashboard - Updated
          </h1>
          <p className="text-gray-600">
            Live data from Creative Australia, Screen Australia, and other grant sources
          </p>
        </div>

        {/* Pipeline Health Status */}
        {pipelineHealth && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pipeline Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPipelineStatusColor(pipelineHealth.pipeline_status)}`}>
                  {pipelineHealth.pipeline_status.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Cache: {pipelineHealth.cache_status}
              </div>
            </div>

            {/* Data Sources Status */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(pipelineHealth.data_sources).map(([source, info]) => (
                <div key={source} className="text-sm">
                  <div className="font-medium text-gray-700 capitalize">
                    {source.replace('_', ' ')}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    info.status === 'healthy' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {info.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {pipelineStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{pipelineStats.total_grants}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Grants</p>
                  <p className="text-2xl font-semibold text-gray-900">{pipelineStats.total_grants}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">$</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Funding</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(pipelineStats.total_funding_available)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">%</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Success Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(pipelineStats.average_success_score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">★</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Data Freshness</p>
                  <p className={`text-2xl font-semibold ${getDataFreshnessColor(pipelineStats.data_freshness)}`}>
                    {pipelineStats.data_freshness.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Rate Dashboard */}
        <div className="mb-8">
          <SuccessRateDashboard
            showDetails={true}
            showAlerts={true}
            autoRefresh={true}
            compact={false}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', count: pipelineStats?.total_grants },
              { id: 'high-priority', label: 'High Priority', count: highPriorityGrants.length },
              { id: 'closing-soon', label: 'Closing Soon', count: closingSoonGrants.length },
              { id: 'all-grants', label: 'All Grants', count: grants.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {selectedTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>

              {/* Grants by Source */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Grants by Source</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pipelineStats && Object.entries(pipelineStats.grants_by_source).map(([source, count]) => (
                    <div key={source} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {source.replace('_', ' ')}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grants by Category */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Grants by Category</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pipelineStats && Object.entries(pipelineStats.grants_by_category).map(([category, count]) => (
                    <div key={category} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace('_', ' ')}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent High Priority Grants */}
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Recent High Priority Grants</h4>
                <div className="space-y-3">
                  {highPriorityGrants.slice(0, 3).map((grant) => (
                    <div key={grant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{grant.title}</h5>
                          <p className="text-sm text-gray-600">{grant.organization}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(grant.amount)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                            {grant.status.replace('_', ' ')}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            Priority: {grant.priority_score}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'high-priority' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority Grants</h3>
              <div className="space-y-4">
                {highPriorityGrants.map((grant) => (
                  <div key={grant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{grant.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{grant.organization}</span>
                          <span>{formatCurrency(grant.amount)}</span>
                          <span>Deadline: {formatDate(grant.deadline)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                          {grant.status.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          Priority: {grant.priority_score || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Success: {grant.success_score ? (grant.success_score * 100).toFixed(1) : 'N/A'}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'closing-soon' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Closing Soon</h3>
              <div className="space-y-4">
                {closingSoonGrants.map((grant) => (
                  <div key={grant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{grant.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{grant.organization}</span>
                          <span>{formatCurrency(grant.amount)}</span>
                          <span>Deadline: {formatDate(grant.deadline)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                          {grant.status.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {grant.days_until_deadline || 'N/A'} days left
                        </div>
                        <div className="text-sm text-gray-500">
                          Success: {grant.success_score ? (grant.success_score * 100).toFixed(1) : 'N/A'}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'all-grants' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Available Grants</h3>
              <div className="space-y-4">
                {grants.map((grant) => (
                  <div key={grant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{grant.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{grant.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{grant.organization}</span>
                          <span>{formatCurrency(grant.amount)}</span>
                          <span>Deadline: {formatDate(grant.deadline)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                          {grant.status.replace('_', ' ')}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          Priority: {grant.priority_score || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Success: {grant.success_score ? (grant.success_score * 100).toFixed(1) : 'N/A'}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {pipelineStats && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Last updated: {formatDate(pipelineStats.last_updated)}
          </div>
        )}
      </div>
    </div>
  );
}
