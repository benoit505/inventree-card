import { html, css, PropertyValues, TemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { Logger } from './utils/logger';
import { InventreeCardConfig, CustomCardEntry } from './types';
import { CARD_NAME, EDITOR_NAME, CARD_VERSION } from './core/constants';
import { store, RootState } from './store';
import { trackUsage } from './utils/metrics-tracker';
import { locatePartById, adjustPartStock } from './store/slices/partsSlice';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
// --- React Imports ---
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot
import { ReactApp } from './react-app'; // Import our React root component
// --- End React Imports ---

// Import editor
import { InventreeCardEditor } from './editors/editor';

// Remove Lit layout/component imports if they are no longer directly used by the Lit wrapper
// import './components/grid/grid-layout'; 
// import './components/detail/detail-layout';
// import './components/list/list-layout';
// import './components/part/part-view';
// import './components/part/part-details';
// import './components/part/part-thumbnail';
// import './components/part/part-container';
// import './components/part/part-buttons';
// import './services/adjust-stock';
// import './services/print-label';
// import './services/wled-service';
// import { VariantHandler } from './components/common/variant-handler';
// import { CacheService, DEFAULT_TTL, CacheCategory } from "./services/cache";
// import './components/variant/variant-layout';
// import './components/part/part-variant';
// import './components/parts/parts-layout';

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

// Use LitElement directly
const BaseClass = LitElement;

// Type definition for timer IDs - remove if unused

try {
    // Define the card element with proper error handling
    @customElement('inventree-card')
    class InventreeCard extends BaseClass implements LovelaceCard {
        @property({ attribute: false }) public config!: InventreeCardConfig;
        // Make _hass internal state, triggering updates when set
        @state() private _hass!: HomeAssistant | null; 
        private logger: Logger = Logger.getInstance();
        private _cleanupFunctions: Array<() => void> = [];
        private _entitySubscriptions: Map<string, () => void> = new Map();
        private _websocketSubscriptions: Array<() => void> = [];
        // No need for manual store subscription if React handles it
        // private _unsubscribeStore: (() => void) | null = null; 

        // --- React Integration ---
        @state() private _reactRoot: ReactDOM.Root | null = null;
        private _reactMountPoint: HTMLDivElement | null = null;
        // --- End React Integration ---

        constructor() {
            super();
            this.logger.log('InventreeCard', 'Creating InventreeCard instance (Lit Wrapper)', {
                category: 'card',
                subsystem: 'lifecycle'
            });
            // Setup listeners can remain if needed for Lit-specific interactions (e.g., editor events)
            // this._setupEventListeners(); 
        }

        // Keep minimal styles or remove if React handles all styling
        static styles = [
            css`
                :host { /* Style the host element itself */
                    display: block; /* Ensure it takes up space */
                    width: 100%;
                    height: 100%;
                }
                #react-root-container {
                    width: 100%;
                    height: 100%;
                }
            `
        ];

        public static async getConfigElement(): Promise<LovelaceCardEditor> {
            if (!customElements.get(EDITOR_NAME)) {
                Logger.getInstance().log('InventreeCard', `Editor not registered yet, importing dynamically`, { category: 'card', subsystem: 'editor' });
                try {
                    await import('./editors/editor'); // Keep editor import
                    Logger.getInstance().log('InventreeCard', `Dynamic editor import successful`, { category: 'card', subsystem: 'editor' });
                } catch (error) {
                    Logger.getInstance().error('InventreeCard', `Error importing editor component: ${error}`, { category: 'card', subsystem: 'editor', data: error });
                }
            }
            Logger.getInstance().log('InventreeCard', `Creating editor element: ${EDITOR_NAME}`, { category: 'card', subsystem: 'editor' });
            const editor = document.createElement(EDITOR_NAME) as LovelaceCardEditor;
            Logger.getInstance().log('InventreeCard', `Editor element created`, { category: 'card', subsystem: 'editor' });
            return editor;
        }

        public static getStubConfig(hass: HomeAssistant): InventreeCardConfig {
             // Keep stub config logic
            const entity = Object.keys(hass.states).find(eid => 
                eid.startsWith('sensor.') && 
                hass.states[eid].attributes?.items !== undefined
            );
            return {
                type: `custom:${CARD_NAME}`,
                entity: entity || '',
                view_type: 'detail', // Default view
                selected_entities: [],
                // Keep other default config fields as needed by React components
                display: { 
                    show_header: true, 
                    show_image: true, 
                    // ... other display flags ...
                },
                direct_api: { enabled: false, url: '', api_key: '', method: 'websocket' },
                // ... other config sections ...
            };
        }

        public setConfig(config: InventreeCardConfig): void {
            if (!config) {
                throw new Error("No configuration provided");
            }
            
            this.logger.log('InventreeCard', 'setConfig called with config (raw):', { category: 'card', subsystem: 'config', data: { config: JSON.stringify(config, null, 2) } });
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
            
            this._setupDebugMode(config); // Keep debug setup if needed at Lit level
            // Request update handled by property decorator
        }

        // Keep entity subscriptions if Lit wrapper needs to react to HASS state changes directly
        // Or remove if all state handling moves to React/Redux via hass prop
        private _setupEntitySubscriptions(): void {
            this._clearEntitySubscriptions();
            if (!this._hass?.connection || (!this.config?.entity && (!this.config?.selected_entities || this.config.selected_entities.length === 0))) {
                this.logger.warn('Card Lit', 'Cannot set up entity subscription - HASS connection or relevant entityIds missing.');
                return;
            }

            const entityIdsToSubscribe = [this.config.entity, ...(this.config.selected_entities || [])].filter(Boolean) as string[];
            const uniqueEntityIds = [...new Set(entityIdsToSubscribe)];

            uniqueEntityIds.forEach(entityId => {
                if (this._entitySubscriptions.has(entityId)) return;

                const subscribe = async (idToSub: string) => {
                    try {
                        const unsub = await this._hass!.connection.subscribeEvents((event: any) => {
                            if (event.data.entity_id === idToSub) {
                                this.logger.log('Card Lit', `Entity ${idToSub} changed, triggering React update via hass prop.`);
                                // Update the _hass property to trigger Lit's update cycle, which passes new hass to React
                                this._hass = { ...this._hass! }; // Create new object reference
                            }
                        }, 'state_changed');
                        this._entitySubscriptions.set(idToSub, unsub);
                        this.logger.log('Card Lit', `Subscribed to HASS entity: ${idToSub}`);
                    } catch (error) {
                        this.logger.error('Card Lit', `Error subscribing to HASS entity ${idToSub}:`, error);
                    }
                };
                subscribe(entityId);
            });
        }
        
        private _clearEntitySubscriptions(): void {
            // Keep cleanup logic
            this.logger.log('Card Lit', 'Clearing HASS entity subscriptions');
            for (const unsubscribe of this._entitySubscriptions.values()) {
                if (typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            }
            this._entitySubscriptions.clear();
        }

        // Render only the container for React
        protected render(): TemplateResult | void {
            this.logger.log("InventreeCardLit", "render() called, creating react-root-container div.");
            return html`<div id="react-root-container"></div>`;
        }

        // Mount/Update React app
        protected firstUpdated(_changedProperties: PropertyValues): void {
            super.firstUpdated(_changedProperties);
            this.logger.log("InventreeCardLit", "firstUpdated() called.");
            // *** CRITICAL: Get the mount point here and store it ***
            if (this.shadowRoot) {
                this._reactMountPoint = this.shadowRoot.getElementById('react-root-container') as HTMLDivElement;
                if (!this._reactMountPoint) {
                    this.logger.error('InventreeCardLit', 'CRITICAL: react-root-container NOT FOUND in shadowRoot during firstUpdated.');
                } else {
                    this.logger.log('InventreeCardLit', 'react-root-container found and cached in firstUpdated.');
                }
            } else {
                this.logger.error('InventreeCardLit', 'CRITICAL: shadowRoot NOT AVAILABLE during firstUpdated.');
            }
            this._mountOrUpdateReactApp(); // Initial mount
        }

        protected updated(changedProperties: PropertyValues): void {
            super.updated(changedProperties);
            // Only call mount/update if hass or config has actually changed
            if (changedProperties.has('_hass') || changedProperties.has('config')) {
                 this.logger.log('InventreeCard', 'Hass or Config changed in Lit, triggering React update.', {
                    changed: Array.from(changedProperties.keys())
                 });
                this._mountOrUpdateReactApp(); 
            }
            // Re-setup subscriptions if config or hass changes and subscriptions are managed here
            if (changedProperties.has('config') || changedProperties.has('_hass')) {
                 this._setupEntitySubscriptions(); 
            }
        }

        private _mountOrUpdateReactApp(): void {
            // *** Use the cached _reactMountPoint ***
            if (!this._reactMountPoint) {
                this.logger.error('InventreeCardLit', 'Cannot mount React app: _reactMountPoint is not set. Attempting to find it again.');
                // Attempt to find it again as a last resort, though this indicates a problem
                if (this.shadowRoot) {
                    this._reactMountPoint = this.shadowRoot.getElementById('react-root-container') as HTMLDivElement;
                    if (!this._reactMountPoint) {
                         this.logger.error('InventreeCardLit', 'Still cannot find react-root-container on re-check.');
                         return;
                    }
                    this.logger.warn('InventreeCardLit', 'Found react-root-container on re-check within _mountOrUpdateReactApp.');
                } else {
                    this.logger.error('InventreeCardLit', 'shadowRoot not available in _mountOrUpdateReactApp for re-check.');
                    return;
                }
            }

             // const reactProps = { hass: this._hass, config: this.config }; // This line is not needed here

             if (!this._reactRoot) {
                 // Check _reactMountPoint again right before creating the root
                 if (!this._reactMountPoint) {
                     this.logger.error('InventreeCardLit', 'Cannot create React root: _reactMountPoint is null just before createRoot.');
                     return;
                 }
                 this._reactRoot = ReactDOM.createRoot(this._reactMountPoint);
                 this.logger.log('InventreeCardLit', 'Mounting React app for the first time.', { hass: !!this._hass, config: !!this.config });
             }

             if (this._hass && this.config) { // Ensure config is also present
                this.logger.log('InventreeCardLit', 'Rendering ReactApp with HASS and Config.');
                this._reactRoot.render(React.createElement(ReactApp, { hass: this._hass, config: this.config }));
             } else {
                this.logger.warn('InventreeCardLit', 'HASS or Config object is null/undefined, not rendering ReactApp.', { hass: !!this._hass, config: !!this.config });
                if (this._reactRoot && (!this._hass || !this.config)) {
                     this.logger.log('InventreeCardLit', 'Skipping render call as HASS or Config is missing.');
                }
             }
        }

        private _unmountReactApp(): void {
            if (this._reactRoot) {
                this._reactRoot.unmount();
                this._reactRoot = null; // Clear the root state
                this.logger.log('InventreeCard', 'React app unmounted successfully.');
            }
            this._reactMountPoint = null; // Clear the mount point reference
        }
        
        public getCardSize(): number {
            // Adjust size calculation if needed, or base it on config
            return 3; // Example size
        }

        // Remove Lit-specific handlers if functionality moves to React
        // private async handleLocateClick(partId: number) { ... }

        // Keep static config form
        static getConfigForm() {
            // ... (keep existing schema) ...
        }

        // Remove Lit debug render if React handles debug UI
        // private _renderDebugInfo(): TemplateResult { ... }
        
        private _setupDebugMode(config: InventreeCardConfig): void {
             // Keep debug setup if needed at Lit level
            this.logger.setDebugConfig(config);
            this.logger.log('Card', 'Debug mode configuration set (Lit wrapper)');
        }

        private _cleanupEventListeners(): void {
            // Keep cleanup logic for subscriptions managed here
            this._clearEntitySubscriptions();
            // Clear any other Lit-specific listeners
            this._websocketSubscriptions.forEach(unsubscribe => unsubscribe());
            this._websocketSubscriptions = [];
            this.logger.log('Card', 'Cleaned up Lit event listeners/subscriptions', {
                category: 'card',
                subsystem: 'lifecycle'
            });
        }

        // Remove Lit event listeners setup if not needed
        // private _setupEventListeners(): void { ... }

        // Remove stock adjustment handler if handled within React
        // private _handleStockAdjustment(e: CustomEvent): void { ... }

        connectedCallback(): void {
            super.connectedCallback();
            try {
                this.logger.log('InventreeCard', 'Lit wrapper connected to DOM', {
                    category: 'card',
                    subsystem: 'lifecycle'
                });
                // Ensure React is mounted/updated when connected
                // this._mountOrUpdateReactApp(); // REMOVED: Initial mount should happen in firstUpdated
                // Keep service/subscription setup if managed here
                this._setupEntitySubscriptions();
                // this._setupWebSocketSubscriptions(); 
                // this._setupParameterEventListeners();
            } catch (error) {
                this.logger.error('InventreeCard', 'Error in connectedCallback (Lit wrapper):', { category: 'card', subsystem: 'lifecycle', data: error });
            }
        }
        
        // Keep WebSocket setup if needed at Lit level
        // private _setupWebSocketSubscriptions() { ... }
        // Keep Parameter setup if needed at Lit level
        // private _setupParameterEventListeners() { ... }

        // Keep hass getter/setter
        get hass(): HomeAssistant | undefined {
            return this._hass ? this._hass : undefined;
        }

        set hass(hass: HomeAssistant | undefined) {
            if (!hass || hass === this._hass) { // Prevent unnecessary updates if hass object ref hasn't changed
                return;
            }
            this.logger.log('Card Lit', 'HASS object received.');
            this._hass = hass; // Update internal state, triggering Lit's update cycle
            // No need to call requestUpdate explicitly, @state decorator handles it
        }

        // Remove Lit service initialization if handled in React/Redux
        // private initializeServices(): void { ... }
        
        // Keep requestUpdate wrapper for safety
        requestUpdate(name?: PropertyKey, oldValue?: unknown): void {
            try {
                super.requestUpdate(name, oldValue);
            } catch (error) {
                this.logger.error('InventreeCard', `Critical error in requestUpdate: ${error}`, { category: 'card', subsystem: 'lifecycle', data: error });
            }
        }
        
        // Keep destroyed flag
        private _isDestroyed = false;

        disconnectedCallback() {
            super.disconnectedCallback();
            this.logger.log('InventreeCard', 'Lit wrapper disconnectedCallback - cleaning up', { category: 'card', subsystem: 'lifecycle' }); 
            this._isDestroyed = true;
            
            this._unmountReactApp(); // Ensure React app is unmounted
            this._cleanupEventListeners(); // General Lit cleanup
            this._cleanupFunctions.forEach(cleanup => cleanup());
            this._cleanupFunctions = [];
            trackUsage('lit', 'cardDisconnected');
        }

        // Remove Lit dispatch method if all actions dispatched from React
        // protected dispatch(action: any): void { ... }

    }
} catch (e) {
    Logger.getInstance().error('InventreeCardGlobal', 'Error defining InventreeCard (Lit Wrapper):', { data: e });
    // Keep fallback definition logic
    if (!customElements.get(CARD_NAME)) {
        Logger.getInstance().log('InventreeCardGlobal', 'Attempting fallback definition for InventreeCard', { category: 'card', subsystem: 'lifecycle' });
        try {
            class FallbackInventreeCard extends LitElement implements LovelaceCard {
                setConfig(config: InventreeCardConfig): void {
                    Logger.getInstance().error('FallbackInventreeCard', "setConfig called. Card failed to load properly.", { data: config });
                    // Potentially render an error message in the card's shadow DOM
                    if (this.shadowRoot) {
                        this.shadowRoot.innerHTML = '<div style="color: red; padding: 16px;">Error: InvenTree Card failed to load. Check console.</div>';
                    }
                }

                getCardSize(): number {
                    return 1; // Default small size for an error card
                }
                // ... (fallback implementation) ...
            }
            customElements.define(CARD_NAME, FallbackInventreeCard);
        } catch (e2) {
            Logger.getInstance().error('FallbackInventreeCard', 'Even fallback InventreeCard failed to register:', { data: e2 });
        }
    }
}

// Keep custom card registration
window.customCards = window.customCards || [];
// Avoid duplicate push if script runs multiple times in dev
if (!window.customCards.some(card => card.type === "inventree-card")) {
    window.customCards.push({
        type: "inventree-card",
        name: "InvenTree Card",
        description: "A card for displaying InvenTree inventory data",
        preview: true
    });
}

// Keep export, adjust if class name changed internally
let InventreeCard: any;
try {
    // Ensure this points to the primary class definition within the try block
    InventreeCard = customElements.get(CARD_NAME); 
} catch (e) {
    // Fallback logic if needed
}
export { InventreeCard };

