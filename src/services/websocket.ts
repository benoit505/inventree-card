import { HassEntities } from 'home-assistant-js-websocket';
import { HomeAssistant } from "custom-card-helpers";
import { Logger } from "../utils/logger";
import { InventreeItem } from "../types";
import { trackUsage } from "../utils/metrics-tracker";
import { store } from "../store";
import { webSocketMessageReceived } from '../store/slices/websocketSlice';
import { Store } from 'redux';

type SubscriptionCallback = (data: any) => void;

/**
 * DEPRECATED: WebSocketService is now a compatibility layer that delegates to ParameterService
 * This class will be removed in a future version
 */
export class WebSocketService {
  private static instance: WebSocketService;
  private _hass: HomeAssistant | null = null;
  private _entityCallbacks: Map<string, Array<() => void>> = new Map();
  private _logger: Logger;
  private _subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();
  private _lastHassUpdate: number = 0;
  private readonly HASS_UPDATE_DEBOUNCE = 5000; // 5 seconds

  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Private constructor for singleton
   */
  private constructor() {
    this._logger = Logger.getInstance();
    this._logger.log('WebSocketService', '✅ WebSocketService instance created');
  }

  /**
   * Set the HASS object
   */
  public setHass(hass: HomeAssistant): void {
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
  private _processHassEntities(states: HassEntities): void {
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
  public subscribeToEntity(entityId: string, callback: () => void): () => void {
    this._logger.log('WebSocket', `Subscribing to entity: ${entityId}`, { category: 'websocket', subsystem: 'entities' });

    if (!this._entityCallbacks.has(entityId)) {
      this._entityCallbacks.set(entityId, []);
    }
    this._entityCallbacks.get(entityId)!.push(callback);

    // Trigger initial callback if HASS state exists
    if (this._hass && this._hass.states[entityId]) {
      callback();
    }

    return () => {
      if (this._entityCallbacks.has(entityId)) {
        const callbacks = this._entityCallbacks.get(entityId)!;
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
  public getDiagnostics(): any {
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
  public isConnected(): boolean {
    return false; // WebSocketService is now a compatibility layer that delegates to ParameterService
  }
  
  /**
   * Get the current connection status
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    isDeprecated: boolean;
  } {
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
  public getApiStatus(): { 
    failureCount: number, 
    usingFallback: boolean, 
    recentSuccess: boolean 
  } {
    return {
      failureCount: 0,
      usingFallback: false,
      recentSuccess: false
    };
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    this._logger.log('WebSocketService', 'Destroying WebSocketService', { category: 'websocket', subsystem: 'reset' });
    this._hass = null;
    this._entityCallbacks.clear();
    this._subscriptions.clear();
  }
}