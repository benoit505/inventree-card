import { InventTreeState } from "inventree-card/core/inventree-state";
import { RenderingService } from "inventree-card/services/rendering-service";
import { Logger } from "inventree-card/utils/logger";
import { CacheService, DEFAULT_TTL, CacheCategory } from "inventree-card/services/cache";
import { ParameterService } from "inventree-card/services/parameter-service";

export interface InvenTreeWebSocketConfig {
  url: string;
  enabled: boolean;
  reconnectInterval?: number;
}

/**
 * Plugin for direct WebSocket connection to InvenTree server
 * Handles parameter updates and other real-time events
 */
export class WebSocketPlugin {
  private static instance: WebSocketPlugin;
  private _config: InvenTreeWebSocketConfig | null = null;
  private _connection: WebSocket | null = null;
  private _reconnectTimer: number | null = null;
  private _keepAliveTimer: number | null = null;
  private _isConnected: boolean = false;
  private _messageCallbacks: ((message: any) => void)[] = [];
  private logger: Logger;
  private cache: CacheService = CacheService.getInstance();
  private _errorCount: number = 0;

  // Stats for monitoring
  private _messageCount: number = 0;
  private _lastMessageTime: number = 0;
  private _processingMessages: Set<string> = new Set();
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketPlugin {
    if (!WebSocketPlugin.instance) {
      WebSocketPlugin.instance = new WebSocketPlugin();
    }
    return WebSocketPlugin.instance;
  }
  
  /**
   * Private constructor for singleton
   */
  private constructor() {
    this.logger = Logger.getInstance();
  }
  
  /**
   * Configure the WebSocket connection
   */
  public configure(config: InvenTreeWebSocketConfig): void {
    this._config = config;
    
    if (config.enabled && config.url) {
      this.connect();
    } else if (!config.enabled && this._connection) {
      this.disconnect();
    }
  }
  
