import { ConditionalLogicItem, ProcessedCondition } from '../../types';
import { RootState } from '../index';
export interface ConditionalLogicState {
    definedLogicItems: ConditionalLogicItem[];
    processedConditions: ProcessedCondition[];
}
export declare const setDefinedLogicItems: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConditionalLogicItem[], "conditionalLogic/setDefinedLogicItems">, setProcessedConditions: import("@reduxjs/toolkit").ActionCreatorWithPayload<ProcessedCondition[], "conditionalLogic/setProcessedConditions">, clearAllConditions: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"conditionalLogic/clearAllConditions">;
export declare const selectDefinedLogicItems: (state: RootState) => ConditionalLogicItem[];
export declare const selectProcessedConditions: (state: RootState) => ProcessedCondition[];
declare const _default: import("redux").Reducer<ConditionalLogicState>;
export default _default;
