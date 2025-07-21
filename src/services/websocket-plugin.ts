import { ConditionalLoggerEngine } from "../core/logging/ConditionalLoggerEngine";
// import { CacheService, DEFAULT_TTL, CacheCategory } from "./cache"; // Removed
import { HomeAssistant } from "custom-card-helpers";
import { store, AppDispatch } from "../store";
import { webSocketMessageReceived, setWebSocketStatus } from '../store/slices/websocketSlice';
import { inventreeApi } from '../store/apis/inventreeApi';
import { WebSocketEventMessage, DirectApiConfig } from '../types';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import debounce from 'lodash-es/debounce'; // Import debounce

const logger = ConditionalLoggerEngine.getInstance().getLogger('WebSocketPlugin');
ConditionalLoggerEngine.getInstance().registerCategory('WebSocketPlugin', { enabled: false, level: 'info' });

/**
 * Connection states for the WebSocket
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
  CLOSING = 'closing'
}

// Maps the internal ConnectionState to the status string required by the Redux store.
function mapToReduxStatus(state: ConnectionState): 'connected' | 'connecting' | 'disconnected' | 'error' {
    switch (state) {
        case ConnectionState.CONNECTED:
            return 'connected';
        case ConnectionState.CONNECTING:
        case ConnectionState.RECONNECTING:
            return 'connecting';
        case ConnectionState.FAILED:
            return 'error';
        case ConnectionState.DISCONNECTED:
        case ConnectionState.CLOSING:
        default:
            return 'disconnected';
    }
}

/**
 * Plugin for direct WebSocket connection to InvenTree server
 * Handles parameter updates and other real-time events
 */
export class WebSocketPlugin {
  private static instance: WebSocketPlugin;
  private _config: DirectApiConfig | null = null;
  private _connection: WebSocket | null = null;
  private _connectionId: string | null = null;
  private _isConnected: boolean = false;
  private _messageCallbacks: ((message: any) => void)[] = [];
  // private cache: CacheService = CacheService.getInstance(); // Removed
  private _errorCount: number = 0;
  private _url: string = '';
  private _debug: boolean = false;
  private _disconnecting: boolean = false;
  private _autoReconnect: boolean = true;
  private _reconnectInterval: number = 5000;
  private _timersInitialized = false;
  private _connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private _lastConnectionAttempt: number = 0;
  private _connectionAttempts: number = 0;
  private _maxReconnectDelay: number = 300000; // 5 minutes max delay
  private _minReconnectDelay: number = 1000; // 1 second min delay
  private _cooldownPeriod: number = 2000; // 2 seconds between connection attempts
  private _lastStateChangeTime: number = 0;
  private _lastSuccessfulConnection: number = 0;
  private _lastServerMessageTime: number = 0;
  private _serverInactivityTimeoutDuration: number = 90000; // 90 seconds default
  private _serverInactivityTimerId: number | null = null;
  private _messageCount: number = 0;
  private _lastMessageTime: number = 0;
  private _processingMessages: Set<string> = new Set();
  private _messageDebounceTime: number = 50; // Default, will be overridden by config
  private _dispatch: AppDispatch | null = null;

