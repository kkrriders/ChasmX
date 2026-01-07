/**
 * Frontend logging utility with structured logging and multiple log levels
 *
 * Features:
 * - Structured logging with context
 * - Log levels (debug, info, warn, error)
 * - Environment-aware (debug logs only in development)
 * - Error tracking integration ready
 * - Performance tracking
 * - User action tracking
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment: boolean
  private sessionId: string
  private userId?: string

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userId: this.userId,
      sessionId: this.sessionId,
    }
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const contextStr = entry.context ? `\n${JSON.stringify(entry.context, null, 2)}` : ''
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log info, warn, and error
    if (!this.isDevelopment && level === LogLevel.DEBUG) {
      return false
    }
    return true
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, message, context, error)

    // Console logging with appropriate method
    const consoleMessage = this.formatConsoleMessage(entry)
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, entry)
        break
      case LogLevel.INFO:
        console.info(consoleMessage, entry)
        break
      case LogLevel.WARN:
        console.warn(consoleMessage, entry)
        break
      case LogLevel.ERROR:
        console.error(consoleMessage, entry)
        if (error) {
          console.error(error)
        }
        break
    }

    // Send to remote logging service in production
    if (!this.isDevelopment && level !== LogLevel.DEBUG) {
      this.sendToRemote(entry)
    }
  }

  private async sendToRemote(entry: LogEntry) {
    try {
      // TODO: Integrate with your logging service (e.g., Sentry, LogRocket, etc.)
      // For now, we'll send to backend
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't want logging to break the app
      })
    } catch {
      // Silently fail
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * Log API requests
   */
  logApiRequest(method: string, url: string, status?: number, duration?: number) {
    this.info('API Request', {
      method,
      url,
      status,
      duration,
      type: 'api_request',
    })
  }

  /**
   * Log API errors
   */
  logApiError(method: string, url: string, error: Error, status?: number) {
    this.error(
      'API Error',
      error,
      {
        method,
        url,
        status,
        type: 'api_error',
      }
    )
  }

  /**
   * Log user actions for analytics
   */
  logUserAction(action: string, details?: LogContext) {
    this.info('User Action', {
      action,
      ...details,
      type: 'user_action',
    })
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    this.info('Performance Metric', {
      metric,
      value,
      unit,
      type: 'performance',
    })
  }

  /**
   * Log workflow execution events
   */
  logWorkflowEvent(
    workflowId: string,
    event: string,
    details?: LogContext
  ) {
    this.info('Workflow Event', {
      workflowId,
      event,
      ...details,
      type: 'workflow',
    })
  }

  /**
   * Start a performance timer
   */
  startTimer(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.logPerformance(label, duration)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const debug = (message: string, context?: LogContext) => logger.debug(message, context)
export const info = (message: string, context?: LogContext) => logger.info(message, context)
export const warn = (message: string, context?: LogContext) => logger.warn(message, context)
export const error = (message: string, err?: Error, context?: LogContext) =>
  logger.error(message, err, context)

export default logger
