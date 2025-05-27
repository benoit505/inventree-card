/**
 * Logger singleton for consistent logging throughout the application
 */
export class Logger {
    constructor() {
        this.logLevel = 'log';
        this.enabled = true;
        // Private constructor to enforce singleton pattern
    }
    /**
     * Get the singleton instance of the logger
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Set the log level
     * @param level The minimum level of logs to output
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Enable or disable logging
     * @param enabled Whether logging is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Log a debug message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    debug(system, message, options) {
        if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('debug'))
            return;
        console.debug(`[${system}] ${message}`, (options === null || options === void 0 ? void 0 : options.data) || '');
    }
    /**
     * Log an info message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    info(system, message, options) {
        if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('info'))
            return;
        console.info(`[${system}] ${message}`, (options === null || options === void 0 ? void 0 : options.data) || '');
    }
    /**
     * Log a standard message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    log(system, message, options) {
        if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('log'))
            return;
        console.log(`[${system}] ${message}`, (options === null || options === void 0 ? void 0 : options.data) || '');
    }
    /**
     * Log a warning message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    warn(system, message, options) {
        if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('warn'))
            return;
        console.warn(`[${system}] ${message}`, (options === null || options === void 0 ? void 0 : options.data) || '');
    }
    /**
     * Log an error message
     * @param system The system generating the log
     * @param message The message to log
     * @param options Additional options for the log
     */
    error(system, message, options) {
        if (!this.enabled || this.getLevelValue(this.logLevel) > this.getLevelValue('error'))
            return;
        console.error(`[${system}] ${message}`, (options === null || options === void 0 ? void 0 : options.data) || '');
    }
    /**
     * Get the numeric value of a log level for comparison
     * @param level The log level
     * @returns The numeric value of the log level
     */
    getLevelValue(level) {
        const levels = {
            debug: 0,
            info: 1,
            log: 2,
            warn: 3,
            error: 4
        };
        return levels[level];
    }
}
//# sourceMappingURL=logger.js.map