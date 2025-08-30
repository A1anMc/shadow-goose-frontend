import { useEffect, useState } from "react";
import { getBranding } from "../../src/lib/branding";
import { getGrantsService } from "../../src/lib/services/grants-service";
import { successMetricsTracker } from "../../src/lib/success-metrics";

import { logger } from '../../src/lib/logger';
import {
    Grant,
    GrantApplication,
} from "../../src/lib/types/grants";

export default function GrantSuccessMetrics() {
  const branding = getBranding();

  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');
  const [metrics, setMetrics] = useState(successMetricsTracker.getMetrics());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const [applicationsData, grantsData] = await Promise.all([
        grantsService.getApplications(),
        grantsService.getGrantsWithSource(),
      ]);
      setApplications(applicationsData);
      setGrants(grantsData.data);
    } catch (error) {
      logger.error("Error loading success metrics data:", error);
      setError('Failed to load success metrics data');
    } finally {
      setLoading(false);
    }
  };

  const loadGrantsData = async () => {
    try {
      setLoading(true);
      const grantsService = getGrantsService();
      const grantsData = await grantsService.getGrantsWithSource();
      setGrants(grantsData.data);
    } catch (error) {
      logger.error('Error loading grants:', error);
      setError('Failed to load grants data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getFilteredData = () => {
    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return { applications, grants };
    }

    const filteredApplications = applications.filter(app =>
      new Date(app.created_at) >= filterDate
    );

    const applicationGrantIds = new Set(filteredApplications.map(app => app.grant_id));
    const filteredGrants = grants.filter(grant => applicationGrantIds.has(typeof grant.id === 'string' ? parseInt(grant.id) : grant.id));

    return { applications: filteredApplications, grants: filteredGrants };
  };

  const { applications: filteredApplications, grants: filteredGrants } = getFilteredData();

  const calculateSuccessMetrics = () => {
    const totalApplications = filteredApplications.length;
    const submittedApplications = filteredApplications.filter(app => app.status === 'submitted').length;
    const approvedApplications = filteredApplications.filter(app => app.status === 'approved').length;
    const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected').length;

    const totalFunding = filteredApplications
      .filter(app => app.status === 'approved')
      .reduce((total, app) => {
        const grant = filteredGrants.find(g => g.id === app.grant_id);
        return total + (grant?.amount || 0);
      }, 0);

    const successRate = submittedApplications > 0 ? (approvedApplications / submittedApplications) * 100 : 0;
    const conversionRate = totalApplications > 0 ? (submittedApplications / totalApplications) * 100 : 0;

    // Calculate average application time
    const completedApplications = filteredApplications.filter(app =>
      app.status === 'submitted' || app.status === 'approved' || app.status === 'rejected'
    );

    let averageApplicationTime = 0;
    if (completedApplications.length > 0) {
      const totalDays = completedApplications.reduce((total, app) => {
        const created = new Date(app.created_at);
        const updated = new Date(app.updated_at);
        const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return total + days;
      }, 0);
      averageApplicationTime = Math.round(totalDays / completedApplications.length);
    }

    // Category performance
    const categoryPerformance = new Map<string, { count: number; approved: number; funding: number }>();

    filteredApplications.forEach(app => {
      const grant = filteredGrants.find(g => g.id === app.grant_id);
      if (grant) {
        const current = categoryPerformance.get(grant.category) || { count: 0, approved: 0, funding: 0 };
        current.count++;
        if (app.status === 'approved') {
          current.approved++;
          current.funding += grant.amount || 0;
        }
        categoryPerformance.set(grant.category, current);
      }
    });

    return {
      totalApplications,
      submittedApplications,
      approvedApplications,
      rejectedApplications,
      totalFunding,
      successRate,
      conversionRate,
      averageApplicationTime,
      categoryPerformance: Array.from(categoryPerformance.entries()).map(([category, data]) => ({
        category,
        ...data,
        successRate: data.count > 0 ? (data.approved / data.count) * 100 : 0
      })).sort((a, b) => b.successRate - a.successRate)
    };
  };

  const getRecommendations = (metrics: ReturnType<typeof calculateSuccessMetrics>) => {
    const recommendations: Array<{
      type: 'success' | 'warning' | 'info';
      title: string;
      message: string;
      action: string;
    }> = [];

    if (metrics.successRate < 50) {
      recommendations.push({
        type: 'warning',
        title: 'Low Success Rate',
        message: 'Your success rate is below average. Consider improving your application quality.',
        action: 'Review rejected applications for common patterns'
      });
    }

    if (metrics.conversionRate < 70) {
      recommendations.push({
        type: 'info',
        title: 'Low Conversion Rate',
        message: 'Many applications are started but not submitted. Focus on completion.',
        action: 'Set up deadline reminders and simplify the application process'
      });
    }

    if (metrics.averageApplicationTime > 14) {
      recommendations.push({
        type: 'warning',
        title: 'Long Application Time',
        message: 'Applications are taking too long to complete. This may reduce success.',
        action: 'Use AI writing assistant to speed up the process'
      });
    }

    const bestCategory = metrics.categoryPerformance[0];
    if (bestCategory && bestCategory.successRate > 80) {
      recommendations.push({
        type: 'success',
        title: 'High-Performing Category',
        message: `${bestCategory.category} grants have a ${bestCategory.successRate.toFixed(1)}% success rate.`,
        action: 'Focus more applications in this category'
      });
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading success metrics...</p>
        </div>
      </div>
    );
  }

  const successMetrics = calculateSuccessMetrics();
  const recommendations = getRecommendations(successMetrics);

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Grant Success Metrics
              </h1>
              <p className="text-gray-600 mt-1">
                Track your grant application performance and optimize for success
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sg-primary"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successMetrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successMetrics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(successMetrics.totalFunding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">{successMetrics.averageApplicationTime} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Funnel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Funnel</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Applications Started</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {successMetrics.totalApplications}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Applications Submitted</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${successMetrics.totalApplications > 0 ? (successMetrics.submittedApplications / successMetrics.totalApplications) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {successMetrics.submittedApplications}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Applications Approved</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${successMetrics.submittedApplications > 0 ? (successMetrics.approvedApplications / successMetrics.submittedApplications) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {successMetrics.approvedApplications}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-4">
              {successMetrics.categoryPerformance.slice(0, 5).map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {category.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {category.count} apps
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {category.successRate.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium text-sg-primary">
                      {formatCurrency(category.funding)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                rec.type === 'success' ? 'bg-green-50 border-green-400' :
                rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                <p className="text-sm font-medium text-sg-primary">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SGE Success Metrics Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SGE Platform Success Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.grants_discovered}</div>
              <div className="text-blue-700 text-sm">Grants Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.applications_started}</div>
              <div className="text-green-700 text-sm">Applications Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(metrics.funding_secured || metrics.total_funding_secured || 0)}
              </div>
              <div className="text-purple-700 text-sm">Funding Secured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.time_saved_hours || 0}h</div>
              <div className="text-orange-700 text-sm">Time Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
