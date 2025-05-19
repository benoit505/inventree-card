import { Logger } from "inventree-card/utils/logger";

export class WebSocketManager {
    private static _instance: WebSocketManager;
    private _connections: Map<string, WebSocket> = new Map();
    private _openCallbacks: Map<string, Set<(event: Event) => void>> = new Map();
    private _messageCallbacks: Map<string, Set<(event: MessageEvent) => void>> = new Map();
    private _keepAliveTimers: Map<string, number> = new Map();
    private _reconnectTimers: Map<string, number> = new Map();
    private _errorCounts: Map<string, number> = new Map();
    private _logger = Logger.getInstance();
    private _processingMessages: Set<string> = new Set();
    private _connectionStats: Map<string, {
        messagesReceived: number,
        messagesSent: number,
        lastActivity: number,
        errorCount: number
    }> = new Map();
    
    public static getInstance(): WebSocketManager {
        if (!WebSocketManager._instance) {
            WebSocketManager._instance = new WebSocketManager();
        }
        return WebSocketManager._instance;
    }
    
    constructor() {
        this._logger.log('WebSocketManager', 'Initialized singleton instance');
    }
    
    // Get a shared WebSocket connection
    public getConnection(url: string, onOpen?: (event: Event) => void, onMessage?: (event: MessageEvent) => void): WebSocket | null {
        // If we already have a connection to this URL, return it
        if (this._connections.has(url) && this._connections.get(url)?.readyState === WebSocket.OPEN) {
            const existingConnection = this._connections.get(url)!;
            
            // Register callbacks
            if (onOpen) this.addOpenCallback(url, onOpen);
            if (onMessage) this.addMessageCallback(url, onMessage);
            
            this._logger.log('WebSocketManager', `Using existing connection to ${url}`);
            return existingConnection;
        }
        
        // Clean up any existing connection for this URL
        this.closeConnection(url);
        
        // Create new connection
        try {
            const connection = new WebSocket(url);
            this._connections.set(url, connection);
            
            // Initialize error count
            this._errorCounts.set(url, 0);
            
            // Set up event handlers
            connection.onopen = (e) => this.handleOpen(e, url);
            connection.onmessage = (e) => this.handleMessage(e, url);
            connection.onerror = (e) => this.handleError(e, url);
            connection.onclose = (e) => this.handleClose(e as CloseEvent, url);
            
            // Register callbacks
            if (onOpen) this.addOpenCallback(url, onOpen);
            if (onMessage) this.addMessageCallback(url, onMessage);
            
            // Set up keep-alive
            this.setupKeepAlive(url);
            
            this._logger.log('WebSocketManager', `Created new shared connection to ${url}`);
            return connection;
        } catch (error) {
            this._logger.error('WebSocketManager', `Error creating connection to ${url}:`, error);
            return null;
        }
    }
    
    // Add a callback for connection open event
    public addOpenCallback(url: string, callback: (event: Event) => void): void {
        if (!this._openCallbacks.has(url)) {
            this._openCallbacks.set(url, new Set());
        }
        this._openCallbacks.get(url)?.add(callback);
    }
    
    // Add a callback for message event
    public addMessageCallback(url: string, callback: (event: MessageEvent) => void): void {
        if (!this._messageCallbacks.has(url)) {
            this._messageCallbacks.set(url, new Set());
        }
        this._messageCallbacks.get(url)?.add(callback);
    }
    
    // Remove callbacks for a connection
    public removeCallbacks(url: string, openCallback?: (event: Event) => void, messageCallback?: (event: MessageEvent) => void): void {
        if (openCallback && this._openCallbacks.has(url)) {
            this._openCallbacks.get(url)?.delete(openCallback);
        }
        
        if (messageCallback && this._messageCallbacks.has(url)) {
            this._messageCallbacks.get(url)?.delete(messageCallback);
        }
        
        // If no more callbacks for this URL, close the connection
        if (
            (!this._openCallbacks.has(url) || this._openCallbacks.get(url)?.size === 0) &&
            (!this._messageCallbacks.has(url) || this._messageCallbacks.get(url)?.size === 0)
        ) {
            this._logger.log('WebSocketManager', `No more callbacks for ${url}, closing connection`);
            this.closeConnection(url);
        }
    }
    
