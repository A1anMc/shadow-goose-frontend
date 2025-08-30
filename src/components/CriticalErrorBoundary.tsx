import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface CriticalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: Date | null;
}

interface CriticalErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  maxRetries?: number;
  retryDelay?: number;
  onCriticalError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

class CriticalErrorBoundary extends Component<CriticalErrorBoundaryProps, CriticalErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: CriticalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<CriticalErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: new Date(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onCriticalError } = this.props;
    const { retryCount, errorId } = this.state;

    // Log critical error with enhanced context
    logger.error('Critical Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName,
      errorId,
      retryCount,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });

    this.setState({ errorInfo });

    // Call critical error handler
    if (onCriticalError) {
      onCriticalError(error, errorInfo);
    }

    // Auto-retry logic for non-fatal errors
    this.handleAutoRetry(error);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleAutoRetry = (error: Error) => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    const { retryCount } = this.state;

    // Don't auto-retry for certain types of errors
    if (this.isFatalError(error) || retryCount >= maxRetries) {
      return;
    }

    // Schedule auto-retry
    this.retryTimeout = setTimeout(() => {
      logger.info('Auto-retrying critical component', {
        componentName: this.props.componentName,
        retryCount: retryCount + 1,
        maxRetries,
      });

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }, retryDelay);
  };

  isFatalError = (error: Error): boolean => {
    // Define what constitutes a fatal error
    const fatalErrorPatterns = [
      'Authentication failed',
      'Access denied',
      'Network error',
      'Server error',
      'Invalid token',
    ];

    return fatalErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorId, retryCount, lastErrorTime } = this.state;
    const { componentName, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Enhanced critical error UI
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 border border-red-200">
            <div className="text-center">
              {/* Critical Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Critical Error Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Critical Error in {componentName}
              </h2>

              {/* Error Message */}
              <p className="text-gray-600 mb-4">
                {error?.message || 'A critical error occurred in this component'}
              </p>

              {/* Retry Information */}
              {retryCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    Auto-retry attempt {retryCount} of {maxRetries}
                  </p>
                  {lastErrorTime && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Last error: {lastErrorTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}

              {/* Error Details */}
              <details className="mb-6 text-left">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer mb-3">
                  Technical Details
                </summary>
                <div className="bg-gray-50 rounded p-4 text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error ID:</strong> {errorId}
                  </div>
                  <div className="mb-2">
                    <strong>Component:</strong> {componentName}
                  </div>
                  <div className="mb-2">
                    <strong>Retry Count:</strong> {retryCount}
                  </div>
                  {error && (
                    <>
                      <div className="mb-2">
                        <strong>Message:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1 text-xs">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleManualRetry}
                  disabled={retryCount >= maxRetries}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    retryCount >= maxRetries
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {retryCount >= maxRetries ? 'Max Retries Reached' : 'Try Again'}
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If this error persists, please contact support with Error ID: {errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CriticalErrorBoundary;
