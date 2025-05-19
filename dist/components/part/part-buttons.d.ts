import { PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InvenTreePart, InventreeCardConfig } from '../../core/types';
import { ReduxLitElement } from '../redux-lit-element';
export declare class InvenTreePartButtons extends ReduxLitElement {
    partData?: InvenTreePart;
    partItem?: InvenTreePart;
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
    private processedButtons;
    private logger;
    static styles: import("lit").CSSResult[];
    private get activePart();
    dispatchMap(): {
        adjustStock: (partId: number, amount: number) => any;
        locatePart: (partId: number) => any;
    };
    protected updated(changedProperties: PropertyValues): void;
    connectedCallback(): void;
    private handleClick;
    private isLEDActiveForPart;
    render(): import("lit-html").TemplateResult<1>;
    private getButtonColor;
    private getButtonTitle;
    private getDefaultLabel;
    private getButtonConfig;
}
