// src/editor.ts
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor, fireEvent } from "custom-card-helpers";
import { InventreeCardConfig } from "../types";
import { EDITOR_NAME, SCHEMA, DEFAULT_CONFIG, CARD_TYPE } from "../utils/constants";
import { editorStyles } from "../styles/editor";
import { validateSetting, getSettingGroup } from "../utils/settings";

@customElement(EDITOR_NAME)
export class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
    static styles = editorStyles;
    
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private _config?: InventreeCardConfig;

    setConfig(config: InventreeCardConfig): void {
        console.debug('📝 Editor: Initial config:', config);
        this._config = JSON.parse(JSON.stringify(config));
    }

    private _handleValueChanged(ev: CustomEvent): void {
        if (!this._config) return;

        ev.stopPropagation();
        
        // The value is in ev.detail.value
        const newConfig = {
            ...this._config,
            ...ev.detail.value
        };

        console.debug('📝 Editor Value Changed:', {
            oldConfig: this._config,
            newValue: ev.detail.value,
            newConfig: newConfig
        });

        fireEvent(this, "config-changed", { config: newConfig });
    }

    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                .computeLabel=${(schema: any) => schema.name}
                @value-changed=${this._handleValueChanged}
            ></ha-form>
        `;
    }
}
