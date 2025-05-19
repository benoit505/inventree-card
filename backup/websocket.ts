import { HomeAssistant } from "custom-card-helpers";
import { WebSocketPlugin } from "./websocket-plugin";
import { Logger } from "inventree-card/utils/logger";
import { InventreeItem } from "inventree-card/core/types";
import { InventTreeState } from "inventree-card/core/inventree-state";
import { InvenTreeDirectAPI } from "inventree-card/services/api";

type SubscriptionCallback = (data: any) => void;

/**
 * WebSocketService manages Home Assistant WebSocket connections for entity data
 * It handles subscriptions to entities and updates the central state
 */
export class WebSocketService {
  private static instance: WebSocketService;
  private hass: HomeAssistant | null = null;
  private _subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();
  private _entitySubscriptions: Map<string, any> = new Map();
  private logger = Logger.getInstance();
  private _lastHassUpdate: number = 0;
  private readonly HASS_UPDATE_DEBOUNCE = 5000; // 5 seconds
  private _healthCheckInterval: any = null;
  private _webSocketManager: any; // For diagnostics only
  private _directApi: InvenTreeDirectAPI | null = null;

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
    this.logger.log('WebSocket', 'WebSocketService initialized', {
      category: 'websocket',
      subsystem: 'initialization'
    });
    this._startHealthCheck();
  }
  
  /**
   * Get a unique ID for a HASS connection
   */
  private getConnectionId(hass: HomeAssistant): string {
    if (!hass) return 'no-hass';
    
    // Create a simple connection ID based on time
    const now = Date.now();
    return `hass-${now}`;
  }
  
  /**
   * Update the Home Assistant instance
   */
  public setHass(hass: HomeAssistant): void {
    const now = Date.now();
    
    // Debounce rapid updates
    if (now - this._lastHassUpdate < this.HASS_UPDATE_DEBOUNCE) {
      return;
    }

    this._lastHassUpdate = now;
    this.hass = hass;
    
    const connId = this.getConnectionId(hass);
    this.logger.log('WebSocket', `Home Assistant connection updated: ${connId}`, {
      category: 'websocket',
      subsystem: 'connection'
    });
    
    // Re-subscribe to all entities
      this._resubscribeAll();
  }
  
  /**
   * Subscribe to an entity via Home Assistant WebSocket
   */
  public subscribeToEntity(entityId: string, callback: (data: any) => void): () => void {
    this.logger.log('WebSocket', `Subscribing to entity: ${entityId}`, {
      category: 'websocket',
      subsystem: 'subscription'
    });
    
    if (!this.hass) {
      this.logger.warn('WebSocket', `Cannot subscribe - HASS not available`, {
        category: 'websocket',
        subsystem: 'errors'
      });
      return () => {}; // No-op unsubscribe
    }
    
    // Check if we already have a subscription for this entity
    if (!this._subscriptions.has(entityId)) {
      this._subscriptions.set(entityId, new Set());
      
      // Start the subscription
      this._subscribeToEntity(entityId);
    }
    
    // Add the callback to our set
    const callbacks = this._subscriptions.get(entityId)!;
    callbacks.add(callback);
    
    // Return an unsubscribe function
        return () => {
      const callbacks = this._subscriptions.get(entityId);
      if (callbacks) {
        callbacks.delete(callback);
        
        // If no more callbacks, unsubscribe
        if (callbacks.size === 0) {
          this._unsubscribeFromEntity(entityId);
          this._subscriptions.delete(entityId);
        }
      }
    };
  }
  
  /**
   * Subscribe to all parts from an entity
   */
  public subscribeToParts(entityId: string, callback: (parts: any[]) => void): () => void {
    this.logger.log('WebSocket', `Subscribing to parts from entity: ${entityId}`, {
      category: 'websocket',
      subsystem: 'subscription'
    });
    
    // Use the basic entity subscription but filter for items
    return this.subscribeToEntity(entityId, (data: any) => {
      if (data && data.attributes && Array.isArray(data.attributes.items)) {
        callback(data.attributes.items);
      }
    });
  }
  
  /**
   * Handle an entity state message
   */
  private _handleEntityMessage(entityId: string, callback: SubscriptionCallback, event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      // Check if this message is for our entity
      if (this._isMessageForEntity(message, entityId)) {
        callback(this._processMessage(message));
      }
    } catch (error) {
      this.logger.error('WebSocket', `Error handling entity message: ${error}`, {
        category: 'websocket',
        subsystem: 'errors'
      });
    }
  }

  /**
   * Subscribe to an entity via Home Assistant
   */
  private _subscribeToEntity(entityId: string): void {
    if (!this.hass) {
      this.logger.warn('WebSocket', `Cannot subscribe - HASS not available`, {
        category: 'websocket',
        subsystem: 'errors'
      });
      return;
    }
    
    try {
      // For Home Assistant, we use the hass object to get the latest entity state
      this.logger.log('WebSocket', `Starting subscription to entity: ${entityId}`, {
        category: 'websocket',
        subsystem: 'subscription'
      });
      
      // Simply get the current state
      const currentState = this.hass.states[entityId];
      
      if (currentState) {
        // Process the initial state
        const callbacks = this._subscriptions.get(entityId);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(currentState);
            } catch (error) {
              this.logger.error('WebSocket', `Error in subscription callback: ${error}`, {
                category: 'websocket',
                subsystem: 'errors'
              });
            }
          });
        }
        
        // Update the state repository
        this._updateEntityState(entityId, currentState);
        
        this.logger.log('WebSocket', `Successfully subscribed to entity: ${entityId}`, {
          category: 'websocket',
          subsystem: 'subscription'
        });
      } else {
        this.logger.error('WebSocket', `Entity not found: ${entityId}`, {
          category: 'websocket',
          subsystem: 'errors'
        });
      }
    } catch (error) {
      this.logger.error('WebSocket', `Error subscribing to entity: ${error}`, {
        category: 'websocket',
        subsystem: 'errors'
      });
    }
  }

  /**
   * Unsubscribe from an entity
   */
  private _unsubscribeFromEntity(entityId: string): void {
    const subscription = this._entitySubscriptions.get(entityId);
    
    if (subscription) {
      this.logger.log('WebSocket', `Unsubscribing from entity: ${entityId}`, {
        category: 'websocket',
        subsystem: 'subscription'
      });
      
      try {
        // Clean up any external subscription
        if (typeof subscription === 'function') {
          subscription(); // Call the unsubscribe function
        }
        
        this._entitySubscriptions.delete(entityId);
        
        this.logger.log('WebSocket', `Successfully unsubscribed from entity: ${entityId}`, {
          category: 'websocket',
          subsystem: 'subscription'
        });
      } catch (error) {
        this.logger.error('WebSocket', `Error unsubscribing from entity: ${error}`, {
          category: 'websocket',
          subsystem: 'errors'
        });
      }
    }
  }

  /**
   * Re-subscribe to all entities
   */
  private _resubscribeAll(): void {
    this.logger.log('WebSocket', 'Resubscribing to all entities', {
      category: 'websocket',
      subsystem: 'subscription'
    });
    
    // Clean up old subscriptions
    for (const [entityId, subscription] of this._entitySubscriptions.entries()) {
      try {
        if (typeof subscription === 'function') {
          subscription(); // Call the unsubscribe function
        }
      } catch (error) {
        this.logger.error('WebSocket', `Error cleaning up subscription: ${error}`, {
          category: 'websocket',
          subsystem: 'errors'
        });
      }
    }
    
    // Clear all subscriptions
    this._entitySubscriptions.clear();
    
    // Re-subscribe to all entities
    for (const entityId of this._subscriptions.keys()) {
      this._subscribeToEntity(entityId);
      
      this.logger.log('WebSocket', `Resubscribed to entity: ${entityId}`, {
        category: 'websocket',
        subsystem: 'subscription'
      });
    }
  }
  
  /**
   * Update entity state in the central state repository
   */
  private _updateEntityState(entityId: string, data: any): void {
    try {
      if (data && data.attributes && Array.isArray(data.attributes.items)) {
        // Update the central state
        const state = InventTreeState.getInstance();
        state.setHassData(entityId, data.attributes.items);
        
        // Track update time
        state.trackLastUpdate('hass', entityId);
        
        // Dispatch an event to notify other components
        window.dispatchEvent(new CustomEvent('inventree-entity-updated', {
        detail: {
            entityId,
            items: data.attributes.items,
            source: 'websocket'
          }
        }));
      }
    } catch (error) {
      this.logger.error('WebSocket', `Error updating entity state: ${error}`, {
        category: 'websocket',
        subsystem: 'errors'
      });
    }
  }

  /**
   * Check if a message is for a specific entity
   */
  private _isMessageForEntity(message: any, entityId: string): boolean {
    if (message && message.type === 'result' && message.result) {
      return message.result.includes && message.result.includes(entityId);
    }
    return false;
  }
  
  /**
   * Process an incoming message
   */
  private _processMessage(message: any): any {
    // For Home Assistant entities, just return the message data
    return message;
  }
  
  /**
   * Start health check interval
   */
  private _startHealthCheck(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
    }
    
    this._healthCheckInterval = setInterval(() => {
      if (this.hass) {
        // Check for entities that need refreshing
        this._subscriptions.forEach((callbacks, entityId) => {
          // Refresh the entity state
          const currentState = this.hass?.states[entityId];
          if (currentState) {
            // Update the entity state
            this._updateEntityState(entityId, currentState);
          }
        });
      }
    }, 30000); // Check every 30 seconds
  }
  
  /**
   * Check if connected to Home Assistant
   */
  public isConnected(): boolean {
    return !!this.hass;
  }
  
  /**
   * Get diagnostics information
   */
  public getDiagnostics(): object {
    return {
      connected: this.isConnected(),
      entities: Array.from(this._subscriptions.keys()),
      subscriptionCount: this._subscriptions.size,
      lastUpdate: this._lastHassUpdate
    };
  }
  
  /**
   * Clean up all resources
   */
  public destroy(): void {
    if (this._healthCheckInterval) {
      clearInterval(this._healthCheckInterval);
    }
    
    // Clean up all subscriptions
    this._subscriptions.forEach((callbacks, entityId) => {
      this._unsubscribeFromEntity(entityId);
    });
    
    this._subscriptions.clear();
    this._entitySubscriptions.clear();
    
    this.logger.log('WebSocket', 'WebSocketService destroyed', {
      category: 'websocket',
      subsystem: 'lifecycle'
    });
  }
  
  /**
   * Get connection status for diagnostics
   */
  public getConnectionStatus(): Record<string, boolean> {
    return {
      isConnected: this.isConnected()
    };
  }
  
  /**
   * Get API status for diagnostics - stub for compatibility
   */
  public getApiStatus(): { 
    failureCount: number, 
    usingFallback: boolean, 
    recentSuccess: boolean 
  } {
    return {
      failureCount: 0,
      usingFallback: false,
      recentSuccess: true
    };
  }
  
  /**
   * Set the direct API instance for API calls
   * @param api The API instance or null
   */
  public setDirectApi(api: InvenTreeDirectAPI | null): void {
    this._directApi = api;
    this.logger.log('WebSocket', `${api ? 'Set' : 'Cleared'} Direct API reference for WebSocket service`, {
      category: 'websocket',
      subsystem: 'integration'
    });
  }
  
  /**
   * Get the current API instance
   */
  public getDirectApi(): InvenTreeDirectAPI | null {
    return this._directApi;
  }
}
