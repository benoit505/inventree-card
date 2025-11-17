import { HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ReactApp } from './react-app';
import { CARD_NAME, CARD_VERSION } from './core/constants';
import { ConditionalLoggerEngine } from './core/logging/ConditionalLoggerEngine';
import { REACT_EDITOR_TAG_NAME, defineReactEditorHost } from './editors/ReactEditorHost';
import { generateStableCardInstanceId } from './utils/cardInstanceId';
import { ILogger } from './types';
import { store } from './store';
import { setConfigAction } from './store/slices/configSlice';
import { destroyCardThunk, initializeCardThunk } from './store/thunks/lifecycleThunks';

// This top-level log is for initial script load confirmation.
console.log(`%c ${CARD_NAME.toUpperCase()} %c v${CARD_VERSION} %c IS LOADED `, 'color: white; background: #03a9f4; font-weight: 700;', 'color: white; background: #212121; font-weight: 700;', 'color: black; background: white; font-weight: 700;');

const topLevelLogger = ConditionalLoggerEngine.getInstance().getLogger('InventreeCard-TopLevel');
topLevelLogger.info('Top-level', `NEWEST VERSION LOADED - v${new Date().getTime()}`);
topLevelLogger.debug('Top-level', 'inventree-card.ts script executing');

ConditionalLoggerEngine.getInstance().registerCategory('InventreeCard', { enabled: true, level: 'info', verbose: false });

// 🔍 DIAGNOSTIC TYPES
interface DisconnectionAnalysis {
  code: string;
  reason: string;
  details: any;
}

@customElement(CARD_NAME)
export class InventreeCard extends LitElement implements LovelaceCard {
  private logger: ILogger;

  // 🔍 DIAGNOSTIC TRACKING VARIABLES
  private _lastConfigChangeTime = 0;
  private _lastConfigHadUIProperties = false;
  private _lastUIProperties: string[] = [];
  private _lastRenderError: Error | null = null;
  private _hasHTTP401Errors = false;
  private _failed401Urls: string[] = [];
  private _configChangeCount = 0;

  constructor() {
    super();
    // Initialize with a temporary, non-dispatching logger
    this.logger = ConditionalLoggerEngine.getInstance().getTemporaryLogger('InventreeCard-Init');
    this.logger.info('constructor', 'Lit component is being created.');
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    const staticLogger = ConditionalLoggerEngine.getInstance().getTemporaryLogger('InventreeCard-Static');
    staticLogger.debug('getConfigElement', 'Getting config element.');
    defineReactEditorHost(); // Ensure the editor is defined
    return document.createElement(REACT_EDITOR_TAG_NAME) as LovelaceCardEditor;
  }

  @property({ attribute: false })
  public hass!: HomeAssistant;

  @property({ attribute: false })
  private _config?: LovelaceCardConfig;

  @property({ state: true })
  private _isInitialized = false;

  private reactRoot?: Root;
  private _cardInstanceId: string | null = null;

  static styles = css`
    #react-root {
      width: 100%;
      height: 100%;
    }
  `;

  public setConfig(config: LovelaceCardConfig): void {
    this.logger.info('setConfig', 'Lovelace is providing a new configuration.', { config });
    
    if (!config) {
      throw new Error('Invalid configuration');
    }

    // 🔍 DIAGNOSTIC: Track config changes
    this._lastConfigChangeTime = Date.now();
    this._configChangeCount++;
    this._lastConfigHadUIProperties = false;
    this._lastUIProperties = [];

    // This is the first point where we have a stable ID.
    // We MUST re-initialize the logger here.
    this._cardInstanceId = generateStableCardInstanceId(config);
    this.logger = ConditionalLoggerEngine.getInstance().getLogger('InventreeCard', this._cardInstanceId);
    this.logger.info('setConfig', `Instance ID is now: ${this._cardInstanceId}`);
    
    // 🔍 DIAGNOSTIC: Check for UI-only properties in config
    this._analyzeConfigForUIProperties(config);
    
    // Create a mutable copy of the config
    const finalConfig = { ...config };

    this._config = {
      ...finalConfig,
      layout: {
        cells: [], // Default to an empty array
        ...finalConfig.layout, // User's layout properties will override the default
      },
    };

    // Dispatch the configuration to the Redux store IMMEDIATELY
    // This ensures fresh config from YAML overrides any persisted state from localStorage
    if (this._cardInstanceId && this._config) {
      console.log('%c[inventree-card.ts setConfig] Dispatching config to Redux', 'color: #E67E22; font-weight: bold;', {
        cardInstanceId: this._cardInstanceId,
        hasDirectApi: !!this._config.direct_api,
        hasApiKey: !!this._config.direct_api?.api_key,
        apiKeyPrefix: this._config.direct_api?.api_key?.substring(0, 20) + '...',
        fullConfig: this._config
      });
      
      store.dispatch(setConfigAction({ 
        config: this._config, 
        cardInstanceId: this._cardInstanceId 
      }));
      
      this.logger.info('setConfig', 'Config dispatched to Redux store', { cardInstanceId: this._cardInstanceId });
      
      // Verify it was set correctly
      const globalConfigAfter = store.getState().config?.globalConfig;
      console.log('%c[inventree-card.ts setConfig] GlobalConfig after dispatch', 'color: #E67E22; font-weight: bold;', {
        hasGlobalConfig: !!globalConfigAfter,
        hasDirectApi: !!globalConfigAfter?.direct_api,
        hasApiKey: !!globalConfigAfter?.direct_api?.api_key,
        apiKeyPrefix: globalConfigAfter?.direct_api?.api_key?.substring(0, 20) + '...'
      });
    } else {
      console.warn('%c[inventree-card.ts setConfig] NOT dispatching config', 'color: #E74C3C; font-weight: bold;', {
        hasCardInstanceId: !!this._cardInstanceId,
        hasConfig: !!this._config
      });
    }
  }

