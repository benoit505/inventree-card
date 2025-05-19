import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, PartData, ParameterData, VisualModifiers } from '../../core/types';
import { RootState } from '../../store';
import { ReduxLitElement } from '../redux-lit-element';
import { TemplateResult } from 'lit';
export declare class InvenTreeDetailLayout extends ReduxLitElement {
    hass: HomeAssistant;
    config: InventreeCardConfig;
    item?: PartData;
    private _locatingPartId;
    private _mainPartParameterStatus;
    private _effectiveParameterStatus;
    private _visualModifiers;
    private _actionButtons;
    private _parameterValues;
    private _requiredParameterPartIds;
    static styles: import("lit").CSSResult[];
    private logger;
    stateMap(state: RootState): {
        _locatingPartId: number | null;
        _mainPartParameterStatus: "loading" | "idle" | "succeeded" | "failed";
        _effectiveParameterStatus: "loading" | "idle" | "succeeded" | "failed";
        _visualModifiers: VisualModifiers;
        _parameterValues: Record<string, ParameterData>;
        _actionButtons: any;
    };
    dispatchMap(): {
        locatePart: (partId: number) => any;
        adjustStock: (partId: number, amount: number) => any;
        updateParameter: (partId: number, parameterName: string, value: string) => any;
        fetchParameters: (partIds: number[]) => any;
    };
    connectedCallback(): void;
    protected firstUpdated(): void;
    updated(changedProps: Map<string, unknown>): void;
    private _calculateRequiredIds;
    private checkAndFetchParameters;
    private _getContainerStyle;
    private _getTextStyle;
    private _handleImageError;
    private _handleParameterActionClick;
    protected render(): TemplateResult | string;
    private _renderParameters;
    private _shallowEqual;
    private _shallowEqualArray;
}
