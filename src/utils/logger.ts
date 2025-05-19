export class Logger {
  private static instance: Logger;
  private debugMode: boolean = false;
  private verboseMode: boolean = false; // New flag to control verbose output
  private logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug' = 'error';
  
  // Define hierarchical debug categories structure
  private debugCategories: {
    [system: string]: {
      enabled: boolean;
      subsystems: { [subsystem: string]: boolean };
    };
  } = {
    api: { 
      enabled: false, 
      subsystems: { 
        calls: false,       // UI: Calls (was 'requests')
        responses: false,   // UI: Responses
        errors: false,      // UI: Errors
        fallbacks: false,   // Keeping for backward compatibility
        throttling: false   // Keeping for backward compatibility
      }
    },
    parameters: { 
      enabled: false, 
      subsystems: { 
        updates: false,     // UI: Updates
        conditions: false,  // UI: Conditions
        filtering: false,   // UI: Filtering
        actions: false      // UI: Actions
      }
    },
    websocket: { 
      enabled: false, 
      subsystems: { 
        connection: false,  // UI: Connection
        messages: false,    // UI: Messages
        events: false,      // UI: Events
        plugin: false,      // UI: Plugin
        subscriptions: false, // Keeping for backward compatibility
        authentication: false  // Keeping for backward compatibility
      }
    },
    redux: {
      enabled: false,
      subsystems: {
        actions: false,     // UI: Actions
        state: false,       // UI: State
        components: false,  // UI: Components
        middleware: false,  // UI: Middleware
        dispatch: false,    // UI: Dispatch
        sync: false,        // UI: Sync
        parameters: false,  // UI: Parameters
        migration: false    // UI: Migration
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
        updates: false,     // UI: Updates
        performance: false, // UI: Performance
        cycle: false,       // Keeping for backward compatibility
        debounce: false     // Keeping for backward compatibility
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
  private _logSequence: number = 0;
  
  // Add deduplication tracking
  private _recentLogs: Map<string, number> = new Map();
  private _dedupeTimeWindow: number = 2000; // 2 seconds
  private _maxDuplicatesPerWindow: number = 1; // Only show a duplicate message once per time window
  private _cache: any; // Will be initialized lazily

  private constructor() {
    // Lazy load the cache service to avoid circular dependencies
    setTimeout(() => {
      try {
        // Now it's safe to dynamically import the CacheService
        import("../services/cache").then(module => {
          this._cache = module.CacheService.getInstance();
          console.info('Logger: Successfully initialized CacheService after delay');
        });
      } catch (e) {
        console.warn('Logger: Could not initialize CacheService, using built-in deduplication');
      }
    }, 100);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Check if debug is enabled for a specific system and optional subsystem
   */
  public isEnabled(system: string, subsystem?: string): boolean {
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
    return this.debugCategories[system].subsystems?.[subsystem] === true;
  }

  /**
   * Check if any category is enabled
   */
  private anyCategoryEnabled(): boolean {
    return Object.keys(this.debugCategories).some(system => 
      this.debugCategories[system].enabled
    );
  }

  /**
   * Get the next sequence number for logs
   */
  private getNextSequence(): number {
    return ++this._logSequence;
  }

  /**
   * Set main debug mode - this enables the debug UI without enabling all logs
   */
  public setDebug(debug: boolean): void {
    this.debugMode = debug;
    
    // Only set logLevel to debug if debug is true
    if (debug) {
      this.logLevel = 'debug';
    } else {
      this.logLevel = 'error';
      this.verboseMode = false; // Turn off verbose mode when debug is disabled
    }
    console.info(`Logger debug mode ${debug ? 'ENABLED' : 'DISABLED'}`);
  }
  
  /**
   * Set verbose mode - this enables ALL logs regardless of category settings
   */
  public setVerboseMode(verbose: boolean): void {
    // Verbose mode requires debug mode to be on
    if (verbose && !this.debugMode) {
      this.setDebug(true);
    }
    this.verboseMode = verbose;
    
    console.info(`Logger verbose mode ${verbose ? 'ENABLED - ALL categories will log' : 'DISABLED - only selected categories will log'}`);
  }
  
  /**
   * Configure debug settings from the card config
   */
  public setDebugConfig(config: any): void {
    if (!config) return;
    
    this.setDebug(config.debug || false);
    this.setVerboseMode(config.debug_verbose || false);
    
    // Process hierarchical config if available
    if (config.debug_hierarchical) {
      this.processHierarchicalConfig(config.debug_hierarchical);
    } else {
      // Fallback to individual flags if hierarchical is not present
      this.setCategoryDebug('api', config.debug_api ?? false);
      this.setCategoryDebug('parameters', config.debug_parameters ?? false);
      this.setCategoryDebug('websocket', config.debug_websocket ?? false);
      this.setCategoryDebug('layouts', config.debug_layouts ?? false);
      this.setCategoryDebug('rendering', config.debug_rendering ?? false);
      this.setCategoryDebug('cache', config.debug_cache ?? false);
      this.setCategoryDebug('card', config.debug_card ?? false);
      this.setCategoryDebug('diagnostics', config.debug_diagnostics ?? false);
    }
    
    this.logConfigStatus();
  }

  /**
   * Process hierarchical debug configuration
   */
  private processHierarchicalConfig(hierarchicalConfig: any): void {
    for (const system in this.debugCategories) {
      const systemConfig = hierarchicalConfig[system];
      if (systemConfig) {
        this.setCategoryDebug(system, systemConfig.enabled ?? false);
        if (systemConfig.subsystems) {
          for (const subsystem in systemConfig.subsystems) {
            this.setSubsystemDebug(system, subsystem, systemConfig.subsystems[subsystem] ?? false);
          }
        }
      } else {
        // If system not in hierarchical config, default to false
        this.setCategoryDebug(system, false);
      }
    }
  }

  /**
   * Format system status for display
   */
  private formatSystemStatus(system: string): string {
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
    } else {
      return 'Enabled (no subsystems)';
    }
  }

  /**
   * Set the log level
   */
  public setLogLevel(level: 'none' | 'error' | 'warn' | 'info' | 'debug'): void {
    this.logLevel = level;
  }

  /**
   * Set debug for a category
   */
  public setCategoryDebug(category: string, enabled: boolean): void {
    if (this.debugCategories[category]) {
      this.debugCategories[category].enabled = enabled;
    } else {
      console.warn(`Logger: Unknown debug category '${category}'`);
    }
  }

  /**
   * Set debug for a specific subsystem
   */
  public setSubsystemDebug(system: string, subsystem: string, enabled: boolean): void {
    if (this.debugCategories[system] && this.debugCategories[system].subsystems.hasOwnProperty(subsystem)) {
      this.debugCategories[system].subsystems[subsystem] = enabled;
    } else {
      console.warn(`Logger: Unknown debug subsystem '${subsystem}' for system '${system}'`);
    }
  }

  /**
   * Check if a log message is a duplicate
   */
  private isDuplicate(key: string): boolean {
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
  private pruneRecentLogs(): void {
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
  public log(component: string, message: string, options?: any, ...restArgs: any[]): void {
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
    if (this.logLevel === 'none') return;
    if (this.logLevel === 'error' && level !== 'error') return;
    if (this.logLevel === 'warn' && level !== 'error' && level !== 'warn') return;
    
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
        } else if (startTime) {
          console.log(`⏱️ Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
        }
      }
      
      console.groupEnd();
    } else {
      console.log(`🔍 [${timestampStr}][${sequence}][${formattedComponent}] ${message}`, ...restArgs);
      
      // Add performance data if available
      if (performanceData) {
        const { startTime, duration } = performanceData;
        if (duration) {
          console.log(`⏱️ [${timestampStr}][${sequence}][${formattedComponent}] Duration: ${duration.toFixed(2)}ms`);
        } else if (startTime) {
          console.log(`⏱️ [${timestampStr}][${sequence}][${formattedComponent}] Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
        }
      }
    }
  }

  /**
   * Log info messages
   * Maintains backward compatibility with previous API
   */
  public info(component: string, message: string, ...args: any[]): void {
    // Backward compatibility check
    const options = args.length > 0 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
    
    if (this.logLevel === 'none' || this.logLevel === 'error' || this.logLevel === 'warn') return;
    
    const category = options?.category;
    const subsystem = options?.subsystem;
    
    // Check if enabled based on hierarchy
    if (category && !this.isEnabled(category, subsystem)) {
      return;
    }
    
    const timestamp = performance?.now().toFixed(2) || Date.now();
    const sequence = this.getNextSequence();
    
    const formattedComponent = category 
      ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`) 
      : component;
    
    console.info(`ℹ️ [${timestamp}][${sequence}][${formattedComponent}] ${message}`, ...args);
    
    // Add performance data if available
    if (options?.performance) {
      const { startTime, duration } = options.performance;
      if (duration) {
        console.info(`⏱️ [${timestamp}][${sequence}][${formattedComponent}] Duration: ${duration.toFixed(2)}ms`);
      } else if (startTime) {
        console.info(`⏱️ [${timestamp}][${sequence}][${formattedComponent}] Elapsed: ${(Date.now() - startTime).toFixed(2)}ms`);
      }
    }
  }

  /**
   * Log warning messages
   * Maintains backward compatibility with previous API
   */
  public warn(component: string, message: string, ...args: any[]): void {
    // Backward compatibility check
    const options = args.length > 0 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args.shift() : {};
    
    if (this.logLevel === 'none' || this.logLevel === 'error') return;
    
    const category = options?.category;
    const subsystem = options?.subsystem;
    
    // Always log warnings regardless of category settings
    const timestamp = performance?.now().toFixed(2) || Date.now();
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
  public error(component: string, message: string, ...args: any[]): void {
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
    
    if (this.logLevel === 'none') return;
    
    const category = options?.category;
    const subsystem = options?.subsystem;
    
    // Always log errors regardless of category settings
    const timestamp = performance?.now().toFixed(2) || Date.now();
    const sequence = this.getNextSequence();
    
    const formattedComponent = category 
      ? (subsystem ? `${component}:${category}:${subsystem}` : `${component}:${category}`) 
      : component;
    
    console.error(`❌ [${timestamp}][${sequence}][${formattedComponent}] ${message}`, ...args);
  }

  /**
   * Start performance measurement
   */
  public startPerformance(label: string): number {
    return Date.now();
  }

  /**
   * End performance measurement and log it
   */
  public endPerformance(component: string, message: string, startTime: number, options?: { 
    category?: string, 
    subsystem?: string 
  }): void {
    const duration = Date.now() - startTime;
    this.log(component, message, {
      ...options,
      performance: { duration }
    });
  }

  /**
   * Reset debug configuration
   */
  public resetDebugConfig(): void {
    console.log('Resetting logger config to defaults');
    this.debugMode = false;
    this.verboseMode = false;
    this.logLevel = 'error';
    
    // Reset all categories and subsystems to false
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
  public setEnabled(category: string, enabled: boolean): void {
    this.setCategoryDebug(category, enabled);
  }

  /**
   * Get all systems with their status
   */
  public getSystemsStatus(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const system in this.debugCategories) {
      const systemConfig = this.debugCategories[system];
      
      result[system] = {
        enabled: systemConfig.enabled,
        subsystems: { ...systemConfig.subsystems }
      };
    }
    
    return result;
  }

  /**
   * Get all subsystems for a system
   */
  public getSubsystems(system: string): string[] {
    if (!this.debugCategories[system]) {
      return [];
    }
    
    return Object.keys(this.debugCategories[system].subsystems);
  }

  /**
   * For backward compatibility
   */
  public isCategoryEnabled(category: string): boolean {
    return this.isEnabled(category);
  }

  // Add this method to log the final config status
  private logConfigStatus(): void {
    console.log('Logger configuration:');
    console.log(`      Debug mode: ${this.debugMode} (controls debug UI view)`);
    console.log(`      Verbose mode: ${this.verboseMode} (logs everything when true)`);
    for (const system in this.debugCategories) {
      const systemEnabled = this.debugCategories[system].enabled;
      console.log(`      ${system.charAt(0).toUpperCase() + system.slice(1)}: ${systemEnabled ? 'Enabled' : 'Disabled'}`);
      if (systemEnabled && !this.verboseMode) { // Only show subsystems if system is enabled and not in verbose
        for (const subsystem in this.debugCategories[system].subsystems) {
          const subEnabled = this.debugCategories[system].subsystems[subsystem];
          console.log(`        - ${subsystem}: ${subEnabled ? 'Enabled' : 'Disabled'}`);
        }
      }
    }
  }
}