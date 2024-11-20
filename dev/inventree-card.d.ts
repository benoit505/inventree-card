import { LitElement } from "lit";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";
import { InventreeCardConfig } from "./types";
export declare class InventreeCard extends LitElement implements LovelaceCard {
    hass: HomeAssistant;
    private config;
    constructor();
    static getStubConfig(): object;
    setConfig(config: InventreeCardConfig): void;
    getCardSize(): number;
    protected render(): import("lit-html").TemplateResult<1>;
    private _renderItem;
    private _handleStockAdjust;
    static get styles(): import("lit").CSSResult;
    static getConfigElement(): Promise<LovelaceCardEditor>;
}
