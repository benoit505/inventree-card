import { TemplateResult, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../core/types';
import { ReduxLitElement } from '../../components/redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreeGridLayout extends ReduxLitElement {
    hass: HomeAssistant;
    config: InventreeCardConfig;
    parts: InventreeItem[];
    private _locatingPartId;
    private _parameterStatus;
    private _isLoadingParameters;
    private logger;
    constructor();
    stateMap(state: RootState): {
        _locatingPartId: number | null;
        _parameterStatus: Record<number, "loading" | "idle" | "succeeded" | "failed">;
    };
    dispatchMap(): {
        locatePart: (partId: number) => any;
        adjustStock: (partId: number, amount: number) => any;
        updateParameter: (partId: number, parameter: string, value: string) => any;
        fetchParameters: (partIds: number[]) => any;
    };
    static styles: import("lit").CSSResult[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    private _updateGlobalLoadingState;
    private _handleParameterActionClick;
    private _getContainerStyle;
    private _getTextStyle;
    private _handleImageError;
    private getButtonConfig;
    render(): TemplateResult | string;
}
