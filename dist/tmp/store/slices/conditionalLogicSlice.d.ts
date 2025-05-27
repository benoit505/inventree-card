import { ConditionRuleDefinition, ProcessedCondition } from '../../types';
import { RootState } from '../index';
export interface ConditionalLogicState {
    rawRuleDefinitions: ConditionRuleDefinition[];
    processedConditions: ProcessedCondition[];
}
export declare const setRawRuleDefinitions: any, setProcessedConditions: any, clearAllConditions: any;
export declare const selectRawRuleDefinitions: (state: RootState) => ConditionRuleDefinition[];
export declare const selectProcessedConditions: (state: RootState) => ProcessedCondition[];
declare const _default: any;
export default _default;
