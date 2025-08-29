import React, { useEffect, useState } from 'react';
import { HealthStatus } from '../lib/monitoring/health-monitor';

interface MonitoringDashboardProps {
  refreshInterval?: number; // milliseconds
  showAlerts?: boolean;
  showPerformance?: boolean;
}

export default function MonitoringDashboard({ 
  refreshInterval = 30000, 
  showAlerts = true, 
  showPerformance = true 
}: MonitoringDashboardProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      // Keep console.error for monitoring errors
      console.error('Health status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading && !healthStatus) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </p>
        </div>
        <button
          onClick={fetchHealthStatus}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {healthStatus && (
        <>
          {/* Overall Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor(healthStatus.status)}`}>
              <span className="mr-2">{getStatusIcon(healthStatus.status)}</span>
              <span className="font-semibold capitalize">{healthStatus.status}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span>Uptime: {formatUptime(healthStatus.uptime)}</span>
              <span className="mx-2">•</span>
              <span>Version: {healthStatus.version}</span>
            </div>
          </div>

          {/* Health Checks */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Checks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthStatus.checks.map((check) => (
                <div key={check.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{check.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      check.status === 'pass' ? 'bg-green-100 text-green-800' :
                      check.status === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  {check.responseTime && (
                    <div className="text-sm text-gray-500 mt-1">
                      Response: {check.responseTime}ms
                    </div>
                  )}
                  {check.error && (
                    <div className="text-sm text-red-600 mt-1">
                      Error: {check.error}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Last checked: {new Date(check.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          {showPerformance && healthStatus.performance && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Memory Usage</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(healthStatus.performance.memoryUsage.percentage)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatBytes(healthStatus.performance.memoryUsage.used)} / {formatBytes(healthStatus.performance.memoryUsage.total)}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">CPU Usage</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(healthStatus.performance.cpuUsage)}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Avg Response Time</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {healthStatus.performance.responseTime.average.toFixed(0)}ms
                  </div>
                  <div className="text-xs text-gray-400">
                    P95: {healthStatus.performance.responseTime.p95.toFixed(0)}ms
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-500">Error Rate</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPercentage(healthStatus.performance.errorRate)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {healthStatus.performance.requestsPerMinute} req/min
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {showAlerts && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Alerts</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  No active alerts at this time.
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Alerts will appear here when performance thresholds are exceeded.
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
