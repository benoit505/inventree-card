import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { InventreeCardConfig, ILogger, CellDefinition } from '../types';
import ReactInventreeCardEditor from '../components/editor/InventreeCardEditor';
import { CARD_NAME } from '../core/constants'; // Assuming CARD_NAME is 'inventree-card'
import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';
import { registerLogCategoriesBatchForInstance, initializeEditorLogger, removeInstance } from '../store/slices/loggingSlice';
import { setConfigAction } from '../store/slices/configSlice';
import { generateStableCardInstanceId } from '../utils/cardInstanceId';

export const REACT_EDITOR_TAG_NAME = `${CARD_NAME}-react-editor-host`;

ConditionalLoggerEngine.getInstance().registerCategory('ReactEditorHost', { enabled: false, level: 'info' });

@customElement(REACT_EDITOR_TAG_NAME)
export class ReactEditorHost extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace!: any;
  @state() private _config?: InventreeCardConfig;
  @state() private _cardInstanceId?: string;
  
  private logger: ILogger;
  private _reactRoot: ReactDOM.Root | null = null;
  private _mountPoint: HTMLDivElement | null = null;

  constructor() {
    super();
    this.logger = ConditionalLoggerEngine.getInstance().getTemporaryLogger('ReactEditorHost-Init');
  }

  static styles = css`
    :host {
      display: block;
    }
    #react-editor-mount-point {
      width: 100%;
      height: 100%;
    }
  `;

  public setConfig(config: InventreeCardConfig): void {
    // 🚀 SIMPLIFIED: Always accept the new config - let React handle the diffing
    this._config = config;
    this._cardInstanceId = generateStableCardInstanceId(config);
    this.logger = ConditionalLoggerEngine.getInstance().getLogger('ReactEditorHost', this._cardInstanceId);
    this.logger.info('setConfig', `Editor Host generated cardInstanceId: ${this._cardInstanceId}`);
    
    // The main card view dispatches `destroyCardThunk` on unmount, which used to remove the shared config.
    // The editor MUST re-establish the config in the store to ensure its selectors and components have the state they need.
    // This makes the editor's initialization robust and idempotent.
    store.dispatch(setConfigAction({ config, cardInstanceId: this._cardInstanceId }));
    
    // Initialize the logger state for this specific instance in the editor
    store.dispatch(initializeEditorLogger({ cardInstanceId: this._cardInstanceId }));
    
    this._renderReactApp(); // Re-render React app when config changes
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (this.shadowRoot) {
      this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point') as HTMLDivElement;
    }
    if (!this._mountPoint) {
        this.logger.error('firstUpdated', 'CRITICAL: react-editor-mount-point NOT FOUND in shadowRoot.');
        return;
    }
    // Pre-register all known logger categories into the Redux store
    // This ensures the settings UI has access to them immediately.
    const allCategories = ConditionalLoggerEngine.getInstance().getRegisteredCategories();
    if (this._cardInstanceId) {
      store.dispatch(registerLogCategoriesBatchForInstance({ cardInstanceId: this._cardInstanceId, categories: allCategories }));
    } else {
      this.logger.warn('firstUpdated', 'Cannot register log categories, cardInstanceId is not yet available.');
    }

    this._renderReactApp();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hass') || changedProperties.has('_config')) {
      this._renderReactApp();
    }
  }

  private _sanitizeConfigForLovelace(config: InventreeCardConfig): InventreeCardConfig {
    const sanitized = JSON.parse(JSON.stringify(config)); // Deep copy

    if (sanitized.layout?.cells) {
      sanitized.layout.cells = sanitized.layout.cells.map((cell: any) => {
        // Lovelace rejects configs containing properties that look like transient UI state.
        // The 'header' property was generated on-the-fly and caused this error.
        // We have now removed it from the type system entirely, but this sanitizer remains
        // as a safeguard in case any old configs still have it. The `id` is required
        // by the layout system and is safe to save.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { header, ...rest } = cell; 
        return rest;
      });
    }

    return sanitized;
  }

  private _handleReactConfigChange = (newConfig: InventreeCardConfig) => {
    this.logger.debug('_handleReactConfigChange', 'React editor changed config, attempting to fire event.', { newConfig });
    
    const sanitizedConfig = this._sanitizeConfigForLovelace(newConfig);

    let eventTargetElement: HTMLElement = this; // Default to 'this' (the custom element itself)

    if (this.lovelace && typeof (this.lovelace as any).dispatchEvent === 'function') {
      this.logger.debug('_handleReactConfigChange', 'Using this.lovelace as event target.');
      eventTargetElement = this.lovelace as HTMLElement;
    } else if (this.lovelace) {
      this.logger.warn('_handleReactConfigChange', 'this.lovelace exists but has no dispatchEvent method or is not HTMLElement. Defaulting to dispatching on self.', { lovelaceObject: this.lovelace });
    } else {
      this.logger.debug('_handleReactConfigChange', 'this.lovelace is not available. Dispatching event on self (this custom element).');
    }

    try {
      fireEvent(eventTargetElement, 'config-changed', { config: sanitizedConfig });
      this.logger.info('_handleReactConfigChange', 'Successfully fired config-changed event.', { target: eventTargetElement === this ? 'self' : 'lovelace' });
      console.log('✅ EDITOR: config-changed event fired successfully!', { target: eventTargetElement === this ? 'self' : 'lovelace' });
    } catch (e) {
      this.logger.error('_handleReactConfigChange', 'Error firing config-changed event:', e as Error, { target: eventTargetElement, newConfig });
      console.log('❌ EDITOR: ERROR firing config-changed event:', e);
    }
  };

  private _renderReactApp(): void {
    if (!this._mountPoint) {
      this.logger.warn('_renderReactApp', 'Attempted to render React app, but mount point is not available. Re-checking...');
      if (this.shadowRoot) {
        this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point') as HTMLDivElement;
        if (this._mountPoint) {
          this.logger.debug('_renderReactApp', 'Mount point re-acquired.');
        } else {
          this.logger.error('_renderReactApp', 'Mount point still NOT available after re-check. Cannot render.');
          return;
        }
      } else {
        this.logger.error('_renderReactApp', 'Shadow DOM not available for mount point re-check. Cannot render.');
        return;
      }
    }

    if (!this.hass || this._config === undefined || !this._cardInstanceId) {
        this.logger.warn('_renderReactApp', 'Hass, config, or cardInstanceId is not yet available. Skipping React render.', { hasHass: !!this.hass, hasConfig: this._config !== undefined, hasId: !!this._cardInstanceId });
        if(this._reactRoot) {
            this._reactRoot.render(React.createElement('div', null, 'Loading editor resources...'));
        } else if (this._mountPoint) {
            this._mountPoint.innerHTML = '<div>Loading editor resources...</div>';
        }
        return;
    }

    if (!this._reactRoot) {
      this._reactRoot = ReactDOM.createRoot(this._mountPoint);
    }

    this.logger.debug('_renderReactApp', 'Rendering React editor component.', { 
        hasHass: !!this.hass, 
        hasConfig: !!this._config,
        config: this._config,
        cardInstanceId: this._cardInstanceId
    });

    const reactEditorProps = {
      hass: this.hass,
      lovelace: this.lovelace, 
      config: this._config,
      cardInstanceId: this._cardInstanceId,
      onConfigChanged: this._handleReactConfigChange,
      dispatch: store.dispatch,
    };
    
    const editorElement = React.createElement(ReactInventreeCardEditor, reactEditorProps);

    this._reactRoot.render(
      React.createElement(
        Provider,
        { store: store, children: editorElement } // Explicitly pass editorElement as props.children
      )
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._reactRoot) {
      this._reactRoot.unmount();
      this._reactRoot = null;
      this.logger.info('disconnectedCallback', 'React editor unmounted.');
    }
    if (this._cardInstanceId) {
      store.dispatch(removeInstance({ cardInstanceId: this._cardInstanceId }));
      this.logger.info('disconnectedCallback', `Cleaned up logging state for instance: ${this._cardInstanceId}`);
    }
    this._mountPoint = null;
  }

  render() {
    return html`<div id="react-editor-mount-point"></div>`;
  }
}

export const defineReactEditorHost = () => {
  if (!customElements.get(REACT_EDITOR_TAG_NAME)) {
    customElements.define(REACT_EDITOR_TAG_NAME, ReactEditorHost);
    const logger = ConditionalLoggerEngine.getInstance().getTemporaryLogger('ReactEditorHost-Define');
    logger.info('defineReactEditorHost', `Defined custom element: ${REACT_EDITOR_TAG_NAME}`);
  }
}; 