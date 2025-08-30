import { useEffect, useState } from "react";
import { getBranding } from "../../src/lib/branding";
import { getGrantsService } from "../../src/lib/services/grants-service";
import { successMetricsTracker } from "../../src/lib/success-metrics";
import {
    Grant,
    GrantApplication,
} from "../../src/lib/types/grants";

export default function GrantsAnalytics() {
  const _branding = getBranding();

  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d');
  const [successMetrics, setSuccessMetrics] = useState(successMetricsTracker.getMetrics());

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
      console.error("Error loading analytics data:", error);
      setError('Failed to load analytics data');
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
      console.error('Error loading grants:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      in_progress: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
    };

    filteredApplications.forEach(app => {
      counts[app.status as keyof typeof counts]++;
    });

    return counts;
  };

  const getCategoryBreakdown = () => {
    const categoryMap = new Map<string, { count: number; totalAmount: number }>();

    filteredApplications.forEach(app => {
      const grant = filteredGrants.find(g => g.id === app.grant_id);
      if (grant) {
        const current = categoryMap.get(grant.category) || { count: 0, totalAmount: 0 };
        categoryMap.set(grant.category, {
          count: current.count + 1,
          totalAmount: current.totalAmount + (grant.amount || 0)
        });
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const getSuccessRate = () => {
    const submitted = filteredApplications.filter(app => app.status === 'submitted').length;
    const approved = filteredApplications.filter(app => app.status === 'approved').length;
    const rejected = filteredApplications.filter(app => app.status === 'rejected').length;

    const totalDecided = approved + rejected;
    return totalDecided > 0 ? (approved / totalDecided) * 100 : 0;
  };

  const getTotalFunding = () => {
    return filteredApplications
      .filter(app => app.status === 'approved')
      .reduce((total, app) => {
        const grant = filteredGrants.find(g => g.id === app.grant_id);
        return total + (grant?.amount || 0);
      }, 0);
  };

  const getAverageApplicationTime = () => {
    const completedApplications = filteredApplications.filter(app =>
      app.status === 'submitted' || app.status === 'approved' || app.status === 'rejected'
    );

    if (completedApplications.length === 0) return 0;

    const totalDays = completedApplications.reduce((total, app) => {
      const created = new Date(app.created_at);
      const updated = new Date(app.updated_at);
      const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);

    return Math.round(totalDays / completedApplications.length);
  };

  const getMonthlyTrends = () => {
    const monthlyData = new Map<string, { applications: number; approvals: number; funding: number }>();

    filteredApplications.forEach(app => {
      const date = new Date(app.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const current = monthlyData.get(monthKey) || { applications: 0, approvals: 0, funding: 0 };
      current.applications++;

      if (app.status === 'approved') {
        current.approvals++;
        const grant = filteredGrants.find(g => g.id === app.grant_id);
        current.funding += grant?.amount || 0;
      }

      monthlyData.set(monthKey, current);
    });

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const categoryBreakdown = getCategoryBreakdown();
  const successRate = getSuccessRate();
  const totalFunding = getTotalFunding();
  const averageApplicationTime = getAverageApplicationTime();
  const monthlyTrends = getMonthlyTrends();

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Grant Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Track your grant application performance and success metrics
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{filteredApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFunding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Application Time</p>
                <p className="text-2xl font-bold text-gray-900">{averageApplicationTime} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Status Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-sg-primary h-2 rounded-full"
                        style={{
                          width: `${filteredApplications.length > 0 ? (count / filteredApplications.length) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-4">
              {categoryBreakdown.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {item.count} applications
                    </span>
                    <span className="text-sm font-medium text-sg-primary">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyTrends.map(([month, data]) => (
              <div key={month} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {new Date(month + '-01').toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-medium">{data.applications}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Approvals:</span>
                    <span className="font-medium text-green-600">{data.approvals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Funding:</span>
                    <span className="font-medium text-sg-primary">{formatCurrency(data.funding)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SGE Success Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successMetrics.grants_discovered}</div>
              <div className="text-blue-700 text-sm">Grants Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successMetrics.applications_started}</div>
              <div className="text-green-700 text-sm">Applications Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(successMetrics.funding_secured || successMetrics.total_funding_secured || 0)}
              </div>
              <div className="text-purple-700 text-sm">Funding Secured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{successMetrics.time_saved_hours || 0}h</div>
              <div className="text-orange-700 text-sm">Time Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
