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
export declare class Logger {
    private static instance;
    private logLevel;
    private enabled;
    private constructor();
    /**
     * Get the singleton instance of the logger
     */
    static getInstance(): Logger;
    /**
     * Set the log level
     * @param level The minimum level of logs to output
     */
    setLogLevel(level: LogLevel): void;
    getLogLevel(): LogLevel;
    /**
     * Enable or disable logging
     * @param enabled Whether logging is enabled
     */
    setEnabled(enabled: boolean): void;
    getIsEnabled(): boolean;
    setDebugConfig(config: any): void;
    /**
     * Log a debug message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    debug(system: string, message: string, options?: LogOptions): void;
    /**
     * Log an info message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    info(system: string, message: string, options?: LogOptions): void;
    /**
     * Log a standard message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    log(system: string, message: string, options?: LogOptions): void;
    /**
     * Log a warning message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    warn(system: string, message: string, options?: LogOptions): void;
    /**
     * Log an error message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    error(system: string, message: string, options?: LogOptions): void;
    /**
     * Get the numeric value of a log level for comparison
     * @param level The log level
     * @returns The numeric value of the log level
     */
    private getLevelValue;
}
