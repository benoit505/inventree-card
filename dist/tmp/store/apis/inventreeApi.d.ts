import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { InventreeItem, ParameterDetail, StockItem } from '../../types';
export declare const inventreeApi: import("@reduxjs/toolkit/query").Api<BaseQueryFn, {
    getPart: import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>;
    getPartParameters: import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>;
    updatePartParameter: import("@reduxjs/toolkit/query").MutationDefinition<{
        partId: number;
        parameterPk: number;
        value: any;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>;
    getStockItems: import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>;
    addStockItem: import("@reduxjs/toolkit/query").MutationDefinition<{
        partId: number;
        quantity: number;
        locationId?: number;
        notes?: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem, "inventreeApi", unknown>;
    searchParts: import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>;
}, "inventreeApi", "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", typeof import("@reduxjs/toolkit/query").coreModuleName | typeof import("@reduxjs/toolkit/query/react").reactHooksModuleName>;
export declare const useGetPartQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: InventreeItem | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    pk: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
    currentData?: InventreeItem | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    pk: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
    currentData?: InventreeItem | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    pk: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
    currentData?: InventreeItem | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    pk: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
    currentData?: InventreeItem | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    pk: number;
    cardInstanceId: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: InventreeItem | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
        currentData?: InventreeItem | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
        currentData?: InventreeItem | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
        currentData?: InventreeItem | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>> & {
        currentData?: InventreeItem | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        pk: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", InventreeItem, "inventreeApi", unknown>>;
}, useGetPartParametersQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: ParameterDetail[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
    currentData?: ParameterDetail[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
    currentData?: ParameterDetail[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
    currentData?: ParameterDetail[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
    currentData?: ParameterDetail[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    partId: number;
    cardInstanceId: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: ParameterDetail[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
        currentData?: ParameterDetail[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
        currentData?: ParameterDetail[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
        currentData?: ParameterDetail[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>> & {
        currentData?: ParameterDetail[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail[], "inventreeApi", unknown>>;
}, useUpdatePartParameterMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: ParameterDetail | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: ParameterDetail | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: ParameterDetail | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: ParameterDetail | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: ParameterDetail | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: ParameterDetail | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: ParameterDetail | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: ParameterDetail | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: ParameterDetail | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: ParameterDetail | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    partId: number;
    parameterPk: number;
    value: any;
    cardInstanceId: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    partId: number;
    parameterPk: number;
    value: any;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", ParameterDetail, "inventreeApi", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        partId: number;
        parameterPk: number;
        value: any;
        cardInstanceId: string;
    } | undefined;
    reset: () => void;
}], useGetStockItemsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: StockItem[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
    currentData?: StockItem[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
    currentData?: StockItem[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
    currentData?: StockItem[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    partId: number;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
    currentData?: StockItem[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    partId: number;
    cardInstanceId: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: StockItem[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
        currentData?: StockItem[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
        currentData?: StockItem[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
        currentData?: StockItem[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>> & {
        currentData?: StockItem[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        partId: number;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem[], "inventreeApi", unknown>>;
}, useAddStockItemMutation: <R extends Record<string, any> = ({
    requestId?: undefined;
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    data?: undefined;
    error?: undefined;
    endpointName?: string;
    startedTimeStamp?: undefined;
    fulfilledTimeStamp?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    isUninitialized: true;
    isLoading: false;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
} & Omit<{
    requestId: string;
    data?: StockItem | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp"> & Required<Pick<{
    requestId: string;
    data?: StockItem | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "data" | "fulfilledTimeStamp">> & {
    error: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    isUninitialized: false;
    isLoading: false;
    isSuccess: true;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
} & {
    requestId: string;
    data?: StockItem | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
} & {
    data?: undefined;
} & {
    status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    isUninitialized: false;
    isLoading: true;
    isSuccess: false;
    isError: false;
}) | ({
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
} & Omit<{
    requestId: string;
    data?: StockItem | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error"> & Required<Pick<{
    requestId: string;
    data?: StockItem | undefined;
    error?: unknown;
    endpointName: string;
    startedTimeStamp: number;
    fulfilledTimeStamp?: number;
}, "error">> & {
    status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    isUninitialized: false;
    isLoading: false;
    isSuccess: false;
    isError: true;
})>(options?: {
    selectFromResult?: ((state: ({
        requestId?: undefined;
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        data?: undefined;
        error?: undefined;
        endpointName?: string;
        startedTimeStamp?: undefined;
        fulfilledTimeStamp?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        isUninitialized: true;
        isLoading: false;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
    } & Omit<{
        requestId: string;
        data?: StockItem | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp"> & Required<Pick<{
        requestId: string;
        data?: StockItem | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "data" | "fulfilledTimeStamp">> & {
        error: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.fulfilled;
        isUninitialized: false;
        isLoading: false;
        isSuccess: true;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
    } & {
        requestId: string;
        data?: StockItem | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    } & {
        data?: undefined;
    } & {
        status: import("@reduxjs/toolkit/query").QueryStatus.pending;
        isUninitialized: false;
        isLoading: true;
        isSuccess: false;
        isError: false;
    }) | ({
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
    } & Omit<{
        requestId: string;
        data?: StockItem | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error"> & Required<Pick<{
        requestId: string;
        data?: StockItem | undefined;
        error?: unknown;
        endpointName: string;
        startedTimeStamp: number;
        fulfilledTimeStamp?: number;
    }, "error">> & {
        status: import("@reduxjs/toolkit/query").QueryStatus.rejected;
        isUninitialized: false;
        isLoading: false;
        isSuccess: false;
        isError: true;
    })) => R) | undefined;
    fixedCacheKey?: string;
} | undefined) => readonly [(arg: {
    partId: number;
    quantity: number;
    locationId?: number;
    notes?: string;
    cardInstanceId: string;
}) => import("@reduxjs/toolkit/query").MutationActionCreatorResult<import("@reduxjs/toolkit/query").MutationDefinition<{
    partId: number;
    quantity: number;
    locationId?: number;
    notes?: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", StockItem, "inventreeApi", unknown>>, import("@reduxjs/toolkit/query").TSHelpersNoInfer<R> & {
    originalArgs?: {
        partId: number;
        quantity: number;
        locationId?: number;
        notes?: string;
        cardInstanceId: string;
    } | undefined;
    reset: () => void;
}], useSearchPartsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(arg: {
    searchText: string;
    cardInstanceId: string;
} | typeof import("@reduxjs/toolkit/query").skipToken, options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
} & {
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}) | undefined) => [R][R extends any ? 0 : never] & {
    refetch: () => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>>;
}, useLazySearchPartsQuery: <R extends Record<string, any> = import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
    status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
    originalArgs?: undefined | undefined;
    data?: undefined | undefined;
    error?: undefined | undefined;
    requestId?: undefined | undefined;
    endpointName?: string | undefined;
    startedTimeStamp?: undefined | undefined;
    fulfilledTimeStamp?: undefined | undefined;
} & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "isUninitialized"> & {
    isUninitialized: true;
}) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, {
    isLoading: true;
    isFetching: boolean;
    data: undefined;
} | ({
    isSuccess: true;
    isFetching: true;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp">>) | ({
    isSuccess: true;
    isFetching: false;
    error: undefined;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
    isError: true;
} & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>> & {
    currentData?: {
        pk: number;
        name: string;
        thumbnail?: string;
    }[] | undefined;
    isUninitialized: false;
    isLoading: false;
    isFetching: false;
    isSuccess: false;
    isError: false;
}, "error">>)>> & {
    status: import("@reduxjs/toolkit/query").QueryStatus;
}>(options?: (import("@reduxjs/toolkit/query").SubscriptionOptions & Omit<{
    skip?: boolean;
    selectFromResult?: ((state: import("@reduxjs/toolkit/query").TSHelpersId<(Omit<{
        status: import("@reduxjs/toolkit/query").QueryStatus.uninitialized;
        originalArgs?: undefined | undefined;
        data?: undefined | undefined;
        error?: undefined | undefined;
        requestId?: undefined | undefined;
        endpointName?: string | undefined;
        startedTimeStamp?: undefined | undefined;
        fulfilledTimeStamp?: undefined | undefined;
    } & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "isUninitialized"> & {
        isUninitialized: true;
    }) | import("@reduxjs/toolkit/query").TSHelpersOverride<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, {
        isLoading: true;
        isFetching: boolean;
        data: undefined;
    } | ({
        isSuccess: true;
        isFetching: true;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp">>) | ({
        isSuccess: true;
        isFetching: false;
        error: undefined;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "data" | "fulfilledTimeStamp" | "currentData">>) | ({
        isError: true;
    } & Required<Pick<import("@reduxjs/toolkit/query").QuerySubState<import("@reduxjs/toolkit/query").QueryDefinition<{
        searchText: string;
        cardInstanceId: string;
    }, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
        pk: number;
        name: string;
        thumbnail?: string;
    }[], "inventreeApi", unknown>> & {
        currentData?: {
            pk: number;
            name: string;
            thumbnail?: string;
        }[] | undefined;
        isUninitialized: false;
        isLoading: false;
        isFetching: false;
        isSuccess: false;
        isError: false;
    }, "error">>)>> & {
        status: import("@reduxjs/toolkit/query").QueryStatus;
    }) => R) | undefined;
}, "skip">) | undefined) => [(arg: {
    searchText: string;
    cardInstanceId: string;
}, preferCacheValue?: boolean) => import("@reduxjs/toolkit/query").QueryActionCreatorResult<import("@reduxjs/toolkit/query").QueryDefinition<{
    searchText: string;
    cardInstanceId: string;
}, BaseQueryFn, "Part" | "PartParameter" | "StockItem" | "SearchResult" | "Category" | "Location", {
    pk: number;
    name: string;
    thumbnail?: string;
}[], "inventreeApi", unknown>>, [R][R extends any ? 0 : never] & {
    reset: () => void;
}, {
    lastArg: {
        searchText: string;
        cardInstanceId: string;
    };
}];
