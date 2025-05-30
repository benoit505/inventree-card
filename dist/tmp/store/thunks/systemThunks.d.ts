import { Logger } from '../../utils/logger';
import { DirectApiConfig } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
export declare const initializeDirectApi: import("@reduxjs/toolkit").AsyncThunk<boolean, {
    directApiConfig: DirectApiConfig;
    logger: Logger;
}, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const initializeWebSocketPlugin: import("@reduxjs/toolkit").AsyncThunk<void, {
    directApiConfig?: DirectApiConfig;
    cardDebugWebSocket?: boolean;
    logger: Logger;
}, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
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
    logger: Logger;
}, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const initializeGenericHaStatesFromConfig: import("@reduxjs/toolkit").AsyncThunk<void, {
    hass: HomeAssistant;
    logger: Logger;
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
