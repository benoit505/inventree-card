import { ThunkAction, Action, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook } from 'react-redux';
export declare const rootReducer: import("redux").Reducer<{
    api: import("./slices/apiSlice").ApiState;
    components: import("./slices/componentSlice").ComponentState;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("./slices/configSlice").ConfigState;
    counter: import("./slices/counterSlice").CounterState;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
    metrics: import("./slices/metricsSlice").MetricsState;
    parameters: import("./slices/parametersSlice").ParametersState;
    parts: import("./slices/partsSlice").PartsState;
    ui: import("./slices/uiSlice").UiState;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("./slices/websocketSlice").WebSocketState;
    actions: import("./slices/actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}, import("redux").UnknownAction, Partial<{
    api: import("./slices/apiSlice").ApiState | undefined;
    components: import("./slices/componentSlice").ComponentState | undefined;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState | undefined;
    config: import("./slices/configSlice").ConfigState | undefined;
    counter: import("./slices/counterSlice").CounterState | undefined;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates | undefined;
    metrics: import("./slices/metricsSlice").MetricsState | undefined;
    parameters: import("./slices/parametersSlice").ParametersState | undefined;
    parts: import("./slices/partsSlice").PartsState | undefined;
    ui: import("./slices/uiSlice").UiState | undefined;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState | undefined;
    websocket: import("./slices/websocketSlice").WebSocketState | undefined;
    actions: import("./slices/actionsSlice").ActionsState | undefined;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi"> | undefined;
}>>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    api: import("./slices/apiSlice").ApiState;
    components: import("./slices/componentSlice").ComponentState;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("./slices/configSlice").ConfigState;
    counter: import("./slices/counterSlice").CounterState;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
    metrics: import("./slices/metricsSlice").MetricsState;
    parameters: import("./slices/parametersSlice").ParametersState;
    parts: import("./slices/partsSlice").PartsState;
    ui: import("./slices/uiSlice").UiState;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("./slices/websocketSlice").WebSocketState;
    actions: import("./slices/actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
}, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: ThunkDispatch<{
        api: import("./slices/apiSlice").ApiState;
        components: import("./slices/componentSlice").ComponentState;
        conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
        config: import("./slices/configSlice").ConfigState;
        counter: import("./slices/counterSlice").CounterState;
        genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
        metrics: import("./slices/metricsSlice").MetricsState;
        parameters: import("./slices/parametersSlice").ParametersState;
        parts: import("./slices/partsSlice").PartsState;
        ui: import("./slices/uiSlice").UiState;
        visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
        websocket: import("./slices/websocketSlice").WebSocketState;
        actions: import("./slices/actionsSlice").ActionsState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<string, import("@reduxjs/toolkit/query").BaseQueryFn<import("./apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
                status?: number | "CUSTOM_ERROR";
                data?: any;
                message?: string;
            }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi">;
    }, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
