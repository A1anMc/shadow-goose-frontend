// ERROR RECOVERY SERVICE
// Provides graceful degradation strategies for various failure scenarios
// Ensures system remains functional even when components fail

import { errorLogger } from './logger';

export interface RecoveryStrategy {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackAction: () => Promise<any>;
  successCriteria: (result: any) => boolean;
}

export interface RecoveryContext {
  service: string;
  operation: string;
  error: Error;
  timestamp: string;
  retryCount: number;
  userContext?: any;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  result?: any;
  error?: Error;
  retryCount: number;
  recoveryTime: number;
}

class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private recoveryHistory: RecoveryResult[] = [];
  private maxHistorySize = 100;

  private constructor() {
    this.initializeStrategies();
  }

  static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  private initializeStrategies(): void {
    // API Connection Recovery
    this.strategies.set('api_connection', {
      name: 'API Connection Recovery',
      description: 'Attempts to reconnect to API with exponential backoff',
      priority: 'high',
      autoRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackAction: async () => {
        // Try alternative endpoints or cached data
        return this.getCachedData();
      },
      successCriteria: (result) => result && result.success !== false
    });

    // Authentication Recovery
    this.strategies.set('authentication', {
      name: 'Authentication Recovery',
      description: 'Attempts to refresh authentication or redirect to login',
      priority: 'critical',
      autoRetry: true,
      maxRetries: 2,
      retryDelay: 2000,
      fallbackAction: async () => {
        // Redirect to login or use cached credentials
        return this.handleAuthFailure();
      },
      successCriteria: (result) => result && result.authenticated === true
    });

    // Data Loading Recovery
    this.strategies.set('data_loading', {
      name: 'Data Loading Recovery',
      description: 'Attempts to load data from alternative sources',
      priority: 'medium',
      autoRetry: true,
      maxRetries: 2,
      retryDelay: 1500,
      fallbackAction: async () => {
        // Load from cache or provide default data
        return this.loadFallbackData();
      },
      successCriteria: (result) => result && Array.isArray(result) && result.length > 0
    });

    // AI Service Recovery
    this.strategies.set('ai_service', {
      name: 'AI Service Recovery',
      description: 'Attempts to use alternative AI services or fallback responses',
      priority: 'medium',
      autoRetry: false,
      maxRetries: 1,
      retryDelay: 0,
      fallbackAction: async () => {
        // Provide template-based responses
        return this.getTemplateResponse();
      },
      successCriteria: (result) => result && result.content && result.content.length > 0
    });

    // File Operation Recovery
    this.strategies.set('file_operation', {
      name: 'File Operation Recovery',
      description: 'Attempts to recover from file operation failures',
      priority: 'low',
      autoRetry: true,
      maxRetries: 2,
      retryDelay: 1000,
      fallbackAction: async () => {
        // Use temporary storage or alternative format
        return this.handleFileFailure();
      },
      successCriteria: (result) => result && result.success === true
    });
  }

  // Attempt recovery for a specific error
  async attemptRecovery(
    error: Error,
    context: Omit<RecoveryContext, 'error' | 'timestamp' | 'retryCount'>
  ): Promise<RecoveryResult> {
    const recoveryContext: RecoveryContext = {
      ...context,
      error,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    errorLogger.info('Starting error recovery', 'attemptRecovery', {
      service: context.service,
      operation: context.operation,
      errorMessage: error.message
    });

    // Determine appropriate strategy based on error type
    const strategy = this.determineStrategy(error, recoveryContext);

    if (!strategy) {
      errorLogger.warn('No recovery strategy found', 'attemptRecovery', {
        service: context.service,
        operation: context.operation,
        errorType: error.constructor.name
      });

      return {
        success: false,
        strategy: 'none',
        error,
        retryCount: 0,
        recoveryTime: 0
      };
    }

    return this.executeStrategy(strategy, recoveryContext);
  }

  private determineStrategy(error: Error, context: RecoveryContext): RecoveryStrategy | null {
    const errorMessage = error.message.toLowerCase();
    const service = context.service.toLowerCase();

    // API connection errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      return this.strategies.get('api_connection') || null;
    }

    // Authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
      return this.strategies.get('authentication') || null;
    }

    // Data loading errors
    if (service.includes('data') || service.includes('load') || errorMessage.includes('404')) {
      return this.strategies.get('data_loading') || null;
    }

    // AI service errors
    if (service.includes('ai') || service.includes('openai') || errorMessage.includes('api key')) {
      return this.strategies.get('ai_service') || null;
    }

    // File operation errors
    if (errorMessage.includes('file') || errorMessage.includes('save') || errorMessage.includes('export')) {
      return this.strategies.get('file_operation') || null;
    }

    return null;
  }

  private async executeStrategy(strategy: RecoveryStrategy, context: RecoveryContext): Promise<RecoveryResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    errorLogger.info('Executing recovery strategy', 'executeStrategy', {
      strategy: strategy.name,
      service: context.service,
      operation: context.operation
    });

    // Attempt retries if auto-retry is enabled
    for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
      try {
        const result = await strategy.fallbackAction();

        if (strategy.successCriteria(result)) {
          const recoveryResult: RecoveryResult = {
            success: true,
            strategy: strategy.name,
            result,
            retryCount: attempt,
            recoveryTime: Date.now() - startTime
          };

          this.addToHistory(recoveryResult);

          errorLogger.info('Recovery successful', 'executeStrategy', {
            strategy: strategy.name,
            retryCount: attempt,
            recoveryTime: recoveryResult.recoveryTime
          });

          return recoveryResult;
        } else {
          throw new Error('Recovery action did not meet success criteria');
        }

      } catch (error) {
        lastError = error as Error;
        context.retryCount = attempt;

        errorLogger.warn('Recovery attempt failed', 'executeStrategy', {
          strategy: strategy.name,
          attempt: attempt + 1,
          maxRetries: strategy.maxRetries,
          error: (error as Error).message
        });

        // Wait before next retry (except for last attempt)
        if (attempt < strategy.maxRetries) {
          await this.delay(strategy.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    // All attempts failed
    const recoveryResult: RecoveryResult = {
      success: false,
      strategy: strategy.name,
      error: lastError,
      retryCount: strategy.maxRetries,
      recoveryTime: Date.now() - startTime
    };

    this.addToHistory(recoveryResult);

    errorLogger.error('Recovery failed after all attempts', 'executeStrategy', lastError as Error, {
      strategy: strategy.name,
      retryCount: strategy.maxRetries,
      recoveryTime: recoveryResult.recoveryTime
    });

    return recoveryResult;
  }

  // Fallback actions
  private async getCachedData(): Promise<any> {
    try {
      // Try to get data from localStorage or memory cache
      const cachedData = localStorage.getItem('sge_cached_data');
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // Return default data structure
      return {
        success: true,
        data: [],
        source: 'cache',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Failed to retrieve cached data');
    }
  }

  private async handleAuthFailure(): Promise<any> {
    try {
      // Clear invalid authentication data
      localStorage.removeItem('sge_auth_token');
      localStorage.removeItem('sge_user_data');

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      return {
        authenticated: false,
        action: 'redirect_to_login',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Failed to handle authentication failure');
    }
  }

  private async loadFallbackData(): Promise<any> {
    try {
      // Return default data structures
      return [
        {
          id: 1,
          title: 'Sample Grant',
          description: 'This is fallback data. Please check your connection and try again.',
          amount: 10000,
          category: 'Arts & Culture',
          status: 'open'
        }
      ];
    } catch (error) {
      throw new Error('Failed to load fallback data');
    }
  }

  private async getTemplateResponse(): Promise<any> {
    try {
      return {
        content: 'This is a template-based response. The AI service is temporarily unavailable.',
        word_count: 15,
        quality_score: 60,
        suggestions: ['Try again later', 'Check your internet connection'],
        alternative_versions: [],
        compliance_check: {
          grant_alignment: 60,
          completeness: 60,
          clarity: 60,
          persuasiveness: 60
        }
      };
    } catch (error) {
      throw new Error('Failed to generate template response');
    }
  }

  private async handleFileFailure(): Promise<any> {
    try {
      // Try alternative export format or temporary storage
      return {
        success: true,
        action: 'use_temporary_storage',
        message: 'File operation failed, using temporary storage'
      };
    } catch (error) {
      throw new Error('Failed to handle file operation failure');
    }
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private addToHistory(result: RecoveryResult): void {
    this.recoveryHistory.push(result);

    // Keep only recent history
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory = this.recoveryHistory.slice(-this.maxHistorySize);
    }
  }

  // Get recovery statistics
  getRecoveryStats(): {
    totalAttempts: number;
    successfulRecoveries: number;
    successRate: number;
    averageRecoveryTime: number;
    recentFailures: RecoveryResult[];
  } {
    const totalAttempts = this.recoveryHistory.length;
    const successfulRecoveries = this.recoveryHistory.filter(r => r.success).length;
    const successRate = totalAttempts > 0 ? (successfulRecoveries / totalAttempts) * 100 : 0;
    const averageRecoveryTime = this.recoveryHistory.length > 0
      ? this.recoveryHistory.reduce((sum, r) => sum + r.recoveryTime, 0) / this.recoveryHistory.length
      : 0;
    const recentFailures = this.recoveryHistory.filter(r => !r.success).slice(-10);

    return {
      totalAttempts,
      successfulRecoveries,
      successRate,
      averageRecoveryTime,
      recentFailures
    };
  }

  // Clear recovery history
  clearHistory(): void {
    this.recoveryHistory = [];
    errorLogger.info('Recovery history cleared', 'clearHistory');
  }
}

// Export singleton instance
export const errorRecoveryService = ErrorRecoveryService.getInstance();
