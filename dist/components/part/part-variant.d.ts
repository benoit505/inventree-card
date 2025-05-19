import { LitElement } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ProcessedVariant } from '../../core/types';
export declare class InvenTreePartVariant extends LitElement {
    variant?: ProcessedVariant;
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
    viewType: string;
    private logger;
    static styles: import("lit").CSSResult[];
    updated(changedProperties: Map<string, any>): void;
    private logVariantDetails;
    render(): import("lit-html").TemplateResult<1>;
    private renderGridView;
    private renderListView;
    private renderTreeView;
}
