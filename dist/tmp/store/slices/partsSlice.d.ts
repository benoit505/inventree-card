import { UnknownAction, ThunkDispatch } from '@reduxjs/toolkit';
import { InventreeItem, EnhancedStockItemEventData, ParameterDetail } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
export interface PartsState {
    partsById: Record<number, InventreeItem>;
    partsByEntity: Record<string, number[]>;
    loading: boolean;
    error: string | null;
    locatingPartId: number | null;
    adjustingStockPartId: number | null;
    adjustmentError: string | null;
}
export declare const fetchPartDetails: import("@reduxjs/toolkit").AsyncThunk<InventreeItem, number, {
    state: RootState;
    rejectValue: string;
    dispatch?: ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
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
    dispatch?: ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
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
    dispatch?: ThunkDispatch<unknown, unknown, UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const setParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    entityId: string;
    parts: InventreeItem[];
}, "parts/setParts">, addParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeItem[], "parts/addParts">, updatePart: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeItem, "parts/updatePart">, updatePartStock: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    newStock: number;
}, "parts/updatePartStock">, clearParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "parts/clearParts">, registerEntity: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "parts/registerEntity">, partStockUpdateFromWebSocket: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<EnhancedStockItemEventData> & {
    partId: number;
}, "parts/partStockUpdateFromWebSocket">, setLocatingPartId: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "parts/setLocatingPartId">;
declare const _default: import("redux").Reducer<PartsState>;
export default _default;
export declare const selectPartsByEntityMapping: (state: RootState) => Record<string, number[]>;
export declare const selectPartsById: (state: RootState) => Record<number, InventreeItem>;
export declare const selectAllPartIds: ((state: {
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
}) => number[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>) => number[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>) => number[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllParts: ((state: {
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
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartsForEntities: ((state: {
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
}, entityIds: string[]) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<string, number[]>, resultFuncArgs_1: Record<number, InventreeItem>, resultFuncArgs_2: string[]) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<string, number[]>, resultFuncArgs_1: Record<number, InventreeItem>, resultFuncArgs_2: string[]) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<string, number[]>, (state: RootState) => Record<number, InventreeItem>, (_: RootState, entityIds: string[]) => string[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartsByEntityId: ((state: {
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
}, entityId: string) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: string) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: string) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>, (state: RootState) => Record<string, number[]>, (_: RootState, entityId: string) => string];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartById: ((state: {
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
}, partId: number | null | undefined) => InventreeItem | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: number | null | undefined) => InventreeItem | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: number | null | undefined) => InventreeItem | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem | undefined;
    dependencies: [(state: RootState) => Record<number, InventreeItem>, (_: RootState, partId: number | null | undefined) => number | null | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartsLoading: (state: RootState) => boolean;
export declare const selectPartsError: (state: RootState) => string | null;
export declare const selectLocatingPartId: (state: RootState) => number | null;
export declare const selectAdjustingStockPartId: (state: RootState) => number | null;
export declare const selectAdjustmentError: (state: RootState) => string | null;
export declare const selectFilteredParts: ((state: {
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
    resultFunc: (resultFuncArgs_0: InventreeItem[]) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: InventreeItem[]) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
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
        resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>) => InventreeItem[];
        memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>) => InventreeItem[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeItem[];
        dependencies: [(state: RootState) => Record<number, InventreeItem>];
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
export declare const selectPartsByEntity: ((state: {
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
}, entityId: string | null | undefined) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: string | null | undefined) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: string | null | undefined) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>, (state: RootState) => Record<string, number[]>, (_: RootState, entityId: string | null | undefined) => string | null | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
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
}, primaryEntityId: string | null | undefined, additionalEntityIds?: string[] | undefined) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: {
        primaryEntityId: string | null | undefined;
        additionalEntityIds: string[];
    }) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: Record<string, number[]>, resultFuncArgs_2: {
        primaryEntityId: string | null | undefined;
        additionalEntityIds: string[];
    }) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>, (state: RootState) => Record<string, number[]>, (_: RootState, primaryEntityId: string | null | undefined, additionalEntityIds?: string[]) => {
        primaryEntityId: string | null | undefined;
        additionalEntityIds: string[];
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectPartsByPks: ((state: {
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
}, pks: number[]) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: number[]) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: Record<number, InventreeItem>, resultFuncArgs_1: number[]) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => Record<number, InventreeItem>, (_state: RootState, pks: number[]) => number[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
