// STRUCTURED LOGGING SERVICE
// Centralized logging with levels, context, and structured data
// Replaces all console statements with proper logging

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogContext {
  service: string;
  operation: string;
  userId?: string;
  requestId?: string;
  timestamp: string;
  environment: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: any;
  error?: Error;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLogSize: number;
  environment: string;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private serviceName: string;

  private constructor(serviceName: string, config?: Partial<LoggerConfig>) {
    this.serviceName = serviceName;
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      maxLogSize: 1000,
      environment: process.env.NODE_ENV || 'development',
      ...config
    };
  }

  static getLogger(serviceName: string, config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(serviceName, config);
    }
    return Logger.instance;
  }

  private createContext(operation: string, additionalContext?: Partial<LogContext>): LogContext {
    return {
      service: this.serviceName,
      operation,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      ...additionalContext
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.context.timestamp).toISOString();
    const level = LogLevel[entry.level];
    const service = entry.context.service;
    const operation = entry.context.operation;

    let message = `[${timestamp}] ${level} [${service}:${operation}] ${entry.message}`;

    if (entry.data) {
      message += ` | Data: ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      message += ` | Error: ${entry.error.message}`;
    }

    return message;
  }

  private log(level: LogLevel, message: string, operation: string, data?: any, error?: Error, additionalContext?: Partial<LogContext>): void {
    if (!this.shouldLog(level)) return;

    const context = this.createContext(operation, additionalContext);
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      error,
      stack: error?.stack
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogSize);
    }

    // Console output
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(formattedMessage);
          break;
      }
    }

    // Remote logging (for production)
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry).catch(err => {
        // Fallback to console if remote logging fails
        console.error('Remote logging failed:', err);
      });
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
    } catch (error) {
      // Don't throw - remote logging failure shouldn't break the app
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  // Public logging methods
  debug(message: string, operation: string, data?: any, context?: Partial<LogContext>): void {
    this.log(LogLevel.DEBUG, message, operation, data, undefined, context);
  }

  info(message: string, operation: string, data?: any, context?: Partial<LogContext>): void {
    this.log(LogLevel.INFO, message, operation, data, undefined, context);
  }

  warn(message: string, operation: string, data?: any, context?: Partial<LogContext>): void {
    this.log(LogLevel.WARN, message, operation, data, undefined, context);
  }

  error(message: string, operation: string, error?: Error, data?: any, context?: Partial<LogContext>): void {
    this.log(LogLevel.ERROR, message, operation, data, error, context);
  }

  critical(message: string, operation: string, error?: Error, data?: any, context?: Partial<LogContext>): void {
    this.log(LogLevel.CRITICAL, message, operation, data, error, context);
  }

  // Utility methods
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logBuffer.filter(entry => entry.level >= level);
    }
    return [...this.logBuffer];
  }

  clearLogs(): void {
    this.logBuffer = [];
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  enableRemoteLogging(endpoint: string): void {
    this.config.enableRemote = true;
    this.config.remoteEndpoint = endpoint;
  }

  disableRemoteLogging(): void {
    this.config.enableRemote = false;
    this.config.remoteEndpoint = undefined;
  }
}

// Export convenience functions for common services
export const createLogger = (serviceName: string, config?: Partial<LoggerConfig>) => Logger.getLogger(serviceName, config);

// Pre-configured loggers for common services
export const authLogger = createLogger('AuthService');
export const grantsLogger = createLogger('GrantsService');
export const projectsLogger = createLogger('ProjectsService');
export const blockchainLogger = createLogger('BlockchainTracker');
export const errorLogger = createLogger('ErrorHandler');
export const websocketLogger = createLogger('WebSocketService');
export const aiLogger = createLogger('AIService');
export const analyticsLogger = createLogger('AnalyticsService');
export const validationLogger = createLogger('DataValidator');
export const monitorLogger = createLogger('DataMonitor');
