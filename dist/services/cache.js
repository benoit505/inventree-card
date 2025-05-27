import { Logger } from '../utils/logger';
import { trackUsage } from '../utils/metrics-tracker';
import { store } from '../store'; // Import Redux store
import { selectApiCacheLifetimeMs } from '../store/slices/apiSlice'; // Import selector
/**
 * Default TTL values for different types of cache entries
 */
export const DEFAULT_TTL = {
    ENTITY_DATA: 30000, // 30 seconds for entity data
    PARAMETER: 60000, // 1 minute for parameters
    RENDER_DEDUP: 300, // 300ms for render deduplication
    WS_DEDUP: 500, // 500ms for websocket deduplication
    CONDITION: 2000, // 2 seconds for condition evaluations
    FALLBACK: 60000 // 1 minute default
};
/**
 * Cache entry categories for better management
 */
export var CacheCategory;
(function (CacheCategory) {
    CacheCategory["ENTITY"] = "entity";
    CacheCategory["PARAMETER"] = "parameter";
    CacheCategory["RENDER"] = "render";
    CacheCategory["WEBSOCKET"] = "websocket";
    CacheCategory["CONDITION"] = "condition";
    CacheCategory["GENERAL"] = "general";
})(CacheCategory || (CacheCategory = {}));
/**
 * Enhanced cache service with TTL support, category management,
 * and better cache coordination between services
 */
