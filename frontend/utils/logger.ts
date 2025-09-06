export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: number;
  action?: string;
  component?: string;
  url?: string;
  error?: Error;
  data?: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      context
    };
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry = this.createLogEntry(level, message, context);
    
    // Store in memory for debugging
    this.logs.push(entry);
    
    // Keep only last 100 logs to avoid memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' :
                           level === LogLevel.WARN ? 'warn' :
                           'log';
      
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '');
    }

    // Send to backend in production (non-blocking) - DISABLED until /api/logs endpoint exists
    // if (!this.isDevelopment && level === LogLevel.ERROR) {
    //   this.sendToBackend(entry).catch(() => {
    //     // Silent fail - don't throw errors from logger
    //   });
    // }
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Silent fail - logging should never break the app
    }
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, `Warning: ${message}`, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, `Debug: ${message}`, context);
  }

  // Specific methods for different types of events
  logUserAction(action: string, data?: any, userId?: number): void {
    const contextData = { ...data };
    if (userId) contextData.userId = userId;
    
    this.log(LogLevel.INFO, `User Action: ${action}`, contextData);
  }

  logApiCall(method: string, url: string, status?: number, error?: Error): void {
    const isError = error || (status && status >= 400);
    const level = isError ? LogLevel.ERROR : LogLevel.INFO;
    const message = isError ? `API Error: ${method} ${url}` : `API Call: ${method} ${url}`;
    
    const context: any = {
      status
    };

    if (error) {
      context.error = error.message;
    }

    this.log(level, message, context);
  }

  logPageView(page: string, userId?: number): void {
    this.info(`Page view: ${page}`, {
      action: 'page_view',
      component: 'navigation',
      userId,
      data: { page }
    });
  }

  logError(error: Error, component?: string, additionalData?: any): void {
    this.error(`Error in ${component || 'unknown component'}: ${error.message}`, {
      component,
      error,
      data: additionalData
    });
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Global error handlers (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.logError(event.error, 'global', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.logError(
      new Error(event.reason || 'Unhandled Promise Rejection'), 
      'promise',
      { reason: event.reason }
    );
  });
}

// Export global instance
export const logger = new Logger();
export default logger;