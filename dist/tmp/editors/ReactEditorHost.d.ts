import { LitElement, PropertyValues } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { InventreeCardConfig } from '../types';
export declare const REACT_EDITOR_TAG_NAME = "inventree-card-react-editor-host";
export declare class ReactEditorHost extends LitElement implements LovelaceCardEditor {
    hass: HomeAssistant;
    lovelace: any;
    private _config?;
    private _cardInstanceId?;
    private logger;
    private _reactRoot;
    private _mountPoint;
    constructor();
    static styles: import("lit").CSSResult;
    setConfig(config: InventreeCardConfig): void;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    private _sanitizeConfigForLovelace;
    private _handleReactConfigChange;
    private _renderReactApp;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const defineReactEditorHost: () => void;
