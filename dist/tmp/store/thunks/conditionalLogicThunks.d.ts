import { RootState } from '../index';
import { ConditionalLogicItem } from '../../types';
export declare const initializeRuleDefinitionsThunk: import("@reduxjs/toolkit").AsyncThunk<void, ConditionalLogicItem[], {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const evaluateAndApplyEffectsThunk: import("@reduxjs/toolkit").AsyncThunk<void, void, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
