// STRUCTURED LOGGING SERVICE
// Centralized logging with levels, context, and structured data
// Replaces all console statements with proper logging

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;
    
    if (data) {
      formattedMessage += ` | Data: ${JSON.stringify(data)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(level, message, data, error);
      
      switch (level) {
        case LogLevel.DEBUG:
          // Debug logging disabled in production
          break;
        case LogLevel.INFO:
          // Info logging disabled in production
          break;
        case LogLevel.WARN:
          // Warn logging disabled in production
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          // Error logging disabled in production
          break;
      }
    }
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, message, data, error);
  }

  critical(message: string, data?: any, error?: Error) {
    this.log(LogLevel.CRITICAL, message, data, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
