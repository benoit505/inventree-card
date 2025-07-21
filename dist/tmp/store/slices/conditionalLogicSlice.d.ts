import { ConditionalLogicItem } from '../../types';
import { RootState } from '../index';
export interface ConditionalLogicState {
    definedLogicsByInstance: Record<string, ConditionalLogicItem[]>;
}
export declare const setDefinedLogicItems: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    logics: ConditionalLogicItem[];
    cardInstanceId: string;
}, "conditionalLogic/setDefinedLogicItems">, removeDefinedLogicItemsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "conditionalLogic/removeDefinedLogicItemsForCard">, clearAllConditions: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"conditionalLogic/clearAllConditions">;
export declare const selectDefinedLogicItems: (state: RootState, cardInstanceId: string) => ConditionalLogicItem[];
declare const _default: import("redux").Reducer<ConditionalLogicState>;
export default _default;