    // Close a specific connection
    public closeConnection(url: string): void {
        const connection = this._connections.get(url);
        if (connection) {
            // Only close if not already closing/closed
            if (connection.readyState !== WebSocket.CLOSING && connection.readyState !== WebSocket.CLOSED) {
                connection.close();
            }
            this._connections.delete(url);
        }
        
        // Clear timers
        if (this._keepAliveTimers.has(url)) {
            window.clearInterval(this._keepAliveTimers.get(url));
            this._keepAliveTimers.delete(url);
        }
        
        if (this._reconnectTimers.has(url)) {
            window.clearTimeout(this._reconnectTimers.get(url));
            this._reconnectTimers.delete(url);
        }
        
        // Clear callbacks
        this._openCallbacks.delete(url);
        this._messageCallbacks.delete(url);
    }
    
    // Close all connections (for cleanup)
    public closeAllConnections(): void {
        for (const url of this._connections.keys()) {
            this.closeConnection(url);
        }
        this._logger.log('WebSocketManager', 'Closed all WebSocket connections');
    }
    
    // Handle WebSocket open event
    private handleOpen(event: Event, url: string): void {
        this._logger.log('WebSocketManager', `Connection established to ${url}`);
        
        // Reset error count
        this._errorCounts.set(url, 0);
        
        // Call registered callbacks
        if (this._openCallbacks.has(url)) {
            for (const callback of this._openCallbacks.get(url) || []) {
                try {
                    callback(event);
                } catch (error) {
                    this._logger.error('WebSocketManager', `Error in open callback for ${url}:`, error);
                }
            }
        }
    }
    
    // Handle WebSocket message event
    private handleMessage(event: MessageEvent, url: string): void {
        try {
            const message = JSON.parse(event.data);
            
            // Don't process ping/pong messages for logging
            if (message.type === 'ping' || message.type === 'pong' || message.type === 'echo') {
                // Process these basic messages without further checks
                this._handleBasicMessage(message, url);
                return;
            }
            
            // For parameter updates, add recursion protection
            if (message.type === 'event' && message.event === 'part_partparameter.saved') {
                const messageId = `${message.data.parent_id}:${message.data.parameter_name}:${message.data.parameter_value}`;
                
                // Check if we're already processing this exact message
                if (this._processingMessages.has(messageId)) {
                    this._logger.log('WebSocketManager', `Preventing duplicate parameter message processing for ${messageId}`, { 
                        category: 'websocket',
                        subsystem: 'deduplication'
                    });
                    return;
                }
                
                // Mark this message as being processed
                this._processingMessages.add(messageId);
                
                // Clear the marker after a short time
                setTimeout(() => {
                    this._processingMessages.delete(messageId);
                }, 2000);
            }
            
            // Call registered callbacks with standard throttling
            if (this._messageCallbacks.has(url)) {
                for (const callback of this._messageCallbacks.get(url) || []) {
                    try {
                        callback(event);
                    } catch (error) {
                        this._logger.error('WebSocketManager', `Error in message callback for ${url}:`, error);
                    }
                }
            }
        } catch (error) {
            this._logger.error('WebSocketManager', `Error parsing message from ${url}:`, error);
        }
    }
    
    // Simple handler for basic messages like ping/pong
    private _handleBasicMessage(message: any, url: string): void {
        // Handle ping messages
        if (message.type === 'ping' && message.source === 'server') {
            const connection = this._connections.get(url);
            if (connection && connection.readyState === WebSocket.OPEN) {
                try {
                    connection.send(JSON.stringify({
                        type: 'pong',
                        source: 'client',
                        time: Date.now() / 1000
                    }));
                } catch (error) {
                    this._logger.error('WebSocketManager', `Error sending pong to ${url}:`, error);
                }
            }
        }
    }
    
    // Handle WebSocket error event
    private handleError(event: Event, url: string): void {
        // Increment error count
        const currentCount = this._errorCounts.get(url) || 0;
        this._errorCounts.set(url, currentCount + 1);
        
        this._logger.error('WebSocketManager', `WebSocket error for ${url} (count: ${currentCount + 1}):`, event);
    }
    
