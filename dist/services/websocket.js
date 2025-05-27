import { Logger } from "../utils/logger";
import { trackUsage } from "../utils/metrics-tracker";
/**
 * DEPRECATED: WebSocketService is now a compatibility layer that delegates to ParameterService
 * This class will be removed in a future version
 */
export class WebSocketService {
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    /**
     * Private constructor for singleton
     */
    constructor() {
        this._hass = null;
        this._entityCallbacks = new Map();
        this._subscriptions = new Map();
        this._lastHassUpdate = 0;
        this.HASS_UPDATE_DEBOUNCE = 5000; // 5 seconds
        this._logger = Logger.getInstance();
        this._logger.log('WebSocketService', '✅ WebSocketService instance created');
    }
    /**
     * Set the HASS object
     */
    setHass(hass) {
        if (!hass) {
            this._logger.warn('WebSocket', 'HASS object is null');
            return;
        }
        if (this._hass) {
            this._logger.warn('WebSocket', 'HASS object already set');
            return;
        }
        this._hass = hass;
        this._logger.log('WebSocket', 'HASS object set', { category: 'websocket', subsystem: 'hass' });
        // Remove call to _subscribeToHassTopic for now
        /*
        this._subscriptions.forEach((_, topic) => {
          this._subscribeToHassTopic(topic);
        });
        */
    }
    /**
     * Process entities from HASS update
     */
    _processHassEntities(states) {
        const now = Date.now();
        if (now - this._lastHassUpdate < this.HASS_UPDATE_DEBOUNCE) {
            this._logger.log('WebSocket', 'Debouncing HASS state update', { category: 'websocket', subsystem: 'hass' });
            return;
        }
        this._lastHassUpdate = now;
        this._logger.log('WebSocket', 'Processing HASS state update', { category: 'websocket', subsystem: 'hass' });
        // Remove call to _extractParameters for now
        /*
        const parameters = this._extractParameters(states);
        if (parameters.length > 0) {
          this.logger.log('WebSocket', `Extracted ${parameters.length} parameters ...`, { ... });
        }
        */
        // Remove call to _notifyEntityCallbacks for now
        /*
        this._notifyEntityCallbacks(Object.keys(states));
        */
    }
    /**
     * Subscribe to changes for a specific entity
     */
    subscribeToEntity(entityId, callback) {
        this._logger.log('WebSocket', `Subscribing to entity: ${entityId}`, { category: 'websocket', subsystem: 'entities' });
        if (!this._entityCallbacks.has(entityId)) {
            this._entityCallbacks.set(entityId, []);
        }
        this._entityCallbacks.get(entityId).push(callback);
        // Trigger initial callback if HASS state exists
        if (this._hass && this._hass.states[entityId]) {
            callback();
        }
        return () => {
            if (this._entityCallbacks.has(entityId)) {
                const callbacks = this._entityCallbacks.get(entityId);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
                if (callbacks.length === 0) {
                    this._entityCallbacks.delete(entityId);
                }
            }
        };
    }
    /**
     * Get diagnostic information about the service
     */
    getDiagnostics() {
        return {
            trackedEntities: Array.from(this._entityCallbacks.keys()),
            entityCallbacksCount: Array.from(this._entityCallbacks.entries()).map(([key, callbacks]) => ({
                entity: key,
                callbackCount: callbacks.length
            })),
            isConnected: this.isConnected(),
            healthCheckActive: false,
            lastHassUpdate: this._lastHassUpdate
        };
    }
    /**
     * Check if the websocket is connected
     */
    isConnected() {
        return false; // WebSocketService is now a compatibility layer that delegates to ParameterService
    }
    /**
     * Get the current connection status
     */
    getConnectionStatus() {
        trackUsage('websocket', 'getConnectionStatus', {
            source: 'redux',
            isConnected: this.isConnected()
        });
        return {
            isConnected: this.isConnected(),
            isDeprecated: true
        };
    }
    /**
     * Get the status of the API connection
     */
    getApiStatus() {
        return {
            failureCount: 0,
            usingFallback: false,
            recentSuccess: false
        };
    }
    /**
     * Clean up resources
     */
    destroy() {
        this._logger.log('WebSocketService', 'Destroying WebSocketService', { category: 'websocket', subsystem: 'reset' });
        this._hass = null;
        this._entityCallbacks.clear();
        this._subscriptions.clear();
    }
}
//# sourceMappingURL=websocket.js.map