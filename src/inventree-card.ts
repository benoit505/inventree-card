console.info('InvenTree Card: Starting initialization');

import { LitElement, html } from "lit";
import { property, state, customElement } from "lit/decorators.js";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";

import { cardStyles } from "./styles/card";
import { renderInventreeCard } from "./renders/card";
import { shouldUpdate } from "./utils/helpers";
import { CARD_NAME, EDITOR_NAME, DEFAULT_CONFIG } from "./utils/constants";
import { InventreeCardConfig } from "./types";
import { InventreeCardEditor } from './editors/editor';

@customElement(CARD_NAME)
export class InventreeCard extends LitElement implements LovelaceCard {
    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config?: InventreeCardConfig;

    static styles = cardStyles;

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        console.debug("InvenTree Card: Loading editor...");
        if (customElements.get(EDITOR_NAME) === undefined) {
            await import('./editors/editor');
        }
        console.debug("InvenTree Card: Editor loaded");
        return document.createElement(EDITOR_NAME) as LovelaceCardEditor;
    }

    public static getStubConfig(): InventreeCardConfig {
        return {
            type: `custom:${CARD_NAME}`,
            entity: "",
            ...JSON.parse(JSON.stringify(DEFAULT_CONFIG))
        };
    }

    public setConfig(config: InventreeCardConfig): void {
        if (!config.entity) {
            throw new Error("Please define an entity");
        }
        
        console.debug('🎴 Card: Setting config:', config);
        
        // Create a deep copy of the config and defaults
        const defaultConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        const newConfig = {
            ...defaultConfig,
            ...JSON.parse(JSON.stringify(config)),
            type: `custom:${CARD_NAME}`,
        };
        
        console.debug('🎴 Card: Merged config:', newConfig);
        
        this._config = newConfig;
        this.requestUpdate();
    }

    protected shouldUpdate(changedProps: Map<string, unknown>): boolean {
        if (!this._config) return false;
        
        if (changedProps.has("_config")) {
            console.debug('🎴 Card: Config changed, updating', this._config);
            return true;
        }

        const update = shouldUpdate(
            this.hass,
            changedProps.get("hass") as HomeAssistant,
            this._config.entity
        );
        
        console.debug('🎴 Card: Should update?', update, {
            config: this._config,
            entity: this._config.entity
        });
        return update;
    }

    protected render() {
        if (!this._config || !this.hass) {
            return html``;
        }

        return renderInventreeCard(this.hass, this._config);
    }

    public getCardSize(): number {
        if (!this._config) return 1;
        
        const stateValue = this.hass?.states[this._config.entity]?.state;
        if (!stateValue) return 1;
        
        try {
            const parsed = JSON.parse(stateValue);
            const size = Math.ceil(parsed.length / (this._config.columns || 2));
            console.debug('🎴 Card: Calculated size:', size);
            return size;
        } catch (e) {
            console.warn('🎴 Card: Failed to calculate size:', e);
            return 1;
        }
    }
}

console.info('InvenTree Card: Class defined');
console.info('InvenTree Card: Registration complete');
