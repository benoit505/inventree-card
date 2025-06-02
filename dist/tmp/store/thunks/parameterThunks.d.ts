import { RootState } from '../index';
import { ParameterDetail, InventreeParameterFetchConfig } from '../../types';
export declare const fetchParametersForReferencedParts: import("@reduxjs/toolkit").AsyncThunk<void, number[], {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateParameterValue: import("@reduxjs/toolkit").AsyncThunk<ParameterDetail, {
    partId: number;
    paramName: string;
    value: string;
}, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchConfiguredParameters: import("@reduxjs/toolkit").AsyncThunk<void, InventreeParameterFetchConfig[], {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
