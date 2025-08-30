import { useEffect, useState } from 'react';
import { liveDataMonitor } from '../lib/live-data-monitor';
import { DataValidationResult, liveDataValidator } from '../lib/live-data-validator';


import { logger } from '../lib/logger';
interface LiveDataStatusProps {
  showDetails?: boolean;
  showAlerts?: boolean;
  autoRefresh?: boolean;
}

export default function LiveDataStatus({
  showDetails = true,
  showAlerts = true,
  autoRefresh = true
}: LiveDataStatusProps) {
  const [healthSummary, setHealthSummary] = useState(liveDataMonitor.getHealthSummary());
  const [validationResult, setValidationResult] = useState<DataValidationResult | null>(null);
  const [activeAlerts, setActiveAlerts] = useState(liveDataMonitor.getActiveAlerts());
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Listen for health check updates
    const handleHealthUpdate = (data: any) => {
      setHealthSummary(liveDataMonitor.getHealthSummary());
      setLastUpdate(new Date());
    };

    // Listen for validation updates
    const handleValidationUpdate = () => {
      setValidationResult(liveDataValidator.getLastValidation());
    };

    // Listen for alert updates
    const handleAlertUpdate = () => {
      setActiveAlerts(liveDataMonitor.getActiveAlerts());
    };

    // Listen for critical alerts
    const handleCriticalAlert = (alert: any) => {
      logger.error('🚨 CRITICAL ALERT:', alert);
      // Show critical alert to user
      showCriticalAlert(alert);
    };

    // Listen for fallback blocking
    const handleFallbackBlocked = (data: any) => {
      logger.error('🚨 FALLBACK BLOCKED:', data);
      showFallbackBlockedAlert(data);
    };

    // Set up event listeners
    liveDataMonitor.on('health-check-complete', handleHealthUpdate);
    liveDataMonitor.on('system-health-update', handleHealthUpdate);
    liveDataMonitor.on('alert-created', handleAlertUpdate);
    liveDataMonitor.on('critical-alert', handleCriticalAlert);

    liveDataValidator.on('fallback-blocked', handleFallbackBlocked);
    liveDataValidator.on('live-data-refreshed', handleValidationUpdate);

    // Initial load
    setHealthSummary(liveDataMonitor.getHealthSummary());
    setValidationResult(liveDataValidator.getLastValidation());
    setActiveAlerts(liveDataMonitor.getActiveAlerts());

    // Auto-refresh if enabled
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        setHealthSummary(liveDataMonitor.getHealthSummary());
        setValidationResult(liveDataValidator.getLastValidation());
        setActiveAlerts(liveDataMonitor.getActiveAlerts());
        setLastUpdate(new Date());
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

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
      case 'unhealthy': return '🚨';
      default: return '❓';
    }
  };

  const showCriticalAlert = (alert: any) => {
    // Create a modal or notification for critical alerts
    const message = `🚨 CRITICAL: ${alert.message}`;
    alert(message); // Simple alert for now, could be replaced with a proper modal

    // Log to console for debugging
    logger.error('Critical Alert Details:', alert);
  };

  const showFallbackBlockedAlert = (data: any) => {
    const message = `🚨 FALLBACK BLOCKED: System attempted to use fallback data. Live data required.`;
    alert(message);

    logger.error('Fallback Blocked Details:', data);
  };

  const handleRefresh = () => {
    // Force refresh of all data sources
    liveDataMonitor.startMonitoring();
    setLastUpdate(new Date());
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthSummary.overallStatus)}`}>
            {getStatusIcon(healthSummary.overallStatus)} Live Data Status
          </div>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExpand}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {isExpanded ? '📉 Hide Details' : '📊 Show Details'}
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{healthSummary.healthySources}</div>
          <div className="text-sm text-gray-600">Healthy Sources</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{healthSummary.totalSources}</div>
          <div className="text-sm text-gray-600">Total Sources</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{healthSummary.criticalAlerts}</div>
          <div className="text-sm text-gray-600">Critical Alerts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {validationResult?.isLiveData ? '✅' : '❌'}
          </div>
          <div className="text-sm text-gray-600">Live Data</div>
        </div>
      </div>

      {/* Critical Status */}
      {healthSummary.criticalAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-600 font-bold">🚨 CRITICAL ISSUES DETECTED</span>
          </div>
          <p className="text-red-700 text-sm">
            {healthSummary.criticalAlerts} critical alert(s) require immediate attention.
            System may be using fallback data.
          </p>
        </div>
      )}

      {/* Live Data Validation */}
      {validationResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-600 font-bold">Live Data Validation</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              validationResult.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {validationResult.isValid ? 'VALID' : 'INVALID'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Data Source:</span> {validationResult.dataSource}
            </div>
            <div>
              <span className="font-medium">Quality Score:</span> {validationResult.quality}%
            </div>
            <div>
              <span className="font-medium">Live Data:</span>
              <span className={validationResult.isLiveData ? 'text-green-600' : 'text-red-600'}>
                {validationResult.isLiveData ? ' Yes' : ' No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {validationResult.lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="mt-3">
              <div className="font-medium text-red-600 mb-1">Errors:</div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="mt-3">
              <div className="font-medium text-yellow-600 mb-1">Warnings:</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed View */}
      {isExpanded && showDetails && (
        <div className="space-y-4">
          {/* Data Sources Health */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Sources Health</h3>
            <div className="space-y-2">
              {Array.from(liveDataMonitor.healthStatus.entries()).map(([source, health]) => (
                <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${
                      health.status === 'healthy' ? 'bg-green-500' :
                      health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <div>
                      <div className="font-medium">{health.name}</div>
                      <div className="text-sm text-gray-500">
                        {health.isPrimary ? 'Primary' : 'Backup'} • {health.responseTime}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      health.status === 'healthy' ? 'text-green-600' :
                      health.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {health.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {health.successRate}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          {showAlerts && activeAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Alerts</h3>
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
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
                          {alert.type.toUpperCase()}: {alert.source}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
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
            System Status: {healthSummary.overallStatus.toUpperCase()}
          </div>
          <div>
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  );
}
