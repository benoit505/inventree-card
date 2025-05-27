import { RootState } from './../index';
import { ParameterDetail, VisualModifiers, ParameterConfig, InventreeCardConfig } from '../../types';
export declare const compareValues: (actualValue: any, expectedValue: any, operator: string) => boolean;
export declare const selectParameterConfig: (state: RootState) => ParameterConfig | undefined;
type LoadingStatusSnapshot = Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
type ParameterValuesSnapshot = Record<number, Record<string, ParameterDetail>>;
/**
 * Export this helper function to resolve a parameter value, potentially from another part.
 */
export declare const resolveParameterValue: (currentPartId: number, parameterIdentifier: string, loadingStatusSnapshot: LoadingStatusSnapshot, // Add snapshot parameter
parameterValuesSnapshot: ParameterValuesSnapshot | undefined) => string | number | boolean | undefined;
export declare const selectParametersForPart: ((state: any, partId: number) => ParameterDetail[] | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: number) => ParameterDetail[] | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: number) => ParameterDetail[] | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => ParameterDetail[] | undefined;
    dependencies: [(state: RootState) => any, (_: RootState, partId: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
/**
 * Selector to compute visual modifiers based on parameter conditions.
 */
export declare const selectVisualModifiers: ((state: any, partId: number) => VisualModifiers) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: ParameterConfig | undefined, resultFuncArgs_1: any, resultFuncArgs_2: number) => VisualModifiers;
    memoizedResultFunc: ((resultFuncArgs_0: ParameterConfig | undefined, resultFuncArgs_1: any, resultFuncArgs_2: number) => VisualModifiers) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => VisualModifiers;
    dependencies: [(state: RootState) => ParameterConfig | undefined, (state: RootState) => any, (_: RootState, partId: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectParameterLoadingStatus: (state: RootState, partId: number) => "idle" | "loading" | "succeeded" | "failed";
/**
 * Selects the visual modifiers (highlight, color, etc.) for a specific part
 * based on evaluated parameter conditions.
 */
export declare const selectAnyParameterLoading: (state: RootState) => boolean;
export {};
/**
 * Selector to get the loading status for a specific part's parameters.
 */
export declare const selectParametersLoadingStatusForPart: ((state: any, partId: number) => "loading" | "idle" | "succeeded" | "failed" | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: number) => "loading" | "idle" | "succeeded" | "failed" | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: number) => "loading" | "idle" | "succeeded" | "failed" | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => "loading" | "idle" | "succeeded" | "failed" | undefined;
    dependencies: [(state: RootState) => any, (_: RootState, partId: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
/**
 * Selector to get the error message for a specific part's parameter fetch, if any.
 */
export declare const selectParametersErrorForPart: ((state: any, partId: number) => string | null | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: number) => string | null | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: number) => string | null | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | null | undefined;
    dependencies: [(state: RootState) => any, (_: RootState, partId: number) => number];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectParameterValue: ((state: any, _partId: number, parameterName: string) => string | undefined) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: ParameterDetail[] | undefined, resultFuncArgs_1: string) => string | undefined;
    memoizedResultFunc: ((resultFuncArgs_0: ParameterDetail[] | undefined, resultFuncArgs_1: string) => string | undefined) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => string | undefined;
    dependencies: [(state: RootState, partId: number) => ParameterDetail[] | undefined, (_: RootState, _partId: number, parameterName: string) => string];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const checkPartVisibility: (partId: number, parameterConfig: InventreeCardConfig["parameters"] | undefined, loadingStatus: Record<number, "idle" | "loading" | "succeeded" | "failed">, parameterValues: Record<number, Record<string, ParameterDetail>> | undefined) => boolean;
