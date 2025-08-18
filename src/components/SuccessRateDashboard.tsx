import { useEffect, useState } from 'react';
import { SuccessAlert, SuccessMetric, successRateMonitor } from '../lib/success-rate-monitor';

interface SuccessRateDashboardProps {
  showDetails?: boolean;
  showAlerts?: boolean;
  autoRefresh?: boolean;
  compact?: boolean;
}

export default function SuccessRateDashboard({
  showDetails = true,
  showAlerts = true,
  autoRefresh = true,
  compact = false
}: SuccessRateDashboardProps) {
  const [metrics, setMetrics] = useState<SuccessMetric[]>([]);
  const [alerts, setAlerts] = useState<SuccessAlert[]>([]);
  const [overallSuccessRate, setOverallSuccessRate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load initial data
    loadSuccessData();

    // Set up event listeners
    const handleAssessmentComplete = (data: any) => {
      loadSuccessData();
      setLastUpdate(new Date());
    };

    const handleAlertCreated = (alert: SuccessAlert) => {
      setAlerts(prev => [...prev, alert]);
    };

    successRateMonitor.on('assessment-complete', handleAssessmentComplete);
    successRateMonitor.on('alert-created', handleAlertCreated);

    // Auto-refresh if enabled
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        loadSuccessData();
        setLastUpdate(new Date());
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadSuccessData = () => {
    setMetrics(successRateMonitor.getAllMetrics());
    setAlerts(successRateMonitor.getAllAlerts());
    setOverallSuccessRate(successRateMonitor.getOverallSuccessRate());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'backend': return '🔧';
      case 'api': return '🌐';
      case 'frontend': return '💻';
      case 'data': return '📊';
      case 'user': return '👥';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  const getOverallStatus = () => {
    if (overallSuccessRate >= 95) return 'excellent';
    if (overallSuccessRate >= 85) return 'good';
    if (overallSuccessRate >= 70) return 'warning';
    return 'critical';
  };

  const criticalMetrics = metrics.filter(m => m.status === 'critical');
  const warningMetrics = metrics.filter(m => m.status === 'warning');
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.resolved);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getOverallStatus())}`}>
            {getStatusIcon(getOverallStatus())} Success Rate Dashboard
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => successRateMonitor.startMonitoring()}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {isExpanded ? '📉 Hide Details' : '📊 Show Details'}
          </button>
        </div>
      </div>

      {/* Overall Success Rate */}
      <div className="mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {overallSuccessRate.toFixed(1)}%
          </div>
          <div className="text-lg text-gray-600 mb-4">Overall Success Rate</div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                overallSuccessRate >= 95 ? 'bg-green-500' :
                overallSuccessRate >= 85 ? 'bg-blue-500' :
                overallSuccessRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(overallSuccessRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Critical Issues Summary */}
      {(criticalMetrics.length > 0 || criticalAlerts.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-600 font-bold">🚨 CRITICAL ISSUES DETECTED</span>
          </div>
          <div className="text-red-700 text-sm space-y-1">
            {criticalMetrics.length > 0 && (
              <div>• {criticalMetrics.length} critical metrics below target</div>
            )}
            {criticalAlerts.length > 0 && (
              <div>• {criticalAlerts.length} critical alerts require attention</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.filter(m => m.status === 'excellent').length}
          </div>
          <div className="text-sm text-gray-600">Excellent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.filter(m => m.status === 'good').length}
          </div>
          <div className="text-sm text-gray-600">Good</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {warningMetrics.length}
          </div>
          <div className="text-sm text-gray-600">Warning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {criticalMetrics.length}
          </div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {/* Detailed Metrics */}
      {isExpanded && showDetails && (
        <div className="space-y-4">
          {/* Metrics by Category */}
          {['backend', 'api', 'data', 'system', 'user'].map(category => {
            const categoryMetrics = metrics.filter(m => m.category === category);
            if (categoryMetrics.length === 0) return null;

            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} Metrics
                </h3>
                <div className="space-y-3">
                  {categoryMetrics.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`w-3 h-3 rounded-full ${
                          metric.status === 'excellent' ? 'bg-green-500' :
                          metric.status === 'good' ? 'bg-blue-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-gray-500">{metric.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            metric.status === 'excellent' ? 'text-green-600' :
                            metric.status === 'good' ? 'text-blue-600' :
                            metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {metric.value.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTrendIcon(metric.trend)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Target: {metric.target}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Active Alerts */}
          {showAlerts && alerts.filter(a => !a.resolved).length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts</h3>
              <div className="space-y-2">
                {alerts.filter(a => !a.resolved).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${
                          alert.type === 'critical' ? 'text-red-700' :
                          alert.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                        }`}>
                          {alert.type.toUpperCase()}: {alert.message}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {alert.actionRequired && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Overall Status: {getOverallStatus().toUpperCase()}
          </div>
          <div>
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  );
}
