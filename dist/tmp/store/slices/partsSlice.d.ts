import { PayloadAction } from '@reduxjs/toolkit';
import { InventreeItem, EnhancedStockItemEventData, ConditionalLogicItem, ParameterDetail } from '../../types';
import { RootState } from '../index';
declare const partsAdapter: import("@reduxjs/toolkit").EntityAdapter<InventreeItem, number>;
export interface InstancePartsState extends ReturnType<typeof partsAdapter.getInitialState> {
    locatingPartId: number | null;
    adjustingStockPartId: number | null;
    adjustmentError: string | null;
    pendingStockChanges: Record<number, {
        originalStock: number;
        expectedStock: number;
        pendingDelta: number;
        lastChangeTimestamp: number;
    }>;
    websocketUpdateTimestamps: Record<number, number>;
}
export interface PartsState {
    partsByInstance: Record<string, InstancePartsState>;
    loadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    loading: boolean;
    error: string | null;
}
declare const partsSlice: import("@reduxjs/toolkit").Slice<PartsState, {
    addApiPart(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        part: InventreeItem;
        cardInstanceId: string;
    }>): void;
    setPartParameters(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        partId: number;
        parameters: ParameterDetail[];
        cardInstanceId: string;
    }>): void;
    updateParameterForPart(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        partId: number;
        parameterPk: number;
        newValue: any;
        cardInstanceId: string;
    }>): void;
    setParts(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        parts: InventreeItem[];
        cardInstanceId: string;
    }>): void;
    removeInstance(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        cardInstanceId: string;
    }>): void;
    updatePart(state: PartsState, action: PayloadAction<{
        part: InventreeItem;
        cardInstanceId: string;
    }>): void;
    addPendingStockChange(state: PartsState, action: PayloadAction<{
        partId: number;
        delta: number;
        cardInstanceId: string;
    }>): void;
    clearPendingStockChange(state: PartsState, action: PayloadAction<{
        partId: number;
        cardInstanceId: string;
    }>): void;
    updatePartStock(state: PartsState, action: PayloadAction<{
        partId: number;
        newStock: number;
        cardInstanceId: string;
    }>): void;
    partStockUpdateFromWebSocket(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<Partial<EnhancedStockItemEventData> & {
        partId: number;
    }>): void;
    setLocatingPartId(state: import("immer").WritableDraft<PartsState>, action: PayloadAction<{
        partId: number | null;
        cardInstanceId: string;
    }>): void;
}, "parts", "parts", import("@reduxjs/toolkit").SliceSelectors<PartsState>>;
export declare const addApiPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    part: InventreeItem;
    cardInstanceId: string;
}, "parts/addApiPart">, setPartParameters: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameters: ParameterDetail[];
    cardInstanceId: string;
}, "parts/setPartParameters">, updateParameterForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameterPk: number;
    newValue: any;
    cardInstanceId: string;
}, "parts/updateParameterForPart">, setParts: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    parts: InventreeItem[];
    cardInstanceId: string;
}, "parts/setParts">, removeInstance: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "parts/removeInstance">, updatePart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    part: InventreeItem;
    cardInstanceId: string;
}, "parts/updatePart">, updatePartStock: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    newStock: number;
    cardInstanceId: string;
}, "parts/updatePartStock">, addPendingStockChange: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    delta: number;
    cardInstanceId: string;
}, "parts/addPendingStockChange">, clearPendingStockChange: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    cardInstanceId: string;
}, "parts/clearPendingStockChange">, partStockUpdateFromWebSocket: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<EnhancedStockItemEventData> & {
    partId: number;
}, "parts/partStockUpdateFromWebSocket">, setLocatingPartId: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number | null;
    cardInstanceId: string;
}, "parts/setLocatingPartId">;
export declare const selectAllReferencedPartPksFromConfig: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => number[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: {
        inventree_parts: undefined;
        part_id: undefined;
        entities: undefined;
        inventree_pks?: undefined;
    } | {
        inventree_pks: any;
        inventree_parts: any;
        part_id: any;
        entities: any;
    }, resultFuncArgs_1: ConditionalLogicItem[], resultFuncArgs_2: string) => number[];
    memoizedResultFunc: ((resultFuncArgs_0: {
        inventree_parts: undefined;
        part_id: undefined;
        entities: undefined;
        inventree_pks?: undefined;
    } | {
        inventree_pks: any;
        inventree_parts: any;
        part_id: any;
        entities: any;
    }, resultFuncArgs_1: ConditionalLogicItem[], resultFuncArgs_2: string) => number[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number[];
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => {
        inventree_parts: undefined;
        part_id: undefined;
        entities: undefined;
        inventree_pks?: undefined;
    } | {
        inventree_pks: any;
        inventree_parts: any;
        part_id: any;
        entities: any;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: import("../../types").InventreeCardConfig) => {
            inventree_parts: undefined;
            part_id: undefined;
            entities: undefined;
            inventree_pks?: undefined;
        } | {
            inventree_pks: any;
            inventree_parts: any;
            part_id: any;
            entities: any;
        };
        memoizedResultFunc: ((resultFuncArgs_0: import("../../types").InventreeCardConfig) => {
            inventree_parts: undefined;
            part_id: undefined;
            entities: undefined;
            inventree_pks?: undefined;
        } | {
            inventree_pks: any;
            inventree_parts: any;
            part_id: any;
            entities: any;
        }) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => {
            inventree_parts: undefined;
            part_id: undefined;
            entities: undefined;
            inventree_pks?: undefined;
        } | {
            inventree_pks: any;
            inventree_parts: any;
            part_id: any;
            entities: any;
        };
        dependencies: [(state: RootState, cardInstanceId: string) => import("../../types").InventreeCardConfig];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("reselect").weakMapMemoize;
        argsMemoize: typeof import("reselect").weakMapMemoize;
    }, (state: RootState, cardInstanceId: string) => ConditionalLogicItem[], (state: RootState, cardInstanceId: string) => string];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectIsReadyForEvaluation: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: boolean, resultFuncArgs_1: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: boolean, resultFuncArgs_1: {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [(state: RootState) => boolean, (state: RootState) => {
        [queryCacheKey: string]: import("@reduxjs/toolkit/query").QuerySubState<unknown, unknown> | undefined;
    }];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectArePartsLoading: (state: RootState) => boolean;
export declare const selectPartsError: (state: RootState) => string | null;
export declare const selectLocatingPartId: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => number | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InstancePartsState) => number | null;
    memoizedResultFunc: ((resultFuncArgs_0: InstancePartsState) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number | null;
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => InstancePartsState) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InstancePartsState;
        dependencies: [(state: RootState) => Record<string, InstancePartsState>, (_state: RootState, cardInstanceId: string) => string];
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
export declare const selectAdjustingStockPartId: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => number | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InstancePartsState) => number | null;
    memoizedResultFunc: ((resultFuncArgs_0: InstancePartsState) => number | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => number | null;
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => InstancePartsState) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InstancePartsState;
        dependencies: [(state: RootState) => Record<string, InstancePartsState>, (_state: RootState, cardInstanceId: string) => string];
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
export declare const selectAdjustmentError: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => string | null) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InstancePartsState) => string | null;
    memoizedResultFunc: ((resultFuncArgs_0: InstancePartsState) => string | null) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | null;
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => InstancePartsState) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InstancePartsState;
        dependencies: [(state: RootState) => Record<string, InstancePartsState>, (_state: RootState, cardInstanceId: string) => string];
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
export declare const selectAllPartsForInstance: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, cardInstanceId: string) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InstancePartsState) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: InstancePartsState) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => InstancePartsState) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InstancePartsState;
        dependencies: [(state: RootState) => Record<string, InstancePartsState>, (_state: RootState, cardInstanceId: string) => string];
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
export declare const selectPartById: ((state: {
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    parameters: import("./parametersSlice").ParametersState;
    parts: PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: import("./visualEffectsSlice").VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    logging: import("./loggingSlice").LoggingState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
            pk: number;
            cardInstanceId: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
        getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
            cardInstanceId: string;
            template_detail?: boolean;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
        updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            parameterId: number;
            data: any;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
        getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
            partId: number;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
        addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
            partId: number;
            quantity: number;
            locationId?: number;
            notes?: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
        removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
            items: Array<{
                pk: number;
                quantity: number;
            }>;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
        searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
            searchText: string;
        }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
            pk: number;
            name: string;
            thumbnail?: string;
        }[], "inventreeApi", unknown>;
    }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
    loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
        getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
        addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
    }, "LogEntry", "loggingApi">;
}, _cardInstanceId: string, partId: number) => {
    [x: string]: any;
    pk: number;
    name: string;
    description?: string | null | undefined;
    IPN?: string | null | undefined;
    variant_of?: number | null | undefined;
    keywords?: string | null | undefined;
    category?: number | null | undefined;
    category_name?: string | null | undefined;
    category_pathstring?: string | null | undefined;
    thumbnail?: string | null | undefined;
    image?: string | null | undefined;
    active?: boolean | undefined;
    assembly?: boolean | undefined;
    component?: boolean | undefined;
    is_template?: boolean | undefined;
    purchaseable?: boolean | undefined;
    salable?: boolean | undefined;
    starred?: boolean | undefined;
    virtual?: boolean | undefined;
    units?: string | null | undefined;
    in_stock?: number | undefined;
    on_order?: number | undefined;
    building?: number | undefined;
    minimum_stock?: number | null | undefined;
    total_in_stock?: number | undefined;
    unallocated_stock?: number | undefined;
    allocated_to_build_orders?: number | undefined;
    allocated_to_sales_orders?: number | undefined;
    link?: string | null | undefined;
    notes?: string | null | undefined;
    parameters?: ParameterDetail[] | null | undefined;
    entity_id?: string | undefined;
    last_updated?: string | undefined;
    status_label?: string | undefined;
    status_value?: number | undefined;
}) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InstancePartsState, resultFuncArgs_1: number) => {
        [x: string]: any;
        pk: number;
        name: string;
        description?: string | null | undefined;
        IPN?: string | null | undefined;
        variant_of?: number | null | undefined;
        keywords?: string | null | undefined;
        category?: number | null | undefined;
        category_name?: string | null | undefined;
        category_pathstring?: string | null | undefined;
        thumbnail?: string | null | undefined;
        image?: string | null | undefined;
        active?: boolean | undefined;
        assembly?: boolean | undefined;
        component?: boolean | undefined;
        is_template?: boolean | undefined;
        purchaseable?: boolean | undefined;
        salable?: boolean | undefined;
        starred?: boolean | undefined;
        virtual?: boolean | undefined;
        units?: string | null | undefined;
        in_stock?: number | undefined;
        on_order?: number | undefined;
        building?: number | undefined;
        minimum_stock?: number | null | undefined;
        total_in_stock?: number | undefined;
        unallocated_stock?: number | undefined;
        allocated_to_build_orders?: number | undefined;
        allocated_to_sales_orders?: number | undefined;
        link?: string | null | undefined;
        notes?: string | null | undefined;
        parameters?: ParameterDetail[] | null | undefined;
        entity_id?: string | undefined;
        last_updated?: string | undefined;
        status_label?: string | undefined;
        status_value?: number | undefined;
    };
    memoizedResultFunc: ((resultFuncArgs_0: InstancePartsState, resultFuncArgs_1: number) => {
        [x: string]: any;
        pk: number;
        name: string;
        description?: string | null | undefined;
        IPN?: string | null | undefined;
        variant_of?: number | null | undefined;
        keywords?: string | null | undefined;
        category?: number | null | undefined;
        category_name?: string | null | undefined;
        category_pathstring?: string | null | undefined;
        thumbnail?: string | null | undefined;
        image?: string | null | undefined;
        active?: boolean | undefined;
        assembly?: boolean | undefined;
        component?: boolean | undefined;
        is_template?: boolean | undefined;
        purchaseable?: boolean | undefined;
        salable?: boolean | undefined;
        starred?: boolean | undefined;
        virtual?: boolean | undefined;
        units?: string | null | undefined;
        in_stock?: number | undefined;
        on_order?: number | undefined;
        building?: number | undefined;
        minimum_stock?: number | null | undefined;
        total_in_stock?: number | undefined;
        unallocated_stock?: number | undefined;
        allocated_to_build_orders?: number | undefined;
        allocated_to_sales_orders?: number | undefined;
        link?: string | null | undefined;
        notes?: string | null | undefined;
        parameters?: ParameterDetail[] | null | undefined;
        entity_id?: string | undefined;
        last_updated?: string | undefined;
        status_label?: string | undefined;
        status_value?: number | undefined;
    }) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        [x: string]: any;
        pk: number;
        name: string;
        description?: string | null | undefined;
        IPN?: string | null | undefined;
        variant_of?: number | null | undefined;
        keywords?: string | null | undefined;
        category?: number | null | undefined;
        category_name?: string | null | undefined;
        category_pathstring?: string | null | undefined;
        thumbnail?: string | null | undefined;
        image?: string | null | undefined;
        active?: boolean | undefined;
        assembly?: boolean | undefined;
        component?: boolean | undefined;
        is_template?: boolean | undefined;
        purchaseable?: boolean | undefined;
        salable?: boolean | undefined;
        starred?: boolean | undefined;
        virtual?: boolean | undefined;
        units?: string | null | undefined;
        in_stock?: number | undefined;
        on_order?: number | undefined;
        building?: number | undefined;
        minimum_stock?: number | null | undefined;
        total_in_stock?: number | undefined;
        unallocated_stock?: number | undefined;
        allocated_to_build_orders?: number | undefined;
        allocated_to_sales_orders?: number | undefined;
        link?: string | null | undefined;
        notes?: string | null | undefined;
        parameters?: ParameterDetail[] | null | undefined;
        entity_id?: string | undefined;
        last_updated?: string | undefined;
        status_label?: string | undefined;
        status_value?: number | undefined;
    };
    dependencies: [((state: {
        components: import("./componentSlice").ComponentState;
        conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
        config: import("./configSlice").ConfigState;
        genericHaStates: import("./genericHaStateSlice").GenericHaStates;
        parameters: import("./parametersSlice").ParametersState;
        parts: PartsState;
        ui: import("./uiSlice").UiState;
        visualEffects: import("./visualEffectsSlice").VisualEffectsState;
        websocket: import("./websocketSlice").WebSocketState;
        actions: import("./actionsSlice").ActionsState;
        logging: import("./loggingSlice").LoggingState;
        inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
            getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
                pk: number;
                cardInstanceId: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", InventreeItem, "inventreeApi", unknown>;
            getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
                cardInstanceId: string;
                template_detail?: boolean;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail[], "inventreeApi", unknown>;
            updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                parameterId: number;
                data: any;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", ParameterDetail, "inventreeApi", unknown>;
            getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
                partId: number;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem[], "inventreeApi", unknown>;
            addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
                partId: number;
                quantity: number;
                locationId?: number;
                notes?: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", import("../../types").StockItem, "inventreeApi", unknown>;
            removeStockItems: import("@reduxjs/toolkit/query").MutationDefinition<{
                items: Array<{
                    pk: number;
                    quantity: number;
                }>;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", any, "inventreeApi", unknown>;
            searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
                searchText: string;
            }, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("@reduxjs/toolkit/query").FetchArgs, unknown, import("@reduxjs/toolkit/query").FetchBaseQueryError>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", {
                pk: number;
                name: string;
                thumbnail?: string;
            }[], "inventreeApi", unknown>;
        }, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location" | "PartParameters", "inventreeApi">;
        loggingApi: import("@reduxjs/toolkit/query").CombinedState<{
            getLogs: import("@reduxjs/toolkit/query").QueryDefinition<import("../apis/loggingApi").LogQueryArgs, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", import("../../types").LogEntry[], "loggingApi", unknown>;
            addLogEntry: import("@reduxjs/toolkit/query").MutationDefinition<Omit<import("../../types").LogEntry, "id" | "timestamp">, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
            clearLogs: import("@reduxjs/toolkit/query").MutationDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<any, unknown, unknown, {}, {}>, "LogEntry", null, "loggingApi", unknown>;
        }, "LogEntry", "loggingApi">;
    }, cardInstanceId: string) => InstancePartsState) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, InstancePartsState>, resultFuncArgs_1: string) => InstancePartsState) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InstancePartsState;
        dependencies: [(state: RootState) => Record<string, InstancePartsState>, (_state: RootState, cardInstanceId: string) => string];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        memoize: typeof import("reselect").weakMapMemoize;
        argsMemoize: typeof import("reselect").weakMapMemoize;
    }, (_state: RootState, _cardInstanceId: string, partId: number) => number];
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
export { partsSlice };
