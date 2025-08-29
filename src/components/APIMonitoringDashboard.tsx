// API MONITORING DASHBOARD
// Real-time monitoring and health status for all APIs
// Displays fallback usage and system performance metrics

import React, { useState, useEffect } from 'react';
import { apiMonitor } from '../lib/api-monitor';
import { fallbackAPI } from '../lib/fallback-api';
import { logger } from '../lib/logger';

interface APIHealthStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: string;
  error?: string;
  dataQuality: number;
  fallbackUsed: boolean;
}

interface FallbackDataStatus {
  lastSync: number;
  dataAge: number;
  isFresh: boolean;
  nextRefresh: number;
  cacheStats: {
    size: number;
    entries: string[];
    totalSize: number;
  };
}

const APIMonitoringDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<Map<string, APIHealthStatus>>(new Map());
  const [fallbackStatus, setFallbackStatus] = useState<FallbackDataStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Start monitoring on component mount
    if (!apiMonitor.isMonitoring()) {
      apiMonitor.startMonitoring();
      setIsMonitoring(true);
    }

    // Set up auto-refresh
    const refreshInterval = setInterval(() => {
      if (autoRefresh) {
        updateDashboard();
      }
    }, 10000); // Refresh every 10 seconds

    // Initial update
    updateDashboard();

    return () => {
      clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const updateDashboard = () => {
    try {
      // Get API health status
      const health = apiMonitor.getHealthStatus();
      setHealthStatus(health);

      // Get fallback API status
      const fallbackData = fallbackAPI.getDataFreshness();
      const cacheStats = fallbackAPI.getCacheStats();
      setFallbackStatus({
        ...fallbackData,
        cacheStats
      });

      setLastUpdate(new Date());
    } catch (error) {
      logger.error('Failed to update dashboard', 'updateDashboard', error as Error);
    }
  };

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

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDataAge = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.floor(ms / 1000)}s`;
  };

  const getHealthSummary = () => {
    let healthy = 0, degraded = 0, unhealthy = 0, unknown = 0;

    healthStatus.forEach(status => {
      switch (status.status) {
        case 'healthy': healthy++; break;
        case 'degraded': degraded++; break;
        case 'unhealthy': unhealthy++; break;
        default: unknown++; break;
      }
    });

    return { healthy, degraded, unhealthy, unknown };
  };

  const summary = getHealthSummary();
  const totalEndpoints = healthStatus.size;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">API Monitoring Dashboard</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          <button
            onClick={updateDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.healthy}</div>
          <div className="text-sm text-green-700">Healthy</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{summary.degraded}</div>
          <div className="text-sm text-yellow-700">Degraded</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{summary.unhealthy}</div>
          <div className="text-sm text-red-700">Unhealthy</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{totalEndpoints}</div>
          <div className="text-sm text-gray-700">Total Endpoints</div>
        </div>
      </div>

      {/* API Health Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">API Health Status</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Quality</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallback Used</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(healthStatus.values()).map((status, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{status.endpoint}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)} {status.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatResponseTime(status.responseTime)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${status.dataQuality}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{status.dataQuality}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(status.lastCheck).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {status.fallbackUsed ? (
                      <span className="text-yellow-600">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fallback API Status */}
      {fallbackStatus && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fallback API Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-700">Data Freshness</div>
              <div className="text-lg font-bold text-blue-900">
                {fallbackStatus.isFresh ? 'Fresh' : 'Stale'}
              </div>
              <div className="text-xs text-blue-600">
                Age: {formatDataAge(fallbackStatus.dataAge)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-700">Cache Status</div>
              <div className="text-lg font-bold text-purple-900">
                {fallbackStatus.cacheStats.size} entries
              </div>
              <div className="text-xs text-purple-600">
                Size: {(fallbackStatus.cacheStats.totalSize / 1024).toFixed(1)}KB
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-600">
              <strong>Last Sync:</strong> {new Date(fallbackStatus.lastSync).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Next Refresh:</strong> {new Date(fallbackStatus.nextRefresh).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Monitoring Status:</span>
            <span className={`ml-2 ${isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Update:</span>
            <span className="ml-2 text-gray-600">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Auto-refresh:</span>
            <span className={`ml-2 ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}>
              {autoRefresh ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Endpoints:</span>
            <span className="ml-2 text-gray-600">{totalEndpoints}</span>
          </div>
        </div>
      </div>

      {/* Error Details */}
      {Array.from(healthStatus.values()).some(status => status.error) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Error Details</h3>
          <div className="space-y-2">
            {Array.from(healthStatus.values())
              .filter(status => status.error)
              .map((status, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-sm font-medium text-red-800">{status.endpoint}</div>
                  <div className="text-xs text-red-600">{status.error}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default APIMonitoringDashboard;
