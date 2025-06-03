import { RootState, AppDispatch } from '../index';
import { ConditionalLogicItem } from '../../types';
export declare const evaluateAndApplyEffectsThunk: import("@reduxjs/toolkit").AsyncThunk<void, {
    cardInstanceId?: string;
    forceReevaluation?: boolean;
    logicItems?: ConditionalLogicItem[];
}, {
    state: RootState;
    dispatch: AppDispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const initializeRuleDefinitionsThunk: import("@reduxjs/toolkit").AsyncThunk<void, ConditionalLogicItem[], {
    dispatch: AppDispatch;
    state: RootState;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
