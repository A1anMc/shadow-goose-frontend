import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { analyticsService, RealTimeMetric } from "../src/lib/analytics";
import { authService, User } from "../src/lib/auth";
import { getBranding } from "../src/lib/branding";


import { logger } from '../src/lib/logger';
export default function InstantAnalytics() {
  const router = useRouter();
  const branding = getBranding();
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<RealTimeMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1h" | "24h" | "7d" | "30d"
  >("24h");

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return undefined;
    }
    setUser(currentUser);

    // Load instant analytics data
    loadInstantAnalytics();

    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(loadInstantAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [router, autoRefresh, selectedTimeframe]);

  const loadInstantAnalytics = async () => {
    try {
      setLoading(true);
      const metricsData = await analyticsService.getRealTimeMetrics();
      setMetrics(metricsData);
    } catch (error) {
      logger.error("Error loading instant analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      default:
        return "→";
    }
  };

  const getTrendColor = (trend: string, changePercent: number) => {
    if (trend === "up" && changePercent > 0) return "text-green-600";
    if (trend === "down" && changePercent < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getMetricStatus = (metric: RealTimeMetric) => {
    // Use conversion_rate as the change indicator
    const change = metric.conversion_rate * 100;

    if (change > 5) return "excellent";
    if (change > 0) return "good";
    if (change > -5) return "stable";
    return "needs-attention";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "stable":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "needs-attention":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading && metrics === null) {
    return (
      <div className="min-h-screen bg-sg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sg-primary mx-auto"></div>
          <p className="mt-4 text-sg-primary">Loading Instant Analytics...</p>
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
                {branding.name} Instant Analytics
              </h1>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${autoRefresh ? "bg-green-500" : "bg-gray-400"}`}
                ></span>
                <span className="text-sm text-gray-600">
                  {autoRefresh ? "Live Updates" : "Manual Refresh"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => router.push("/impact-analytics")}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Impact Analytics
                </button>
              </nav>
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
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) =>
                setSelectedTimeframe(
                  e.target.value as "1h" | "24h" | "7d" | "30d",
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sg-primary focus:border-sg-primary"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                autoRefresh
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
            </button>
            <button
              onClick={loadInstantAnalytics}
              className="px-4 py-2 bg-sg-primary text-white rounded-md text-sm hover:bg-sg-primary/90 transition-colors"
            >
              Refresh Now
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Instant Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Active Users</h3>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    {metrics.active_users.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-75">
                    Current active users
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Page Views</h3>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    {metrics.page_views.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-75">
                    Total page views
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Conversion Rate</h3>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    {(metrics.conversion_rate * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm opacity-75">
                    Success rate
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Avg Session</h3>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    {Math.round(metrics.average_session_duration / 60)}m
                  </p>
                  <p className="text-sm opacity-75">
                    Average session duration
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Real-Time Activity Feed */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Real-Time Activity Feed
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {metrics && (
                <>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Active Users</p>
                      <p className="text-sm text-gray-600">
                        {metrics.active_users.toLocaleString()} users
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Page Views</p>
                      <p className="text-sm text-gray-600">
                        {metrics.page_views.toLocaleString()} views
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Conversion Rate</p>
                      <p className="text-sm text-gray-600">
                        {(metrics.conversion_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Avg Session</p>
                      <p className="text-sm text-gray-600">
                        {Math.round(metrics.average_session_duration / 60)}m
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/projects/new")}
            className="p-6 bg-gradient-to-r from-sg-primary to-sg-accent text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
            <p className="text-sm opacity-90">
              Start tracking a new SGE initiative
            </p>
          </button>

          <button
            onClick={() => router.push("/impact-analytics")}
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Impact Analysis</h3>
            <p className="text-sm opacity-90">Deep dive into impact metrics</p>
          </button>

          <button
            onClick={() => router.push("/analytics")}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Full Analytics</h3>
            <p className="text-sm opacity-90">
              Comprehensive analytics dashboard
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
