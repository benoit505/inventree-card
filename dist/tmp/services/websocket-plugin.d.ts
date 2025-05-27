import { DirectApiConfig } from '../types';
/**
 * Connection states for the WebSocket
 */
export declare enum ConnectionState {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    RECONNECTING = "reconnecting",
    FAILED = "failed",
    CLOSING = "closing"
}
/**
 * Plugin for direct WebSocket connection to InvenTree server
 * Handles parameter updates and other real-time events
 */
export declare class WebSocketPlugin {
    private static instance;
    private _config;
    private _connection;
    private _connectionId;
    private _isConnected;
    private _messageCallbacks;
    private _logger;
    private cache;
    private _errorCount;
    private _url;
    private _debug;
    private _disconnecting;
    private _autoReconnect;
    private _reconnectInterval;
    private _timersInitialized;
    private _connectionState;
    private _lastConnectionAttempt;
    private _connectionAttempts;
    private _maxReconnectDelay;
    private _minReconnectDelay;
    private _cooldownPeriod;
    private _lastStateChangeTime;
    private _lastSuccessfulConnection;
    private _lastServerMessageTime;
    private _serverInactivityTimeoutDuration;
    private _serverInactivityTimerId;
    private _messageCount;
    private _lastMessageTime;
    private _processingMessages;
    private _messageDebounceTime;
    private _messageDebounceQueue;
    private _dispatch;
    /**
     * Get the singleton instance
     */
    static getInstance(): WebSocketPlugin;
    /**
     * Private constructor for singleton
     */
    private constructor();
    /**
     * Configure the WebSocket connection
     * @param config Configuration options for the WebSocket connection
     */
    configure(config: DirectApiConfig): void;
    /**
     * Change connection state with appropriate logging
     */
    private _setConnectionState;
    /**
     * Clear all active timers
     */
    private _clearAllTimers;
    /**
     * Connect to the InvenTree WebSocket server
     */
    connect(): void;
    /**
     * Event handler for connection open
     */
    private _onConnectionOpen;
    /**
     * Event handler for connection message
     */
    private _onConnectionMessage;
    /**
     * Debounce processing of messages to avoid flooding the system.
     * Uses the instance member this._messageDebounceTime for the delay.
     */
    private _debouncedProcessMessage;
    /**
     * Notify all message callbacks
     */
    private _notifyMessageCallbacks;
    /**
     * Event handler for connection error
     */
    private _onConnectionError;
    /**
     * Event handler for connection close
     */
    private _onConnectionClose;
    /**
     * Close the current connection
     */
    private _closeConnection;
    /**
     * Start the server inactivity timer
     */
    private _startServerInactivityTimer;
    private _clearServerInactivityTimer;
    private _resetServerInactivityTimer;
    private _handleServerInactivity;
    /**
     * Register a callback for incoming messages
     */
    onMessage(callback: (message: any) => void): () => void;
    /**
     * Process incoming WebSocket message
     */
    private _processMessage;
    /**
     * Handle parameter update message
     */
    private _handleParameterUpdate;
    /**
     * Get the connection status
     */
    isConnected(): boolean;
    /**
     * Get statistics about the connection
     */
    getStats(): {
        connectionState: ConnectionState;
        isConnected: boolean;
        messageCount: number;
        errorCount: number;
        lastMessageTime: number;
        connectionAttempts: number;
        lastConnectionAttempt: number;
        lastSuccessfulConnection: number;
        lastServerMessageTime: number;
    };
    /**
     * Reset connection state and try to reconnect
     */
    reset(): void;
    /**
     * Get statistics about active timers
     */
    getTimerStats(): any;
    /**
     * Send a message to the WebSocket server
     * @param message Message to send
     * @returns Whether the message was sent successfully
     */
    sendMessage(message: any): boolean;
    /**
     * Register a callback for incoming messages
     * @param callback The callback to register
     */
    registerMessageCallback(callback: (message: any) => void): void;
    /**
     * Unregister a callback for incoming messages
     * @param callback The callback to unregister
     */
    unregisterMessageCallback(callback: (message: any) => void): void;
    /**
     * Get diagnostic information about the WebSocket connection
     */
    getDiagnostics(): any;
    /**
     * Force a reconnection attempt
     */
    forceReconnect(): void;
    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void;
    private _scheduleReconnect;
}
