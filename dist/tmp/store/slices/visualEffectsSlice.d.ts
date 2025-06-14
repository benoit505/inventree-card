import { RootState } from '../index';
import { VisualModifiers, DisplayConfigKey } from '../../types';
export interface VisualEffect extends VisualModifiers {
    opacity?: number;
    customClasses?: string[];
    animation?: {
        variants?: object;
        initial?: string | boolean;
        animate?: object;
        transition?: object;
        whileHover?: object;
        whileTap?: object;
    };
}
export interface VisualEffectsState {
    effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
    elementVisibilityByCard: Record<string, Partial<Record<DisplayConfigKey, boolean>>>;
}
export declare const setVisualEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
    effect: Partial<VisualEffect>;
}, "visualEffects/setVisualEffect">, setVisualEffectsBatchForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    effects: Record<number, VisualEffect>;
}, "visualEffects/setVisualEffectsBatchForCard">, clearVisualEffectForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
}, "visualEffects/clearVisualEffectForPart">, clearAllVisualEffectsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearAllVisualEffectsForCard">, clearEffectsForAllCardInstances: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearEffectsForAllCardInstances">, setConditionalPartEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
    effect: VisualEffect;
}, "visualEffects/setConditionalPartEffect">, setConditionalPartEffectsBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    effectsMap: Record<number, VisualEffect>;
}, "visualEffects/setConditionalPartEffectsBatch">, clearConditionalPartEffectsForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
}, "visualEffects/clearConditionalPartEffectsForPart">, clearAllConditionalPartEffects: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearAllConditionalPartEffects">, clearConditionalPartEffectsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearConditionalPartEffectsForCard">, setElementVisibility: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    displayKey: DisplayConfigKey;
    isVisible: boolean;
}, "visualEffects/setElementVisibility">, setElementVisibilitiesBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    visibilities: Partial<Record<DisplayConfigKey, boolean>>;
}, "visualEffects/setElementVisibilitiesBatch">, clearElementVisibilitiesForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearElementVisibilitiesForCard">, clearAllElementVisibilities: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearAllElementVisibilities">;
export declare const selectVisualEffectForPart: ((state: {
    api: import("./apiSlice").ApiState;
    components: import("./componentSlice").ComponentState;
    conditionalLogic: import("./conditionalLogicSlice").ConditionalLogicState;
    config: import("./configSlice").ConfigState;
    counter: import("./counterSlice").CounterState;
    genericHaStates: import("./genericHaStateSlice").GenericHaStates;
    metrics: import("./metricsSlice").MetricsState;
    parameters: import("./parametersSlice").ParametersState;
    parts: import("./partsSlice").PartsState;
    ui: import("./uiSlice").UiState;
    visualEffects: VisualEffectsState;
    websocket: import("./websocketSlice").WebSocketState;
    actions: import("./actionsSlice").ActionsState;
    inventreeApi: import("@reduxjs/toolkit/query").CombinedState<{
        getPart: import("@reduxjs/toolkit/query").QueryDefinition<number, import("@reduxjs/toolkit/query").BaseQueryFn<import("../apis/inventreeApi").AxiosBaseQueryArgs, unknown, {
            status?: number | "CUSTOM_ERROR";
            data?: any;
            message?: string;
        }>, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", import("../../types").InventreeItem, "inventreeApi", unknown>;
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
}, _cardInstanceId: string, partId: number) => {
    opacity?: number;
    customClasses?: string[];
    animation?: {
        variants?: object;
        initial?: string | boolean;
        animate?: object;
        transition?: object;
        whileHover?: object;
        whileTap?: object;
    };
    highlight?: string;
    textColor?: string;
    border?: string;
    icon?: string;
    badge?: string;
    sort?: "top" | "bottom";
    filter?: "show" | "hide";
    showSection?: "show" | "hide";
    priority?: "high" | "medium" | "low";
    isVisible?: boolean;
    thumbnailStyle?: {
        filter?: string;
        opacity?: number;
    };
} | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<string, Record<number, VisualEffect>>, resultFuncArgs_1: string, resultFuncArgs_2: number) => {
        opacity?: number;
        customClasses?: string[];
        animation?: {
            variants?: object;
            initial?: string | boolean;
            animate?: object;
            transition?: object;
            whileHover?: object;
            whileTap?: object;
        };
        highlight?: string;
        textColor?: string;
        border?: string;
        icon?: string;
        badge?: string;
        sort?: "top" | "bottom";
        filter?: "show" | "hide";
        showSection?: "show" | "hide";
        priority?: "high" | "medium" | "low";
        isVisible?: boolean;
        thumbnailStyle?: {
            filter?: string;
            opacity?: number;
        };
    } | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: Record<string, Record<number, VisualEffect>>, resultFuncArgs_1: string, resultFuncArgs_2: number) => {
        opacity?: number;
        customClasses?: string[];
        animation?: {
            variants?: object;
            initial?: string | boolean;
            animate?: object;
            transition?: object;
            whileHover?: object;
            whileTap?: object;
        };
        highlight?: string;
        textColor?: string;
        border?: string;
        icon?: string;
        badge?: string;
        sort?: "top" | "bottom";
        filter?: "show" | "hide";
        showSection?: "show" | "hide";
        priority?: "high" | "medium" | "low";
        isVisible?: boolean;
        thumbnailStyle?: {
            filter?: string;
            opacity?: number;
        };
    } | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => {
        opacity?: number;
        customClasses?: string[];
        animation?: {
            variants?: object;
            initial?: string | boolean;
            animate?: object;
            transition?: object;
            whileHover?: object;
            whileTap?: object;
        };
        highlight?: string;
        textColor?: string;
        border?: string;
        icon?: string;
        badge?: string;
        sort?: "top" | "bottom";
        filter?: "show" | "hide";
        showSection?: "show" | "hide";
        priority?: "high" | "medium" | "low";
        isVisible?: boolean;
        thumbnailStyle?: {
            filter?: string;
            opacity?: number;
        };
    } | undefined;
    dependencies: [(state: RootState) => Record<string, Record<number, VisualEffect>>, (_state: RootState, cardInstanceId: string) => string, (_state: RootState, _cardInstanceId: string, partId: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectAllVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
export declare const selectAllEffectsByCardInstance: (state: RootState) => Record<string, Record<number, VisualEffect>>;
export declare const selectVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
export declare const selectElementVisibility: (state: RootState, cardInstanceId: string, displayKey: DisplayConfigKey) => boolean | undefined;
export declare const selectAllElementVisibilitiesForCard: (state: RootState, cardInstanceId: string) => Partial<Record<DisplayConfigKey, boolean>> | undefined;
declare const _default: import("redux").Reducer<VisualEffectsState>;
export default _default;
