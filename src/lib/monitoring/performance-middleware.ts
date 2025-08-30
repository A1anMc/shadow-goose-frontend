import { NextApiRequest, NextApiResponse } from 'next';
import { healthMonitor } from './health-monitor';


import { logger } from '../logger';
export interface PerformanceData {
  path: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  error?: string;
}

class PerformanceMiddleware {
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];
  private lastMinute: number = Date.now();

  // Middleware function
  middleware(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    const self = this;
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const startTime = Date.now();
      const originalSend = res.send;
      const originalJson = res.json;
      const originalStatus = res.status;

      let statusCode = 200;
      let error: string | undefined;

      // Override status method to capture status code
      res.status = function(code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
      };

      // Override send method to capture response
      res.send = function(body: any) {
        const responseTime = Date.now() - startTime;
        self.recordRequest(req, responseTime, statusCode, error);
        return originalSend.call(this, body);
      };

      // Override json method to capture response
      res.json = function(body: any) {
        const responseTime = Date.now() - startTime;
        self.recordRequest(req, responseTime, statusCode, error);
        return originalJson.call(this, body);
      };

      try {
        await handler(req, res);
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        const responseTime = Date.now() - startTime;
        self.recordRequest(req, responseTime, 500, error);
        throw err;
      }
    };
  }

  // Record request performance data
  private recordRequest(req: NextApiRequest, responseTime: number, statusCode: number, error?: string): void {
    const now = Date.now();
    
    // Reset counters every minute
    if (now - this.lastMinute > 60000) {
      this.requestCount = 0;
      this.errorCount = 0;
      this.responseTimes = [];
      this.lastMinute = now;
    }

    // Update counters
    this.requestCount++;
    if (statusCode >= 400 || error) {
      this.errorCount++;
    }

    // Record response time
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    // Calculate metrics
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    const p95 = this.calculatePercentile(this.responseTimes, 95);
    const p99 = this.calculatePercentile(this.responseTimes, 99);

    // Record performance metrics
    healthMonitor.recordPerformance({
      responseTime: {
        average: avgResponseTime,
        p95,
        p99
      },
      errorRate,
      requestsPerMinute: this.requestCount
    });

    // Log performance data
    const performanceData: PerformanceData = {
      path: req.url || '',
      method: req.method || 'GET',
      responseTime,
      statusCode,
      timestamp: new Date().toISOString(),
      error
    };

    // Log slow requests or errors
    if (responseTime > 2000 || statusCode >= 400 || error) {
      // Keep console.warn for performance alerts
      logger.warn('Performance Alert:', performanceData);
    }
  }

  // Calculate percentile
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Get current performance metrics
  getMetrics() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      averageResponseTime: this.responseTimes.length > 0 
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
        : 0,
      p95ResponseTime: this.calculatePercentile(this.responseTimes, 95),
      p99ResponseTime: this.calculatePercentile(this.responseTimes, 99)
    };
  }
}

// Export singleton instance
export const performanceMiddleware = new PerformanceMiddleware();

  // Helper function to wrap API handlers
  export function withPerformanceMonitoring(
    handler: (_req: NextApiRequest, res: NextApiResponse) => Promise<void>
  ) {
    return performanceMiddleware.middleware(handler);
  }
