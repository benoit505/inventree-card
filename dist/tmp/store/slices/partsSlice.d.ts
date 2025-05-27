import { InventreeItem } from '../../types';
import { RootState } from '../index';
export declare const fetchPartDetails: any;
export declare const locatePartById: any;
export declare const adjustPartStock: any;
export declare const setParts: any, addParts: any, updatePart: any, updatePartStock: any, clearParts: any, registerEntity: any, partStockUpdateFromWebSocket: any, setLocatingPartId: any;
declare const _default: any;
export default _default;
export declare const selectPartsByEntityMapping: (state: RootState) => Record<string, number[]>;
export declare const selectPartsById: (state: RootState) => Record<number, InventreeItem>;
export declare const selectAllPartIds: ((state: any) => number[]) & {
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
export declare const selectAllParts: ((state: any) => InventreeItem[]) & {
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
export declare const selectPartsForEntities: ((state: any, entityIds: string[]) => InventreeItem[]) & {
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
export declare const selectPartsByEntityId: ((state: any, entityId: string) => InventreeItem[]) & {
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
export declare const selectPartById: ((state: any, partId: number | null | undefined) => any) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: number | null | undefined) => any;
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: number | null | undefined) => any) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => any;
    dependencies: [(state: RootState) => any, (_: RootState, partId: number | null | undefined) => number | null | undefined];
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
export declare const selectFilteredParts: ((state: any) => InventreeItem[]) & {
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
export declare const selectPartsByEntity: ((state: any, entityId: string | null | undefined) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: any, resultFuncArgs_2: string | null | undefined) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: any, resultFuncArgs_2: string | null | undefined) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => any, (state: RootState) => any, (_: RootState, entityId: string | null | undefined) => string | null | undefined];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectCombinedParts: ((state: any, primaryEntityId: string | null | undefined, additionalEntityIds?: string[] | undefined) => InventreeItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any, resultFuncArgs_1: any, resultFuncArgs_2: {
        primaryEntityId: string | null | undefined;
        additionalEntityIds: string[];
    }) => InventreeItem[];
    memoizedResultFunc: ((resultFuncArgs_0: any, resultFuncArgs_1: any, resultFuncArgs_2: {
        primaryEntityId: string | null | undefined;
        additionalEntityIds: string[];
    }) => InventreeItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeItem[];
    dependencies: [(state: RootState) => any, (state: RootState) => any, (_: RootState, primaryEntityId: string | null | undefined, additionalEntityIds?: string[]) => {
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
export declare const selectPartsByPks: ((state: any, pks: number[]) => InventreeItem[]) & {
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
