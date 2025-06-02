import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { InventreeCardConfig } from '../types';
import ReactInventreeCardEditor from '../components/editor/InventreeCardEditor';
import { CARD_NAME } from '../core/constants'; // Assuming CARD_NAME is 'inventree-card'
import { Logger } from '../utils/logger';

export const REACT_EDITOR_TAG_NAME = `${CARD_NAME}-react-editor-host`;

@customElement(REACT_EDITOR_TAG_NAME)
export class ReactEditorHost extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace!: any;
  @state() private _config?: InventreeCardConfig;
  
  private _reactRoot: ReactDOM.Root | null = null;
  private _mountPoint: HTMLDivElement | null = null;
  private logger = Logger.getInstance();

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
    this.logger.log('ReactEditorHost', 'setConfig called', { config });
    this._config = config;
    this._renderReactApp(); // Re-render React app when config changes
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (this.shadowRoot) {
      this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point') as HTMLDivElement;
    }
    if (!this._mountPoint) {
        this.logger.error('ReactEditorHost', 'CRITICAL: react-editor-mount-point NOT FOUND in shadowRoot.');
        return;
    }
    this._renderReactApp();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hass') || changedProperties.has('_config')) {
      this._renderReactApp();
    }
  }

  private _handleReactConfigChange = (newConfig: InventreeCardConfig) => {
    this.logger.log('ReactEditorHost', 'React editor changed config, attempting to fire event.', { newConfig });

    let eventTargetElement: HTMLElement = this; // Default to 'this' (the custom element itself)

    if (this.lovelace && typeof (this.lovelace as any).dispatchEvent === 'function') {
      this.logger.log('ReactEditorHost', 'Using this.lovelace as event target.');
      // Assuming this.lovelace is HTMLElement compatible if it has dispatchEvent
      eventTargetElement = this.lovelace as HTMLElement;
    } else if (this.lovelace) {
      this.logger.warn('ReactEditorHost', 'this.lovelace exists but has no dispatchEvent method or is not HTMLElement. Defaulting to dispatching on self.', { lovelaceObject: this.lovelace });
      // eventTargetElement is already 'this'
    } else {
      this.logger.log('ReactEditorHost', 'this.lovelace is not available. Dispatching event on self (this custom element).');
      // eventTargetElement is already 'this'
    }

    try {
      // fireEvent expects HTMLElement | Window. Cast is necessary if target could be broader EventTarget.
      fireEvent(eventTargetElement, 'config-changed', { config: newConfig });
      this.logger.log('ReactEditorHost', 'Successfully fired config-changed event.', { target: eventTargetElement === this ? 'self' : 'lovelace' });
    } catch (e) {
      this.logger.error('ReactEditorHost', 'Error firing config-changed event:', { error: e, target: eventTargetElement, newConfig });
    }
  };

  private _renderReactApp(): void {
    if (!this._mountPoint) {
      this.logger.warn('ReactEditorHost', 'Attempted to render React app, but mount point is not available. Re-checking...');
      if (this.shadowRoot) {
        this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point') as HTMLDivElement;
        if (this._mountPoint) {
          this.logger.log('ReactEditorHost', 'Mount point re-acquired.');
        } else {
          this.logger.error('ReactEditorHost', 'Mount point still NOT available after re-check. Cannot render.');
          return;
        }
      } else {
        this.logger.error('ReactEditorHost', 'Shadow DOM not available for mount point re-check. Cannot render.');
        return;
      }
    }

    if (!this.hass || this._config === undefined) {
        this.logger.warn('ReactEditorHost', 'Hass or config is not yet available. Skipping React render.', { hasHass: !!this.hass, hasConfig: this._config !== undefined });
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

    this.logger.log('ReactEditorHost', 'Rendering React editor component.', { 
        hasHass: !!this.hass, 
        hasConfig: !!this._config,
        config: this._config 
    });

    const reactEditorProps = {
      hass: this.hass,
      lovelace: this.lovelace, 
      config: this._config,
      onConfigChanged: this._handleReactConfigChange,
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
      this.logger.log('ReactEditorHost', 'React editor unmounted.');
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
    Logger.getInstance().log('ReactEditorHost', `Defined custom element: ${REACT_EDITOR_TAG_NAME}`);
  }
}; 