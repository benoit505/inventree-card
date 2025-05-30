import { RootState } from '../index';
import { ProcessedCondition, ConditionRuleDefinition } from '../../types';
export interface ConditionalLogicState {
    rawRuleDefinitions: ConditionRuleDefinition[];
    processedConditions: ProcessedCondition[];
}
export declare const setRawRuleDefinitions: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConditionRuleDefinition[], "conditionalLogic/setRawRuleDefinitions">, setProcessedConditions: import("@reduxjs/toolkit").ActionCreatorWithPayload<ProcessedCondition[], "conditionalLogic/setProcessedConditions">, clearAllConditions: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"conditionalLogic/clearAllConditions">;
export declare const selectRawRuleDefinitions: (state: RootState) => ConditionRuleDefinition[];
export declare const selectProcessedConditions: (state: RootState) => ProcessedCondition[];
declare const _default: import("redux").Reducer<ConditionalLogicState>;
export default _default;
