// src/editor.ts
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor, fireEvent } from "custom-card-helpers";
import { InventreeCardConfig, InventreeCardConfigKey } from "../types/types";
import { EDITOR_NAME, SCHEMA, DEFAULT_CONFIG, CARD_NAME, CARD_TYPE } from "../utils/constants";
import { editorStyles } from "../styles/editor";
import { validateSetting, getSettingGroup } from "../utils/settings";

// Add module-level logging
console.log('🔧 Editor Module: Start loading');

@customElement(EDITOR_NAME)
export class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
    static styles = editorStyles;
    
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private _config?: InventreeCardConfig;

    constructor() {
        super();
        console.log('🔧 Editor Constructor Called');
    }
    
    connectedCallback() {
        super.connectedCallback();
        console.log('🔧 Editor Connected');
    }

    setConfig(config: InventreeCardConfig): void {
        console.log('📝 Editor setConfig:', config);
        // Create a deep copy of the config to prevent reference issues
        this._config = JSON.parse(JSON.stringify(config));
        console.log('📝 Editor merged config:', this._config);
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config) return;

        const target = ev.detail.target;
        const value = ev.detail.value;

        console.log('📝 Editor Value Changed:', { target, value });

        // Create a new config object with the updated value
        const newConfig = {
            ...this._config,
            [target.configValue]: value
        };

        // Update internal state
        this._config = newConfig;

        // Dispatch the event with the full config
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: newConfig }
        }));
    }

    protected render() {
        console.log('📝 Editor Render:', { 
            hass: !!this.hass, 
            config: this._config,
            schema: SCHEMA 
        });

        if (!this.hass || !this._config) {
            return nothing;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }
}

// Remove the duplicate registration at the bottom
console.log('🔧 Editor Module: Loading complete');
