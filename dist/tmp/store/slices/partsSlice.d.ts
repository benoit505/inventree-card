import { UnknownAction } from '@reduxjs/toolkit';
import { InventreeItem, EnhancedStockItemEventData, ParameterDetail, ConditionalLogicItem, InventreeCardConfig } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
export interface PartsState {
    partsById: Record<number, InventreeItem>;
    partsByEntity: Record<string, number[]>;
    loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    loading: boolean;
    error: string | null;
    locatingPartId: number | null;
    adjustingStockPartId: number | null;
    adjustmentError: string | null;
}
export declare const fetchPartDetails: import("@reduxjs/toolkit").AsyncThunk<InventreeItem, number, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const locatePartById: import("@reduxjs/toolkit").AsyncThunk<void, {
    partId: number;
    hass: HomeAssistant;
}, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const adjustPartStock: import("@reduxjs/toolkit").AsyncThunk<{
    partId: number;
    newTotalStock: number | undefined;
}, {
    partId: number;
    amount: number;
    locationId?: number;
    notes?: string;
    hass?: HomeAssistant;
}, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const setParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    entityId: string;
    parts: InventreeItem[];
}, "parts/setParts">, removePartsForEntity: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    entityId: string;
}, "parts/removePartsForEntity">, updatePart: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeItem, "parts/updatePart">, updatePartStock: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    newStock: number;
}, "parts/updatePartStock">, clearParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "parts/clearParts">, registerEntity: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "parts/registerEntity">, partStockUpdateFromWebSocket: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<EnhancedStockItemEventData> & {
    partId: number;
}, "parts/partStockUpdateFromWebSocket">, setLocatingPartId: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "parts/setLocatingPartId">;
export declare const selectPartsLoading: (state: RootState) => boolean;
export declare const selectPartsError: (state: RootState) => string | null;
export declare const selectLocatingPartId: (state: RootState) => number | null;
export declare const selectAdjustingStockPartId: (state: RootState) => number | null;
export declare const selectAdjustmentError: (state: RootState) => string | null;
export declare const selectPartLoadingStatus: (state: RootState, partId: number) => "idle" | "loading" | "succeeded" | "failed";
export declare const selectCombinedParts: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<number, InventreeItem>) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<number, InventreeItem>) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>, ((state: {
        api: import("./apiSlice").ApiState;
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        counter: import("./counterSlice").CounterState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        metrics: import("./metricsSlice").MetricsState;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    }) => Record<number, InventreeItem>) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }) => Record<number, InventreeItem>;
        memoizedResultFunc: ((resultFuncArgs_0: {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }) => Record<number, InventreeItem>) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => Record<number, InventreeItem>;
        dependencies: [(state: RootState) => {
            [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("reselect").weakMapMemoize;
        argsMemoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectRegisteredEntities: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}) => string[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<string, number[]>) => string[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<string, number[]>) => string[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string[];
    dependencies: [(state: RootState) => Record<string, number[]>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllReferencedPartPksFromConfig: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}, config: InventreeCardConfig | undefined) => number[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig | undefined, resultFuncArgs_1: ConditionalLogicItem[]) => number[];
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig | undefined, resultFuncArgs_1: ConditionalLogicItem[]) => number[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number[];
    dependencies: [(_state: RootState, config: InventreeCardConfig | undefined) => InventreeCardConfig | undefined, (state: RootState) => ConditionalLogicItem[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartByPk: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}, pk: number) => InventreeItem | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeItem[], resultFuncArgs_1: number) => InventreeItem | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: InventreeItem[], resultFuncArgs_1: number) => InventreeItem | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem | undefined;
    dependencies: [((state: {
        api: import("./apiSlice").ApiState;
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        counter: import("./counterSlice").CounterState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        metrics: import("./metricsSlice").MetricsState;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    }) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<number, InventreeItem>) => InventreeItem[];
        memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<number, InventreeItem>) => InventreeItem[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeItem[];
        dependencies: [(state: RootState) => Record<number, InventreeItem>, ((state: {
            api: import("./apiSlice").ApiState;
            components: import("./componentSlice").ComponentState;
            conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
            config: import("./configSlice").ConfigState;
            counter: import("./counterSlice").CounterState;
            genericHaStates: import("./genericHaStateSlice").GenericHaStates;
            metrics: import("./metricsSlice").MetricsState;
            parameters: import("./parametersSlice").ParametersState;
            parts: PartsState;
            ui: import("./uiSlice").UiState;
            visualEffects: import("./visualEffectsSlice").VisualEffectsState;
            websocket: import("./websocketSlice").WebSocketState;
            actions: import("./actionsSlice").ActionsState;
            inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
                getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
                getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
                updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                    partId: number;
                    parameterPk: number;
                    value: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
                getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                    partId: number;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
                addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                    partId: number;
                    quantity: number;
                    locationId?: number;
                    notes?: string;
                }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
                searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                    status?: number | "CUSTOM_ERROR";
                    data?: any;
                    message?: string;
                }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
                    pk: number;
                    name: string;
                    thumbnail?: string;
                }[], "inventreeApi", unknown>;
            }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
        }) => Record<number, InventreeItem>) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        } & {
            resultFunc: (resultFuncArgs_0: {
                [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
            }) => Record<number, InventreeItem>;
            memoizedResultFunc: ((resultFuncArgs_0: {
                [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
            }) => Record<number, InventreeItem>) & {
                clearCache: () => void;
                resultsCount: () => number;
                resetResultsCount: () => void;
            };
            lastResult: () => Record<number, InventreeItem>;
            dependencies: [(state: RootState) => {
                [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
            }];
            recomputations: () => number;
            resetRecomputations: () => void;
            dependencyRecomputations: () => number;
            resetDependencyRecomputations: () => void;
        } & {
            memoize: typeof import("reselect").weakMapMemoize;
            argsMemoize: typeof import("reselect").weakMapMemoize;
        }];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("reselect").weakMapMemoize;
        argsMemoize: typeof import("reselect").weakMapMemoize;
    }, (_state: RootState, pk: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsReadyForEvaluation: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}, config: InventreeCardConfig | undefined) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }, resultFuncArgs_1: number[]) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }, resultFuncArgs_1: number[]) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }, ((state: {
        api: import("./apiSlice").ApiState;
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        counter: import("./counterSlice").CounterState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        metrics: import("./metricsSlice").MetricsState;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    }, config: InventreeCardConfig | undefined) => number[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: InventreeCardConfig | undefined, resultFuncArgs_1: ConditionalLogicItem[]) => number[];
        memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig | undefined, resultFuncArgs_1: ConditionalLogicItem[]) => number[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => number[];
        dependencies: [(_state: RootState, config: InventreeCardConfig | undefined) => InventreeCardConfig | undefined, (state: RootState) => ConditionalLogicItem[]];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("reselect").weakMapMemoize;
        argsMemoize: typeof import("reselect").weakMapMemoize;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
declare const _default: import("redux").Reducer<PartsState>;
export default _default;
