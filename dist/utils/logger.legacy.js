export class Logger {
    constructor() {
        this.debugMode = false;
        this.verboseMode = false; // New flag to control verbose output
        this.logLevel = 'error';
        // Preserve user-set debug values to prevent them from being overwritten
        this._userDebugSettings = {
            categorySettings: {},
            subsystemSettings: {}
        };
        // Define hierarchical debug categories structure
        this.debugCategories = {
            api: {
                enabled: false,
                subsystems: {
                    calls: false, // UI: Calls (was 'requests')
                    responses: false, // UI: Responses
                    errors: false, // UI: Errors
                    fallbacks: false, // Keeping for backward compatibility
                    throttling: false // Keeping for backward compatibility
                }
            },
            parameters: {
                enabled: false,
                subsystems: {
                    updates: false, // UI: Updates
                    conditions: false, // UI: Conditions
                    filtering: false, // UI: Filtering
                    actions: false // UI: Actions
                }
            },
            websocket: {
                enabled: false,
                subsystems: {
                    connection: false, // UI: Connection
                    messages: false, // UI: Messages
                    events: false, // UI: Events
                    plugin: false, // UI: Plugin
                    subscriptions: false, // Keeping for backward compatibility
                    authentication: false // Keeping for backward compatibility
                }
            },
            layouts: {
                enabled: false,
                subsystems: {
                    rendering: false,
                    filtering: false,
                    updates: false
                }
            },
            rendering: {
                enabled: false,
                subsystems: {
                    updates: false, // UI: Updates
                    performance: false, // UI: Performance
                    cycle: false, // Keeping for backward compatibility
                    debounce: false // Keeping for backward compatibility
                }
            },
            cache: {
                enabled: false,
                subsystems: {
                    hits: false,
                    misses: false,
                    pruning: false,
                    performance: false
                }
            },
            card: {
                enabled: false,
                subsystems: {
                    initialization: false,
                    lifecycle: false,
                    rendering: false,
                    updates: false
                }
            },
            diagnostics: {
                enabled: false,
                subsystems: {
                    performance: false,
                    memory: false,
                    errors: false
                }
            }
        };
        // Add sequence counter for chronological tracking
        this._logSequence = 0;
        // Add deduplication tracking
        this._recentLogs = new Map();
        this._dedupeTimeWindow = 2000; // 2 seconds
        this._maxDuplicatesPerWindow = 1; // Only show a duplicate message once per time window
        // Lazy load the cache service to avoid circular dependencies
        setTimeout(() => {
            try {
                // Now it's safe to dynamically import the CacheService
                import("../services/cache").then(module => {
                    this._cache = module.CacheService.getInstance();
                    console.info('Logger: Successfully initialized CacheService after delay');
                });
            }
            catch (e) {
                console.warn('Logger: Could not initialize CacheService, using built-in deduplication');
            }
        }, 100);
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Check if debug is enabled for a specific system and optional subsystem
     */
    isEnabled(system, subsystem) {
        var _a;
        // If verbose mode is disabled and no specific category is enabled, nothing should log
        if (!this.verboseMode && !this.anyCategoryEnabled()) {
            return false;
        }
        // If system doesn't exist, it's not enabled
        if (!this.debugCategories[system]) {
            return false;
        }
        // In verbose mode, everything is enabled regardless of individual settings
        if (this.verboseMode) {
            return true;
        }
        // If system exists but is not enabled, return false
        if (!this.debugCategories[system].enabled) {
            return false;
        }
        // If no subsystem specified, just check the system
        if (!subsystem) {
            return true;
        }
        // If subsystem specified, check if it exists and is explicitly enabled
        // Only return true for subsystems that are explicitly set to true
        return ((_a = this.debugCategories[system].subsystems) === null || _a === void 0 ? void 0 : _a[subsystem]) === true;
    }
    /**
     * Check if any category is enabled
     */
    anyCategoryEnabled() {
        return Object.keys(this.debugCategories).some(system => this.debugCategories[system].enabled);
    }
    /**
     * Get the next sequence number for logs
     */
    getNextSequence() {
        return ++this._logSequence;
    }
    /**
     * Set main debug mode - this enables the debug UI without enabling all logs
     */
    setDebug(debug) {
        this.debugMode = debug;
        // Store the user setting
        this._userDebugSettings.debugEnabled = debug;
        // Only set logLevel to debug if debug is true
        if (debug) {
            this.logLevel = 'debug';
        }
        else {
            this.logLevel = 'error';
            this.verboseMode = false; // Turn off verbose mode when debug is disabled
        }
        console.info(`Logger debug mode ${debug ? 'ENABLED' : 'DISABLED'}`);
    }
    /**
     * Set verbose mode - this enables ALL logs regardless of category settings
     */
    setVerboseMode(verbose) {
        // Verbose mode requires debug mode to be on
        if (verbose && !this.debugMode) {
            this.setDebug(true);
        }
        this.verboseMode = verbose;
        // Store the user setting
        this._userDebugSettings.verboseEnabled = verbose;
        console.info(`Logger verbose mode ${verbose ? 'ENABLED - ALL categories will log' : 'DISABLED - only selected categories will log'}`);
    }
    /**
     * Configure debug settings from the card config
     */
    setDebugConfig(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        if (!config)
            return;
        // Apply user-set debug flag first, if it exists
        const shouldEnableDebug = (_a = this._userDebugSettings.debugEnabled) !== null && _a !== void 0 ? _a : config.debug;
        this.setDebug(shouldEnableDebug || false);
        // Apply user-set verbose mode if it exists
        if (this._userDebugSettings.verboseEnabled !== undefined) {
            this.setVerboseMode(this._userDebugSettings.verboseEnabled);
        }
        else if (config.debug_verbose !== undefined) {
            this.setVerboseMode(config.debug_verbose);
        }
        else {
            // For backward compatibility - if debug is enabled but no categories are,
            // automatically enable verbose mode to maintain previous behavior
            if (config.debug && !this.anyCategoryEnabled() &&
                !config.debug_api && !config.debug_parameters &&
                !config.debug_websocket && !config.debug_layouts &&
                !config.debug_rendering && !config.debug_cache &&
                !config.debug_card && !config.debug_diagnostics) {
                this.setVerboseMode(true);
            }
        }
        // Set individual system flags, respecting user settings
        this.setCategoryDebug('api', (_c = (_b = this._userDebugSettings.categorySettings['api']) !== null && _b !== void 0 ? _b : config.debug_api) !== null && _c !== void 0 ? _c : false);
        this.setCategoryDebug('parameters', (_e = (_d = this._userDebugSettings.categorySettings['parameters']) !== null && _d !== void 0 ? _d : config.debug_parameters) !== null && _e !== void 0 ? _e : false);
        this.setCategoryDebug('websocket', (_g = (_f = this._userDebugSettings.categorySettings['websocket']) !== null && _f !== void 0 ? _f : config.debug_websocket) !== null && _g !== void 0 ? _g : false);
        this.setCategoryDebug('layouts', (_j = (_h = this._userDebugSettings.categorySettings['layouts']) !== null && _h !== void 0 ? _h : config.debug_layouts) !== null && _j !== void 0 ? _j : false);
        this.setCategoryDebug('rendering', (_l = (_k = this._userDebugSettings.categorySettings['rendering']) !== null && _k !== void 0 ? _k : config.debug_rendering) !== null && _l !== void 0 ? _l : false);
        this.setCategoryDebug('cache', (_o = (_m = this._userDebugSettings.categorySettings['cache']) !== null && _m !== void 0 ? _m : config.debug_cache) !== null && _o !== void 0 ? _o : false);
        this.setCategoryDebug('card', (_q = (_p = this._userDebugSettings.categorySettings['card']) !== null && _p !== void 0 ? _p : config.debug_card) !== null && _q !== void 0 ? _q : false);
        this.setCategoryDebug('diagnostics', (_s = (_r = this._userDebugSettings.categorySettings['diagnostics']) !== null && _r !== void 0 ? _r : config.debug_diagnostics) !== null && _s !== void 0 ? _s : false);
        // Process hierarchical debug settings if available, respecting user settings
        if (config.debug_hierarchical) {
            this.processHierarchicalConfig(config.debug_hierarchical);
        }
        // Log debug settings for diagnostics
        console.info(`Logger configuration: 
      Debug mode: ${this.debugMode} (controls debug UI view)
      Verbose mode: ${this.verboseMode} (logs everything when true)
      API: ${this.formatSystemStatus('api')}
      Parameters: ${this.formatSystemStatus('parameters')}
      WebSocket: ${this.formatSystemStatus('websocket')}
      Layouts: ${this.formatSystemStatus('layouts')}
      Rendering: ${this.formatSystemStatus('rendering')}
      Cache: ${this.formatSystemStatus('cache')}
      Card: ${this.formatSystemStatus('card')}
      Diagnostics: ${this.formatSystemStatus('diagnostics')}
    `);
    }
    /**
     * Process hierarchical debug configuration
     */
    processHierarchicalConfig(config) {
        if (!config)
            return;
        // Process each system
        for (const system in config) {
            if (this.debugCategories[system]) {
                const systemConfig = config[system];
                // If this is a boolean, set the whole system
                if (typeof systemConfig === 'boolean') {
                    this.setCategoryDebug(system, systemConfig);
                    continue;
                }
                // If it's an object, it might have subsystem settings
                if (typeof systemConfig === 'object') {
                    // First set the system enabled flag
                    if ('enabled' in systemConfig) {
                        this.setCategoryDebug(system, systemConfig.enabled);
                    }
                    // Then process subsystems
                    if (systemConfig.subsystems && typeof systemConfig.subsystems === 'object') {
                        for (const subsystem in systemConfig.subsystems) {
                            this.setSubsystemDebug(system, subsystem, !!systemConfig.subsystems[subsystem]);
                        }
                    }
                }
            }
        }
    }
    /**
     * Format system status for display
     */
    formatSystemStatus(system) {
        if (!this.debugCategories[system]) {
            return 'Not configured';
        }
        const enabled = this.debugCategories[system].enabled;
        if (!enabled) {
            return 'Disabled';
        }
        // Count enabled subsystems
        const subsystems = this.debugCategories[system].subsystems;
        const enabledSubsystems = Object.keys(subsystems).filter(s => subsystems[s]).join(', ');
        if (enabledSubsystems) {
            return `Enabled with subsystems: ${enabledSubsystems}`;
        }
        else {
            return 'Enabled (no subsystems)';
        }
    }
    /**
     * Set the log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Set debug for a category
     */
    setCategoryDebug(category, enabled) {
        if (!this.debugCategories[category])
            return;
        this.debugCategories[category].enabled = enabled;
        // Store this as a user setting to persist across config refreshes
        this._userDebugSettings.categorySettings[category] = enabled;
    }
    /**
     * Set debug for a specific subsystem
     */
    setSubsystemDebug(system, subsystem, enabled) {
        if (!this.debugCategories[system])
            return;
        if (!this.debugCategories[system].subsystems) {
            this.debugCategories[system].subsystems = {};
        }
        this.debugCategories[system].subsystems[subsystem] = enabled;
        // Store this as a user setting to persist across config refreshes
        if (!this._userDebugSettings.subsystemSettings[system]) {
            this._userDebugSettings.subsystemSettings[system] = {};
        }
        this._userDebugSettings.subsystemSettings[system][subsystem] = enabled;
    }
    /**
     * Check if a log message is a duplicate
     */
    isDuplicate(key) {
        const now = Date.now();
        // Check if we've seen this message recently
        const lastSeen = this._recentLogs.get(key);
        if (lastSeen) {
            // If it's within our time window, it's a duplicate
            if (now - lastSeen < this._dedupeTimeWindow) {
                return true;
            }
        }
        // Update the last seen time
        this._recentLogs.set(key, now);
        // Periodically clean up old entries (every 10 logs)
        if (this._logSequence % 10 === 0) {
            this.pruneRecentLogs();
        }
        return false;
    }
    /**
     * Remove expired entries from the recent logs map
     */
    pruneRecentLogs() {
        const now = Date.now();
        for (const [key, timestamp] of this._recentLogs.entries()) {
            if (now - timestamp > this._dedupeTimeWindow) {
                this._recentLogs.delete(key);
            }
        }
    }
    /**
     * Enhanced log method with support for hierarchical categories
     * Also maintains backward compatibility with previous API
     */
    log(component, message, options, ...restArgs) {
        // BACKWARD COMPATIBILITY HANDLING
        // If options is an error object or any non-object, treat it as a regular argument
        if (options && (options instanceof Error || typeof options !== 'object' || Array.isArray(options))) {
            restArgs = [options, ...restArgs];
            options = {}; // Convert to empty options object
        }
        const category = options && typeof options === 'object' ? options.category : undefined;
        const subsystem = options && typeof options === 'object' ? options.subsystem : undefined;
        const level = options && typeof options === 'object' ? options.level || 'debug' : 'debug';
        const performanceData = options && typeof options === 'object' ? options.performance : undefined;
        // Check if enabled based on hierarchy
        if (category && !this.isEnabled(category, subsystem)) {
            return;
        }
        // For backward compatibility: if no category provided, use main debug mode
        if (!category && !this.debugMode) {
            return;
        }
        // Check log level - using different logic to avoid type comparison errors
        if (this.logLevel === 'none')
            return;
        if (this.logLevel === 'error' && level !== 'error')
            return;
        if (this.logLevel === 'warn' && level !== 'error' && level !== 'warn')
            return;
        // Create a key for deduplication
        const logKey = `${component}:${category || 'main'}:${subsystem || ''}:${message}`;
        // Skip if duplicate
        if (this.isDuplicate(logKey)) {
            return;
        }
        // Add timestamp and sequence for chronological tracking
        const sequence = this.getNextSequence();
        const timestamp = Date.now();
        const timestampStr = timestamp.toString();
        // Format the component name with category if provided
        const formattedComponent = category
            ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`)
            : component;
        // Format for better visual grouping
        if (level === 'trace') {
            console.groupCollapsed(`[${timestampStr}][${sequence}][${formattedComponent}] ${message}`);
            // Log additional args
            if (restArgs.length > 0) {
                console.log(...restArgs);
            }
            // Add performance data if available
            if (performanceData) {
                const { startTime, duration } = performanceData;
                if (duration) {
                    console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`);
                }
                else if (startTime) {
                    console.log(`⏱️ Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
                }
            }
            console.groupEnd();
        }
        else {
            console.log(`🔍 [${timestampStr}][${sequence}][${formattedComponent}] ${message}`, ...restArgs);
            // Add performance data if available
            if (performanceData) {
                const { startTime, duration } = performanceData;
                if (duration) {
                    console.log(`⏱️ [${timestampStr}][${sequence}][${formattedComponent}] Duration: ${duration.toFixed(2)}ms`);
                }
                else if (startTime) {
                    console.log(`⏱️ [${timestampStr}][${sequence}][${formattedComponent}] Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
                }
            }
        }
    }
    /**
     * Log info messages
     * Maintains backward compatibility with previous API
     */
    info(component, message, ...args) {
        // Backward compatibility check
        const options = args.length > 0 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
        if (this.logLevel === 'none' || this.logLevel === 'error' || this.logLevel === 'warn')
            return;
        const category = options === null || options === void 0 ? void 0 : options.category;
        const subsystem = options === null || options === void 0 ? void 0 : options.subsystem;
        // Check if enabled based on hierarchy
        if (category && !this.isEnabled(category, subsystem)) {
            return;
        }
        const timestamp = (performance === null || performance === void 0 ? void 0 : performance.now().toFixed(2)) || Date.now();
        const sequence = this.getNextSequence();
        const formattedComponent = category
            ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`)
            : component;
        console.info(`ℹ️ [${timestamp}][${sequence}][${formattedComponent}] ${message}`, ...args);
        // Add performance data if available
        if (options === null || options === void 0 ? void 0 : options.performance) {
            const { startTime, duration } = options.performance;
            if (duration) {
                console.info(`⏱️ [${timestamp}][${sequence}][${formattedComponent}] Duration: ${duration.toFixed(2)}ms`);
            }
            else if (startTime) {
                console.info(`⏱️ [${timestamp}][${sequence}][${formattedComponent}] Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
            }
        }
    }
    /**
     * Log warning messages
     * Maintains backward compatibility with previous API
     */
    warn(component, message, ...args) {
        // Backward compatibility check
        const options = args.length > 0 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
        if (this.logLevel === 'none' || this.logLevel === 'error')
            return;
        const category = options === null || options === void 0 ? void 0 : options.category;
        const subsystem = options === null || options === void 0 ? void 0 : options.subsystem;
        // Always log warnings regardless of category settings
        const timestamp = (performance === null || performance === void 0 ? void 0 : performance.now().toFixed(2)) || Date.now();
        const sequence = this.getNextSequence();
        const formattedComponent = category
            ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`)
            : component;
        console.warn(`⚠️ [${timestamp}][${sequence}][${formattedComponent}] ${message}`, ...args);
    }
    /**
     * Log error messages
     * Maintains backward compatibility with previous API
     */
    error(component, message, ...args) {
        // Backward compatibility: if the first arg looks like an error object, use old style
        // Otherwise, treat first arg as options if it's an object
        const firstArg = args.length > 0 ? args[0] : undefined;
        const isFirstArgError = firstArg instanceof Error ||
            (firstArg && typeof firstArg === 'object' && 'stack' in firstArg) ||
            typeof firstArg === 'string';
        // Extract options if present and not an error
        const options = (!isFirstArgError && firstArg && typeof firstArg === 'object' && !Array.isArray(firstArg))
            ? args.shift()
            : {};
        if (this.logLevel === 'none')
            return;
        const category = options === null || options === void 0 ? void 0 : options.category;
        const subsystem = options === null || options === void 0 ? void 0 : options.subsystem;
        // Always log errors regardless of category settings
        const timestamp = (performance === null || performance === void 0 ? void 0 : performance.now().toFixed(2)) || Date.now();
        const sequence = this.getNextSequence();
        const formattedComponent = category
            ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`)
            : component;
        console.error(`❌ [${timestamp}][${sequence}][${formattedComponent}] ${message}`, ...args);
    }
    /**
     * Start performance measurement
     */
    startPerformance(label) {
        return Date.now();
    }
    /**
     * End performance measurement and log it
     */
    endPerformance(component, message, startTime, options) {
        const duration = Date.now() - startTime;
        this.log(component, message, Object.assign(Object.assign({}, options), { performance: { duration } }));
    }
    /**
     * Reset debug configuration
     */
    resetDebugConfig() {
        this.debugMode = false;
        this.logLevel = 'error';
        // Reset all categories
        for (const system in this.debugCategories) {
            this.debugCategories[system].enabled = false;
            // Reset all subsystems
            for (const subsystem in this.debugCategories[system].subsystems) {
                this.debugCategories[system].subsystems[subsystem] = false;
            }
        }
        // Clear deduplication tracking
        this._recentLogs.clear();
        console.info(`Logger debug settings reset - all logging disabled`);
    }
    /**
     * Set the enabled state for a specific logging category (legacy method)
     */
    setEnabled(category, enabled) {
        this.setCategoryDebug(category, enabled);
    }
    /**
     * Get all systems with their status
     */
    getSystemsStatus() {
        const result = {};
        for (const system in this.debugCategories) {
            const systemConfig = this.debugCategories[system];
            result[system] = {
                enabled: systemConfig.enabled,
                subsystems: Object.assign({}, systemConfig.subsystems)
            };
        }
        return result;
    }
    /**
     * Get all subsystems for a system
     */
    getSubsystems(system) {
        if (!this.debugCategories[system]) {
            return [];
        }
        return Object.keys(this.debugCategories[system].subsystems);
    }
    /**
     * For backward compatibility
     */
    isCategoryEnabled(category) {
        return this.isEnabled(category);
    }
}
//# sourceMappingURL=logger.legacy.js.map