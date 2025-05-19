/**
 * Default TTL values for different types of cache entries
 */
export declare const DEFAULT_TTL: {
    ENTITY_DATA: number;
    PARAMETER: number;
    RENDER_DEDUP: number;
    WS_DEDUP: number;
    CONDITION: number;
    FALLBACK: number;
};
/**
 * Cache entry categories for better management
 */
export declare enum CacheCategory {
    ENTITY = "entity",
    PARAMETER = "parameter",
    RENDER = "render",
    WEBSOCKET = "websocket",
    CONDITION = "condition",
    GENERAL = "general"
}
/**
 * Enhanced cache service with TTL support, category management,
 * and better cache coordination between services
 */
export declare class CacheService {
    private static instance;
    private cache;
    private logger;
    private _fallbackValues;
    private _missCallbacks;
    private _pruneIntervalId;
    private _isDestroyed;
    private _useRedux;
    private constructor();
    /**
     * Start the prune interval timer
     * This is separated to allow better control over timer creation
     */
    private _startPruneInterval;
    static getInstance(): CacheService;
    /**
     * Set a value in the cache with TTL
     * @param key Cache key
     * @param value Value to cache
     * @param ttlMs Time to live in milliseconds
     * @param category Optional category for better organization
     */
    set(key: string, value: any, ttlMs?: number, category?: CacheCategory): void;
    /**
     * Get a value from the cache with fallback support
     * @param key Cache key
     * @param useFallback Whether to use fallback value if available
     * @returns Cached value or undefined if not found or expired
     */
    get<T>(key: string, useFallback?: boolean): T | undefined;
    /**
     * Handle cache miss by calling registered callback if exists
     */
    private _handleCacheMiss;
    /**
     * Register a callback for cache miss handling
     * @param keyPattern Key pattern to match (exact key or prefix with *)
     * @param callback Function to execute on cache miss
     */
    registerMissCallback(keyPattern: string, callback: () => Promise<any>): void;
    /**
     * Set a fallback value that will be used when cache misses
     * @param key Cache key
     * @param value Fallback value
     */
    setFallback(key: string, value: any): void;
    /**
     * Check if a key exists in the cache and is not expired
     * @param key Cache key
     * @returns True if valid cache entry exists
     */
    has(key: string): boolean;
    /**
     * Update TTL for an existing cache entry without changing the value
     * @param key Cache key
     * @param ttlMs New TTL in milliseconds
     * @returns True if entry was found and updated
     */
    updateTTL(key: string, ttlMs: number): boolean;
    /**
     * Refresh an entity cache entry with new TTL
     * @param entityId Entity ID to refresh
     * @returns True if entry was found and refreshed
     */
    refreshEntityCache(entityId: string): boolean;
    /**
     * Delete a key from the cache
     * @param key Cache key
     */
    delete(key: string): void;
    /**
     * Clear all expired entries from the cache
     */
    prune(): void;
    /**
     * Clear the entire cache
     */
    clear(): void;
    /**
     * Get statistics about the cache
     */
    getStats(): {
        size: number;
        expired: number;
        byCategory: Record<string, number>;
        fallbackCount: number;
    };
    /**
     * Get all keys in the cache
     */
    getKeys(): string[];
    /**
     * Clear cache entries by pattern
     * @param pattern String pattern to match against keys
     * @returns Number of entries cleared
     */
    clearPattern(pattern: string): number;
    /**
     * Clear all entity data cache entries
     */
    clearEntityCache(): number;
    /**
     * Clear all condition cache entries
     */
    clearConditionCache(): number;
    /**
     * Clear all render deduplication entries
     */
    clearRenderCache(): number;
    /**
     * Clear all websocket deduplication entries
     */
    clearWebSocketCache(): number;
    /**
     * Clean up resources used by the cache service
     */
    destroy(): void;
}
export {};