  // Map to store debounced _processMessage functions, keyed by messageId
  private _debouncedProcessors: Map<string, (message: any) => void> = new Map();

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
    this._lastServerMessageTime = 0; // Initialize
    if (!this._timersInitialized) {
      // window.setTimeout(() => this._initializeTimers(), 0); // Defer timer init if causing issues
      this._timersInitialized = true;
    }
    logger.info('constructor', 'Instance created.');
  }
  
  /**
   * Configure the WebSocket connection
   * @param config Configuration options for the WebSocket connection
   */
  public configure(config: DirectApiConfig): void {
    this._config = config;

    // Determine the WebSocket URL to use
    if (config.websocket_url && config.websocket_url.trim() !== '') {
      this._url = config.websocket_url.trim();
      logger.info('configure', `Using explicit WebSocket URL: ${this._url}`);
    } else if (config.url && config.url.trim() !== '') {
      const baseUrl = config.url.trim().replace(/\/+$/, ''); 
      if (baseUrl.startsWith('http')) {
        this._url = baseUrl.replace(/^http/, 'ws') + '/ws/'; 
      } else {
        this._url = `ws://${baseUrl}/ws/`; 
      }
      logger.info('configure', `Derived WebSocket URL from API URL: ${this._url}`, { base: config.url });
    } else {
      this._url = ''; 
      logger.warn('configure', 'Could not determine WebSocket URL from configuration.');
    }
    
    // Configure auto-reconnect
    this._autoReconnect = config.performance?.websocket?.reconnectInterval !== undefined ? true : false; 
    if (config.performance?.websocket?.reconnectInterval !== undefined && config.performance.websocket.reconnectInterval <= 0) {
        this._autoReconnect = false;
    }

    if (config.performance?.websocket?.reconnectInterval && config.performance.websocket.reconnectInterval > 0) {
      this._reconnectInterval = config.performance.websocket.reconnectInterval;
    } else {
      this._reconnectInterval = 5000; 
    }
    
    if (config.performance?.websocket?.messageDebounce && config.performance.websocket.messageDebounce >= 0) {
      this._messageDebounceTime = config.performance.websocket.messageDebounce;
    } else {
        this._messageDebounceTime = 50; 
    }
    
    logger.info('configure', `Configured WebSocket plugin.`, { targetUrl: this._url, autoReconnect: this._autoReconnect, reconnectInterval: this._reconnectInterval, debounce: this._messageDebounceTime, serverInactivityTimeout: this._serverInactivityTimeoutDuration});
  }
  
  /**
   * Change connection state with appropriate logging
   */
  private _setConnectionState(newState: ConnectionState): void {
    const oldState = this._connectionState;
    
    if (oldState === newState) {
      return; // No change
    }
    
    // Validate state transitions
    const validTransitions: Record<ConnectionState, ConnectionState[]> = {
      [ConnectionState.DISCONNECTED]: [ConnectionState.CONNECTING],
      [ConnectionState.CONNECTING]: [ConnectionState.CONNECTED, ConnectionState.FAILED, ConnectionState.DISCONNECTED],
      [ConnectionState.CONNECTED]: [ConnectionState.DISCONNECTED, ConnectionState.CLOSING],
      [ConnectionState.RECONNECTING]: [ConnectionState.CONNECTING, ConnectionState.DISCONNECTED, ConnectionState.FAILED],
      [ConnectionState.FAILED]: [ConnectionState.RECONNECTING, ConnectionState.DISCONNECTED],
      [ConnectionState.CLOSING]: [ConnectionState.DISCONNECTED]
    };
    
    if (!validTransitions[oldState].includes(newState)) {
      logger.warn('_setConnectionState', `Invalid state transition from ${oldState} to ${newState}`);
      return;
    }
    
    // Update state
    this._connectionState = newState;
    this._lastStateChangeTime = Date.now();
    
    logger.info('_setConnectionState', `Connection state changed: ${oldState} -> ${newState}`);
    
    // Perform actions based on new state
    switch (newState) {
      case ConnectionState.CONNECTED:
        this._lastSuccessfulConnection = Date.now();
        this._errorCount = 0;
        this._connectionAttempts = 0;
        this._startServerInactivityTimer();
        // Dispatch connection event
        window.dispatchEvent(new CustomEvent('inventree-websocket-connected'));
        break;
        
      case ConnectionState.DISCONNECTED:
        this._clearAllTimers();
        this._clearServerInactivityTimer();
        break;
        
      case ConnectionState.FAILED:
        this._errorCount++;
        // Schedule reconnect if appropriate
        if (this._autoReconnect && this._errorCount < 20) {
          this._setConnectionState(ConnectionState.RECONNECTING);
          this._scheduleReconnect();
        }
        break;
    }
  }
  
  /**
   * Clear all active timers
   */
  private _clearAllTimers(): void {
    // This method might become largely obsolete if each timer is managed locally
    // For now, ensure any specific timers used by this class are cleared
    this._clearServerInactivityTimer();
    // If other direct timers were used by this class and tracked, clear them here.
    logger.debug('_clearAllTimers', 'Cleared specific timers in WebSocketPlugin.');
    // The old cleanupAllTimers() was global; we are moving away from that.
  }
  
  /**
   * Connect to the InvenTree WebSocket server
   */
  public connect(): void {
    if (!this._timersInitialized || !this._url) {
      logger.warn('connect', 'Cannot connect - plugin not initialized or URL not provided');
      return;
    }
    
    // Check connection state
    if (this._connectionState === ConnectionState.CONNECTING || 
        this._connectionState === ConnectionState.CONNECTED) {
      logger.info('connect', `Already ${this._connectionState}, not initiating new connection`);
      return;
    }
    
    // Enforce cooldown period between connection attempts
    const timeSinceLastAttempt = Date.now() - this._lastConnectionAttempt;
    if (timeSinceLastAttempt < this._cooldownPeriod) {
      logger.debug('connect', `Connection attempt too soon (${timeSinceLastAttempt}ms since last attempt), enforcing cooldown`);
      return;
    }

    this._lastConnectionAttempt = Date.now();
    this._connectionAttempts++;
    this._setConnectionState(ConnectionState.CONNECTING);
    this._disconnecting = false; 

    logger.info('connect', `Attempting to connect to WebSocket: ${this._url}`);
    
    try {
        this._connection = new WebSocket(this._url);
        this._connection.onopen = this._onConnectionOpen.bind(this);
        this._connection.onmessage = this._onConnectionMessage.bind(this);
        this._connection.onerror = this._onConnectionError.bind(this);
        this._connection.onclose = this._onConnectionClose.bind(this);
    } catch (error) {
        logger.error('connect', 'Error creating WebSocket connection:', error as Error);
        this._setConnectionState(ConnectionState.FAILED);
    }
  }

  /**
   * Called when the WebSocket connection is opened
   */
  private _onConnectionOpen(event: Event): void {
    this._setConnectionState(ConnectionState.CONNECTED);
    this._connectionId = this._generateConnectionId();
    logger.info('_onConnectionOpen', `WebSocket connection established. Connection ID: ${this._connectionId}`);
  }

  /**
   * Called when a message is received from the WebSocket server
   */
  private _onConnectionMessage(event: MessageEvent): void {
    this._resetServerInactivityTimer();
    this._lastServerMessageTime = Date.now();
    this._messageCount++;
    this._lastMessageTime = Date.now();
    
    if (this._dispatch) {
        this._dispatch(setWebSocketStatus(mapToReduxStatus(this._connectionState)));
    }

    try {
        const message = JSON.parse(event.data);
        const messageId = message?.data?.pk ?? (message?.name || 'unknown');
        logger.debug('_onConnectionMessage', 'Received message:', { message });
        this._handleDebouncedMessageProcessing(message, messageId);
    } catch (error) {
        logger.error('_onConnectionMessage', 'Error parsing WebSocket message:', error as Error);
    }
  }

  /**
   * Debounces message processing based on a unique message identifier.
   */
  private _handleDebouncedMessageProcessing(message: any, messageId: string): void {
    if (!this._debouncedProcessors.has(messageId)) {
      const debouncedFunc = debounce(
        (msg: any) => {
          this._processingMessages.add(messageId);
          try {
            this._notifyMessageCallbacks(msg);
          } finally {
            this._processingMessages.delete(messageId);
          }
        },
        this._messageDebounceTime,
        { leading: false, trailing: true }
      );
      this._debouncedProcessors.set(messageId, debouncedFunc);
    }
    this._debouncedProcessors.get(messageId)!(message);
  }

  /**
   * Notify all registered callbacks with the new message
   */
  private _notifyMessageCallbacks(message: any): void {
    if (this._dispatch) {
        this._dispatch(webSocketMessageReceived(message));
    }
    
    this._processMessage(message);

    for (const callback of this._messageCallbacks) {
        try {
            callback(message);
        } catch (error) {
            logger.error('_notifyMessageCallbacks', 'Error in message callback:', error as Error);
        }
    }
  }
  
  /**
   * Called when a WebSocket error occurs
   */
  private _onConnectionError(event: Event): void {
    logger.error('_onConnectionError', 'WebSocket connection error:', undefined, event);
    this._setConnectionState(ConnectionState.FAILED);
    if (!this._disconnecting && this._autoReconnect) {
      this._scheduleReconnect();
    }
  }

  /**
   * Called when the WebSocket connection is closed
   */
  private _onConnectionClose(event: CloseEvent): void {
    const eventDetails = { code: event.code, reason: event.reason, wasClean: event.wasClean };
    if (event.wasClean) {
      logger.info('_onConnectionClose', 'WebSocket connection closed cleanly.', eventDetails);
    } else {
      logger.error('_onConnectionClose', 'WebSocket closed with an error.', undefined, eventDetails);
    }

    this._setConnectionState(ConnectionState.DISCONNECTED);
    this._connection = null;
    this._connectionId = null;

    if (!this._disconnecting && this._autoReconnect) {
      logger.info('_onConnectionClose', 'Scheduling reconnect due to unexpected closure.');
      this._scheduleReconnect();
    }
  }

  /**
   * Close the WebSocket connection
   */
  private _closeConnection(): void {
    if (this._connection) {
      this._connection.close();
      this._setConnectionState(ConnectionState.CLOSING);
    }
  }

  private _startServerInactivityTimer(): void {
    this._clearServerInactivityTimer();
    this._serverInactivityTimerId = window.setTimeout(() => this._handleServerInactivity(), this._serverInactivityTimeoutDuration);
    logger.debug('_startServerInactivityTimer', 'Server inactivity timer started.');
  }

  private _clearServerInactivityTimer(): void {
    if (this._serverInactivityTimerId) {
      window.clearTimeout(this._serverInactivityTimerId);
      this._serverInactivityTimerId = null;
    }
  }

  private _resetServerInactivityTimer(): void {
    this._clearServerInactivityTimer();
    this._startServerInactivityTimer();
  }

  private _handleServerInactivity(): void {
    logger.warn('_handleServerInactivity', 'Server inactivity detected. Reconnecting...');
    this.forceReconnect();
  }

  public onMessage(callback: (message: any) => void): () => void {
    this._messageCallbacks.push(callback);
    return () => {
      this._messageCallbacks = this._messageCallbacks.filter(cb => cb !== callback);
    };
  }

  private _processMessage(message: any): void {
    try {
      switch (message.type) {
        case 'parameter.update':
          this._handleParameterUpdate(message.data);
          break;
        default:
          logger.debug('_processMessage', `Received unhandled message type: ${message.type}`);
          break;
      }
    } catch (error) {
      logger.error('_processMessage', 'Error processing WebSocket message:', error as Error, { message });
    }
  }
  
  private _handleParameterUpdate(messageData: any): void {
    const { pk, value } = messageData;
    if (pk === undefined || value === undefined) {
      logger.warn('_handleParameterUpdate', 'Received invalid parameter update message data.', { data: messageData });
      return;
    }
  
    logger.info('_handleParameterUpdate', `Processing parameter update for pk ${pk}.`, { newValue: value });
  
    if (this._dispatch) {
      try {
        const thunk = inventreeApi.util.invalidateTags([{ type: 'PartParameter', id: pk }]);
        this._dispatch(thunk);
        logger.debug('_handleParameterUpdate', `Successfully invalidated cache for PartParameter with pk: ${pk}`);
      } catch (error) {
        logger.error('_handleParameterUpdate', `Error invalidating cache for PartParameter with pk: ${pk}`, error as Error);
      }
    } else {
      logger.warn('_handleParameterUpdate', 'Dispatch function not available, cannot invalidate cache.');
    }
  }

  /**
   * Check if the websocket is connected
   * @returns boolean
   */
  public isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }
  
  /**
   * Get connection statistics
   */
  public getStats(): {
    connectionState: ConnectionState;
    isConnected: boolean;
    messageCount: number;
    errorCount: number;
    lastMessageTime: number;
    connectionAttempts: number;
    lastConnectionAttempt: number;
    lastSuccessfulConnection: number;
    lastServerMessageTime: number;
  } {
    return {
      connectionState: this._connectionState,
      isConnected: this.isConnected(),
      messageCount: this._messageCount,
      errorCount: this._errorCount,
      lastMessageTime: this._lastMessageTime,
      connectionAttempts: this._connectionAttempts,
      lastConnectionAttempt: this._lastConnectionAttempt,
      lastSuccessfulConnection: this._lastSuccessfulConnection,
      lastServerMessageTime: this._lastServerMessageTime
    };
  }
  
  /**
   * Reset the WebSocket plugin state
   */
  public reset(): void {
    this.disconnect();
    this._config = null;
    this._messageCallbacks = [];
    this._errorCount = 0;
    this._url = '';
    this._autoReconnect = true;
    this._reconnectInterval = 5000;
    this._timersInitialized = false;
    this._connectionState = ConnectionState.DISCONNECTED;
    this._lastConnectionAttempt = 0;
    this._connectionAttempts = 0;
    logger.info('reset', 'WebSocket plugin has been reset.');
  }

  /**
   * Send a message to the WebSocket server
   */
  public sendMessage(message: any): boolean {
    if (this._connection && this._connection.readyState === WebSocket.OPEN) {
      try {
        this._connection.send(JSON.stringify(message));
        logger.debug('sendMessage', 'Message sent:', { message });
        return true;
      } catch (error) {
        logger.error('sendMessage', 'Error sending message:', error as Error, { message });
        return false;
      }
    } else {
      logger.warn('sendMessage', 'Cannot send message, connection is not open.');
      return false;
    }
  }

  /**
   * Register a message callback
   * @param callback The callback to register
   */
  public registerMessageCallback(callback: (message: any) => void): void {
    this.onMessage(callback);
    logger.debug('registerMessageCallback', 'Message callback registered.');
  }

  /**
   * Unregister a message callback
   */
  public unregisterMessageCallback(callback: (message: any) => void): void {
    this._messageCallbacks = this._messageCallbacks.filter(cb => cb !== callback);
    logger.debug('unregisterMessageCallback', 'Message callback unregistered.');
  }

  /**
   * Force a reconnection attempt
   */
  public forceReconnect(): void {
    logger.info('forceReconnect', 'Forcing reconnection...');
    if (this._connection) {
      this._disconnecting = true; 
      this._connection.close();
      this._onConnectionClose({ wasClean: true, code: 1000, reason: 'Forced reconnect' } as CloseEvent);
    }
    this._disconnecting = false;
    this._scheduleReconnect(true);
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    logger.info('disconnect', 'Disconnecting from WebSocket server...');
    this._disconnecting = true;
    this._autoReconnect = false;
    this._closeConnection();
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private _scheduleReconnect(forceImmediate: boolean = false): void {
    if (!this._autoReconnect || this._connectionState === ConnectionState.CONNECTING) {
      return;
    }

    const delay = forceImmediate ? 0 : Math.min(
      this._minReconnectDelay + Math.pow(2, this._connectionAttempts) * 1000,
      this._maxReconnectDelay
    );

    logger.info('_scheduleReconnect', `Scheduling reconnect attempt in ${delay}ms.`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Generate a unique ID for the connection
   */
  private _generateConnectionId(): string {
    return 'conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Set the dispatch function for Redux
   * @param dispatch The Redux dispatch function
   */
  public setDispatch(dispatch: AppDispatch): void {
    this._dispatch = dispatch;
    logger.info('setDispatch', 'Redux dispatch function has been set.');
  }
}