  /**
   * Connect to the InvenTree WebSocket server
   */
  public connect(): void {
    if (!this._config?.url || !this._config.enabled) {
      this.logger.warn('WebSocket', 'Cannot connect - plugin disabled or URL not provided', {
        category: 'websocket',
        subsystem: 'plugin'
      });
      return;
    }
    
    try {
      this.logger.log('WebSocket', `Connecting to InvenTree WebSocket at ${this._config.url}`, { 
        category: 'websocket', 
        subsystem: 'plugin' 
      });
      
      // First, clean up any existing connection
      this.disconnect();
      
      // Create a new WebSocket connection
      this._connection = new WebSocket(this._config.url);
      
      // Set up event handlers
      this._connection.onopen = this._handleOpen.bind(this);
      this._connection.onmessage = this._handleMessage.bind(this);
      this._connection.onerror = this._handleError.bind(this);
      this._connection.onclose = this._handleClose.bind(this);
      
      this.logger.log('WebSocket', `Connection request sent to ${this._config.url}`, { 
        category: 'websocket', 
        subsystem: 'plugin' 
      });
    } catch (error) {
      this.logger.error('WebSocket', `Error connecting to WebSocket: ${error}`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
      this._scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    // Clear keep-alive timer
    if (this._keepAliveTimer) {
      window.clearInterval(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
    
    // Clear reconnect timer
    if (this._reconnectTimer) {
      window.clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    
    // Close the connection
    if (this._connection) {
      if (this._connection.readyState !== WebSocket.CLOSING && 
          this._connection.readyState !== WebSocket.CLOSED) {
        this._connection.close();
      }
      this._connection = null;
      this._isConnected = false;
      this.logger.log('WebSocket', 'Disconnected from WebSocket server', { 
        category: 'websocket',
        subsystem: 'plugin'
      });
    }
  }
  
  /**
   * Register a callback for incoming messages
   */
  public onMessage(callback: (message: any) => void): () => void {
    this._messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this._messageCallbacks.indexOf(callback);
      if (index !== -1) {
        this._messageCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Handle WebSocket open event
   */
  private _handleOpen(event: Event): void {
    this._isConnected = true;
    this._errorCount = 0;
    this.logger.log('WebSocket', 'Successfully connected to InvenTree WebSocket server', { 
      category: 'websocket', 
      subsystem: 'plugin' 
    });
    
    // Set up keep-alive mechanism
    this._setupKeepAlive();
    
    // Fire an event that other components can listen for
    window.dispatchEvent(new CustomEvent('inventree-websocket-connected'));
  }
  
  /**
   * Handle WebSocket message event
   */
  private _handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this._messageCount++;
      this._lastMessageTime = Date.now();
      
      // Create a message signature for deduplication
      const messageId = this._getMessageId(message);
      
      // Skip duplicate messages within a short window
      if (messageId && this.cache.has(`ws-msg:${messageId}`)) {
        this.logger.log('WebSocket', `Skipping duplicate message: ${messageId}`, { 
          category: 'websocket', 
          subsystem: 'messages' 
        });
        return;
      }
      
      // Cache this message ID to prevent duplicates
      if (messageId) {
        this.cache.set(`ws-msg:${messageId}`, true, DEFAULT_TTL.WS_DEDUP, CacheCategory.WEBSOCKET);
      }
      
      // For parameter updates, add recursion protection
      if (message.type === 'event' && message.event === 'part_partparameter.saved') {
        const dedupeId = `${message.data?.parent_id}:${message.data?.parameter_name}:${message.data?.parameter_value}`;
        
        // Check if we're already processing this exact message
        if (this._processingMessages.has(dedupeId)) {
          this.logger.log('WebSocket', `Preventing duplicate parameter message processing for ${dedupeId}`, { 
            category: 'websocket',
            subsystem: 'deduplication'
          });
          return;
        }
        
        // Mark this message as being processed
        this._processingMessages.add(dedupeId);
        
        // Clear the marker after a short time
        setTimeout(() => {
          this._processingMessages.delete(dedupeId);
        }, 2000);
      }
      
      // Call all registered callbacks
      this._messageCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          this.logger.error('WebSocket', `Error in message callback: ${error}`, {
            category: 'websocket',
            subsystem: 'plugin'
          });
        }
      });
      
      // Process specific message types
      this._processMessage(message);
    } catch (error) {
      this.logger.error('WebSocket', `Error parsing message: ${error}`, {
        category: 'websocket',
        subsystem: 'messages'
      });
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private _handleError(event: Event): void {
    this._errorCount++;
    this.logger.error('WebSocket', `WebSocket error (count: ${this._errorCount})`, {
      category: 'websocket',
      subsystem: 'plugin'
    });
  }
  
  /**
   * Handle WebSocket close event
   */
  private _handleClose(event: CloseEvent): void {
    this._isConnected = false;
    this.logger.log('WebSocket', `Connection closed: ${event.code} ${event.reason}`, {
      category: 'websocket',
      subsystem: 'plugin'
    });
    
    // Clear keep-alive timer
    if (this._keepAliveTimer) {
      window.clearInterval(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
    
    // Schedule reconnection
    this._scheduleReconnect();
  }
  
  /**
   * Setup keep-alive mechanism
   */
  private _setupKeepAlive(): void {
    // Clear any existing timer
    if (this._keepAliveTimer) {
      window.clearInterval(this._keepAliveTimer);
    }
    
    // Create new timer - send ping every 30 seconds
    this._keepAliveTimer = window.setInterval(() => {
      if (this._connection && this._connection.readyState === WebSocket.OPEN) {
        try {
          this._connection.send(JSON.stringify({
            type: 'ping',
            source: 'client',
            time: Date.now() / 1000
          }));
        } catch (error) {
          this.logger.error('WebSocket', `Error sending keep-alive: ${error}`, {
            category: 'websocket',
            subsystem: 'plugin'
          });
        }
      }
    }, 30000);
  }
  
  /**
   * Generate a unique ID for a message to identify duplicates
   */
  private _getMessageId(message: any): string | null {
    // Only generate IDs for specific message types we care about
    if (message.model === 'PartParameter') {
      return `param:${message.parent_id || 0}:${message.parameter_name || ''}:${message.parameter_value || ''}`;
    }
    
    if (message.type === 'event' && message.event === 'part_partparameter.saved') {
      const data = message.data || {};
      return `param-event:${data.parent_id || 0}:${data.parameter_name || ''}:${data.parameter_value || ''}`;
    }
    
    // For ping/pong messages
    if (message.type === 'ping' || message.type === 'pong') {
      return `${message.type}:${message.source || 'unknown'}:${Math.floor(Date.now() / 10000)}`; // Group pings by 10s windows
    }
    
    // For other message types, return null (no deduplication)
    return null;
  }
  
  /**
   * Process incoming WebSocket message
   */
  private _processMessage(message: any): void {
    // Handle basic messages like ping/pong first
    if (message.type === 'ping' && message.source === 'server') {
      this._sendPongResponse();
      return;
    }
    
    // Log the raw message at debug level
    this.logger.log('WebSocket', `Received message from server: ${JSON.stringify(message).substring(0, 200)}...`, { 
      category: 'websocket', 
      subsystem: 'messages' 
    });

    // Check if this is a parameter update (direct parameter model update)
    if (message.model === 'PartParameter') {
      this._handleParameterUpdate(message);
      return;
    }
    
    // Check if this is an event message
    if (message.type === 'event') {
      if (message.event === 'part_partparameter.saved') {
        this.logger.log('WebSocket', `Received parameter saved event: ${JSON.stringify(message.data)}`, { 
          category: 'websocket', 
          subsystem: 'events' 
        });
        
        // Extract parameter data from the event
        const data = message.data || {};
        
        // Create parameter update object
        const paramUpdate = {
          parent_id: data.parent_id || data.part,
          parameter_name: data.parameter_name || data.name,
          parameter_value: data.parameter_value || data.value
        };
        
        // Process parameter update
        if (paramUpdate.parent_id && paramUpdate.parameter_name) {
          this._handleParameterUpdate(paramUpdate);
        } else {
          this.logger.warn('WebSocket', 'Received incomplete parameter event data', {
            category: 'websocket',
            subsystem: 'events'
          }, message);
        }
      } else {
        this.logger.log('WebSocket', `Received event message: ${message.event}`, { 
          category: 'websocket', 
          subsystem: 'events' 
        });
      }
    }
  }
  
  /**
   * Send pong response to a ping message
   */
  private _sendPongResponse(): void {
    if (this._connection && this._connection.readyState === WebSocket.OPEN) {
      try {
        this._connection.send(JSON.stringify({
          type: 'pong',
          source: 'client',
          time: Date.now() / 1000
        }));
      } catch (error) {
        this.logger.error('WebSocket', `Error sending pong response: ${error}`, {
          category: 'websocket',
          subsystem: 'plugin'
        });
      }
    }
  }
  
  /**
   * Handle parameter update message
   */
  private _handleParameterUpdate(message: any): void {
    let partId: number | null = null;
    let paramName: string | null = null;
    let paramValue: string | null = null;
    
    try {
      // Extract parameter data based on different possible message formats
      partId = message.parent_id || message.part || null;
      paramName = message.parameter_name || message.name || null;
      paramValue = message.parameter_value !== undefined ? String(message.parameter_value) : 
                  (message.value !== undefined ? String(message.value) : null);
                  
      if (!partId || !paramName || paramValue === null) {
        this.logger.warn('WebSocket', 'Incomplete parameter message', {
          category: 'websocket',
          subsystem: 'messages'
        }, message);
        return;
      }
      
      this.logger.log('WebSocket', `Processing parameter update: part=${partId}, ${paramName}=${paramValue}`, { 
        category: 'websocket', 
        subsystem: 'plugin' 
      });
      
      // Create cache key for parameter value
      const paramCacheKey = `param:${partId}:${paramName}`;
      
      // Cache the parameter value with appropriate TTL
      this.cache.set(paramCacheKey, paramValue, DEFAULT_TTL.PARAMETER, CacheCategory.PARAMETER);
      
      // Also set as fallback for future cache misses
      this.cache.setFallback(paramCacheKey, paramValue);
      
      // Get the state manager
      const state = InventTreeState.getInstance();
      
      // Get the rendering service
      const renderingService = RenderingService.getInstance();
      
      // Update the state
      state.updateParameter(partId, paramName, paramValue);
      
      // Reset the idle timer in RenderingService
      renderingService.restartIdleTimer();
      
      // Log the update
      this.logger.log('WebSocket', `✅ Parameter updated in state: ${paramName}=${paramValue} for part ${partId}`, { 
        category: 'websocket', 
        subsystem: 'events' 
      });
      
      // Mark the parameter as recently changed for UI updates
      try {
        if (ParameterService.hasInstance()) {
          const paramService = ParameterService.getInstance();
          
          // Find entity for part to mark as changed
          const entityId = paramService.findEntityForPart(partId);
          if (entityId) {
            ParameterService.markParameterChanged(entityId, paramName);
            
            // Create a deduplication key for this update
            const dedupeKey = `update:${entityId}:${partId}:${paramName}`;
            
            // Only dispatch events if we haven't seen this exact update recently
            if (!this.cache.has(dedupeKey)) {
              // Fire events to notify other components
              window.dispatchEvent(new CustomEvent('inventree-parameter-updated', {
                detail: {
                  part_id: partId,
                  parameter_name: paramName,
                  value: paramValue,
                  source: 'websocket-plugin'
                }
              }));
              
              // Trigger parameter-changed event for other listeners
              window.dispatchEvent(new CustomEvent('inventree-parameter-changed', {
                detail: {
                  parameter: paramName,
                  value: paramValue,
                  part_id: partId,
                  source: 'websocket-plugin'
                }
              }));
              
              // Cache this update to prevent duplicate events
              this.cache.set(dedupeKey, true, DEFAULT_TTL.WS_DEDUP, CacheCategory.WEBSOCKET);
            } else {
              this.logger.log('WebSocket', `Suppressed duplicate events for ${paramName}=${paramValue} (part ${partId})`, {
                category: 'websocket',
                subsystem: 'events'
              });
            }
          } else {
            // No entity found, but we still want to update orphaned parts
            this.logger.log('WebSocket', `No entity found for part ${partId}, storing as orphaned parameter`, {
              category: 'websocket',
              subsystem: 'events'
            });
            
            paramService.storeOrphanedParameter(partId, paramName, paramValue);
          }
        }
      } catch (e) {
        this.logger.warn('WebSocket', `Could not mark parameter as changed: ${e}`, {
          category: 'websocket',
          subsystem: 'events'
        });
      }
      
      // Force the rendering service to update
      renderingService.forceRender();
    } catch (error) {
      this.logger.error('WebSocket', `Error processing parameter update: ${error}`, {
        category: 'websocket',
        subsystem: 'errors'
      }, { partId, paramName, paramValue });
    }
  }
  
  /**
   * Schedule a reconnection attempt
   */
  private _scheduleReconnect(): void {
    if (this._reconnectTimer) {
      window.clearTimeout(this._reconnectTimer);
    }
    
    // Use exponential backoff based on error count
    const baseInterval = this._config?.reconnectInterval || 5000;
    const reconnectDelay = Math.min(baseInterval * Math.pow(1.5, this._errorCount), 60000);
    
    this.logger.log('WebSocket', `Will attempt to reconnect in ${reconnectDelay/1000} seconds`, { 
      category: 'websocket',
      subsystem: 'plugin' 
    });
    
    this._reconnectTimer = window.setTimeout(() => {
      this.logger.log('WebSocket', 'Attempting to reconnect...', { category: 'websocket' });
      this.connect();
    }, reconnectDelay);
  }
  
  /**
   * Get the connection status
   */
  public isConnected(): boolean {
    return this._isConnected;
  }
  
  /**
   * Get statistics about the connection
   */
  public getStats(): {
    isConnected: boolean;
    messageCount: number;
    errorCount: number;
    lastMessageTime: number;
  } {
    return {
      isConnected: this._isConnected,
      messageCount: this._messageCount,
      errorCount: this._errorCount,
      lastMessageTime: this._lastMessageTime
    };
  }
}