  public getCardSize(): number {
    this.logger.verbose('getCardSize', 'Getting card size', { size: 3 });
    return 3; // Default card size
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.logger.info('connectedCallback', 'Element has been connected to the DOM.', { hasRoot: !!this.reactRoot });

    // If the card has already been initialized and is being reconnected (e.g., tab switch),
    // we need to re-mount the React application. The `reactRoot` would have been cleared
    // by `disconnectedCallback`.
    if (this._isInitialized && !this.reactRoot) {
      this.logger.info('connectedCallback', 'Re-mounting React app for reconnected element.');
      this._mountOrUpdateReactApp();
    }
    // Initial mounting logic remains in firstUpdated.
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.logger.info('firstUpdated', 'Component has rendered for the first time.');

    // 🔍 DIAGNOSTIC LOG: Check the state right before initialization
    this.logger.debug('firstUpdated', 'Pre-initialization state check:', {
      isInitialized: this._isInitialized,
      hasConfig: !!this._config,
      hasCardInstanceId: !!this._cardInstanceId,
      config: this._config,
      cardInstanceId: this._cardInstanceId,
    });

    // This is the first time we can be sure this element is "real" and its DOM is available.
    if (!this._isInitialized && this._config && this._cardInstanceId) {
      this.logger.info('firstUpdated', 'Dispatching initialization thunk.');
      
      const { _cardInstanceId, hass, _config } = this;

      // Dispatch the thunk, but don't await. Let the lifecycle continue.
      (store.dispatch as any)(initializeCardThunk({ 
        cardInstanceId: _cardInstanceId, 
        hass,
        config: _config,
      })).then(() => {
        // This block runs after the thunk is fully resolved.
        this.logger.info('firstUpdated', `Thunk completed for ${_cardInstanceId}. Now mounting React.`);
        
        // If the element is still on the page, mount React and update state.
        if (this.isConnected) {
          this._mountOrUpdateReactApp();
          this._isInitialized = true;
        } else {
          this.logger.warn('firstUpdated', `Thunk completed, but element for ${_cardInstanceId} was disconnected. Aborting React mount.`);
        }
      });
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    // This lifecycle method is called when any of the element's properties change.
    // We are specifically interested in the 'hass' object, which is updated by Lovelace
    // whenever an entity state changes in Home Assistant.
    if (changedProperties.has('hass') && this._isInitialized) {
      this.logger.debug('updated', 'Hass object changed, propagating to React app.');
      // By calling _mountOrUpdateReactApp, we pass the new 'hass' object down to our
      // React component tree, triggering a re-render and all associated data updates.
      this._mountOrUpdateReactApp();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    // 🔍 ENHANCED DIAGNOSTIC ANALYSIS
    const disconnectionReason = this._analyzeDisconnectionCause();
    
    this.logger.error('disconnectedCallback', `[${disconnectionReason.code}] ${disconnectionReason.reason}`, undefined, disconnectionReason.details);
    
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = undefined;
      this.logger.info('disconnectedCallback', 'React app unmounted.');
    }
  }

  protected render(): TemplateResult | void {
    this.logger.debug('render', 'Lit render method called.', { hasConfig: !!this._config });
    if (!this._config) {
      return html`<div>Loading...</div>`;
    }

    // Always render the container. 
    // Show a message inside which will be replaced by React once it's ready.
    return html`
      <div id="react-root">${!this._isInitialized ? 'Initializing...' : ''}</div>
    `;
  }

  private _mountOrUpdateReactApp(): void {
    this.logger.debug('_mountOrUpdateReactApp', 'Attempting to mount/update React app.', { instanceId: this._cardInstanceId });
    const mountPoint = this.shadowRoot?.getElementById('react-root');
    if (!mountPoint) {
      this.logger.warn('_mountOrUpdateReactApp', 'React mount point not found. App will not be rendered.');
      return;
    }

    if (!this.hass || !this._config) {
      this.logger.warn('_mountOrUpdateReactApp', 'Hass or config is not available. App will not be rendered.');
      return;
    }

    const props = {
      hass: this.hass,
      config: this._config,
      cardInstanceId: this._cardInstanceId ?? undefined,
    };

    this.logger.verbose('_mountOrUpdateReactApp', 'Props being passed to React app.', {
      hasHass: !!props.hass,
      configKeys: Object.keys(props.config),
      cardInstanceId: props.cardInstanceId,
    });

    if (!this.reactRoot) {
      this.reactRoot = createRoot(mountPoint);
      this.logger.info('_mountOrUpdateReactApp', 'New React root created.');
    }

    this.reactRoot.render(React.createElement(ReactApp, props));
    this.logger.debug('_mountOrUpdateReactApp', 'React app rendered.');
  }

  static getStubConfig(): Record<string, unknown> {
    const staticLogger = ConditionalLoggerEngine.getInstance().getTemporaryLogger('InventreeCard-Static');
    staticLogger.debug('getStubConfig', 'Getting stub config.');
    return {
      type: 'custom:inventree-card',
      name: 'My InvenTree Card',
    };
  }

  // 🔍 DIAGNOSTIC ANALYSIS METHODS

  private _analyzeConfigForUIProperties(config: any): void {
    const uiProperties: string[] = [];
    
    // Check for UI-only properties in cells
    if (config.layout?.cells) {
      config.layout.cells.forEach((cell: any, index: number) => {
        if (cell.header) {
          uiProperties.push(`cells[${index}].header`);
        }
        if (cell.id && typeof cell.id === 'string' && cell.id.includes('-')) {
          // Likely a UUID
          uiProperties.push(`cells[${index}].id (UUID)`);
        }
      });
    }
    
    if (uiProperties.length > 0) {
      this._lastConfigHadUIProperties = true;
      this._lastUIProperties = uiProperties;
    }
  }

  private _analyzeDisconnectionCause(): DisconnectionAnalysis {
    const timeSinceLastConfigChange = Date.now() - this._lastConfigChangeTime;
    const hasRecentConfigChange = timeSinceLastConfigChange < 2000; // 2 seconds
    
    // ERROR CODE BUCKETS
    if (hasRecentConfigChange && this._lastConfigHadUIProperties) {
      return {
        code: 'DC001',
        reason: 'Config contained UI-only properties - Lovelace rejected unsafe config',
        details: { 
          timeSinceConfig: timeSinceLastConfigChange, 
          uiProps: this._lastUIProperties,
          configChangeCount: this._configChangeCount
        }
      };
    }
    
    if (hasRecentConfigChange && this._lastRenderError) {
      return {
        code: 'DC002', 
        reason: 'React render error detected before disconnection',
        details: { 
          error: this._lastRenderError.message, 
          timeSinceConfig: timeSinceLastConfigChange,
          configChangeCount: this._configChangeCount
        }
      };
    }
    
    if (this._hasHTTP401Errors) {
      return {
        code: 'DC003',
        reason: 'HTTP 401 errors detected - Authentication/thumbnail issues',
        details: { 
          failedUrls: this._failed401Urls,
          timeSinceConfig: timeSinceLastConfigChange
        }
      };
    }
    
    if (hasRecentConfigChange) {
      return {
        code: 'DC004',
        reason: 'Unknown config-related disconnection - Config triggered recreation',
        details: { 
          timeSinceConfig: timeSinceLastConfigChange,
          configChangeCount: this._configChangeCount,
          hadUIProps: this._lastConfigHadUIProperties
        }
      };
    }
    
    if (this._configChangeCount > 10) {
      return {
        code: 'DC005',
        reason: 'Excessive config changes detected - Possible infinite loop',
        details: { 
          configChangeCount: this._configChangeCount,
          timeSinceConfig: timeSinceLastConfigChange
        }
      };
    }
    
    return {
      code: 'DC999',
      reason: 'Normal disconnection (tab switch, navigation, or user action)',
      details: { 
        timeSinceConfig: timeSinceLastConfigChange,
        configChangeCount: this._configChangeCount
      }
    };
  }
}

