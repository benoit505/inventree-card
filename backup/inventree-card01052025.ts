import { html, css, PropertyValues, TemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { Logger } from './utils/logger';
import { InventreeCardConfig, InventreeItem, CustomCardEntry } from './core/types';
import { WLEDService } from './services/wled-service';
import { PrintService } from './services/print-label';
import { InvenTreeDirectAPI } from './services/api';
import { WebSocketService } from './services/websocket';
import { WebSocketPlugin } from './services/websocket-plugin';
import { CARD_NAME, EDITOR_NAME, CARD_VERSION } from './core/constants';
import { store, RootState } from './store';
import { trackUsage } from './utils/metrics-tracker';
import { selectPartsForEntities, adjustPartStock, setParts, registerEntity, selectPartById, locatePartById } from './store/slices/partsSlice';
import { fetchParametersForReferencedParts } from './store/thunks/parameterThunks';
import { setApiConfig, apiInitializationSuccess, apiInitializationError } from './store/slices/apiSlice';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
// Only import selectParameterLoadingStatus
import { selectParameterLoadingStatus } from './store/selectors/parameterSelectors'; 
// --- React Imports ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactApp } from './react-app';
// --- End React Imports ---

// Import editor
import { InventreeCardEditor } from './editors/editor';

// Import layouts
import './components/grid/grid-layout';
import './components/detail/detail-layout';
import './components/list/list-layout';

// Import part components
import './components/part/part-view';
import './components/part/part-details';
import './components/part/part-thumbnail';
import './components/part/part-container';
import './components/part/part-buttons';

// Import services
import './services/adjust-stock';
import './services/print-label';
import './services/wled-service';
import { VariantHandler } from './components/common/variant-handler';
import { CacheService, DEFAULT_TTL, CacheCategory } from "./services/cache";

// Add these imports
import './components/variant/variant-layout';
import './components/part/part-variant';
import './components/parts/parts-layout';

// Declare customCards for TypeScript
declare global {
    interface Window {
        customCards: CustomCardEntry[];
    }
}

// Register custom card info
if (!window.customCards) window.customCards = [] as CustomCardEntry[];

window.customCards.push({
    type: "inventree-card",
    name: "InvenTree Card",
    description: "A card for displaying InvenTree inventory data",
    preview: true
});

// Use LitElement directly for now
const BaseClass = LitElement;

// Type definition for timer IDs
// Remove TimerId type if not used elsewhere

try {
    // Define the card element with proper error handling
    @customElement('inventree-card')
    class InventreeCard extends BaseClass implements LovelaceCard {
        @property({ attribute: false }) public config!: InventreeCardConfig;
        @state() private _parts: InventreeItem[] = [];
        private _hass!: HomeAssistant | null;
        private logger: Logger = Logger.getInstance();
        private _timersInitialized = true; // Flag to track if timers are properly initialized
        private cache: CacheService = CacheService.getInstance();
        private _lastRenderedHash: string = '';
        private _cleanupFunctions: Array<() => void> = [];
        private _entitySubscriptions: Map<string, () => void> = new Map();
        private _isRefreshing: boolean = false;
        private _lastRefreshTime: number = 0;
        private _lastPartsCount: number = 0;
        private _lastPartsHash: string = '';
        private _lastValidParts: InventreeItem[] = [];
        private _websocketSubscriptions: Array<() => void> = [];
        private _forceRenderListener: EventListener | null = null;
        private _unsubscribeStore: (() => void) | null = null; // Manual store subscription

        // --- React Integration ---
        private _reactRoot: ReactDOM.Root | null = null;
        private _reactMountPoint: HTMLDivElement | null = null;
        // --- End React Integration ---

        constructor() {
            super();
            
            this.logger.log('Card', `Creating InventreeCard instance`, {
                category: 'card',
                subsystem: 'lifecycle'
            });
            
            // Manual subscription to get parts relevant to THIS instance
            this._unsubscribeStore = store.subscribe(() => {
                const state = store.getState();
                // Determine entities for THIS card instance from its config
                const entityIds = this.config?.entity ? [this.config.entity] : [];
                if (Array.isArray(this.config?.selected_entities)) {
                    entityIds.push(...this.config.selected_entities);
                }
                const uniqueEntityIds = [...new Set(entityIds)];
                
                // Select parts ONLY for this instance's entities
                const instanceParts = selectPartsForEntities(state, uniqueEntityIds);
                
                // Update local state only if parts have changed
                // Simple JSON compare for now, could be optimized
                if (JSON.stringify(this._parts) !== JSON.stringify(instanceParts)) {
                     this._parts = instanceParts;
                     this.requestUpdate('_parts'); // Request update specifically for _parts
                }
            });

            this._setupEventListeners();
        }

        static styles = [
            css`
                .diagnostic-tools {
                    margin-top: 16px;
                    padding: 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                
                .diagnostic-tools h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                
                .api-status {
                    margin-bottom: 12px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                .status-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
                
                .status-label {
                    font-weight: bold;
                }
                
                .status-value {
                    padding: 0 4px;
                }
                
                .status-value.success {
                    color: green;
                }
                
                .status-value.warning {
                    color: orange;
                }
                
                .status-value.error {
                    color: red;
                }
                
                .diagnostic-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .diagnostic-buttons button {
                    padding: 8px 12px;
                    border-radius: 4px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                
                .diagnostic-buttons button:hover {
                    background: var(--primary-color-light);
                }
            `
        ];

        public static async getConfigElement(): Promise<LovelaceCardEditor> {
            // The editor should already be registered by index.ts
            // But double-check and import it dynamically if needed
            if (!customElements.get(EDITOR_NAME)) {
                console.log(`Editor not registered yet, importing dynamically`);
                try {
                    // Import directly from the source
                    await import('./editors/editor.js');
                    console.log(`Dynamic editor import successful`);
                } catch (error) {
                    console.error(`Error importing editor component: ${error}`);
                }
            }
            
            // Create a new editor instance
            console.log(`Creating editor element: ${EDITOR_NAME}`);
            const editor = document.createElement(EDITOR_NAME) as LovelaceCardEditor;
            console.log(`Editor element created`);
            return editor;
        }

        public static getStubConfig(hass: HomeAssistant): InventreeCardConfig {
            // Find the first available InvenTree sensor
            const entity = Object.keys(hass.states).find(eid => 
                eid.startsWith('sensor.') && 
                hass.states[eid].attributes?.items !== undefined
            );

            // Return a minimal default config, similar to DEFAULT_CONFIG in constants.ts
            return {
                type: `custom:${CARD_NAME}`,
                entity: entity || '',
                view_type: 'detail',
                selected_entities: [],
                display: {
                    show_header: true,
                    show_image: true,
                    show_name: true,
                    show_stock: true,
                    show_description: false,
                    show_category: false,
                    show_stock_status_border: true,
                    show_stock_status_colors: true,
                    show_buttons: true
                },
                direct_api: {
                    enabled: false,
                    url: '',
                    api_key: '',
                    method: 'websocket'
                }
            };
        }

        public setConfig(config: InventreeCardConfig): void {
            if (!config) {
                throw new Error("No configuration provided");
            }
            
            console.log("InventreeCard: setConfig called with config:", JSON.stringify(config, null, 2));
            this.logger.info('Card', 'Setting configuration', {
                category: 'card',
                subsystem: 'config',
                data: {
                    entityId: config.entity,
                    viewType: config.view_type
                }
            });
            
            // Store config directly on the instance
            this.config = config; 
            
            // Dispatch only if needed for other global state, but not for config itself
            // Remove config dispatch: store.dispatch(setCardConfig(config)); 
            
            this._setupDebugMode(config);
            this.requestUpdate(); // Request update as config changed
            
            // If hass is already available, process it with the new config
            if (this._hass) {
                 this.processHassState(this._hass);
                 // Fetch referenced parameters after processing HASS state
                 this._fetchReferencedParameters(); 
            }
        }

        private _setupEntitySubscriptions(): void {
            // Clear existing subscriptions first
            this._clearEntitySubscriptions();
            
            // Don't try to subscribe if HASS isn't available yet
            if (!this._hass) {
                this.logger.warn('Card', 'Cannot set up entity subscription - HASS object is null.');
                return;
            }

            // Check for connection
            const connection = this._hass.connection;
            if (!connection) {
                this.logger.warn('Card', 'Cannot set up entity subscription - HASS connection not available.');
                return;
            }
            
            const entityId = this.config?.entity;
            if (!entityId) {
                this.logger.log('Card', 'No entity to subscribe to.');
                return;
            }
            
            const subscribe = async (entityIdToSubscribe: string) => {
                try {
                    // Use subscribeEvents with stored connection
                    const unsub = await connection.subscribeEvents((event: any) => {
                        // Filter inside the callback
                        if (event.data.entity_id === entityIdToSubscribe) {
                            this.logger.log('Card', `Entity ${entityIdToSubscribe} changed, requesting update.`);
                            this.requestUpdate(); 
                        }
                    }, 'state_changed');

                    this._entitySubscriptions.set(entityIdToSubscribe, unsub);
                    this.logger.log('Card', `Subscribed to entity: ${entityIdToSubscribe}`);
                } catch (error) {
                    this.logger.error('Card', `Error subscribing to entity ${entityIdToSubscribe}:`, error);
                }
            };
            
            // Subscribe to the main entity
            subscribe(entityId);
        }
        
        private _clearEntitySubscriptions(): void {
            this.logger.log('Card', 'Clearing entity subscriptions', {
                category: 'card', 
                subsystem: 'lifecycle'
            });
            
            // Make sure we have hass and config
            if (!this._hass || !this.config) {
                return;
            }
            
            // Clear any existing subscriptions
            for (const unsubscribe of this._entitySubscriptions.values()) {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            }
            this._entitySubscriptions.clear();
            
            // Setup subscriptions for the main entity
            if (this.config.entity) {
                const wsService = WebSocketService.getInstance();
                
                // Subscribe to entity changes
                const entitySubscription = wsService.subscribeToEntity(this.config.entity, () => {
                    try {
                        this.logger.log('Card', `Entity update received for ${this.config.entity}`, {
                            category: 'card', 
                            subsystem: 'websocket'
                        });
                        this.requestUpdate();
                    } catch (error) {
                        this.logger.error('Card', `Error handling entity update: ${error}`, {
                            category: 'card', 
                            subsystem: 'errors'
                        });
                    }
                });
                
                this._entitySubscriptions.set(this.config.entity, entitySubscription);
            }
            
            // Setup subscriptions for any additional entities
            if (this.config.selected_entities && Array.isArray(this.config.selected_entities)) {
                for (const entityId of this.config.selected_entities) {
                    // Skip if we already have a subscription for this entity
                    if (this._entitySubscriptions.has(entityId)) {
                        continue;
                    }
                    
                    const wsService = WebSocketService.getInstance();
                    
                    // Subscribe to entity changes
                    const entitySubscription = wsService.subscribeToEntity(entityId, () => {
                        try {
                            this.logger.log('Card', `Entity update received for ${entityId}`, {
                                category: 'card', 
                                subsystem: 'websocket'
                            });
                            this.requestUpdate();
                        } catch (error) {
                            this.logger.error('Card', `Error handling entity update: ${error}`, {
                                category: 'card', 
                                subsystem: 'errors'
                            });
                        }
                    });
                    
                    this._entitySubscriptions.set(entityId, entitySubscription);
                }
            }
        }

        protected render(): TemplateResult | void {
            // Create a container for the React app
            // We'll find this in updated() or firstUpdated() to mount React
            return html`<div id="react-root-container" style="width: 100%; height: 100%;"></div>`;
        }

        // Mount React app after the container div is rendered
        protected firstUpdated(_changedProperties: PropertyValues): void {
            super.firstUpdated(_changedProperties);
            this._mountReactApp();
        }
        
        private _computeHash(str: string): number {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        }

        private getSelectedPart(parts: InventreeItem[]): InventreeItem | undefined {
            if (!parts || !parts.length) return undefined; 
            
            // Use instance config
            if (this.config.part_id) { 
                return parts.find(p => p.pk === this.config.part_id) || parts[0];
            }
            
            return parts[0];
        }

        public getCardSize(): number {
            // Use instance config
            if (!this.config || !this._hass) return 1; 
            
            const stateValue = this._hass.states[this.config.entity!]?.state;
            if (!stateValue) return 1;
            
            try {
                const parsed = JSON.parse(stateValue);
                const size = Math.ceil(parsed.length / (this.config.columns || 2));
                // this.logger.log('Card', '🎴 Card: Calculated size:', size);
                return size;
            } catch (e) {
                // this.logger.log('Card', '🎴 Card: Failed to calculate size:', e);
                return 1;
            }
        }

        private async handleLocateClick(part: InventreeItem) {
            this.logger.log('Card', `Dispatching locatePartById for part ${part.pk}`);
            // Use the new dispatch method and the correct thunk
            this.dispatch(locatePartById(part.pk)); 
        }

        private convertToInvenTreePart(part: InventreeItem): InventreeItem {
            return {
                pk: part.pk,
                name: part.name,
                in_stock: part.in_stock,
                minimum_stock: part.minimum_stock || 0,
                image: part.thumbnail || null,
                thumbnail: part.thumbnail || undefined,
                active: part.active || true,
                assembly: false,
                category: part.category || 0,
                category_name: part.category_name || '',
                category_pathstring: '',
                dashboard_url: '',
                inventree_url: '',
                barcode_hash: '',
                barcode_data: '',
                component: false,
                description: part.description || '',
                full_name: part.full_name || part.name,
                IPN: part.IPN || '',
                keywords: '',
                purchaseable: false,
                revision: '',
                salable: false,
                units: part.units || '',
                total_in_stock: part.total_in_stock || part.in_stock,
                unallocated_stock: 0,
                allocated_to_build_orders: 0,
                allocated_to_sales_orders: 0,
                building: 0,
                ordering: 0,
                variant_of: part.variant_of || null,
                is_template: part.is_template || false,
                parameters: part.parameters ? 
                    part.parameters
                        .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined)
                        .map(p => ({
                            pk: p.pk,
                            part: p.part,
                            template: p.template,
                            template_detail: p.template_detail,
                            data: p.data,
                            data_numeric: typeof p.data_numeric === 'number' ? p.data_numeric : null
                        })) 
                    : []
            };
        }

        static getConfigForm() {
            return {
                schema: [
                    {
                        name: "entity",
                        required: true,
                        selector: { 
                            entity: {
                                domain: ["sensor"],
                                filter: {
                                    attributes: {
                                        items: {}
                                    }
                                },
                                mode: "dropdown"
                            }
                        }
                    },
                    {
                        name: "view_type",
                        selector: {
                            select: {
                                options: [
                                    { value: "detail", label: "Detail" },
                                    { value: "grid", label: "Grid" },
                                    { value: "list", label: "List" },
                                    { value: "parts", label: "Parts" },
                                    { value: "variants", label: "Variants" },
                                    { value: "base", label: "Base Layout" },
                                    { value: "debug", label: "Data Flow Debug" }
                                ],
                                mode: "dropdown"
                            }
                        }
                    },
                    {
                        name: "selected_entities",
                        selector: {
                            entity: {
                                domain: ["sensor"],
                                multiple: true,
                                filter: {
                                    attributes: {
                                        items: {}
                                    }
                                }
                            }
                        }
                    }
                ],
                assertConfig: (config: InventreeCardConfig) => {
                    if (!config.entity || typeof config.entity !== "string") {
                        throw new Error('Configuration error: "entity" must be a non-empty string.');
                    }
                }
            };
        }

        private _compareValues(value: any, filterValue: string, operator: string): boolean {
            if (value === undefined || value === null) return false;
            
            switch (operator) {
                case 'eq':
                    return String(value) === filterValue;
                case 'contains':
                    return String(value).toLowerCase().includes(filterValue.toLowerCase());
                case 'gt':
                    return Number(value) > Number(filterValue);
                case 'lt':
                    return Number(value) < Number(filterValue);
                default:
                    return false;
            }
        }

        private _renderDebugInfo(parts: InventreeItem[]): TemplateResult {
            return html`
                <ha-card>
                    <div class="card-header">
                        <div class="name">InvenTree Card Debug</div>
                    </div>
                    <div class="card-content">
                        <details>
                            <summary>Configuration</summary>
                            <pre>${JSON.stringify(this.config, null, 2)}</pre>
                        </details>
                        <details>
                            <summary>Parts (${parts.length})</summary>
                            <pre>${JSON.stringify(parts, null, 2)}</pre>
                        </details>
                    </div>
                </ha-card>
            `;
        }

        connectedCallback(): void {
            super.connectedCallback();
            try {
                this.logger.log('InventreeCard', 'Card connected to DOM', {
                    category: 'card',
                    subsystem: 'initialization'
                });
                
                // Ensure the React app is mounted when the element connects/reconnects
                // firstUpdated handles the initial mount
                if (this.shadowRoot && !this._reactRoot) {
                    this._mountReactApp();
                }
                
                // Re-subscribe if needed when reconnecting
                if (!this._unsubscribeStore) {
                    // Need to redefine the subscription logic here slightly
                    this._unsubscribeStore = store.subscribe(() => {
                        const state = store.getState();
                        const entityIds = this.config?.entity ? [this.config.entity] : [];
                        if (Array.isArray(this.config?.selected_entities)) {
                            entityIds.push(...this.config.selected_entities);
                        }
                        const uniqueEntityIds = [...new Set(entityIds)];
                        const instanceParts = selectPartsForEntities(state, uniqueEntityIds);
                        if (JSON.stringify(this._parts) !== JSON.stringify(instanceParts)) {
                             this._parts = instanceParts;
                             // No need to requestUpdate here, React will handle updates via Redux Provider
                        }
                    });
                }
                
                // Initialize services if HASS is available
                if (this._hass) {
                    this.initializeServices(); // Ensure services like WS are set up
                }
                this._setupWebSocketSubscriptions();
                this._setupParameterEventListeners();
            } catch (error) {
                this.logger.error('InventreeCard', 'Error in connectedCallback:', error);
                console.error('InventreeCard: Error in connectedCallback', error);
            }
        }
        
        private _setupWebSocketSubscriptions() {
            // Implement WebSocket subscription logic here
        }

        private _setupParameterEventListeners() {
            // Implement parameter event listener logic here
        }

        get hass(): HomeAssistant | undefined {
            return this._hass ? this._hass : undefined;
        }

        // Renamed original set hass to processHassState
        private processHassState(hass: HomeAssistant): void {
            // Existing logic to dispatch setParts, registerEntity etc.
            // This logic might stay here to update Redux state based on HASS
            const currentConfig = this.config;
            // --- Start Added Declarations ---
            if (!currentConfig) {
                this.logger.log('CardWrapper', 'Cannot process HASS state - config not available yet.');
                return;
            }
            const entityIdsToProcess: string[] = [];
            if (currentConfig.entity) {
                entityIdsToProcess.push(currentConfig.entity);
            }
            if (Array.isArray(currentConfig.selected_entities)) {
                entityIdsToProcess.push(...currentConfig.selected_entities);
            }
            const uniqueEntityIds = [...new Set(entityIdsToProcess)];
            if (uniqueEntityIds.length === 0) {
                this.logger.warn('CardWrapper', 'Cannot process HASS state - no entity or selected_entities configured.');
                return;
            }
            let instancePartIds: number[] = [];
            // --- End Added Declarations ---
            // ... (rest of the logic from original processHassState)
            // Ensure this updates Redux, React will pick up changes via useSelector
             this.logger.log('CardWrapper', 'Processing HASS state (may trigger React update via Redux)');
        }
        
        // New setter for hass property
        set hass(hass: HomeAssistant | undefined) {
            if (!hass) return;
            
            const hassChanged = this._hass !== hass;
            this._hass = hass;

            if (hassChanged) {
                 this.logger.log('Card', 'HASS object updated.');
                 // Initialize services if config is available
                 if (this.config) {
                      this.initializeServices(); 
                 }
                 // Process the new HASS state
                 this.processHassState(hass); 
                 // Fetch referenced parameters after processing HASS state
                 this._fetchReferencedParameters(); 
            }
        }

        // Ensure initializeServices is called correctly
        private initializeServices(): void {
             this.logger.log('CardController', '🔄 Initializing services', { 
                category: 'card', 
                subsystem: 'lifecycle' 
             });
        
             if (!this._hass) {
                this.logger.warn('CardController', '⚠️ Cannot initialize services: HASS not available', {
                    category: 'card',
                    subsystem: 'lifecycle'
                });
                return;
             }
             
              if (!this.config) {
                this.logger.warn('CardController', '⚠️ Cannot initialize services: Config not available', {
                    category: 'card',
                    subsystem: 'lifecycle'
                });
                return;
             }
        
             this.logger.log('CardController', '✅ Service initialization sequence complete', {
                category: 'card',
                subsystem: 'lifecycle'
             });

            // Keep API initialization (uses instance config)
            if (this.config?.direct_api?.enabled) {
                this.initializeApi();
            }
            // Keep WebSocketPlugin initialization (uses instance config)
            if (this.config?.direct_api?.enabled && 
                this.config.direct_api.method !== 'hass') {
                this.initializeWebSocketPlugin();
            }
        }
        
        // Added API/WS init methods here (or they could be moved to separate service initializers)
        private _api: InvenTreeDirectAPI | null = null; // Instance variable for API
        private initializeApi(): void {
             this.logger.log('Card', '🔌 Setting up Direct API connection', { category: 'api' });
             if (!this.config?.direct_api?.enabled || !this.config.direct_api.url || !this.config.direct_api.api_key) {
                  this.logger.warn('Card', '⚠️ Direct API not configured or enabled.');
                  this.dispatch(apiInitializationError('Direct API not configured or enabled.')); // Dispatch error
                  return;
             }
             try {
                  // Store config details before creating API instance
                  const apiUrl = this.config.direct_api.url;
                  const apiKey = this.config.direct_api.api_key;
                  
                  this._api = new InvenTreeDirectAPI(apiUrl, apiKey);
                  this.logger.log('Card', '✅ Direct API initialized');
                  
                  // Dispatch config and success to apiSlice
                  this.dispatch(setApiConfig({ url: apiUrl, apiKey: apiKey }));
                  this.dispatch(apiInitializationSuccess());
                  
             } catch (error: any) {
                  const errorMessage = error.message || String(error);
                  this.logger.error('Card', `❌ Error initializing Direct API: ${errorMessage}`);
                  this.dispatch(apiInitializationError(`Initialization failed: ${errorMessage}`)); // Dispatch specific error
             }
        }
        
        private initializeWebSocketPlugin(): void {
             if (!this.config?.direct_api?.enabled || !this.config.direct_api.method) {
                  this.logger.log('Card', 'Skipping WebSocketPlugin initialization (not enabled or method missing)');
                 return;
             }

             const { websocket_url, api_key, url } = this.config.direct_api;
             let wsUrl = websocket_url;
             if (!wsUrl && url) {
                 const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
                 wsUrl = baseUrl.replace(/^http/, 'ws') + '/api/ws/';
             }
             if (!wsUrl) {
                 this.logger.error('Card', '❌ Cannot initialize WebSocketPlugin: No URL available'); return;
             }
             if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
                 wsUrl = wsUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
             }

             this.logger.log('Card', `🔌 Initializing WebSocketPlugin connection to ${wsUrl}`);
             const webSocketPlugin = WebSocketPlugin.getInstance();
             webSocketPlugin.configure({
                 url: wsUrl,
                 enabled: true,
                 apiKey: api_key,
                 debug: this.config.debug_websocket || false,
                 autoReconnect: true,
                 reconnectInterval: this.config.direct_api?.performance?.websocket?.reconnectInterval || 5000,
                 messageDebounce: this.config.direct_api?.performance?.websocket?.messageDebounce || 50
             });
             // Note: onMessage handler is likely set globally in middleware, which is fine
             webSocketPlugin.connect();
             this.logger.log('Card', '✅ WebSocketPlugin configured and connection requested');
        }

        requestUpdate(name?: PropertyKey, oldValue?: unknown): void {
            try {
                super.requestUpdate(name, oldValue);
            } catch (error) {
                console.error('Critical error in requestUpdate:', error);
                if (this.logger) {
                    this.logger.error('Card', `Critical error in requestUpdate: ${error}`);
                }
            }
        }
        
        private _isDestroyed = false;

        disconnectedCallback() {
            super.disconnectedCallback();
            console.log(`InventreeCard disconnectedCallback - cleaning up`); 
            this._isDestroyed = true;
            
            // Unsubscribe from the store
            if (this._unsubscribeStore) {
                this._unsubscribeStore();
                this._unsubscribeStore = null;
            }
            
            this._cleanupEventListeners();
            this._cleanupFunctions.forEach(cleanup => cleanup());
            this._cleanupFunctions = [];
            trackUsage('redux', 'cardDisconnected');
        }

        // Add a dispatch helper method
        protected dispatch(action: any): void {
            try {
                // Dispatch directly to the global store
                (store.dispatch as ThunkDispatch<RootState, unknown, UnknownAction>)(action); 
                trackUsage('redux', 'cardDispatch');
                this.logger.log('Card', `Dispatched action: ${action.type}`, {
                    category: 'redux',
                    subsystem: 'dispatch'
                });
            } catch (error) {
                this.logger.error('Card', 'Error dispatching action:', error);
            }
        }

        private _renderDebugTestPattern(): TemplateResult {
            // Use instance _parts state and config
            const parts = this._parts; 
            const partsCount = parts ? parts.length : 0;
            
            const entityState = this._hass && this.config?.entity ? 
                this._hass.states[this.config.entity] : undefined;
            
            return html`
                <ha-card style="padding: 16px;">
                    <div style="border: 3px solid blue; padding: 16px; margin-bottom: 16px; background: #f0f7ff;">
                        <h2 style="color: blue; margin-top: 0;">InvenTree Card Debug Mode</h2>
                        <p>This is a special debug rendering to diagnose layout issues.</p>
                        
                        <h3>Component Status:</h3>
                        <ul>
                            <li>Card Version: ${CARD_VERSION || 'unknown'}</li>
                            <li>HASS Available: ${!!this._hass ? 'Yes' : 'No'}</li>
                            <li>Config Available: ${!!this.config ? 'Yes' : 'No'}</li>
                            <li>Entity: ${this.config?.entity || 'Not set'}</li>
                            <li>View Type: ${this.config?.view_type || 'Not set'}</li>
                            <li>Parts Count (Instance): ${partsCount}</li>
                        </ul>
                        
                        <h3>Service Status:</h3>
                        <ul>
                            <li>WebSocketService: ${!!WebSocketService.getInstance() ? 'Available' : 'Missing'}</li>
                        </ul>
                        
                        <h3>First 3 Parts (Instance):</h3>
                        <pre style="background: #eee; padding: 8px; max-height: 200px; overflow: auto; font-size: 12px;">
${parts && parts.length > 0 ? JSON.stringify(parts.slice(0, 3), null, 2) : 'No parts available for this instance'}
                        </pre>
                        
                        <h3>Raw Entity State:</h3>
                        <pre style="background: #eee; padding: 8px; max-height: 200px; overflow: auto; font-size: 12px;">
${entityState ? JSON.stringify(entityState, null, 2) : 'No entity state available'}
                        </pre>
                    </div>
                </ha-card>
            `;
        }
        
        private _setupDebugMode(config: InventreeCardConfig): void {
            this.logger.setDebugConfig(config);
            
            this.logger.log('Card', 'Debug mode configuration', {
                category: 'card',
                subsystem: 'debug',
                data: {
                    debug: !!config.debug,
                    debug_card: !!config.debug_card,
                    show_debug: !!config.show_debug,
                }
            });
        }

        private _cleanupEventListeners(): void {
            this._clearEntitySubscriptions();
            this._websocketSubscriptions.forEach(unsubscribe => unsubscribe());
            this._websocketSubscriptions = [];
            this.logger.log('Card', 'Cleaned up event listeners', {
                category: 'card',
                subsystem: 'lifecycle'
            });
        }

        private _setupEventListeners(): void {
            this.logger.log('Card', 'Setting up event listeners');
        }

        private _handleStockAdjustment(e: CustomEvent): void {
            const { item, amount } = e.detail;
            if (!item || !amount) { 
                this.logger.warn('Card', 'Stock adjustment event missing item or amount.');
                return; 
            }
            this.logger.log('Card', `Dispatching adjustPartStock for part ${item.pk}, amount ${amount}.`);
            this.dispatch(adjustPartStock({ partId: item.pk, amount, hass: this.hass })); 
        }

        /**
         * Scans parameter conditions for cross-part references (part:id:param)
         * and dispatches a thunk to fetch parameters for those parts if needed.
         */
        private _fetchReferencedParameters(): void {
            if (!this.config?.direct_api?.enabled || !this.config.parameters?.enabled || !this.config.parameters.conditions) {
                this.logger.log('Card', 'Skipping referenced parameter fetch (Direct API/Parameters disabled or no conditions).');
                return;
            }

            const referencedPartIds = new Set<number>();
            const conditionRegex = /^part:(\d+):(.+)$/;

            this.config.parameters.conditions.forEach(condition => {
                const match = condition.parameter.match(conditionRegex);
                if (match && match[1]) {
                    const partId = parseInt(match[1], 10);
                    if (!isNaN(partId)) {
                        referencedPartIds.add(partId);
                    }
                }
            });

            if (referencedPartIds.size === 0) {
                this.logger.log('Card', 'No cross-part references found in parameter conditions.');
                return;
            }

            const currentState = store.getState();
            const partIdsToFetch: number[] = [];

            referencedPartIds.forEach(partId => {
                const status = selectParameterLoadingStatus(currentState, partId);
                if (status === 'idle') {
                    partIdsToFetch.push(partId);
                }
            });

            if (partIdsToFetch.length > 0) {
                this.logger.log('Card', `Found ${referencedPartIds.size} referenced parts in conditions. Need to fetch parameters for: ${partIdsToFetch.join(', ')}`, {
                    category: 'parameters',
                    subsystem: 'fetch-referenced'
                });
                this.dispatch(fetchParametersForReferencedParts(partIdsToFetch));
            } else {
                this.logger.log('Card', `Found ${referencedPartIds.size} referenced parts in conditions. All parameters already fetched or pending.`, {
                    category: 'parameters',
                    subsystem: 'fetch-referenced'
                });
            }
        }

        // --- React Integration Methods ---
        private _mountReactApp(): void {
            if (this.shadowRoot && !this._reactRoot) {
                this._reactMountPoint = this.shadowRoot.getElementById('react-root-container') as HTMLDivElement;
                if (this._reactMountPoint) {
                    this._reactRoot = ReactDOM.createRoot(this._reactMountPoint);
                    this._reactRoot.render(React.createElement(ReactApp)); // Use React.createElement
                    this.logger.log('InventreeCard', 'React app mounted successfully.', { category: 'react' });
                } else {
                    this.logger.error('InventreeCard', 'React mount point not found!', { category: 'react' });
                }
            }
        }

        private _unmountReactApp(): void {
            if (this._reactRoot) {
                this._reactRoot.unmount();
                this._reactRoot = null;
                this.logger.log('InventreeCard', 'React app unmounted successfully.', { category: 'react' });
            }
            this._reactMountPoint = null; // Clear mount point ref
        }
        // --- End React Integration Methods ---
    }
} catch (e) {
    console.error('Error defining InventreeCard:', e);
    
    if (!customElements.get(CARD_NAME)) {
        console.log('Attempting fallback definition for InventreeCard');
        try {
            class FallbackInventreeCard extends LitElement implements LovelaceCard {
                @property({ attribute: false }) public config!: InventreeCardConfig;
                @property({ attribute: false }) private _hass?: HomeAssistant;
                
                setConfig(config: InventreeCardConfig): void {
                    this.config = config;
                }
                
                get hass(): HomeAssistant | undefined {
                    return this._hass;
                }
                
                set hass(hass: HomeAssistant | undefined) {
                    this._hass = hass;
                }
                
                getCardSize(): number {
                    return 3;
                }
                
                static get styles() {
                    return css`
                        ha-card {
                            padding: 16px;
                            text-align: center;
                        }
                    `;
                }
                
                render() {
                    return html`
                        <ha-card>
                            <h2>InvenTree Card (Fallback)</h2>
                            <p>Normal card failed to load - see console for errors</p>
                            ${this.config?.entity ? 
                                html`<p>Entity: ${this.config.entity}</p>` : 
                                html`<p>No entity configured</p>`}
                        </ha-card>
                    `;
                }
            }
            
            customElements.define(CARD_NAME, FallbackInventreeCard);
        } catch (e2) {
            console.error('Even fallback InventreeCard failed to register:', e2);
        }
    }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: "inventree-card",
    name: "InvenTree Card",
    description: "A card for displaying InvenTree inventory data",
    preview: true
});

let InventreeCard: any;
try {
    class InventreeCardInternal extends BaseClass { /* ... */ }
    InventreeCard = InventreeCardInternal;
} catch (e) {
    // Fallback logic
}
export { InventreeCard };

