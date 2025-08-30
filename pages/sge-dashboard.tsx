import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { sgeGrantsService } from '../src/lib/services/sge-grants-service';
import { SGEDashboardData } from '../src/lib/types/sge-types';


import { logger } from '../src/lib/logger';
const SGEDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<SGEDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await sgeGrantsService.getSGEDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      logger.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'unsuccessful': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'documentary': return '🎬';
      case 'digital': return '💻';
      case 'community': return '🤝';
      case 'multicultural': return '🌍';
      default: return '📺';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SGE Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-sg-primary text-white px-4 py-2 rounded-lg hover:bg-sg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Dashboard Data</h2>
          <p className="text-gray-600">No SGE dashboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SGE Grant Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Media Projects • Cultural Representation • Social Impact</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/sge/grants')}
                className="bg-sg-primary text-white px-4 py-2 rounded-lg hover:bg-sg-primary-dark"
              >
                View All Grants
              </button>
              <button
                onClick={() => router.push('/sge/applications/new')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                New Application
              </button>
              <button
                onClick={() => router.push('/sge/applications/success-analysis')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Success Analysis
              </button>
              <button
                onClick={() => router.push('/sge/content-optimization')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Content Optimization
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.business_metrics.applications_submitted}</p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(dashboardData.business_metrics.success_rate / 100)}</p>
                <p className="text-xs text-green-600">Applications won</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Funding Secured</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.business_metrics.funding_secured)}</p>
                <p className="text-xs text-purple-600">Total secured</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.business_metrics.time_saved_hours}h</p>
                <p className="text-xs text-orange-600">Through automation</p>
              </div>
            </div>
          </div>
        </div>

        {/* SGE-Specific Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Projects</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Documentary</span>
                <span className="font-semibold">{dashboardData.business_metrics.media_projects_funded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Digital</span>
                <span className="font-semibold">{dashboardData.business_metrics.media_projects_funded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Community</span>
                <span className="font-semibold">{dashboardData.business_metrics.media_projects_funded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Multicultural</span>
                <span className="font-semibold">{dashboardData.business_metrics.media_projects_funded}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Impact</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cultural Projects</span>
                <span className="font-semibold">{dashboardData.business_metrics.cultural_impact_projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Social Impact</span>
                <span className="font-semibold">{dashboardData.business_metrics.social_impact_projects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Efficiency</span>
                <span className="font-semibold">{formatPercentage(dashboardData.business_metrics.team_efficiency_score)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Recommendations</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{dashboardData.ml_recommendations.next_grants_to_apply.length}</span> grants to apply
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{dashboardData.ml_recommendations.applications_to_optimize.length}</span> apps to optimize
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{dashboardData.ml_recommendations.team_improvements.length}</span> team improvements
              </div>
            </div>
          </div>
        </div>

        {/* Recent Grants */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Grants</h2>
            <button
              onClick={() => router.push('/sge/grants')}
              className="text-sg-primary hover:text-sg-primary-dark"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.recent_grants.slice(0, 6).map((grant) => (
              <div key={grant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{getMediaTypeIcon(grant.media_type || '')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.sge_status || '')}`}>
                    {grant.sge_status || 'discovered'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{grant.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{grant.organization}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(grant.amount)}</span>
                  <span className="text-xs text-gray-500">
                    Due: {new Date(grant.deadline).toLocaleDateString()}
                  </span>
                </div>
                {grant.sge_alignment_score && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>SGE Fit</span>
                      <span>{Math.round(grant.sge_alignment_score)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-sg-primary h-1 rounded-full"
                        style={{ width: `${grant.sge_alignment_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Applications</h2>
            <button
              onClick={() => router.push('/sge/applications')}
              className="text-sg-primary hover:text-sg-primary-dark"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.active_applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.project_title || 'Untitled Project'}
                        </div>
                        <div className="text-sm text-gray-500">{application.media_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-sg-primary h-2 rounded-full"
                            style={{ width: `${application.completion_score || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{application.completion_score || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {application.success_probability ? formatPercentage(application.success_probability) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/sge/applications/${application.id}`)}
                        className="text-sg-primary hover:text-sg-primary-dark"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ML Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Next Grants to Apply */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 ML-Recommended Grants</h2>
            <div className="space-y-4">
              {dashboardData.ml_recommendations.next_grants_to_apply.slice(0, 3).map((grant) => (
                <div key={grant.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{grant.title}</h3>
                    <span className="text-2xl">{getMediaTypeIcon(grant.media_type || '')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{grant.organization}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(grant.amount)}</span>
                    <span className="text-xs text-gray-500">
                      Due: {new Date(grant.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/sge/grants/${grant.id}`)}
                    className="w-full bg-sg-primary text-white py-2 rounded-lg hover:bg-sg-primary-dark text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Applications to Optimize */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Applications to Optimize</h2>
            <div className="space-y-4">
              {dashboardData.ml_recommendations.applications_to_optimize.slice(0, 3).map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {application.project_title || 'Untitled Project'}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {application.completion_score || 0}% complete
                    </span>
                  </div>
                  {application.optimization_suggestions && application.optimization_suggestions.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Suggestions:</span> {application.optimization_suggestions[0]}
                    </div>
                  )}
                  <button
                    onClick={() => router.push(`/sge/applications/${application.id}`)}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 text-sm"
                  >
                    Optimize Application
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SGEDashboard;
