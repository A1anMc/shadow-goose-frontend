/**
 * Live Data Validator - Ensures 100% Live Data Usage
 * Prevents fallback to test data and maintains data integrity
 */

export interface DataValidationResult {
  isValid: boolean;
  isLiveData: boolean;
  dataSource: string;
  quality: number;
  lastUpdated: Date;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  validate: (data: any) => boolean;
  errorMessage: string;
}

export class LiveDataValidator {
  private validationRules: ValidationRule[] = [];
  private lastValidation: DataValidationResult | null = null;
  private validationHistory: DataValidationResult[] = [];
  private isBlockingFallback: boolean = true;

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Initialize critical validation rules
   */
  private initializeValidationRules(): void {
    this.validationRules = [
      // Critical: Must have live data source
      {
        id: 'live-data-source',
        name: 'Live Data Source Required',
        description: 'Data must come from live API, not fallback sources',
        severity: 'critical',
        validate: (data: any) => {
          return data && 
                 data.data_source && 
                 data.data_source !== 'fallback' && 
                 data.data_source !== 'curated' &&
                 data.data_source !== 'mock';
        },
        errorMessage: 'CRITICAL: Using fallback data instead of live data'
      },

      // Critical: Must have recent data
      {
        id: 'recent-data',
        name: 'Recent Data Required',
        description: 'Data must be updated within the last 24 hours',
        severity: 'critical',
        validate: (data: any) => {
          if (!data || !data.last_updated) return false;
          const lastUpdate = new Date(data.last_updated);
          const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
          return hoursSinceUpdate < 24;
        },
        errorMessage: 'CRITICAL: Data is older than 24 hours'
      },

      // Critical: Must have valid structure
      {
        id: 'valid-structure',
        name: 'Valid Data Structure',
        description: 'Data must have required fields and valid structure',
        severity: 'critical',
        validate: (data: any) => {
          return data && 
                 typeof data === 'object' && 
                 Array.isArray(data.grants) && 
                 data.grants.length > 0;
        },
        errorMessage: 'CRITICAL: Invalid data structure or missing required fields'
      },

      // Critical: Must have authentication
      {
        id: 'authentication',
        name: 'Valid Authentication',
        description: 'Must have valid authentication token',
        severity: 'critical',
        validate: (data: any) => {
          const token = this.getAuthToken();
          return token && token.length > 0;
        },
        errorMessage: 'CRITICAL: No valid authentication token'
      },

      // Warning: Data quality check
      {
        id: 'data-quality',
        name: 'Data Quality',
        description: 'Data must meet quality standards',
        severity: 'warning',
        validate: (data: any) => {
          if (!data || !data.grants) return false;
          
          let qualityScore = 100;
          const grants = data.grants;

          // Check for required fields in each grant
          grants.forEach((grant: any) => {
            if (!grant.title) qualityScore -= 20;
            if (!grant.amount) qualityScore -= 20;
            if (!grant.deadline) qualityScore -= 20;
            if (!grant.category) qualityScore -= 10;
          });

          return qualityScore >= 70;
        },
        errorMessage: 'WARNING: Data quality below acceptable standards'
      },

      // Warning: API response time
      {
        id: 'response-time',
        name: 'Response Time',
        description: 'API response time must be reasonable',
        severity: 'warning',
        validate: (data: any) => {
          return data && (!data.responseTime || data.responseTime < 5000);
        },
        errorMessage: 'WARNING: API response time is slow'
      }
    ];
  }

  /**
   * Validate data and ensure it's live
   */
  public async validateData(data: any, source: string): Promise<DataValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;
    let quality = 100;

    // Run all validation rules
    for (const rule of this.validationRules) {
      try {
        const ruleValid = rule.validate(data);
        
        if (!ruleValid) {
          if (rule.severity === 'critical') {
            errors.push(rule.errorMessage);
            isValid = false;
            quality -= 50;
          } else if (rule.severity === 'warning') {
            warnings.push(rule.errorMessage);
            quality -= 20;
          }
        }
      } catch (error) {
        errors.push(`Validation rule ${rule.name} failed: ${error}`);
        isValid = false;
        quality -= 30;
      }
    }

    // Additional live data checks
    const isLiveData = this.isLiveDataSource(data, source);
    if (!isLiveData) {
      errors.push('CRITICAL: Data source is not live');
      isValid = false;
      quality = 0;
    }

    // Check for fallback data indicators
    if (this.isFallbackData(data)) {
      errors.push('CRITICAL: Fallback data detected - live data required');
      isValid = false;
      quality = 0;
    }

    const result: DataValidationResult = {
      isValid,
      isLiveData,
      dataSource: source,
      quality: Math.max(0, quality),
      lastUpdated: new Date(),
      errors,
      warnings
    };

    this.lastValidation = result;
    this.validationHistory.push(result);

