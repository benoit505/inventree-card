// src/editor.ts
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, LovelaceCardEditor, fireEvent } from "custom-card-helpers";
import { InventreeCardConfig } from "../core/types";
import { EDITOR_NAME, SCHEMA, CARD_TYPE } from "../core/constants";
import { editorStyles } from "../styles/editor";
import { validateSetting, getSettingGroup, DEFAULT_CONFIG } from "../core/settings";

@customElement(EDITOR_NAME)
export class InventreeCardEditor extends LitElement implements LovelaceCardEditor {
    static styles = editorStyles;
    
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private _config?: InventreeCardConfig;

    setConfig(config: InventreeCardConfig): void {
        this._config = {
            ...DEFAULT_CONFIG,
            ...config,
            thumbnails: {
                ...DEFAULT_CONFIG.thumbnails,
                ...(config.thumbnails || {})
            }
        };
    }

    private _handleValueChanged(ev: CustomEvent): void {
        if (!this._config) return;

        console.debug('Value changed event:', ev.detail);

        // Case 1: Full config update
        if (ev.detail?.value && !ev.detail?.path) {
            const value = ev.detail.value;
            
            // Ensure we preserve the type and required fields
            const newConfig = {
                ...this._config,
                ...value,
                type: CARD_TYPE, // Always preserve the card type
                // Preserve nested objects with defaults
                layout: {
                    ...DEFAULT_CONFIG.layout,
                    ...value.layout
                },
                display: {
                    ...DEFAULT_CONFIG.display,
                    ...value.display
                },
                style: {
                    ...DEFAULT_CONFIG.style,
                    ...value.style
                },
                thumbnails: {
                    ...DEFAULT_CONFIG.thumbnails,
                    ...value.thumbnails
                }
            };

            console.debug('Full config update:', {
                oldConfig: this._config,
                newConfig: newConfig
            });

            fireEvent(this, "config-changed", { config: newConfig });
            return;
        }

        // Case 2: Path/value update
        const path = ev.detail?.path;
        const value = ev.detail?.value;

        if (!path) {
            console.warn('Invalid value-changed event:', ev.detail);
            return;
        }

        // Handle nested properties
        let newConfig = { ...this._config };
        
        if (path.includes('.')) {
            const [section, key] = path.split('.');
            console.debug(`Updating nested config: ${section}.${key} =`, value);
            
            newConfig = {
                ...newConfig,
                [section]: {
                    ...DEFAULT_CONFIG[section],
                    ...newConfig[section],
                    [key]: value
                }
            };
        } else {
            console.debug(`Updating top-level config: ${path} =`, value);
            
            newConfig = {
                ...newConfig,
                [path]: value
            };
        }

        console.debug('Config update:', {
            path,
            value,
            oldConfig: this._config,
            newConfig
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
