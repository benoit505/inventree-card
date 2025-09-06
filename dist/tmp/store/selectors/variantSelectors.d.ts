import { RootState } from '../index';
import { InventreeItem, ProcessedVariant } from '../../types';
export declare const selectProcessedVariants: ((state: {
    components: import("../slices/componentSlice").ComponentState;
    conditionalLogic: import("../slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("../slices/configSlice").ConfigState;
    genericHaStates: import("../slices/genericHaStateSlice").GenericHaStates;
    metrics: import("../slices/metricsSlice").MetricsState;
    parameters: import("../slices/parametersSlice").ParametersState;
    parts: import("../slices/partsSlice").PartsState;
    ui: import("../slices/uiSlice").UiState;
    visualEffects: import("../slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("../slices/websocketSlice").WebSocketState;
    actions: import("../slices/actionsSlice").ActionsState;
    logging: import("../slices/loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: any;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => ProcessedVariant[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeItem[]) => ProcessedVariant[];
    memoizedResultFunc: ((resultFuncArgs_0: InventreeItem[]) => ProcessedVariant[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => ProcessedVariant[];
    dependencies: [(state: RootState, cardInstanceId: string) => InventreeItem[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVariantGroups: ((state: {
    components: import("../slices/componentSlice").ComponentState;
    conditionalLogic: import("../slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("../slices/configSlice").ConfigState;
    genericHaStates: import("../slices/genericHaStateSlice").GenericHaStates;
    metrics: import("../slices/metricsSlice").MetricsState;
    parameters: import("../slices/parametersSlice").ParametersState;
    parts: import("../slices/partsSlice").PartsState;
    ui: import("../slices/uiSlice").UiState;
    visualEffects: import("../slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("../slices/websocketSlice").WebSocketState;
    actions: import("../slices/actionsSlice").ActionsState;
    logging: import("../slices/loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: any;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => {
    groups: Record<string, InventreeItem[]>;
    templates: InventreeItem[];
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeItem[]) => {
        groups: Record<string, InventreeItem[]>;
        templates: InventreeItem[];
    };
    memoizedResultFunc: ((resultFuncArgs_0: InventreeItem[]) => {
        groups: Record<string, InventreeItem[]>;
        templates: InventreeItem[];
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        groups: Record<string, InventreeItem[]>;
        templates: InventreeItem[];
    };
    dependencies: [(state: RootState, cardInstanceId: string) => InventreeItem[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