export class CacheService {
    // Private constructor for singleton
    constructor() {
        this.cache = new Map();
        this._fallbackValues = new Map();
        this._missCallbacks = new Map();
        this._pruneIntervalId = null;
        this._isDestroyed = false;
        this._useRedux = true;
        this.logger = Logger.getInstance();
        try {
            // Assume Redux timer management is always enabled now
            this._useRedux = true;
            this.logger.log('CacheService', 'CacheService instance created');
            // Track initialization in metrics
            trackUsage('cache', 'initialize', {
                source: this._useRedux ? 'redux' : 'legacy'
            });
        }
        catch (error) {
            // Fallback initialization if feature flags are not available
            this._useRedux = false;
            this.logger.error('Cache', 'Error during feature flag check, using fallback timer implementation', {
                category: 'cache',
                subsystem: 'errors',
                error
            });
        }
        // Schedule regular pruning using standard setInterval
        this._startPruneInterval();
    }
    /**
     * Start the prune interval timer
     * This is separated to allow better control over timer creation
     */
    _startPruneInterval() {
        if (this._isDestroyed) {
            return;
        }
        // Don't create a new timer if one already exists
        if (this._pruneIntervalId !== null) {
            return;
        }
        try {
            // Track usage of timer in metrics
            trackUsage('cache', 'startPruneInterval', {
                source: this._useRedux ? 'redux' : 'legacy'
            });
            this._pruneIntervalId = setInterval(() => {
                if (!this._isDestroyed) {
                    this.prune();
                }
            }, 60000); // Check every minute
            this.logger.log('Cache', 'Prune interval started', {
                category: 'cache',
                subsystem: this._useRedux ? 'redux' : 'legacy'
            });
        }
        catch (error) {
            this.logger.error('Cache', `Failed to start prune interval: ${error}`, {
                category: 'cache',
                subsystem: 'errors'
            });
            // Attempt to use native setTimeout as fallback
            if (!this._pruneIntervalId) {
                try {
                    this._pruneIntervalId = setTimeout(() => {
                        if (!this._isDestroyed) {
                            this.prune();
                        }
                    }, 60000);
                    this.logger.log('Cache', 'Prune interval started with fallback timer', {
                        category: 'cache'
                    });
                }
                catch (fallbackError) {
                    this.logger.error('Cache', `Failed to start fallback prune interval: ${fallbackError}`, {
                        category: 'cache',
                        subsystem: 'errors'
                    });
                }
            }
        }
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    /**
     * Set a value in the cache with TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttlMs Time to live in milliseconds
     * @param category Optional category for better organization
     */
    set(key, value, ttlMs, category = CacheCategory.GENERAL) {
        if (this._isDestroyed)
            return;
        trackUsage('cache', 'set', {
            category,
            source: this._useRedux ? 'redux' : 'legacy'
        });
        let effectiveTtlMs = ttlMs;
        if (effectiveTtlMs === undefined) { // If no specific TTL is provided by the caller
            if (category === CacheCategory.ENTITY || category === CacheCategory.PARAMETER) {
                const configuredCacheLifetimeMs = selectApiCacheLifetimeMs(store.getState());
                if (configuredCacheLifetimeMs > 0) {
                    effectiveTtlMs = configuredCacheLifetimeMs;
                    this.logger.log('Cache', `Using configured API cache lifetime for ${key}: ${effectiveTtlMs}ms`, { category: 'cache', subsystem: category });
                }
                else {
                    // Fallback to category-specific defaults if store value is 0 or not sensible
                    effectiveTtlMs = (category === CacheCategory.ENTITY) ? DEFAULT_TTL.ENTITY_DATA : DEFAULT_TTL.PARAMETER;
                    this.logger.log('Cache', `Using default API cache lifetime for ${key}: ${effectiveTtlMs}ms (configured was ${configuredCacheLifetimeMs}ms)`, { category: 'cache', subsystem: category });
                }
            }
            else {
                // For non-API categories, use existing key-prefix based guessing or general fallback
                if (key.startsWith('render:')) {
                    effectiveTtlMs = DEFAULT_TTL.RENDER_DEDUP;
                }
                else if (key.startsWith('ws-') || key.startsWith('websocket:')) { // Added websocket: prefix
                    effectiveTtlMs = DEFAULT_TTL.WS_DEDUP;
                }
                else if (key.startsWith('condition:')) {
                    effectiveTtlMs = DEFAULT_TTL.CONDITION;
                }
                else {
                    effectiveTtlMs = DEFAULT_TTL.FALLBACK;
                }
            }
        }
        else if (ttlMs === DEFAULT_TTL.FALLBACK && (category === CacheCategory.ENTITY || category === CacheCategory.PARAMETER)) {
            // If TTL was explicitly passed as DEFAULT_TTL.FALLBACK for an API category, also try to use configured value
            // This handles cases where old code might pass DEFAULT_TTL.FALLBACK explicitly for API items
            const configuredCacheLifetimeMs = selectApiCacheLifetimeMs(store.getState());
            if (configuredCacheLifetimeMs > 0) {
                effectiveTtlMs = configuredCacheLifetimeMs;
            }
            // else it remains DEFAULT_TTL.FALLBACK as passed
        }
        // Ensure a valid TTL is always used
        if (typeof effectiveTtlMs !== 'number' || effectiveTtlMs <= 0) {
            this.logger.warn('Cache', `Invalid or zero TTL determined for key ${key}. Using fallback TTL: ${DEFAULT_TTL.FALLBACK}ms`, { category: 'cache', subsystem: category, determinedTtl: effectiveTtlMs });
            effectiveTtlMs = DEFAULT_TTL.FALLBACK;
        }
        this.cache.set(key, { value, timestamp: Date.now(), ttl: effectiveTtlMs, category });
        this.logger.log('Cache', `Set ${key}, expires in ${effectiveTtlMs}ms`, { category: 'cache', subsystem: category });
    }
    /**
     * Get a value from the cache with fallback support
     * @param key Cache key
     * @param useFallback Whether to use fallback value if available
     * @returns Cached value or undefined if not found or expired
     */
    get(key, useFallback = true) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.logger.log('Cache', `Miss: ${key} (not found)`, { category: 'cache' });
            // Try to reload from cache miss callback
            this._handleCacheMiss(key);
            // Return fallback if available and requested
            if (useFallback && this._fallbackValues.has(key)) {
                const fallbackValue = this._fallbackValues.get(key);
                this.logger.log('Cache', `Using fallback for ${key}`, { category: 'cache' });
                return fallbackValue;
            }
            return undefined;
        }
        // Check if expired
        if (entry.timestamp + entry.ttl < Date.now()) {
            this.cache.delete(key);
            this.logger.log('Cache', `Miss: ${key} (expired)`, { category: 'cache', subsystem: entry.category });
            // Try to reload from cache miss callback
            this._handleCacheMiss(key);
            // Return fallback if available and requested
            if (useFallback && this._fallbackValues.has(key)) {
                const fallbackValue = this._fallbackValues.get(key);
                this.logger.log('Cache', `Using fallback for ${key} (expired)`, { category: 'cache' });
                return fallbackValue;
            }
            return undefined;
        }
        // Update fallback value with fresh data
        if (useFallback) {
            this._fallbackValues.set(key, entry.value);
        }
        this.logger.log('Cache', `Hit: ${key}`, { category: 'cache', subsystem: entry.category });
        return entry.value;
    }
    /**
     * Handle cache miss by calling registered callback if exists
     */
    _handleCacheMiss(key) {
        if (this._missCallbacks.has(key)) {
            const callback = this._missCallbacks.get(key);
            if (callback) {
                this.logger.log('Cache', `Executing miss callback for ${key}`, { category: 'cache' });
                // Execute callback and update cache
                callback().then(value => {
                    if (value !== undefined) {
                        // Determine appropriate TTL based on key pattern
                        let ttl = DEFAULT_TTL.FALLBACK;
                        if (key.startsWith('entity-data:'))
                            ttl = DEFAULT_TTL.ENTITY_DATA;
                        this.set(key, value, ttl);
                        this.logger.log('Cache', `Miss callback successfully updated ${key}`, { category: 'cache' });
                    }
                }).catch(error => {
                    this.logger.error('Cache', `Error in miss callback for ${key}: ${error}`, { category: 'cache' });
                });
            }
        }
    }
    /**
     * Register a callback for cache miss handling
     * @param keyPattern Key pattern to match (exact key or prefix with *)
     * @param callback Function to execute on cache miss
     */
    registerMissCallback(keyPattern, callback) {
        this._missCallbacks.set(keyPattern, callback);
        this.logger.log('Cache', `Registered miss callback for ${keyPattern}`, { category: 'cache' });
    }
    /**
     * Set a fallback value that will be used when cache misses
     * @param key Cache key
     * @param value Fallback value
     */
    setFallback(key, value) {
        this._fallbackValues.set(key, value);
        this.logger.log('Cache', `Set fallback value for ${key}`, { category: 'cache' });
    }
    /**
     * Check if a key exists in the cache and is not expired
     * @param key Cache key
     * @returns True if valid cache entry exists
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        // Check if expired
        if (entry.timestamp + entry.ttl < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Update TTL for an existing cache entry without changing the value
     * @param key Cache key
     * @param ttlMs New TTL in milliseconds
     * @returns True if entry was found and updated
     */
    updateTTL(key, ttlMs) {
        if (this._isDestroyed)
            return false;
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        const expires = Date.now() + ttlMs;
        this.cache.set(key, Object.assign(Object.assign({}, entry), { ttl: ttlMs }));
        this.logger.log('Cache', `Updated TTL for ${key}, new expiry in ${ttlMs}ms`, { category: 'cache' });
        return true;
    }
    /**
     * Refresh an entity cache entry with new TTL
     * @param entityId Entity ID to refresh
     * @returns True if entry was found and refreshed
     */
    refreshEntityCache(entityId) {
        const key = `entity-data:${entityId}`;
        return this.updateTTL(key, DEFAULT_TTL.ENTITY_DATA);
    }
    /**
     * Delete a key from the cache
     * @param key Cache key
     */
    delete(key) {
        const entry = this.cache.get(key);
        this.cache.delete(key);
        if (entry) {
            this.logger.log('Cache', `Deleted ${key}`, { category: 'cache', subsystem: entry.category });
        }
        else {
            this.logger.log('Cache', `Attempted to delete non-existent key: ${key}`, { category: 'cache' });
        }
    }
    /**
     * Clear all expired entries from the cache
     */
    prune() {
        const now = Date.now();
        let pruned = 0;
        const categoryCount = {};
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp + entry.ttl < now) {
                this.cache.delete(key);
                pruned++;
                // Track count by category
                const category = entry.category || CacheCategory.GENERAL;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        }
        if (pruned > 0) {
            const categoryDetails = Object.entries(categoryCount)
                .map(([cat, count]) => `${cat}: ${count}`)
                .join(', ');
            this.logger.log('Cache', `Pruned ${pruned} expired entries (${categoryDetails})`, { category: 'cache' });
        }
    }
    /**
     * Clear the entire cache
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this._fallbackValues.clear();
        this.logger.log('Cache', `Cleared ${size} entries`, { category: 'cache' });
    }
    /**
     * Get statistics about the cache
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        const byCategory = {};
        for (const [key, entry] of this.cache.entries()) {
            // Count by category
            const category = entry.category || CacheCategory.GENERAL;
            byCategory[category] = (byCategory[category] || 0) + 1;
            // Count expired
            if (entry.timestamp + entry.ttl < now) {
                expired++;
            }
        }
        return {
            size: this.cache.size,
            expired,
            byCategory,
            fallbackCount: this._fallbackValues.size
        };
    }
    /**
     * Get all keys in the cache
     */
    getKeys() {
        return Array.from(this.cache.keys());
    }
    /**
     * Clear cache entries by pattern
     * @param pattern String pattern to match against keys
     * @returns Number of entries cleared
     */
    clearPattern(pattern) {
        let count = 0;
        const keysToDelete = [];
        // First build a list of keys to delete
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
                count++;
            }
        }
        // Then delete them
        for (const key of keysToDelete) {
            const entry = this.cache.get(key);
            this.cache.delete(key);
            if (entry) {
                this.logger.log('Cache', `Deleted ${key} by pattern match`, {
                    category: 'cache',
                    subsystem: entry.category
                });
            }
        }
        this.logger.log('Cache', `Cleared ${count} entries matching pattern: ${pattern}`, { category: 'cache' });
        return count;
    }
    /**
     * Clear all entity data cache entries
     */
    clearEntityCache() {
        return this.clearPattern('entity-data:');
    }
    /**
     * Clear all condition cache entries
     */
    clearConditionCache() {
        return this.clearPattern('condition:');
    }
    /**
     * Clear all render deduplication entries
     */
    clearRenderCache() {
        return this.clearPattern('render:');
    }
    /**
     * Clear all websocket deduplication entries
     */
    clearWebSocketCache() {
        const count1 = this.clearPattern('ws-');
        const count2 = this.clearPattern('websocket:');
        return count1 + count2;
    }
    /**
     * Clean up resources used by the cache service
     */
    destroy() {
        this._isDestroyed = true;
        // Track cache service destruction
        trackUsage('cache', 'destroy', {
            source: this._useRedux ? 'redux' : 'legacy'
        });
        // Clean up all timers
        if (this._pruneIntervalId !== null) {
            try {
                clearInterval(this._pruneIntervalId);
            }
            catch (error) {
                this.logger.error('Cache', `Error clearing prune interval: ${error}`, {
                    category: 'cache',
                    subsystem: 'errors'
                });
            }
            this._pruneIntervalId = null;
        }
        // Clear cache data
        this.clear();
        this.logger.log('Cache', 'Cache service destroyed and resources released', {
            category: 'cache',
            subsystem: this._useRedux ? 'redux' : 'legacy'
        });
    }
}
//# sourceMappingURL=cache.js.map