    // Handle WebSocket close event
    private handleClose(event: CloseEvent, url: string): void {
        this._logger.log('WebSocketManager', `Connection closed for ${url}: ${event.code} ${event.reason}`);
        
        // Remove from active connections
        this._connections.delete(url);
        
        // Clear keep-alive timer
        if (this._keepAliveTimers.has(url)) {
            window.clearInterval(this._keepAliveTimers.get(url));
            this._keepAliveTimers.delete(url);
        }
        
        // Set up reconnect timer with exponential backoff
        const errorCount = this._errorCounts.get(url) || 0;
        const reconnectDelay = Math.min(5000 * Math.pow(1.5, errorCount), 60000);
        
        this._logger.log('WebSocketManager', `Will attempt to reconnect to ${url} in ${reconnectDelay/1000} seconds`);
        
        const timer = window.setTimeout(() => {
            this._logger.log('WebSocketManager', `Attempting to reconnect to ${url}`);
            
            // Recreate the connection with the same callbacks
            const openCallbacks = this._openCallbacks.get(url);
            const messageCallbacks = this._messageCallbacks.get(url);
            
            // Clear callback maps (they'll be repopulated on reconnect)
            this._openCallbacks.delete(url);
            this._messageCallbacks.delete(url);
            
            // Recreate connection
            const newConnection = this.getConnection(url);
            
            // Re-register callbacks
            if (newConnection && openCallbacks) {
                for (const callback of openCallbacks) {
                    this.addOpenCallback(url, callback);
                }
            }
            
            if (newConnection && messageCallbacks) {
                for (const callback of messageCallbacks) {
                    this.addMessageCallback(url, callback);
                }
            }
        }, reconnectDelay);
        
        this._reconnectTimers.set(url, timer);
    }
    
    // Set up keep-alive mechanism for a connection
    private setupKeepAlive(url: string): void {
        // Clear any existing timer
        if (this._keepAliveTimers.has(url)) {
            window.clearInterval(this._keepAliveTimers.get(url));
        }
        
        // Create new timer
        const timer = window.setInterval(() => {
            const connection = this._connections.get(url);
            if (connection && connection.readyState === WebSocket.OPEN) {
                // Send ping message
                try {
                    connection.send(JSON.stringify({
                        type: 'ping',
                        source: 'client',
                        time: Date.now() / 1000
                    }));
                } catch (error) {
                    this._logger.error('WebSocketManager', `Error sending keep-alive for ${url}:`, error);
                }
            }
        }, 30000); // 30 second interval
        
        this._keepAliveTimers.set(url, timer);
    }
    
    // For cleanup
    public destroy(): void {
        this.closeAllConnections();
    }
    
    // Check if a connection is active
    public isConnected(url: string): boolean {
        return this._connections.has(url) && this._connections.get(url)?.readyState === WebSocket.OPEN;
    }
    
    // Get connection statistics
    public getStats(): { activeConnections: number, connections: Record<string, any> } {
        const stats = {
            activeConnections: 0,
            connections: {} as Record<string, any>
        };
        
        for (const [url, connection] of this._connections.entries()) {
            if (connection.readyState === WebSocket.OPEN) {
                stats.activeConnections++;
            }
            
            stats.connections[url] = {
                state: this.getReadyStateString(connection.readyState),
                errorCount: this._errorCounts.get(url) || 0,
                openCallbacks: this._openCallbacks.get(url)?.size || 0,
                messageCallbacks: this._messageCallbacks.get(url)?.size || 0,
                hasKeepAlive: this._keepAliveTimers.has(url),
                hasReconnectTimer: this._reconnectTimers.has(url)
            };
        }
        
        return stats;
    }
    
    private getReadyStateString(state: number): string {
        switch (state) {
            case WebSocket.CONNECTING: return 'CONNECTING';
            case WebSocket.OPEN: return 'OPEN';
            case WebSocket.CLOSING: return 'CLOSING';
            case WebSocket.CLOSED: return 'CLOSED';
            default: return 'UNKNOWN';
        }
    }
    
    /**
     * Record activity for a connection
     */
    private _recordActivity(url: string, type: 'received' | 'sent' | 'error'): void {
        if (!this._connectionStats.has(url)) {
            this._connectionStats.set(url, {
                messagesReceived: 0,
                messagesSent: 0,
                lastActivity: Date.now(),
                errorCount: 0
            });
        }
        
        const stats = this._connectionStats.get(url)!;
        
        if (type === 'received') {
            stats.messagesReceived++;
        } else if (type === 'sent') {
            stats.messagesSent++;
        } else if (type === 'error') {
            stats.errorCount++;
        }
        
        stats.lastActivity = Date.now();
    }
    
    /**
     * Get enhanced statistics for all connections
     */
    public getEnhancedStats(): { activeConnections: number, connections: Record<string, any> } {
        const basicStats = this.getStats();
        
        // Add detailed connection stats
        for (const [url, connection] of this._connections.entries()) {
            if (basicStats.connections[url]) {
                basicStats.connections[url].stats = this._connectionStats.get(url) || {
                    messagesReceived: 0,
                    messagesSent: 0,
                    lastActivity: 0,
                    errorCount: 0
                };
            }
        }
        
        return basicStats;
    }
} 