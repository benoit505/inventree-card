import { ParameterCondition, ParameterDetail, ParameterOperator, ParameterActionType } from '../../types';
import { RootState } from '../index';
export interface ProcessedCondition {
    id: string;
    rawConditionString: string;
    sourceParameterString: string;
    partId: number;
    parameterName: string;
    operator: ParameterOperator;
    valueToCompare: any;
    action: ParameterActionType;
    actionValue: string;
    targetPartIds?: number[] | string;
}
export interface ConditionalPartEffect {
    isVisible?: boolean;
    highlight?: string;
    textColor?: string;
    border?: string;
    icon?: string;
    badge?: string;
}
export declare const setConditions: any, setDefinedConditions: any, setProcessedConditions: any, setConditionalPartEffectsBatch: any, clearConditionalPartEffects: any, setActions: any, setConfig: any, setStrictWebSocketMode: any, clearConditionCache: any, clearCache: any, checkCondition: any, updateValue: any, webSocketUpdateReceived: any, markChanged: any, addParametersForPart: any, updateParameterForPart: any;
export declare const selectConditions: (state: RootState, entityId: string) => any;
export declare const selectActions: (state: RootState, entityId: string) => any;
export declare const selectParameterLoadingStatus: (state: RootState, partId: number) => "idle" | "loading" | "succeeded" | "failed";
export declare const selectPartParameterError: (state: RootState, partId: number) => string | null;
export declare const selectParametersLoadingStatus: (state: RootState, partIds: number[]) => Record<number, "idle" | "loading" | "succeeded" | "failed">;
export declare const selectStrictWebSocketMode: (state: RootState) => any;
export declare const selectParameterConfig: (state: RootState) => any;
export declare const selectRecentlyChangedParameters: (state: RootState) => any;
export declare const selectParametersForPart: (state: RootState, partId: number) => ParameterDetail[] | undefined;
export declare const selectParameterValue: (state: RootState, partId: number, paramName: string) => string | null;
export declare const selectDefinedConditions: (state: RootState) => ParameterCondition[];
export declare const selectProcessedConditions: (state: RootState) => ProcessedCondition[];
export declare const selectConditionalPartEffects: (state: RootState) => Record<number, ConditionalPartEffect>;
export declare const selectConditionalEffectForPart: (state: RootState, partId: number) => ConditionalPartEffect | undefined;
declare const _default: any;
export default _default;
