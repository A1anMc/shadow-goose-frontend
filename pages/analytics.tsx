import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getBranding } from '../src/lib/branding';
import { authService, User } from '../src/lib/auth';
import { DataSource, PredictiveModel, RealTimeMetric } from '../src/lib/analytics';
import { mockAnalyticsService } from '../src/lib/mockAnalytics';

export default function Analytics() {
  const router = useRouter();
  const branding = getBranding();
  const [user, setUser] = useState<User | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'sources' | 'metrics'>('overview');

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Load analytics data
    loadAnalyticsData();
  }, [router]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load all analytics data in parallel (using mock service for now)
      const [sourcesData, modelsData, metricsData] = await Promise.all([
        mockAnalyticsService.getDataSources(),
        mockAnalyticsService.getPredictiveModels(),
        mockAnalyticsService.getRealTimeMetrics(),
      ]);

      setDataSources(sourcesData);
      setPredictiveModels(modelsData);
      setRealTimeMetrics(metricsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'text-green-600 bg-green-100';
      case 'training':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading SGE Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-sg-primary">
                {branding.name} Analytics
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  New Project
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-sg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-sg-accent/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'models', label: 'Predictive Models' },
              { id: 'sources', label: 'Data Sources' },
              { id: 'metrics', label: 'Real-Time Metrics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'models' | 'sources' | 'metrics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-sg-primary text-sg-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
                <p className="text-3xl font-bold text-sg-primary">{dataSources.length}</p>
                <p className="text-sm text-gray-600">Active sources</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Predictive Models</h3>
                <p className="text-3xl font-bold text-sg-primary">{predictiveModels.length}</p>
                <p className="text-sm text-gray-600">Ready models</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Real-Time Metrics</h3>
                <p className="text-3xl font-bold text-sg-primary">{realTimeMetrics.length}</p>
                <p className="text-sm text-gray-600">Active metrics</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Average Accuracy</h3>
                <p className="text-3xl font-bold text-sg-primary">
                  {predictiveModels.length > 0
                    ? Math.round(
                        predictiveModels.reduce((acc, model) => acc + model.accuracy, 0) /
                          predictiveModels.length
                      )
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Model performance</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dataSources.slice(0, 3).map((source) => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{source.name}</p>
                        <p className="text-sm text-gray-600">Last sync: {new Date(source.lastSync).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                        {source.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Predictive Models</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Metric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Trained
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictiveModels.map((model) => (
                      <tr key={model.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{model.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{model.targetMetric}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{model.accuracy}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                            {model.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(model.lastTrained).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refresh Interval
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Sync
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dataSources.map((source) => (
                      <tr key={source.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{source.name}</div>
                          {source.url && (
                            <div className="text-sm text-gray-500">{source.url}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{source.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{source.refreshInterval} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status)}`}>
                            {source.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(source.lastSync).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Real-Time Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realTimeMetrics.map((metric) => (
                <div key={metric.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                    <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-sg-primary">
                      {metric.value} {metric.unit}
                    </p>
                    <p className={`text-sm ${metric.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent}% from last period
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(metric.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
