import { HomeAssistant } from "custom-card-helpers";
/**
 * DEPRECATED: WebSocketService is now a compatibility layer that delegates to ParameterService
 * This class will be removed in a future version
 */
export declare class WebSocketService {
    private static instance;
    private _hass;
    private _entityCallbacks;
    private _logger;
    private _subscriptions;
    private _lastHassUpdate;
    private readonly HASS_UPDATE_DEBOUNCE;
    /**
     * Get the singleton instance
     */
    static getInstance(): WebSocketService;
    /**
     * Private constructor for singleton
     */
    private constructor();
    /**
     * Set the HASS object
     */
    setHass(hass: HomeAssistant): void;
    /**
     * Process entities from HASS update
     */
    private _processHassEntities;
    /**
     * Subscribe to changes for a specific entity
     */
    subscribeToEntity(entityId: string, callback: () => void): () => void;
    /**
     * Get diagnostic information about the service
     */
    getDiagnostics(): any;
    /**
     * Check if the websocket is connected
     */
    isConnected(): boolean;
    /**
     * Get the current connection status
     */
    getConnectionStatus(): {
        isConnected: boolean;
        isDeprecated: boolean;
    };
    /**
     * Get the status of the API connection
     */
    getApiStatus(): {
        failureCount: number;
        usingFallback: boolean;
        recentSuccess: boolean;
    };
    /**
     * Clean up resources
     */
    destroy(): void;
}
