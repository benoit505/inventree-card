import { TemplateResult, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../core/types';
import { ReduxLitElement } from '../../components/redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreeListLayout extends ReduxLitElement {
    hass: HomeAssistant;
    entity: string;
    config: InventreeCardConfig;
    parts: InventreeItem[];
    private _locatingPartId;
    private _parameterStatus;
    private _requiredPartIds;
    private _isLoadingParameters;
    private logger;
    static styles: import("lit").CSSResult[];
    constructor();
    private getReferencedPartIds;
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
    updated(changedProperties: PropertyValues): void;
    private checkAndFetchParameters;
    private _updateGlobalLoadingState;
    private _handleParameterActionClick;
    private _getContainerStyle;
    private _getTextStyle;
    private _handleImageError;
    protected render(): TemplateResult | string;
}