    // Keep only last 100 validations
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100);
    }

    // Block usage if critical errors
    if (!isValid && this.isBlockingFallback) {
      this.blockFallbackUsage(result);
    }

    return result;
  }

  /**
   * Check if data source is live
   */
  private isLiveDataSource(data: any, source: string): boolean {
    // Check for live API indicators
    if (source.includes('shadow-goose-api.onrender.com')) {
      return true;
    }

    // Check for external API indicators
    if (source.includes('screenaustralia.gov.au') || 
        source.includes('creative.gov.au') || 
        source.includes('vicscreen.vic.gov.au')) {
      return true;
    }

    // Check data source field
    if (data && data.data_source) {
      const liveSources = ['api', 'live', 'external', 'primary'];
      return liveSources.includes(data.data_source);
    }

    return false;
  }

  /**
   * Detect fallback data
   */
  private isFallbackData(data: any): boolean {
    // Check for fallback indicators
    if (data && data.data_source) {
      const fallbackSources = ['fallback', 'curated', 'mock', 'test', 'demo'];
      return fallbackSources.includes(data.data_source);
    }

    // Check for test data patterns
    if (data && data.grants) {
      const grants = data.grants;
      const testPatterns = [
        'Test Grant',
        'Sample Grant',
        'Demo Grant',
        'Mock Grant',
        'Example Grant'
      ];

      return grants.some((grant: any) => 
        testPatterns.some(pattern => 
          grant.title && grant.title.includes(pattern)
        )
      );
    }

    return false;
  }

  /**
   * Block fallback data usage
   */
  private blockFallbackUsage(validation: DataValidationResult): void {
    console.error('🚨 CRITICAL: Blocking fallback data usage', validation);
    
    // Create critical alert
    this.createCriticalAlert(validation);
    
    // Force data refresh
    this.forceLiveDataRefresh();
    
    // Emit blocking event
    this.emit('fallback-blocked', {
      timestamp: new Date(),
      validation,
      action: 'Forcing live data refresh'
    });
  }

  /**
   * Force refresh to get live data
   */
  private async forceLiveDataRefresh(): Promise<void> {
    console.log('🔄 Forcing live data refresh...');
    
    // Clear cached data
    this.clearCachedData();
    
    // Attempt to fetch live data
    try {
      const liveData = await this.fetchLiveData();
      if (liveData) {
        console.log('✅ Live data refresh successful');
        this.emit('live-data-refreshed', { timestamp: new Date() });
      } else {
        console.error('❌ Live data refresh failed');
        this.emit('live-data-refresh-failed', { timestamp: new Date() });
      }
    } catch (error) {
      console.error('❌ Live data refresh error:', error);
      this.emit('live-data-refresh-error', { 
        timestamp: new Date(), 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Fetch live data from primary sources
   */
  private async fetchLiveData(): Promise<any> {
    const primarySources = [
      'https://shadow-goose-api.onrender.com/api/grants',
      'https://shadow-goose-api.onrender.com/api/grant-applications'
    ];

    for (const source of primarySources) {
      try {
        const response = await fetch(source, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          const validation = await this.validateData(data, source);
          
          if (validation.isValid && validation.isLiveData) {
            return data;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${source}:`, error);
      }
    }

    return null;
  }

  /**
   * Clear cached data to force fresh fetch
   */
  private clearCachedData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('grants') || 
            key.includes('applications') || 
            key.includes('cache') ||
            key.includes('fallback')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  /**
   * Create critical alert for fallback usage
   */
  private createCriticalAlert(validation: DataValidationResult): void {
    const alert = {
      id: `critical-${Date.now()}`,
      type: 'critical' as const,
      title: 'Fallback Data Blocked',
      message: 'System attempted to use fallback data. Live data required.',
      validation,
      timestamp: new Date(),
      actionRequired: true
    };

    // Store alert
    if (typeof window !== 'undefined' && window.localStorage) {
      const alerts = JSON.parse(localStorage.getItem('critical_alerts') || '[]');
      alerts.push(alert);
      localStorage.setItem('critical_alerts', JSON.stringify(alerts));
    }

    // Emit alert event
    this.emit('critical-alert', alert);
  }

  /**
   * Get validation history
   */
  public getValidationHistory(): DataValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Get last validation result
   */
  public getLastValidation(): DataValidationResult | null {
    return this.lastValidation;
  }

  /**
   * Check if system is currently using live data
   */
  public isUsingLiveData(): boolean {
    return !!(this.lastValidation?.isValid && this.lastValidation?.isLiveData);
  }

  /**
   * Get system health status
   */
  public getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    liveDataAvailable: boolean;
    lastValidation: Date | null;
    criticalErrors: number;
    warnings: number;
  } {
    const criticalErrors = this.lastValidation?.errors.length || 0;
    const warnings = this.lastValidation?.warnings.length || 0;
    const liveDataAvailable = this.isUsingLiveData();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalErrors > 0 || !liveDataAvailable) {
      status = 'unhealthy';
    } else if (warnings > 0) {
      status = 'degraded';
    }

    return {
      status,
      liveDataAvailable,
      lastValidation: this.lastValidation?.lastUpdated || null,
      criticalErrors,
      warnings
    };
  }

  /**
   * Enable/disable fallback blocking
   */
  public setFallbackBlocking(enabled: boolean): void {
    this.isBlockingFallback = enabled;
    console.log(`Fallback blocking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Event system
   */
  private eventListeners: Map<string, Function[]> = new Map();

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Utility methods
   */
  private getAuthToken(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }
}

// Global instance
export const liveDataValidator = new LiveDataValidator();

// Auto-validate data in browser environment
if (typeof window !== 'undefined') {
  // Monitor for data changes and validate
  setInterval(() => {
    // Check if we're using fallback data
    const cachedData = localStorage.getItem('grants_data');
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        liveDataValidator.validateData(data, 'cached');
      } catch (error) {
        console.warn('Failed to validate cached data:', error);
      }
    }
  }, 60000); // Every minute
}
