import { RootState } from '../index';
import { InventreeItem, ProcessedVariant } from '../../types';
export declare const selectProcessedVariants: ((state: any) => ProcessedVariant[]) & {
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
export declare const selectVariantGroups: ((state: any) => {
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
    dependencies: [((state: any) => InventreeItem[]) & {
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
