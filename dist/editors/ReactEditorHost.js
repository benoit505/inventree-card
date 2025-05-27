var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent } from 'custom-card-helpers';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import ReactInventreeCardEditor from '../components/editor/InventreeCardEditor';
import { CARD_NAME } from '../core/constants'; // Assuming CARD_NAME is 'inventree-card'
import { Logger } from '../utils/logger';
export const REACT_EDITOR_TAG_NAME = `${CARD_NAME}-react-editor-host`;
let ReactEditorHost = class ReactEditorHost extends LitElement {
    constructor() {
        super(...arguments);
        this._reactRoot = null;
        this._mountPoint = null;
        this.logger = Logger.getInstance();
        this._handleReactConfigChange = (newConfig) => {
            this.logger.log('ReactEditorHost', 'React editor changed config, attempting to fire event.', { newConfig });
            console.log('[ReactEditorHost] _handleReactConfigChange (from React editor):', JSON.parse(JSON.stringify(newConfig)));
            let eventTargetElement = this; // Default to 'this' (the custom element itself)
            if (this.lovelace && typeof this.lovelace.dispatchEvent === 'function') {
                this.logger.log('ReactEditorHost', 'Using this.lovelace as event target.');
                // Assuming this.lovelace is HTMLElement compatible if it has dispatchEvent
                eventTargetElement = this.lovelace;
            }
            else if (this.lovelace) {
                this.logger.warn('ReactEditorHost', 'this.lovelace exists but has no dispatchEvent method or is not HTMLElement. Defaulting to dispatching on self.', { lovelaceObject: this.lovelace });
                // eventTargetElement is already 'this'
            }
            else {
                this.logger.log('ReactEditorHost', 'this.lovelace is not available. Dispatching event on self (this custom element).');
                // eventTargetElement is already 'this'
            }
            try {
                // fireEvent expects HTMLElement | Window. Cast is necessary if target could be broader EventTarget.
                fireEvent(eventTargetElement, 'config-changed', { config: newConfig });
                this.logger.log('ReactEditorHost', 'Successfully fired config-changed event.', { target: eventTargetElement === this ? 'self' : 'lovelace' });
            }
            catch (e) {
                this.logger.error('ReactEditorHost', 'Error firing config-changed event:', { error: e, target: eventTargetElement, newConfig });
            }
        };
    }
    setConfig(config) {
        this.logger.log('ReactEditorHost', 'setConfig called', { config });
        console.log('[ReactEditorHost] setConfig received:', JSON.parse(JSON.stringify(config)));
        this._config = config;
        this._renderReactApp(); // Re-render React app when config changes
    }
    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        if (this.shadowRoot) {
            this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point');
        }
        if (!this._mountPoint) {
            this.logger.error('ReactEditorHost', 'CRITICAL: react-editor-mount-point NOT FOUND in shadowRoot.');
            return;
        }
        this._renderReactApp();
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('hass') || changedProperties.has('_config')) {
            this._renderReactApp();
        }
    }
    _renderReactApp() {
        if (!this._mountPoint) {
            this.logger.warn('ReactEditorHost', 'Attempted to render React app, but mount point is not available. Re-checking...');
            console.log('[ReactEditorHost] _renderReactApp: Mount point NOT available. Re-checking...');
            if (this.shadowRoot) {
                this._mountPoint = this.shadowRoot.getElementById('react-editor-mount-point');
                if (this._mountPoint) {
                    this.logger.log('ReactEditorHost', 'Mount point re-acquired.');
                    console.log('[ReactEditorHost] _renderReactApp: Mount point re-acquired.');
                }
                else {
                    this.logger.error('ReactEditorHost', 'Mount point still NOT available after re-check. Cannot render.');
                    console.log('[ReactEditorHost] _renderReactAoo: Mount point STILL NOT available after re-check.');
                    return;
                }
            }
            else {
                this.logger.error('ReactEditorHost', 'Shadow DOM not available for mount point re-check. Cannot render.');
                console.log('[ReactEditorHost] _renderReactApp: Shadow DOM not available for re-check.');
                return;
            }
        }
        if (!this.hass || this._config === undefined) {
            this.logger.warn('ReactEditorHost', 'Hass or config is not yet available. Skipping React render.', { hasHass: !!this.hass, hasConfig: this._config !== undefined });
            console.log('[ReactEditorHost] _renderReactApp: HASS or _config undefined. Skipping.', { hasHass: !!this.hass, hasConfig: this._config !== undefined });
            if (this._reactRoot) {
                this._reactRoot.render(React.createElement('div', null, 'Loading editor resources...'));
            }
            else if (this._mountPoint) {
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
        console.log('[ReactEditorHost] _renderReactApp: Rendering with props:', { hass: !!this.hass, config: JSON.parse(JSON.stringify(this._config)) });
        const reactEditorProps = {
            hass: this.hass,
            lovelace: this.lovelace,
            config: this._config,
            onConfigChanged: this._handleReactConfigChange,
        };
        const editorElement = React.createElement(ReactInventreeCardEditor, reactEditorProps);
        this._reactRoot.render(React.createElement(Provider, { store: store, children: editorElement } // Explicitly pass editorElement as props.children
        ));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._reactRoot) {
            this._reactRoot.unmount();
            this._reactRoot = null;
            this.logger.log('ReactEditorHost', 'React editor unmounted.');
        }
        this._mountPoint = null;
    }
    render() {
        return html `<div id="react-editor-mount-point"></div>`;
    }
};
ReactEditorHost.styles = css `
    :host {
      display: block;
    }
    #react-editor-mount-point {
      width: 100%;
      height: 100%;
    }
  `;
__decorate([
    property({ attribute: false })
], ReactEditorHost.prototype, "hass", void 0);
__decorate([
    property({ attribute: false })
], ReactEditorHost.prototype, "lovelace", void 0);
__decorate([
    state()
], ReactEditorHost.prototype, "_config", void 0);
ReactEditorHost = __decorate([
    customElement(REACT_EDITOR_TAG_NAME)
], ReactEditorHost);
export { ReactEditorHost };
// Helper function to ensure the element is defined only once
export function defineReactEditorHost() {
    if (!customElements.get(REACT_EDITOR_TAG_NAME)) {
        customElements.define(REACT_EDITOR_TAG_NAME, ReactEditorHost);
        Logger.getInstance().log('ReactEditorHost', `Defined custom element: ${REACT_EDITOR_TAG_NAME}`);
    }
}
//# sourceMappingURL=ReactEditorHost.js.map