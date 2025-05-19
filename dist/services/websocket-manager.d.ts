/**
 * @deprecated This file is being phased out and will be removed in a future version.
 * It currently contains stub implementations to maintain backward compatibility.
 * WebSocket connections are now handled directly with browser APIs.
 */
/**
 * DEPRECATED: WebSocketManager is now a stub implementation
 * This class will be removed in a future version
 */
export declare class WebSocketManager {
    private static _instance;
    private _connections;
    private _openCallbacks;
    private _messageCallbacks;
    private _keepAliveTimers;
    private _reconnectTimers;
    private _errorCounts;
    private _logger;
    private _processingMessages;
    private _connectionStats;
    static getInstance(): WebSocketManager;
    constructor();
    getConnection(url: string, onOpen?: (event: Event) => void, onMessage?: (event: MessageEvent) => void): WebSocket | null;
    addOpenCallback(url: string, callback: (event: Event) => void): void;
    addMessageCallback(url: string, callback: (event: MessageEvent) => void): void;
    removeCallbacks(url: string, openCallback?: (event: Event) => void, messageCallback?: (event: MessageEvent) => void): void;
    closeConnection(url: string): void;
    closeAllConnections(): void;
    private handleOpen;
    private handleMessage;
    private _handleBasicMessage;
    private handleError;
    private handleClose;
    private setupKeepAlive;
    destroy(): void;
    isConnected(url: string): boolean;
    getStats(): {
        activeConnections: number;
        connections: Record<string, any>;
    };
    /**
     * Record activity for a connection
     */
    private _recordActivity;
    /**
     * Get enhanced statistics for all connections
     */
    getEnhancedStats(): {
        activeConnections: number;
        connections: Record<string, any>;
    };
}
