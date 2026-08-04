/**
 * Simple logging utility for Perchance AI Toolkit
 * Provides structured logging with different levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export class Logger {
  private level: LogLevel;
  private context?: string;

  constructor(level: LogLevel = LogLevel.INFO, context?: string) {
    this.level = level;
    this.context = context;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setContext(context: string): void {
    this.context = context;
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    const extraContext = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${extraContext}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.DEBUG) {
      console.error(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.INFO) {
      console.error(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.WARN) {
      console.error(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, context));
    }
  }

  // Convenience methods
  debugOperation(operation: string, details?: Record<string, any>): void {
    this.debug(`Operation: ${operation}`, details);
  }

  infoOperation(operation: string, details?: Record<string, any>): void {
    this.info(`Operation: ${operation}`, details);
  }

  warnOperation(operation: string, details?: Record<string, any>): void {
    this.warn(`Operation: ${operation}`, details);
  }

  errorOperation(operation: string, error?: Error, details?: Record<string, any>): void {
    const errorContext = {
      ...details,
      error: error?.message,
      stack: error?.stack,
    };
    this.error(`Operation failed: ${operation}`, errorContext);
  }
}

// Global logger instance
const globalLogger = new Logger(
  process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG :
  process.env.LOG_LEVEL === 'warn' ? LogLevel.WARN :
  process.env.LOG_LEVEL === 'error' ? LogLevel.ERROR :
  LogLevel.INFO
);

export default globalLogger;

// Context-specific logger factory
export function createLogger(context: string, level?: LogLevel): Logger {
  return new Logger(level || globalLogger['level'], context);
}
