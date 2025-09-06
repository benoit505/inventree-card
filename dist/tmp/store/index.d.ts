import { ThunkAction, Action, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook } from 'react-redux';
declare const appReducer: import("redux").Reducer<{
    components: import("./slices/componentSlice").ComponentState;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("./slices/configSlice").ConfigState;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
    metrics: import("./slices/metricsSlice").MetricsState;
    parameters: import("./slices/parametersSlice").ParametersState;
    parts: import("./slices/partsSlice").PartsState;
    ui: import("./slices/uiSlice").UiState;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("./slices/websocketSlice").WebSocketState;
    actions: import("./slices/actionsSlice").ActionsState;
    logging: import("./slices/loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: any;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
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
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("./apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, import("redux").UnknownAction, Partial<{
    components: import("./slices/componentSlice").ComponentState | undefined;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState | undefined;
    config: import("./slices/configSlice").ConfigState | undefined;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates | undefined;
    metrics: import("./slices/metricsSlice").MetricsState | undefined;
    parameters: import("./slices/parametersSlice").ParametersState | undefined;
    parts: import("./slices/partsSlice").PartsState | undefined;
    ui: import("./slices/uiSlice").UiState | undefined;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState | undefined;
    websocket: import("./slices/websocketSlice").WebSocketState | undefined;
    actions: import("./slices/actionsSlice").ActionsState | undefined;
    logging: import("./slices/loggingSlice").LoggingState | undefined;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: any;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", "inventreeApi"> | undefined;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("./apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi"> | undefined;
}>>;
export type RootState = ReturnType<typeof appReducer>;
export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    components: import("./slices/componentSlice").ComponentState;
    conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
    config: import("./slices/configSlice").ConfigState;
    genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
    metrics: import("./slices/metricsSlice").MetricsState;
    parameters: import("./slices/parametersSlice").ParametersState;
    parts: import("./slices/partsSlice").PartsState;
    ui: import("./slices/uiSlice").UiState;
    visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
    websocket: import("./slices/websocketSlice").WebSocketState;
    actions: import("./slices/actionsSlice").ActionsState;
    logging: import("./slices/loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterPk: number;
            value: any;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
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
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("./apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
} & import("redux-persist/es/persistReducer").PersistPartial, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: ThunkDispatch<{
        components: import("./slices/componentSlice").ComponentState;
        conditionalLogic: import("./slices/conditionalLogicSlice").ConditionalLogicState;
        config: import("./slices/configSlice").ConfigState;
        genericHaStates: import("./slices/genericHaStateSlice").GenericHaStates;
        metrics: import("./slices/metricsSlice").MetricsState;
        parameters: import("./slices/parametersSlice").ParametersState;
        parts: import("./slices/partsSlice").PartsState;
        ui: import("./slices/uiSlice").UiState;
        visualEffects: import("./slices/visualEffectsSlice").VisualEffectsState;
        websocket: import("./slices/websocketSlice").WebSocketState;
        actions: import("./slices/actionsSlice").ActionsState;
        logging: import("./slices/loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterPk: number;
                value: any;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../types").StockItem, "inventreeApi", unknown>;
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
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("./apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    } & import("redux-persist/es/persistReducer").PersistPartial, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export declare const persistor: import("redux-persist").Persistor;
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
export {};
