export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
  performance: PerformanceMetrics;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  requestsPerMinute: number;
}

export interface MonitoringConfig {
  checkInterval: number; // milliseconds
  alertThreshold: number; // error rate percentage
  performanceThreshold: number; // response time threshold
  enableAlerts: boolean;
}

class HealthMonitor {
  private config: MonitoringConfig;
  private checks: Map<string, HealthCheck> = new Map();
  private performanceData: PerformanceMetrics[] = [];
  private startTime: number = Date.now();
  private isMonitoring: boolean = false;

  constructor(config: MonitoringConfig = {
    checkInterval: 30000, // 30 seconds
    alertThreshold: 5, // 5% error rate
    performanceThreshold: 2000, // 2 seconds
    enableAlerts: true
  }) {
    this.config = config;
  }

  // Start monitoring
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.scheduleHealthChecks();
    this.log('info', 'Health monitoring started', { config: this.config });
  }

  // Stop monitoring
  stop(): void {
    this.isMonitoring = false;
    this.log('info', 'Health monitoring stopped');
  }

  // Add a health check
  addHealthCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, {
      name,
      status: 'pass',
      lastChecked: new Date().toISOString()
    });

    // Schedule the check
    setInterval(async () => {
      if (!this.isMonitoring) return;
      
      const startTime = Date.now();
      try {
        const result = await checkFn();
        const responseTime = Date.now() - startTime;
        
        this.checks.set(name, {
          name,
          status: result ? 'pass' : 'fail',
          responseTime,
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        this.checks.set(name, {
          name,
          status: 'fail',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
          lastChecked: new Date().toISOString()
        });
      }
    }, this.config.checkInterval);
  }

  // Get current health status
  getHealthStatus(): HealthStatus {
    const checks = Array.from(this.checks.values());
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warn');
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (failedChecks.length > 0) {
      status = 'unhealthy';
    } else if (warningChecks.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks,
      performance: this.getPerformanceMetrics()
    };
  }

  // Record performance metrics
  recordPerformance(metrics: Partial<PerformanceMetrics>): void {
    const currentMetrics: PerformanceMetrics = {
      memoryUsage: metrics.memoryUsage || this.getMemoryUsage(),
      cpuUsage: metrics.cpuUsage || 0,
      responseTime: metrics.responseTime || { average: 0, p95: 0, p99: 0 },
      errorRate: metrics.errorRate || 0,
      requestsPerMinute: metrics.requestsPerMinute || 0
    };

    this.performanceData.push(currentMetrics);
    
    // Keep only last 100 data points
    if (this.performanceData.length > 100) {
      this.performanceData.shift();
    }

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkAlerts(currentMetrics);
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    if (this.performanceData.length === 0) {
      return {
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: 0,
        responseTime: { average: 0, p95: 0, p99: 0 },
        errorRate: 0,
        requestsPerMinute: 0
      };
    }

    const latest = this.performanceData[this.performanceData.length - 1];
    return latest;
  }

  // Get memory usage
  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const used = memUsage.heapUsed;
      const total = memUsage.heapTotal;
      return {
        used,
        total,
        percentage: (used / total) * 100
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }

  // Schedule health checks
  private scheduleHealthChecks(): void {
    setInterval(() => {
      if (!this.isMonitoring) return;
      
      // Record basic performance metrics
      this.recordPerformance({
        memoryUsage: this.getMemoryUsage()
      });
    }, this.config.checkInterval);
  }

  // Check for alerts
  private checkAlerts(metrics: PerformanceMetrics): void {
    if (metrics.errorRate > this.config.alertThreshold) {
      this.log('warn', 'High error rate detected', { 
        errorRate: metrics.errorRate, 
        threshold: this.config.alertThreshold 
      });
    }

    if (metrics.responseTime.average > this.config.performanceThreshold) {
      this.log('warn', 'High response time detected', { 
        responseTime: metrics.responseTime.average, 
        threshold: this.config.performanceThreshold 
      });
    }

    if (metrics.memoryUsage.percentage > 80) {
      this.log('warn', 'High memory usage detected', { 
        memoryUsage: metrics.memoryUsage.percentage 
      });
    }
  }

  // Logging
  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      service: 'health-monitor'
    };

    // Use structured logging for monitoring system
    if (level === 'error') {
      // Keep console.error for critical monitoring issues
      console.error('Health Monitor Error:', logEntry);
    } else if (level === 'warn') {
      // Keep console.warn for monitoring warnings
      console.warn('Health Monitor Warning:', logEntry);
    } else {
      // Keep console.log for monitoring info
      console.log('Health Monitor Info:', logEntry);
    }
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();

// Default health checks
export const defaultHealthChecks = {
  // Database connectivity check
  database: async (): Promise<boolean> => {
    try {
      // This would check database connectivity
      // For now, return true as placeholder
      return true;
    } catch (error) {
      return false;
    }
  },

  // API health check
  api: async (): Promise<boolean> => {
    try {
      // This would check API endpoints
      // For now, return true as placeholder
      return true;
    } catch (error) {
      return false;
    }
  },

  // External services check
  externalServices: async (): Promise<boolean> => {
    try {
      // This would check external API dependencies
      // For now, return true as placeholder
      return true;
    } catch (error) {
      return false;
    }
  }
};
