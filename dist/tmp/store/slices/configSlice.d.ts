import { InventreeCardConfig, DisplayConfig, ConditionalLogicItem, ActionDefinition } from '../../types';
export interface InstanceConfigState {
    config: InventreeCardConfig;
    cardInstanceId: string;
    configInitialized: boolean;
    _configLastUpdated: number;
}
export interface ConfigState {
    configsByInstance: Record<string, {
        config: InventreeCardConfig;
        configInitialized: boolean;
    }>;
}
export declare const setConfigAction: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    config: InventreeCardConfig;
}, "config/setConfigAction">, removeConfigAction: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "config/removeConfigAction">;
export declare const selectConfigByInstanceId: ((state: any, cardInstanceId: string) => InventreeCardConfig) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: Record<string, {
        config: InventreeCardConfig;
        configInitialized: boolean;
    }>, resultFuncArgs_1: string) => InventreeCardConfig;
    memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
        config: InventreeCardConfig;
        configInitialized: boolean;
    }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => InventreeCardConfig;
    dependencies: [(state: {
        config: ConfigState;
    }) => Record<string, {
        config: InventreeCardConfig;
        configInitialized: boolean;
    }>, (state: any, cardInstanceId: string) => string];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectActions: ((state: any, cardInstanceId: string) => ActionDefinition[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig) => ActionDefinition[];
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig) => ActionDefinition[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => ActionDefinition[];
    dependencies: [((state: any, cardInstanceId: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeCardConfig;
        dependencies: [(state: {
            config: ConfigState;
        }) => Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, (state: any, cardInstanceId: string) => string];
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
export declare const selectConditionalLogic: ((state: any, cardInstanceId: string) => ConditionalLogicItem[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig) => ConditionalLogicItem[];
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig) => ConditionalLogicItem[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => ConditionalLogicItem[];
    dependencies: [((state: any, cardInstanceId: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeCardConfig;
        dependencies: [(state: {
            config: ConfigState;
        }) => Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, (state: any, cardInstanceId: string) => string];
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
export declare const selectDisplayConfig: ((state: any, cardInstanceId: string) => DisplayConfig) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig) => DisplayConfig;
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig) => DisplayConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => DisplayConfig;
    dependencies: [((state: any, cardInstanceId: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeCardConfig;
        dependencies: [(state: {
            config: ConfigState;
        }) => Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, (state: any, cardInstanceId: string) => string];
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
export declare const selectDirectApiEnabled: ((state: any, cardInstanceId: string) => boolean) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig) => boolean;
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig) => boolean) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => boolean;
    dependencies: [((state: any, cardInstanceId: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeCardConfig;
        dependencies: [(state: {
            config: ConfigState;
        }) => Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, (state: any, cardInstanceId: string) => string];
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
export declare const selectLayoutOptions: ((state: any, cardInstanceId: string) => any) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: InventreeCardConfig) => any;
    memoizedResultFunc: ((resultFuncArgs_0: InventreeCardConfig) => any) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => any;
    dependencies: [((state: any, cardInstanceId: string) => InventreeCardConfig) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig;
        memoizedResultFunc: ((resultFuncArgs_0: Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, resultFuncArgs_1: string) => InventreeCardConfig) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => InventreeCardConfig;
        dependencies: [(state: {
            config: ConfigState;
        }) => Record<string, {
            config: InventreeCardConfig;
            configInitialized: boolean;
        }>, (state: any, cardInstanceId: string) => string];
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
declare const _default: import("redux").Reducer<ConfigState>;
export default _default;
