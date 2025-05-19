import { PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ViewType } from '../../core/types';
import { ReduxLitElement } from '../redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreePartContainer extends ReduxLitElement {
    hass: HomeAssistant;
    config: InventreeCardConfig;
    view_type: ViewType;
    columns: number;
    grid_spacing: number;
    showImage: boolean;
    showName: boolean;
    showStock: boolean;
    showDescription: boolean;
    showCategory: boolean;
    textStyle: string;
    item_height: number;
    private _parts;
    private logger;
    static styles: import("lit").CSSResult;
    constructor();
    stateMap(state: RootState): {
        _parts: import("../../types").InventreeItem[];
    };
    updated(changedProperties: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
}
