// CENTRALIZED ERROR HANDLING SERVICE
// Single source of truth for all error handling across the entire application
// This prevents error handling inconsistencies and makes the system maintainable

import { configService } from './config';


import { logger } from './logger';
export interface ErrorContext {
  service: string;
  operation: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  context: ErrorContext;
  originalError?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  context?: string;
  timestamp: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 1000; // Keep last 1000 errors

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle API errors with consistent pattern
  static handleApiError(error: any, context: string): ErrorResponse {
    const errorInfo = ErrorHandler.createErrorInfo(error, context, 'medium');
    ErrorHandler.getInstance().logError(errorInfo);

    // Determine user-friendly error message
    let userMessage = 'An unexpected error occurred';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        userMessage = 'Authentication required. Please login again.';
        errorCode = 'AUTH_REQUIRED';
      } else if (error.message.includes('403')) {
        userMessage = 'Access denied. You do not have permission for this action.';
        errorCode = 'ACCESS_DENIED';
      } else if (error.message.includes('404')) {
        userMessage = 'The requested resource was not found.';
        errorCode = 'NOT_FOUND';
      } else if (error.message.includes('500')) {
        userMessage = 'Server error. Please try again later.';
        errorCode = 'SERVER_ERROR';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
        errorCode = 'TIMEOUT';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Please check your connection.';
        errorCode = 'NETWORK_ERROR';
      } else {
        userMessage = error.message;
      }
    } else if (typeof error === 'string') {
      userMessage = error;
    }

    return {
      success: false,
      error: userMessage,
      code: errorCode,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  // Handle authentication errors
  static handleAuthError(error: any, context: string): ErrorResponse {
    const errorInfo = ErrorHandler.createErrorInfo(error, context, 'high');
    ErrorHandler.getInstance().logError(errorInfo);

    let userMessage = 'Authentication failed';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      if (error.message.includes('invalid credentials')) {
        userMessage = 'Invalid username or password.';
        errorCode = 'INVALID_CREDENTIALS';
      } else if (error.message.includes('token expired')) {
        userMessage = 'Your session has expired. Please login again.';
        errorCode = 'TOKEN_EXPIRED';
      } else if (error.message.includes('token invalid')) {
        userMessage = 'Invalid session. Please login again.';
        errorCode = 'TOKEN_INVALID';
      } else {
        userMessage = error.message;
      }
    }

    return {
      success: false,
      error: userMessage,
      code: errorCode,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  // Handle validation errors
  static handleValidationError(error: any, context: string): ErrorResponse {
    const errorInfo = ErrorHandler.createErrorInfo(error, context, 'low');
    ErrorHandler.getInstance().logError(errorInfo);

    let userMessage = 'Validation failed';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      if (error.message.includes('required')) {
        userMessage = 'Please fill in all required fields.';
        errorCode = 'MISSING_REQUIRED_FIELDS';
      } else if (error.message.includes('invalid format')) {
        userMessage = 'Please check the format of your input.';
        errorCode = 'INVALID_FORMAT';
      } else if (error.message.includes('too long')) {
        userMessage = 'Input is too long. Please shorten your text.';
        errorCode = 'INPUT_TOO_LONG';
      } else {
        userMessage = error.message;
      }
    }

    return {
      success: false,
      error: userMessage,
      code: errorCode,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  // Handle critical system errors
  static handleCriticalError(error: any, context: string): ErrorResponse {
    const errorInfo = ErrorHandler.createErrorInfo(error, context, 'critical');
    ErrorHandler.getInstance().logError(errorInfo);

    // For critical errors, always show a generic message to users
    const userMessage = 'A system error occurred. Please contact support if this persists.';

    return {
      success: false,
      error: userMessage,
      code: 'SYSTEM_ERROR',
      context,
      timestamp: new Date().toISOString(),
    };
  }

  // Log error for debugging/monitoring
  logError(errorInfo: ErrorInfo): void {
    this.errorLog.push(errorInfo);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (configService.isDevelopment()) {
      logger.error('Error logged:', errorInfo);
    }

    // In production, you might want to send to error tracking service
    if (configService.isProduction()) {
      this.sendToErrorTracking(errorInfo);
    }
  }

  // Get error log for debugging
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Create standardized error info
  private static createErrorInfo(error: any, context: string, severity: 'low' | 'medium' | 'high' | 'critical'): ErrorInfo {
    const errorContext: ErrorContext = {
      service: 'frontend',
      operation: context,
      timestamp: new Date().toISOString(),
    };

    let message = 'Unknown error';
    let code: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      code = error.name;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      message = error.message || error.error || 'Object error';
      code = error.code;
    }

    return {
      message,
      code,
      context: errorContext,
      originalError: error,
      severity,
    };
  }

  // Send error to tracking service (placeholder for production)
  private sendToErrorTracking(errorInfo: ErrorInfo): void {
    // In production, this would send to Sentry, LogRocket, etc.
    // For now, just log to console
    logger.error('Production error:', errorInfo);
  }

  // Utility method to check if error is retryable
  static isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('timeout') ||
             message.includes('network') ||
             message.includes('500') ||
             message.includes('502') ||
             message.includes('503') ||
             message.includes('504');
    }
    return false;
  }

  // Utility method to get error severity
  static getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('validation') || message.includes('format')) {
        return 'low';
      } else if (message.includes('timeout') || message.includes('network')) {
        return 'medium';
      } else if (message.includes('auth') || message.includes('permission')) {
        return 'high';
      } else if (message.includes('system') || message.includes('critical')) {
        return 'critical';
      }
    }
    return 'medium';
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions for common use cases
export const handleApiError = (error: any, context: string) => ErrorHandler.handleApiError(error, context);
export const handleAuthError = (error: any, context: string) => ErrorHandler.handleAuthError(error, context);
export const handleValidationError = (error: any, context: string) => ErrorHandler.handleValidationError(error, context);
export const handleCriticalError = (error: any, context: string) => ErrorHandler.handleCriticalError(error, context);
export const isRetryableError = (error: any) => ErrorHandler.isRetryableError(error);
