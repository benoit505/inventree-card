import { Logger } from "../utils/logger";
import { CacheService, DEFAULT_TTL, CacheCategory } from "./cache";
import { HomeAssistant } from "custom-card-helpers";
import { safeSetTimeout, safeClearTimeout, safeSetInterval, safeClearInterval, cleanupAllTimers } from "../utils/safe-timer";
import { store } from "../store";
import { webSocketMessageReceived, setWebSocketStatus } from '../store/slices/websocketSlice';
import { webSocketUpdateReceived as webSocketUpdateReceivedAction } from '../store/slices/parametersSlice';
import { WebSocketEventMessage, DirectApiConfig } from '../types';
import { Dispatch, UnknownAction } from '@reduxjs/toolkit';

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
  private _logger: Logger;
  private cache: CacheService = CacheService.getInstance();
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
  private _messageDebounceQueue: Map<string, {message: any, timerId: number}> = new Map();
  private _dispatch: Dispatch<UnknownAction> | null = null;

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
    this._logger = Logger.getInstance();
    this._lastServerMessageTime = 0; // Initialize
    if (!this._timersInitialized) {
      // safeSetTimeout(() => this._initializeTimers(), 0, 'init-timers'); // Defer timer init if causing issues
      this._timersInitialized = true;
    }
    this._logger.log('WebSocketPlugin', 'Instance created.', {
      category: 'websocket',
      subsystem: 'plugin'
    });
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
      this._logger.log('WebSocket', `Using explicit WebSocket URL: ${this._url}`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
    } else if (config.url && config.url.trim() !== '') {
      const baseUrl = config.url.trim().replace(/\/+$/, ''); 
      if (baseUrl.startsWith('http')) {
        this._url = baseUrl.replace(/^http/, 'ws') + '/ws/'; 
      } else {
        this._url = `ws://${baseUrl}/ws/`; 
      }
      this._logger.log('WebSocket', `Derived WebSocket URL from API URL: ${this._url} (Base: ${config.url})`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
    } else {
      this._url = ''; 
      this._logger.warn('WebSocket', 'Could not determine WebSocket URL from configuration.', {
        category: 'websocket',
        subsystem: 'plugin'
      });
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
    
    this._logger.log('WebSocket', `Configured WebSocket plugin. Target URL: ${this._url}, Auto-Reconnect: ${this._autoReconnect}, Reconnect Interval: ${this._reconnectInterval}ms, Debounce: ${this._messageDebounceTime}ms, Server Inactivity Timeout: ${this._serverInactivityTimeoutDuration}ms`, {
      category: 'websocket',
      subsystem: 'plugin'
    });
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
      this._logger.warn('WebSocket', `Invalid state transition from ${oldState} to ${newState}`, {
        category: 'websocket',
        subsystem: 'state'
      });
      return;
    }
    
    // Update state
    this._connectionState = newState;
    this._lastStateChangeTime = Date.now();
    
    this._logger.log('WebSocket', `Connection state changed: ${oldState} -> ${newState}`, {
      category: 'websocket', 
      subsystem: 'state'
    });
    
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
    this._logger.log('WebSocketPlugin', 'Clearing all timers', { category: 'websocket', subsystem: 'timers' });
    if (this._serverInactivityTimerId) {
      safeClearTimeout(this._serverInactivityTimerId);
      this._serverInactivityTimerId = null;
    }
  }
  
  /**
   * Connect to the InvenTree WebSocket server
   */
  public connect(): void {
    if (!this._timersInitialized || !this._url) {
      this._logger.warn('WebSocket', 'Cannot connect - plugin not initialized or URL not provided', {
        category: 'websocket',
        subsystem: 'plugin'
      });
      return;
    }
    
    // Check connection state
    if (this._connectionState === ConnectionState.CONNECTING || 
        this._connectionState === ConnectionState.CONNECTED) {
      this._logger.log('WebSocket', `Already ${this._connectionState}, not initiating new connection`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
      return;
    }
    
    // Enforce cooldown period between connection attempts
    const timeSinceLastAttempt = Date.now() - this._lastConnectionAttempt;
    if (timeSinceLastAttempt < this._cooldownPeriod) {
      this._logger.log('WebSocket', `Connection attempt too soon (${timeSinceLastAttempt}ms since last attempt), enforcing cooldown`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
      
      // Schedule a connection attempt after the cooldown using safe timer utilities
      safeSetTimeout(() => {
        this.connect();
      }, this._cooldownPeriod - timeSinceLastAttempt, 'connection-cooldown');
      
      return;
    }
    
    // Update connection tracking
    this._lastConnectionAttempt = Date.now();
    this._connectionAttempts++;
    
    try {
      // Set state to connecting
      this._setConnectionState(ConnectionState.CONNECTING);
      
      this._logger.log('WebSocket', `Connecting to InvenTree WebSocket at ${this._url} (attempt #${this._connectionAttempts + 1})`, { 
        category: 'websocket', 
        subsystem: 'plugin' 
      });
      
      // Create a WebSocket connection
      this._connection = new WebSocket(this._url);
      
      // Add connection timeout (10 seconds) using safe timer utilities
      safeSetTimeout(() => {
        if (this._connectionState === ConnectionState.CONNECTING) {
          this._logger.warn('WebSocket', 'Connection attempt timed out after 10 seconds', {
            category: 'websocket',
            subsystem: 'plugin'
          });
          
          // Close the connection if it's still pending
          this._closeConnection();
          
          // Set state to failed
          this._setConnectionState(ConnectionState.FAILED);
        }
      }, 10000, 'connection-timeout');
      
      // Set up event handlers
      this._connection.onopen = this._onConnectionOpen.bind(this);
      this._connection.onmessage = this._onConnectionMessage.bind(this);
      this._connection.onerror = this._onConnectionError.bind(this);
      this._connection.onclose = this._onConnectionClose.bind(this);
      
    } catch (error) {
      this._logger.error('WebSocket', `Error creating WebSocket: ${error}`, {
        category: 'websocket',
        subsystem: 'plugin'
      });
      
      this._setConnectionState(ConnectionState.FAILED);
    }
  }
  
  /**
   * Event handler for connection open
   */
  private _onConnectionOpen(event: Event): void {
    this._setConnectionState(ConnectionState.CONNECTED);
    this._isConnected = true;
    this._connectionAttempts = 0; // Reset on successful connection
    this._lastSuccessfulConnection = Date.now();
    this._errorCount = 0; // Reset error count on new successful connection

    // If dispatch is available, set global WebSocket status
    if (this._dispatch) {
      this._dispatch(setWebSocketStatus('connected'));
    }
    
    this._logger.log('WebSocketPlugin', 'WebSocket connection established successfully.', {
      category: 'websocket',
      subsystem: 'connection',
      connectionId: this._connectionId
    });

    // Start server inactivity detection
    this._lastServerMessageTime = Date.now();
    this._startServerInactivityTimer();
  }
  
  /**
   * Event handler for connection message
   */
  private _onConnectionMessage(event: MessageEvent): void {
    this._lastMessageTime = Date.now();
    this._messageCount++;
    this._lastServerMessageTime = Date.now(); // Update on any server message
    this._resetServerInactivityTimer();      // Reset inactivity timer

    let messageData;
    try {
      messageData = JSON.parse(event.data as string);
    } catch (error) {
      this._logger.error('WebSocket', 'Failed to parse incoming JSON message', { 
        category: 'websocket',
        subsystem: 'message',
        error: error,
        rawData: event.data 
      });
      return;
    }

    // Use a unique identifier for debouncing if available, otherwise use raw message string (less ideal)
    // Example: use message.event or message.type if consistent, or hash of message content.
    // For simplicity, let's assume a message.type or message.event exists for grouping.
    const messageId = messageData.event || messageData.type || JSON.stringify(messageData); 

    // --- BEGIN Temporary Direct Console Log for Raw Message ---
    console.log('RAW WEBSOCKET MESSAGE (messageData):', JSON.stringify(messageData, null, 2));
    // --- END Temporary Direct Console Log ---

    this._logger.log('WebSocket', 'Raw message received (stringified)', {
      category: 'websocket',
      subsystem: 'message',
      data: JSON.stringify(messageData, null, 2),
      level: 'info'
    });
    
    // Debounce message processing based on messageId
    // This will use this._messageDebounceTime which is set by configure()
    this._debouncedProcessMessage(messageData, messageId);
  }
  
  /**
   * Debounce processing of messages to avoid flooding the system.
   * Uses the instance member this._messageDebounceTime for the delay.
   */
  private _debouncedProcessMessage(message: any, messageId: string): void {
    // If a timer already exists for this messageId, clear it
    if (this._messageDebounceQueue.has(messageId)) {
      const existingEntry = this._messageDebounceQueue.get(messageId)!;
      safeClearTimeout(existingEntry.timerId);
      this._logger.log('WebSocket', `Debounce: Cleared existing timer for messageId: ${messageId}`, { level: 'silly' });
    }
    
    // Set a new timer to process this message after the debounce period
    const timerId = safeSetTimeout(() => {
      this._messageDebounceQueue.delete(messageId); // Remove from queue before processing
      this._logger.log('WebSocket', `Debounce: Executing for messageId: ${messageId}`, { data: message, level: 'silly' });
      this._processMessage(message); // Process the actual message
    }, this._messageDebounceTime); // Use the configured debounce time
    
    // Store the new timerId in the queue
    this._messageDebounceQueue.set(messageId, { message, timerId });
    this._logger.log('WebSocket', `Debounce: Set new timer for messageId: ${messageId}, delay: ${this._messageDebounceTime}ms`, { level: 'silly' });
  }
  
  /**
   * Notify all message callbacks
   */
  private _notifyMessageCallbacks(message: any): void {
    for (const callback of this._messageCallbacks) {
      try {
        callback(message);
      } catch (error) {
        this._logger.error('WebSocket', `Error in message callback: ${error}`, {
          category: 'websocket',
          subsystem: 'callback'
        });
      }
    }
  }
  
  /**
   * Event handler for connection error
   */
  private _onConnectionError(event: Event): void {
    this._errorCount++;
    this._logger.error('WebSocketPlugin', `WebSocket error event triggered - error count: ${this._errorCount}`, {
      category: 'websocket',
      subsystem: 'error',
      eventData: event // Generic event might not have much detail
    });
    // Error event often precedes close event. State transition might be handled in onClose.
    // If not already connecting/reconnecting, transition to failed and attempt reconnect.
    if (this._connectionState !== ConnectionState.CONNECTING && this._connectionState !== ConnectionState.RECONNECTING) {
        this._setConnectionState(ConnectionState.FAILED);
        if (this._autoReconnect) {
            this._scheduleReconnect();
        }
    }
  }
  
  /**
   * Event handler for connection close
   */
  private _onConnectionClose(event: CloseEvent): void {
    const previousState = this._connectionState;
    this._setConnectionState(ConnectionState.DISCONNECTED);
    this._isConnected = false;
    this._clearServerInactivityTimer(); // Stop inactivity timer

    this._logger.log('WebSocketPlugin', `WebSocket connection closed. Code: ${event.code}, Reason: "${event.reason || 'Unknown reason'}", Was Clean: ${event.wasClean}`, {
      category: 'websocket',
      subsystem: 'connection',
      connectionId: this._connectionId,
      previousState: previousState
    });

    if (this._dispatch) {
      this._dispatch(setWebSocketStatus('disconnected'));
    }

    if (!this._disconnecting && this._autoReconnect) { // If not an intentional disconnect
      this._logger.log('WebSocketPlugin', 'Auto-reconnect is enabled, scheduling reconnect.', { category: 'websocket', subsystem: 'reconnect' });
      this._scheduleReconnect();
    } else {
      this._logger.log('WebSocketPlugin', 'Auto-reconnect disabled or intentionally disconnecting, not scheduling reconnect.', { category: 'websocket', subsystem: 'reconnect' });
      // Ensure state is truly disconnected if it was closing
      if (previousState === ConnectionState.CLOSING) {
          this._setConnectionState(ConnectionState.DISCONNECTED); // Finalize state
      }
    }
    this._connection = null; // Clear the connection object
  }
  
  /**
   * Close the current connection
   */
  private _closeConnection(): void {
    this._logger.log('WebSocketPlugin', 'Attempting to close WebSocket connection.', { category: 'websocket', subsystem: 'connection', currentState: this._connectionState });
    if (this._connection) {
      if (this._connection.readyState === WebSocket.OPEN || this._connection.readyState === WebSocket.CONNECTING) {
        this._setConnectionState(ConnectionState.CLOSING);
        this._connection.close(1000, 'Client initiated disconnect'); // Normal closure
      } else {
        this._logger.log('WebSocketPlugin', 'Connection already closed or closing.', { readyState: this._connection.readyState });
        // Ensure timers are cleared if connection was, e.g., already closed by server
        this._clearAllTimers();
        this._setConnectionState(ConnectionState.DISCONNECTED); // Ensure state reflects reality
      }
    } else {
      this._logger.log('WebSocketPlugin', 'No active connection to close.');
      this._setConnectionState(ConnectionState.DISCONNECTED); // Ensure state if no connection object
    }
  }
  
  /**
   * Start the server inactivity timer
   */
  private _startServerInactivityTimer(): void {
    this._clearServerInactivityTimer(); // Clear any existing timer

    if (this._connectionState === ConnectionState.CONNECTED) { // Only run if connected
      this._logger.log('WebSocketPlugin', `Starting server inactivity timer for ${this._serverInactivityTimeoutDuration}ms.`, { category: 'websocket', subsystem: 'heartbeat' });
      this._serverInactivityTimerId = safeSetTimeout(
        () => {
          this._handleServerInactivity();
        }, 
        this._serverInactivityTimeoutDuration
      );
    }
  }

  private _clearServerInactivityTimer(): void {
    if (this._serverInactivityTimerId) {
      safeClearTimeout(this._serverInactivityTimerId);
      this._serverInactivityTimerId = null;
    }
  }

  private _resetServerInactivityTimer(): void {
    this._startServerInactivityTimer();
  }

  private _handleServerInactivity(): void {
    this._logger.warn('WebSocketPlugin', 'Server inactivity detected. Last message received more than timeout period ago.', {
      category: 'websocket',
      subsystem: 'heartbeat',
      lastMessageTime: new Date(this._lastServerMessageTime).toISOString(),
      timeoutDuration: this._serverInactivityTimeoutDuration
    });
    this._errorCount++; // Consider this an error scenario
    
    this._logger.error('WebSocketPlugin', 'Max server inactivity reached, closing connection as potentially stale.', { category: 'websocket', subsystem: 'heartbeat' });
    
    this._disconnecting = false; // Ensure auto-reconnect can happen
    this.disconnect(); // This call is correct (0 arguments for a 0-parameter function)
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
   * Process incoming WebSocket message
   */
  private _processMessage(message: any): void {
    // Check if this is a parameter update by looking inside message.data
    if (message.data && message.data.model === 'PartParameter') {
      this._handleParameterUpdate(message.data); // Pass message.data to the handler
    }
    // Add other message type handlers as needed
  }
  
  /**
   * Handle parameter update message
   */
  private _handleParameterUpdate(messageData: any): void { // Changed parameter name to messageData for clarity
    this._logger.log('WebSocketPlugin', `Handling parameter update: ${JSON.stringify(messageData)}`, {
      category: 'websocket',
      subsystem: 'parameters',
      level: 'info'
    });
    
    // Extract from messageData directly (which was the nested 'data' object from the raw message)
    const partId = messageData.part_pk; 
    const paramName = messageData.parameter_name;
    const paramValue = messageData.parameter_value;
      
    if (!partId || !paramName) {
      this._logger.warn('WebSocketPlugin', 'Missing partId or parameter name in update messageData', { data: messageData });
      return;
    }
    
    this._logger.log('WebSocketPlugin', 'Dispatching action from webSocketUpdateReceivedAction for parameter update.', { 
        level: 'info', 
        subsystem: 'dispatch', 
        data: { partId, parameterName: paramName, value: paramValue }
    });

    store.dispatch(webSocketUpdateReceivedAction({
        partId: Number(partId),
        parameterName: String(paramName),
        value: paramValue, 
        source: 'websocket-plugin'
    }));
  }
  
  /**
   * Get the connection status
   */
  public isConnected(): boolean {
    return this._connectionState === ConnectionState.CONNECTED;
  }
  
  /**
   * Get statistics about the connection
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
      isConnected: this._isConnected,
      messageCount: this._messageCount,
      errorCount: this._errorCount,
      lastMessageTime: this._lastMessageTime,
      connectionAttempts: this._connectionAttempts,
      lastConnectionAttempt: this._lastConnectionAttempt,
      lastSuccessfulConnection: this._lastSuccessfulConnection,
      lastServerMessageTime: this._lastServerMessageTime,
    };
  }
  
  /**
   * Reset connection state and try to reconnect
   */
  public reset(): void {
    this._logger.log('WebSocket', 'Resetting WebSocket connection', {
      category: 'websocket',
      subsystem: 'control'
    });
    
    // Disconnect first
    this.disconnect();
    
    // Reset error counters
    this._errorCount = 0;
    this._connectionAttempts = 0;
    
    // Wait a moment before reconnecting
    safeSetTimeout(() => {
      if (this._config?.enabled) {
        this.connect();
      }
    }, 1000);
  }
  
  /**
   * Get statistics about active timers
   */
  public getTimerStats(): any {
    return {
      isInitialized: this._timersInitialized,
      messageQueueSize: this._messageDebounceQueue.size
    };
  }

  /**
   * Send a message to the WebSocket server
   * @param message Message to send
   * @returns Whether the message was sent successfully
   */
  public sendMessage(message: any): boolean {
    if (!this._connection || this._connection.readyState !== WebSocket.OPEN) {
      this._logger.warn('WebSocket', 'Cannot send message - WebSocket not connected', {
        category: 'websocket',
        subsystem: 'message'
      });
      return false;
    }
    
    try {
      this._connection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this._logger.error('WebSocket', `Error sending message: ${error}`, {
        category: 'websocket',
        subsystem: 'message'
      });
      return false;
    }
  }

  /**
   * Register a callback for incoming messages
   * @param callback The callback to register
   */
  public registerMessageCallback(callback: (message: any) => void): void {
    if (!this._messageCallbacks.includes(callback)) {
      this._messageCallbacks.push(callback);
    }
  }

  /**
   * Unregister a callback for incoming messages
   * @param callback The callback to unregister
   */
  public unregisterMessageCallback(callback: (message: any) => void): void {
    const index = this._messageCallbacks.indexOf(callback);
    if (index !== -1) {
      this._messageCallbacks.splice(index, 1);
    }
  }

  /**
   * Get diagnostic information about the WebSocket connection
   */
  public getDiagnostics(): any {
    const now = Date.now();
    const safeStringify = (obj: any) => {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return `Error stringifying object: ${e instanceof Error ? e.message : String(e)}`;
      }
    };

    return {
      config: this._config ? safeStringify(this._config) : 'Not configured',
      url: this._url,
      connectionState: this._connectionState,
      isConnected: this._isConnected,
      isConfigured: this._timersInitialized,
      lastConnectionAttempt: this._lastConnectionAttempt ? new Date(this._lastConnectionAttempt).toISOString() : 'N/A',
      connectionAttempts: this._connectionAttempts,
      lastSuccessfulConnection: this._lastSuccessfulConnection ? new Date(this._lastSuccessfulConnection).toISOString() : 'N/A',
      lastStateChangeTime: this._lastStateChangeTime ? new Date(this._lastStateChangeTime).toISOString() : 'N/A',
      timeSinceLastStateChangeMs: this._lastStateChangeTime ? (now - this._lastStateChangeTime) : 'N/A',
      disconnectingIntentional: this._disconnecting,
      autoReconnectEnabled: this._autoReconnect,
      reconnectIntervalMs: this._reconnectInterval,
      timersInitialized: this._timersInitialized,
      messageStats: {
        count: this._messageCount,
        lastReceivedTime: this._lastMessageTime ? new Date(this._lastMessageTime).toISOString() : 'N/A',
        timeSinceLastMessageMs: this._lastMessageTime ? (now - this._lastMessageTime) : 'N/A',
        debounceQueueSize: this._messageDebounceQueue.size,
        processingMessagesCount: this._processingMessages.size,
      },
      serverInactivity: {
        lastServerMessageTime: this._lastServerMessageTime ? new Date(this._lastServerMessageTime).toISOString() : 'N/A',
        timeSinceLastServerMessageMs: this._lastServerMessageTime ? (now - this._lastServerMessageTime) : 'N/A',
        inactivityTimeoutMs: this._serverInactivityTimeoutDuration,
        inactivityTimerRunning: !!this._serverInactivityTimerId,
      },
      timerManagerStats: this.getTimerStats()
    };
  }

  /**
   * Force a reconnection attempt
   */
  public forceReconnect(): void {
    this._logger.log('WebSocket', 'Forcing reconnection...', {
      category: 'websocket',
      subsystem: 'plugin'
    });
    
    // Close any existing connection
    this._closeConnection();
    
    // Reset error count
    this._errorCount = 0;
    
    // Set state to reconnecting
    this._setConnectionState(ConnectionState.RECONNECTING);
    
    // Connect immediately
    safeSetTimeout(() => {
      this.connect();
    }, 100, 'force-reconnect');
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    // Set flag to prevent auto-reconnect
    this._disconnecting = true;
    
    // Clear all timers
    this._clearAllTimers();
    
    // Close the connection
    this._closeConnection();
    
    // Update state after a brief delay to allow close event to process
    safeSetTimeout(() => {
      this._disconnecting = false;
      this._setConnectionState(ConnectionState.DISCONNECTED);
    }, 100, 'disconnect-complete');
  }

  private _scheduleReconnect(forceImmediate: boolean = false): void {
    if (!this._autoReconnect || this._disconnecting) {
      this._logger.log('WebSocket', 'Auto-reconnect disabled or intentionally disconnecting, not scheduling reconnect.', {
        category: 'websocket',
        subsystem: 'reconnect'
      });
      // Ensure state is truly disconnected if it was RECONNECTING, otherwise it might be stuck
      if (this._connectionState === ConnectionState.RECONNECTING) {
         this._setConnectionState(ConnectionState.DISCONNECTED);
      }
      return;
    }

    // If already connecting or connected, don't schedule another reconnect immediately
    if (this._connectionState === ConnectionState.CONNECTING || this._connectionState === ConnectionState.CONNECTED) {
        this._logger.log('WebSocketPlugin', 'Already connecting or connected, skipping scheduled reconnect.', { category: 'websocket', subsystem: 'reconnect' });
        return;
    }

    this._setConnectionState(ConnectionState.RECONNECTING);
    
    // Simple fixed interval based on _reconnectInterval for now
    // Exponential backoff could be added later if needed, respecting _minReconnectDelay and _maxReconnectDelay
    const delay = forceImmediate ? 0 : this._reconnectInterval; 

    this._logger.log('WebSocket', `Scheduling reconnect in ${delay}ms (attempt ${this._connectionAttempts + 1})`, {
      category: 'websocket',
      subsystem: 'reconnect'
    });
    
    // Clear existing reconnect timer before setting a new one
    // This requires storing the timer ID if we want to clear it specifically.
    // For simplicity, ensure connect() is only called if state is RECONNECTING.
    safeSetTimeout(() => {
      if (this._connectionState === ConnectionState.RECONNECTING) { // Check state before attempting
        this.connect();
      } else {
        this._logger.log('WebSocketPlugin', `Reconnect was scheduled but current state is ${this._connectionState}, aborting connect attempt.`, { category: 'websocket', subsystem: 'reconnect' });
      }
    }, delay, `reconnect-${this._connectionId || 'global'}`);
  }
}
