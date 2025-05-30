export declare class Logger {
    private static instance;
    private debugMode;
    private verboseMode;
    private logLevel;
    private debugCategories;
    private _logSequence;
    private _recentLogs;
    private _dedupeTimeWindow;
    private _maxDuplicatesPerWindow;
    private constructor();
    static getInstance(): Logger;
    /**
     * Check if debug is enabled for a specific system and optional subsystem
     */
    isEnabled(system: string, subsystem?: string): boolean;
    /**
     * Check if any category is enabled
     */
    private anyCategoryEnabled;
    /**
     * Get the next sequence number for logs
     */
    private getNextSequence;
    /**
     * Set main debug mode - this enables the debug UI without enabling all logs
     */
    setDebug(debug: boolean): void;
    /**
     * Set verbose mode - this enables ALL logs regardless of category settings
     */
    setVerboseMode(verbose: boolean): void;
    /**
     * Configure debug settings from the card config
     */
    setDebugConfig(config: any): void;
    /**
     * Process hierarchical debug configuration
     */
    private processHierarchicalConfig;
    /**
     * Format system status for display
     */
    private formatSystemStatus;
    /**
     * Set the log level
     */
    setLogLevel(level: 'none' | 'error' | 'warn' | 'info' | 'debug'): void;
    /**
     * Set debug for a category
     */
    setCategoryDebug(category: string, enabled: boolean): void;
    /**
     * Set debug for a specific subsystem
     */
    setSubsystemDebug(system: string, subsystem: string, enabled: boolean): void;
    /**
     * Check if a log message is a duplicate
     */
    private isDuplicate;
    /**
     * Remove expired entries from the recent logs map
     */
    private pruneRecentLogs;
    /**
     * Enhanced log method with support for hierarchical categories
     * Also maintains backward compatibility with previous API
     */
    log(component: string, message: string, options?: any, ...restArgs: any[]): void;
    /**
     * Log info messages
     * Maintains backward compatibility with previous API
     */
    info(component: string, message: string, ...args: any[]): void;
    /**
     * Log warning messages
     * Maintains backward compatibility with previous API
     */
    warn(component: string, message: string, ...args: any[]): void;
    /**
     * Log error messages
     * Maintains backward compatibility with previous API
     */
    error(component: string, message: string, ...args: any[]): void;
    /**
     * Start performance measurement
     */
    startPerformance(label: string): number;
    /**
     * End performance measurement and log it
     */
    endPerformance(component: string, message: string, startTime: number, options?: {
        category?: string;
        subsystem?: string;
    }): void;
    /**
     * Reset debug configuration
     */
    resetDebugConfig(): void;
    /**
     * Set the enabled state for a specific logging category (legacy method)
     */
    setEnabled(category: string, enabled: boolean): void;
    /**
     * Get all systems with their status
     */
    getSystemsStatus(): Record<string, any>;
    /**
     * Get all subsystems for a system
     */
    getSubsystems(system: string): string[];
    /**
     * For backward compatibility
     */
    isCategoryEnabled(category: string): boolean;
    private logConfigStatus;
}
