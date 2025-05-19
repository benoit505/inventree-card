/**
 * CardController - Central Orchestration Component for InvenTree Card
 *
 * == Architecture Overview ==
 * The CardController is the primary orchestration component that manages:
 * 1. Configuration handling and validation
 * 2. Connection to data sources:
 *    - Home Assistant (HASS) entity data
 *    - Direct InvenTree API
 *    - WebSocket connections for real-time updates
 * 3. Service initialization and management:
 *    - Parameter service for parameter operations
 *    - Rendering service for UI components
 *    - WebSocket service for HASS communication
 *    - WebSocket plugin for direct InvenTree updates
 *
 * == Data Flow Architecture ==
 * 1. Initial Configuration (setConfig)
 *    - Card config received from HASS
 *    - Services initialized based on configuration
 *
 * 2. HASS Connection (setHass)
 *    - Connects to Home Assistant
 *    - Loads initial entity data
 *
 * 3. Direct API (initializeApi)
 *    - Establishes connection to InvenTree API
 *    - Links API to parameter service
 *
 * 4. WebSocket Updates (initializeWebSocketPlugin)
 *    - Connects to InvenTree WebSocket
 *    - Handles real-time parameter updates
 *
 * 5. Data Processing and Updates
 *    - Entity data stored in InvenTreeState
 *    - Parameter updates applied directly via API or through state manager
 *    - Events dispatched for UI updates
 *
 * 6. UI Rendering
 *    - Parts data retrieved from InventTreeState with priority logic
 *    - Rendering service manages UI components
 *
 * == Connection Management ==
 * - WebSocket connections implement a state machine to manage connection lifecycle
 * - Exponential backoff with jitter for reconnection attempts
 * - Connection states tracked (DISCONNECTED, CONNECTING, CONNECTED, etc.)
 * - Ping/pong monitoring to detect zombie connections
 *
 * == Key Components ==
 * - Singleton pattern ensures one controller instance
 * - Centralized logging with category and subsystem tracking
 * - Cache system for deduplication of rapid updates
 * - WebSocket Plugin handles direct InvenTree WebSocket messages
 * - InventTreeState manages data from multiple sources with priority logic
 */
import { HomeAssistant } from "custom-card-helpers";
import { InventreeCardConfig } from "../core/types";
import { WebSocketService } from "./websocket";
import { WebSocketPlugin } from "./websocket-plugin";
/**
 * Controller for the main card - handles business logic
 */
export declare class CardController {
    private static instance;
    private _hass;
    private _config;
    private _api;
    private _lastSelectedEntity;
    private logger;
    private _webSocketPlugin;
    private cache;
    /**
     * Get the singleton instance
     */
    static getInstance(): CardController;
    constructor();
    /**
     * Process config and initialize services
     */
    setConfig(config: InventreeCardConfig): void;
    /**
     * Set HASS object
     */
    setHass(hass: HomeAssistant): void;
    /**
     * Initialize all services - Called by setConfig or setHass
     */
    private initializeServices;
    /**
     * Initialize the direct API connection
     */
    private initializeApi;
    /**
     * Get WebSocketService instance (for HASS WS)
     */
    getWebSocketService(): WebSocketService;
    /**
     * Configures and initiates the connection for the WebSocketPlugin (Direct InvenTree WS)
     */
    private initializeWebSocketPlugin;
    /**
     * Handle messages from the WebSocket plugin
     */
    private handleWebSocketMessage;
    /**
     * Get diagnostics information
     */
    getWebSocketDiagnostics(): any;
    /**
     * Subscribe to entity changes through WebSocket service
     * @param entityId
     * @param callback
     * @returns Unsubscribe function
     */
    subscribeToEntityChanges(entityId: string, callback: () => void): () => void;
    /**
     * Get WebSocketPlugin instance
     */
    getWebSocketPlugin(): WebSocketPlugin;
    /**
     * Reset API failures and fallback mode
     */
    resetApiFailures(): void;
    /**
     * Clean up all resources used by the controller
     */
    destroy(): void;
    private _checkAndLogApiStatus;
}
