/**
 * Performance Optimization Service
 * Handles caching, request optimization, and performance monitoring
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  requestCount: number;
  errorRate: number;
}

class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    cacheHitRate: 0,
    requestCount: 0,
    errorRate: 0,
  };

  /**
   * Get cached data if available and not expired
   */
  getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
    return entry.data;
  }

  /**
   * Cache data with TTL
   */
  setCached<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Optimized fetch with caching and retry logic
   */
  async optimizedFetch<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requestCount++;

    // Check cache first
    if (cacheKey) {
      const cached = this.getCached<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.metrics.responseTime = (this.metrics.responseTime + responseTime) / 2;

      // Cache successful responses
      if (cacheKey) {
        this.setCached(cacheKey, data, ttl);
      }

      return data;
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate + 1) / 2;
      throw error;
    }
  }

  /**
   * Batch multiple requests for efficiency
   */
  async batchRequests<T>(
    requests: Array<{ url: string; options?: RequestInit; cacheKey?: string }>
  ): Promise<T[]> {
    const promises = requests.map(({ url, options, cacheKey }) =>
      this.optimizedFetch<T>(url, options, cacheKey)
    );

    return Promise.allSettled(promises).then((results) =>
      results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          throw result.reason;
        }
      })
    );
  }

  /**
   * Preload critical data
   */
  async preloadData(urls: string[]): Promise<void> {
    const preloadPromises = urls.map((url) =>
      this.optimizedFetch(url, {}, undefined, 10 * 60 * 1000) // 10 minute cache
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Optimize images for faster loading
   */
  optimizeImageUrl(url: string, width: number, height: number): string {
    // Add image optimization parameters
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: '80', // quality
      fm: 'webp', // format
    });

    return `${url}?${params.toString()}`;
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export types
export type { PerformanceMetrics, CacheEntry };
