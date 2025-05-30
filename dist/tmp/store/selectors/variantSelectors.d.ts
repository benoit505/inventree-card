import { RootState } from '../index';
import { InventreeItem, ProcessedVariant } from '../../types';
export declare const selectProcessedVariants: ((state: {
    api: import("../slices/apiSlice").ApiState;
    components: import("../slices/componentSlice").ComponentState;
    conditionalLogic: import("../slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("../slices/configSlice").ConfigState;
    counter: import("../slices/counterSlice").CounterState;
    genericHaStates: import("../slices/genericHaStateSlice").GenericHaStates;
    metrics: import("../slices/metricsSlice").MetricsState;
    parameters: import("../slices/parametersSlice").ParametersState;
    parts: import("../slices/partsSlice").PartsState;
    ui: import("../slices/uiSlice").UiState;
    visualEffects: import("../slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("../slices/websocketSlice").WebSocketState;
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
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail, "inventreeApi", unknown>;
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
}) => ProcessedVariant[]) & {
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
    dependencies: [(state: RootState) => InventreeItem[]];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectVariantGroups: ((state: {
    api: import("../slices/apiSlice").ApiState;
    components: import("../slices/componentSlice").ComponentState;
    conditionalLogic: import("../slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("../slices/configSlice").ConfigState;
    counter: import("../slices/counterSlice").CounterState;
    genericHaStates: import("../slices/genericHaStateSlice").GenericHaStates;
    metrics: import("../slices/metricsSlice").MetricsState;
    parameters: import("../slices/parametersSlice").ParametersState;
    parts: import("../slices/partsSlice").PartsState;
    ui: import("../slices/uiSlice").UiState;
    visualEffects: import("../slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("../slices/websocketSlice").WebSocketState;
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
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail, "inventreeApi", unknown>;
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
}) => {
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
    dependencies: [((state: {
        api: import("../slices/apiSlice").ApiState;
        components: import("../slices/componentSlice").ComponentState;
        conditionalLogic: import("../slices/conditionalLogicSlice").ConditionalLogicState;
        config: import("../slices/configSlice").ConfigState;
        counter: import("../slices/counterSlice").CounterState;
        genericHaStates: import("../slices/genericHaStateSlice").GenericHaStates;
        metrics: import("../slices/metricsSlice").MetricsState;
        parameters: import("../slices/parametersSlice").ParametersState;
        parts: import("../slices/partsSlice").PartsState;
        ui: import("../slices/uiSlice").UiState;
        visualEffects: import("../slices/visualEffectsSlice").VisualEffectsState;
        websocket: import("../slices/websocketSlice").WebSocketState;
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
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").ParameterDetail, "inventreeApi", unknown>;
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
