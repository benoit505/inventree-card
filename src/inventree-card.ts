console.log('[DEBUG] STEP 1: inventree-card.ts executing');
import { html, css, PropertyValues, TemplateResult, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';
import { Logger } from './utils/logger';
import { InventreeCardConfig, CustomCardEntry } from './types';
import { CARD_NAME, /* EDITOR_NAME, */ CARD_VERSION } from './core/constants'; // Comment out old EDITOR_NAME
import { DEFAULT_CONFIG } from './core/settings'; // ADDED IMPORT
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

// Import the React Editor Host and its registration function
import { REACT_EDITOR_TAG_NAME, defineReactEditorHost } from './editors/ReactEditorHost';

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
// if (!window.customCards) window.customCards = [] as CustomCardEntry[]; // REMOVE

// window.customCards.push({ // REMOVE BLOCK
// type: "inventree-card", // REMOVE
// name: "InvenTree Card", // REMOVE
// description: "A card for displaying InvenTree inventory data", // REMOVE
// preview: true // REMOVE
// }); // REMOVE

// Use LitElement directly
const BaseClass = LitElement;

// Type definition for timer IDs - remove if unused

console.log('[DEBUG] STEP 1: inventree-card.ts executing');

try {
    // Define the card element with proper error handling
    @customElement(CARD_NAME)
    class InventreeCard extends BaseClass implements LovelaceCard {
        @property({ attribute: false }) public config!: InventreeCardConfig;
        @state() private _hass!: HomeAssistant;
        private logger: Logger = Logger.getInstance();
        private _cleanupFunctions: Array<() => void> = [];
        // private _entitySubscriptions: Map<string, () => void> = new Map();
        private _websocketSubscriptions: Array<() => void> = [];
        // No need for manual store subscription if React handles it
        // private _unsubscribeStore: (() => void) | null = null; 

        // --- React Integration ---
        @state() private _reactRoot: ReactDOM.Root | null = null;
        private _reactMountPoint: HTMLDivElement | null = null;
        // --- End React Integration ---
        private _cardInstanceId: string; // Add stable instance ID

        constructor() {
            super();
            this._cardInstanceId = `inventree-card-${Math.random().toString(36).substring(2, 15)}`; // Create stable ID
            this.logger = Logger.getInstance();
            this.logger.log('InventreeCard', `constructor() called. Stable ID created: ${this._cardInstanceId}`);
            this.config = { type: 'custom:inventree-card' }; // FIX LINTER ERROR
            this.hass = {} as HomeAssistant;
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
            const logger = Logger.getInstance(); // Local logger instance for static method
            logger.log('InventreeCard', 'getConfigElement called for React editor', { category: 'card', subsystem: 'editor' });
            
            // Ensure the React editor host element is defined
            defineReactEditorHost(); 
            
            logger.log('InventreeCard', `Creating editor element: ${REACT_EDITOR_TAG_NAME}`, { category: 'card', subsystem: 'editor' });
            const editor = document.createElement(REACT_EDITOR_TAG_NAME) as LovelaceCardEditor;
            if (!editor) {
                logger.error('InventreeCard', `Failed to create editor element: ${REACT_EDITOR_TAG_NAME}`);
                // Fallback or throw error
                throw new Error(`Failed to create editor element: ${REACT_EDITOR_TAG_NAME}`);
            }
            logger.log('InventreeCard', `React editor host element created: ${REACT_EDITOR_TAG_NAME}`, { category: 'card', subsystem: 'editor' });
            return editor;
        }

        public static getStubConfig(hass: HomeAssistant): InventreeCardConfig {
            // Find the first available InvenTree sensor
            const entity = Object.keys(hass.states).find(eid => 
                eid.startsWith('sensor.') && 
                hass.states[eid].attributes?.items !== undefined
            );

            // Start with a deep clone of DEFAULT_CONFIG to avoid modifying the original
            // This ensures all nested objects from DEFAULT_CONFIG are present.
            const stub = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as InventreeCardConfig;

            // Override specific fields for a new card stub
            stub.type = `custom:${CARD_NAME}`;
            stub.name = 'InvenTree Card';
            
            // data_sources is guaranteed to exist from DEFAULT_CONFIG
            stub.data_sources.inventree_hass_sensors = entity ? [entity] : [];

            // Explicitly remove legacy top-level fields that might have been on an older DEFAULT_CONFIG version
            // or if they were part of an even earlier stub structure before spreading DEFAULT_CONFIG.
            // Most of these are now nested under layout_options or data_sources, or removed entirely.
            delete (stub as any).entity; 
            delete (stub as any).selected_entities;
            delete (stub as any).columns; 
            delete (stub as any).grid_spacing; 
            delete (stub as any).item_height; 
            delete (stub as any).parts_config; 
            delete (stub as any).thumbnails; 
            delete (stub as any).buttons; 
            delete (stub as any).services; 
            delete (stub as any).variant_groups;
            delete (stub as any).variant_view_type;
            delete (stub as any).auto_detect_variants;


            // All other defaults (view_type, display, direct_api, layout_options, style, interactions, 
            // conditional_logic, performance, parameters, debug flags) are correctly inherited 
            // from the comprehensive DEFAULT_CONFIG.

            return stub; // No need to cast again if stub is already InventreeCardConfig
        }

        public setConfig(config: InventreeCardConfig): void {
            this.logger.log('InventreeCard', 'setConfig() called.');
            if (!config) {
                this.logger.error('InventreeCard', 'setConfig() called with null or undefined config.');
                throw new Error('You need to define a configuration.');
            }
            this.config = config;
            this.logger.setDebugConfig(config);
            this.logger.log('InventreeCard', 'setConfig() finished.');
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
            
            // Request update handled by property decorator
            this._setupDebugMode(config);
        }

        // Keep entity subscriptions if Lit wrapper needs to react to HASS state changes directly
        // Or remove if all state handling moves to React/Redux via hass prop
        // private _setupEntitySubscriptions(): void {
        //     this._clearEntitySubscriptions();
        //     if (!this._hass?.connection || (!this.config?.entity && (!this.config?.selected_entities || this.config.selected_entities.length === 0))) {
        //         this.logger.warn('Card Lit', 'Cannot set up entity subscription - HASS connection or relevant entityIds missing.');
        //         return;
        //     }

        //     const entityIdsToSubscribe = [this.config.entity, ...(this.config.selected_entities || [])].filter(Boolean) as string[];
        //     const uniqueEntityIds = [...new Set(entityIdsToSubscribe)];

        //     uniqueEntityIds.forEach(entityId => {
        //         if (this._entitySubscriptions.has(entityId)) return;

        //         const subscribe = async (idToSub: string) => {
        //             try {
        //                 const unsub = await this._hass!.connection.subscribeEvents((event: any) => {
        //                     if (event.data.entity_id === idToSub) {
        //                         this.logger.log('Card Lit', `Entity ${idToSub} changed, triggering React update via hass prop.`);
        //                         // Update the _hass property to trigger Lit's update cycle, which passes new hass to React
        //                         this._hass = { ...this._hass! }; // Create new object reference
        //                     }
        //                 }, 'state_changed');
        //                 this._entitySubscriptions.set(idToSub, unsub);
        //                 this.logger.log('Card Lit', `Subscribed to HASS entity: ${idToSub}`);
        //             } catch (error) {
        //                 this.logger.error('Card Lit', `Error subscribing to HASS entity ${idToSub}:`, error);
        //             }
        //         };
        //         subscribe(entityId);
        //     });
        // }
        
        // private _clearEntitySubscriptions(): void {
        //     // Keep cleanup logic
        //     this.logger.log('Card Lit', 'Clearing HASS entity subscriptions');
        //     for (const unsubscribe of this._entitySubscriptions.values()) {
        //         if (typeof unsubscribe === 'function') {
        //             unsubscribe();
        //         }
        //     }
        //     this._entitySubscriptions.clear();
        // }

        // Render only the container for React
        protected render(): TemplateResult | void {
            this.logger.log('InventreeCard', 'render() called.');
            return html`<div id="react-root-container"></div>`;
        }

        shouldUpdate(changedProperties: Map<string | number | symbol, unknown>): boolean {
            // Always update if the config changes, as it's the source of truth for dependencies.
            if (changedProperties.has('config')) {
                this.logger.log('InventreeCard', 'shouldUpdate: config changed, forcing update.', { category: 'card', subsystem: 'lifecycle' });
                return true;
            }
        
            // Check if hass has changed.
            if (changedProperties.has('_hass')) {
                const oldHass = changedProperties.get('_hass') as HomeAssistant | undefined;
        
                // This can happen on the very first render or if hass is temporarily unavailable. Allow the update.
                if (!this._hass || !oldHass) {
                    this.logger.log('InventreeCard', 'shouldUpdate: hass not yet available, allowing update.', { category: 'card', subsystem: 'lifecycle' });
                    return true;
                }
        
                // Get the list of entities we care about from the config.
                const dependentEntities = [
                    ...(this.config?.data_sources?.inventree_hass_sensors || []),
                    ...(this.config?.data_sources?.ha_entities || []),
                ];
        
                // If we don't depend on any entities, there's no need to update on hass changes.
                // This is a major optimization.
                if (dependentEntities.length === 0) {
                    this.logger.log('InventreeCard', 'shouldUpdate: hass changed, but no dependent entities configured. Preventing update.', { category: 'card', subsystem: 'lifecycle' });
                    return false;
                }
        
                // Check if any of our dependent entities have changed state object references.
                for (const entityId of dependentEntities) {
                    if (oldHass.states[entityId] !== this._hass.states[entityId]) {
                        this.logger.log('InventreeCard', `shouldUpdate: Dependent entity ${entityId} changed. Allowing update.`, { category: 'card', subsystem: 'lifecycle' });
                        return true;
                    }
                }
        
                // If we're here, hass changed, but none of our dependent entities did.
                this.logger.log('InventreeCard', 'shouldUpdate: hass changed, but no dependent entities were affected. Preventing update.', { category: 'card', subsystem: 'lifecycle' });
                return false;
            }
        
            // For any other property changes (like internal state), let Lit decide.
            return changedProperties.size > 0;
        }

        // Mount/Update React app
        protected firstUpdated(_changedProperties: PropertyValues): void {
            super.firstUpdated(_changedProperties);
            this.logger.log('InventreeCard', 'firstUpdated() called.');
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
                // this._setupEntitySubscriptions(); 
            }
        }

        private _mountOrUpdateReactApp(): void {
            this.logger.log('InventreeCard', '_mountOrUpdateReactApp() called.');
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
                 this.logger.log('InventreeCardLit', 'About to call createRoot(). Mount point is:', { element: this._reactMountPoint });
                 this._reactRoot = ReactDOM.createRoot(this._reactMountPoint);
                 this.logger.log('InventreeCardLit', 'Successfully called createRoot(). React root is created.');
                 this.logger.log('InventreeCardLit', 'Mounting React app for the first time.', { hass: !!this._hass, config: !!this.config });
             }

             if (this._hass && this.config) { // Ensure config is also present
                this.logger.log('InventreeCardLit', 'Rendering ReactApp with HASS and Config.');
                this._reactRoot.render(
                    React.createElement(
                        React.StrictMode,
                        null,
                        React.createElement(ReactApp, { 
                            hass: this._hass, 
                            config: this.config, 
                            cardInstanceId: this._cardInstanceId // Pass stable ID down
                        })
                    )
                );
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
            // this._clearEntitySubscriptions();
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
                // this._setupEntitySubscriptions();
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
// window.customCards = window.customCards || []; // REMOVE
// Avoid duplicate push if script runs multiple times in dev
// if (!window.customCards.some(card => card.type === "inventree-card")) { // REMOVE BLOCK
// window.customCards.push({ // REMOVE
// type: "inventree-card", // REMOVE
// name: "InvenTree Card", // REMOVE
// description: "A card for displaying InvenTree inventory data", // REMOVE
// preview: true // REMOVE
// }); // REMOVE
// } // REMOVE

// Keep export, adjust if class name changed internally
let InventreeCard: any;
try {
    // Ensure this points to the primary class definition within the try block
    InventreeCard = customElements.get(CARD_NAME); 
} catch (e) {
    // Fallback logic if needed
}
export { InventreeCard };

