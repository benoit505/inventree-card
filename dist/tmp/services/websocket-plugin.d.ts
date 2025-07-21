import { AppDispatch } from "../store";
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
    private _dispatch;
    private _debouncedProcessors;
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
     * Called when the WebSocket connection is opened
     */
    private _onConnectionOpen;
    /**
     * Called when a message is received from the WebSocket server
     */
    private _onConnectionMessage;
    /**
     * Debounces message processing based on a unique message identifier.
     */
    private _handleDebouncedMessageProcessing;
    /**
     * Notify all registered callbacks with the new message
     */
    private _notifyMessageCallbacks;
    /**
     * Called when a WebSocket error occurs
     */
    private _onConnectionError;
    /**
     * Called when the WebSocket connection is closed
     */
    private _onConnectionClose;
    /**
     * Close the WebSocket connection
     */
    private _closeConnection;
    private _startServerInactivityTimer;
    private _clearServerInactivityTimer;
    private _resetServerInactivityTimer;
    private _handleServerInactivity;
    onMessage(callback: (message: any) => void): () => void;
    private _processMessage;
    private _handleParameterUpdate;
    /**
     * Check if the websocket is connected
     * @returns boolean
     */
    isConnected(): boolean;
    /**
     * Get connection statistics
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
     * Reset the WebSocket plugin state
     */
    reset(): void;
    /**
     * Send a message to the WebSocket server
     */
    sendMessage(message: any): boolean;
    /**
     * Register a message callback
     * @param callback The callback to register
     */
    registerMessageCallback(callback: (message: any) => void): void;
    /**
     * Unregister a message callback
     */
    unregisterMessageCallback(callback: (message: any) => void): void;
    /**
     * Force a reconnection attempt
     */
    forceReconnect(): void;
    /**
     * Disconnect from the WebSocket server
     */
    disconnect(): void;
    /**
     * Schedule a reconnection attempt with exponential backoff
     */
    private _scheduleReconnect;
    /**
     * Generate a unique ID for the connection
     */
    private _generateConnectionId;
    /**
     * Set the dispatch function for Redux
     * @param dispatch The Redux dispatch function
     */
    setDispatch(dispatch: AppDispatch): void;
}
