import { DirectApiConfig } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState, AppDispatch } from '../index';
export declare const initializeWebSocketPlugin: import("@reduxjs/toolkit").AsyncThunk<void, {
    directApiConfig?: DirectApiConfig;
    cardDebugWebSocket?: boolean;
    cardInstanceId: string;
}, {
    dispatch: AppDispatch;
    state: RootState;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const processHassEntities: import("@reduxjs/toolkit").AsyncThunk<{
    processedCount: number;
    errors: number;
}, {
    hass: HomeAssistant;
    entityIds: string[];
    cardInstanceId: string;
}, {
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: string;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const initializeGenericHaStatesFromConfig: import("@reduxjs/toolkit").AsyncThunk<void, {
    hass: HomeAssistant;
    cardInstanceId: string;
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
