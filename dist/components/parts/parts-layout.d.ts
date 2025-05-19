import { TemplateResult, PropertyValues } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../core/types';
import { ReduxLitElement } from '../../components/redux-lit-element';
import { RootState } from '../../store';
import '../search/search-bar';
export declare class InvenTreePartsLayout extends ReduxLitElement {
    hass: HomeAssistant;
    config: InventreeCardConfig;
    selectedEntities: string[];
    parts: InventreeItem[];
    private _locatingPartId;
    private _parameterStatus;
    private _requiredPartIds;
    private _isLoadingParameters;
    private _searchQuery;
    private _searchResults;
    private logger;
    static styles: import("lit").CSSResult[];
    private getReferencedPartIds;
    stateMap(state: RootState): {
        _locatingPartId: number | null;
        _parameterStatus: Record<number, "loading" | "idle" | "succeeded" | "failed">;
        _searchQuery: string;
        _searchResults: {
            pk: number;
            name: string;
            thumbnail?: string | undefined;
        }[];
        _parts: import("../../types").InventreeItem[];
    };
    dispatchMap(): {
        locatePart: (partId: number) => any;
        adjustStock: (partId: number, amount: number) => any;
        updateParameter: (partId: number, parameter: string, value: string) => any;
        fetchParameters: (partIds: number[]) => any;
        search: (query: string) => any;
        clearSearch: () => any;
    };
    updated(changedProperties: PropertyValues): void;
    private checkAndFetchParameters;
    private _updateGlobalLoadingState;
    private _handleParameterActionClick;
    private _getContainerStyle;
    private _getTextStyle;
    private _handleImageError;
    render(): TemplateResult | string;
    private _renderGridView;
    private _renderListView;
}
