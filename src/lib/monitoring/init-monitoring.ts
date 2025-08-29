import { healthMonitor, defaultHealthChecks } from './health-monitor';

export function initializeMonitoring() {
  // Start the health monitor
  healthMonitor.start();

  // Add default health checks
  healthMonitor.addHealthCheck('database', defaultHealthChecks.database);
  healthMonitor.addHealthCheck('api', defaultHealthChecks.api);
  healthMonitor.addHealthCheck('external-services', defaultHealthChecks.externalServices);

  // Add custom health checks for our application
  healthMonitor.addHealthCheck('grant-discovery-engine', async () => {
    try {
      // Check if grant discovery engine is working
      // This is a placeholder - in a real implementation, you'd check actual functionality
      return true;
    } catch (_error) {
      return false;
    }
  });

  healthMonitor.addHealthCheck('authentication-service', async () => {
    try {
      // Check if authentication service is working
      // This is a placeholder - in a real implementation, you'd check actual functionality
      return true;
    } catch (_error) {
      return false;
    }
  });

  healthMonitor.addHealthCheck('analytics-service', async () => {
    try {
      // Check if analytics service is working
      // This is a placeholder - in a real implementation, you'd check actual functionality
      return true;
    } catch (_error) {
      return false;
    }
  });

  // Keep console.log for monitoring initialization
  console.log('✅ Monitoring system initialized successfully');
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  // Only initialize on the server side
  if (typeof window === 'undefined') {
    initializeMonitoring();
  }
}
