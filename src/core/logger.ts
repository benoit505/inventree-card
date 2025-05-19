export type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';
export type LogCategory = 'redux' | 'ui' | 'api' | 'general';

export interface LogOptions {
  category?: LogCategory;
  subsystem?: string;
  data?: any;
}

/**
 * Logger singleton for consistent logging throughout the application
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'log';
  private enabled: boolean = true;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of the logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the log level
   * @param level The minimum level of logs to output
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Enable or disable logging
   * @param enabled Whether logging is enabled
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log a debug message
   * @param system The system generating the log
   * @param message The message to log
   * @param options Additional options for the log
   */
  public debug(system: string, message: string, options?: LogOptions): void {
    if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('debug')) return;
    console.debug(`[${system}] ${message}`, options?.data || '');
  }

  /**
   * Log an info message
   * @param system The system generating the log
   * @param message The message to log
   * @param options Additional options for the log
   */
  public info(system: string, message: string, options?: LogOptions): void {
    if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('info')) return;
    console.info(`[${system}] ${message}`, options?.data || '');
  }

  /**
   * Log a standard message
   * @param system The system generating the log
   * @param message The message to log
   * @param options Additional options for the log
   */
  public log(system: string, message: string, options?: LogOptions): void {
    if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('log')) return;
    console.log(`[${system}] ${message}`, options?.data || '');
  }

  /**
   * Log a warning message
   * @param system The system generating the log
   * @param message The message to log
   * @param options Additional options for the log
   */
  public warn(system: string, message: string, options?: LogOptions): void {
    if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('warn')) return;
    console.warn(`[${system}] ${message}`, options?.data || '');
  }

  /**
   * Log an error message
   * @param system The system generating the log
   * @param message The message to log
   * @param options Additional options for the log
   */
  public error(system: string, message: string, options?: LogOptions): void {
    if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('error')) return;
    console.error(`[${system}] ${message}`, options?.data || '');
  }

  /**
   * Get the numeric value of a log level for comparison
   * @param level The log level
   * @returns The numeric value of the log level
   */
  private getLevelValue(level: LogLevel): number {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      log: 2,
      warn: 3,
      error: 4
    };
    return levels[level];
  }
} 