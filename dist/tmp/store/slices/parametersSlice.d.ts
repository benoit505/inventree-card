import { PayloadAction } from '@reduxjs/toolkit';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterCondition } from '../../types';
import { RootState } from '../index';
export interface ParametersState {
    parameterValues: Record<number, Record<string, ParameterDetail>>;
    parameterLoadingStatus: Record<number, 'idle' | 'loading' | 'succeeded' | 'failed'>;
    parameterError: Record<number, string | null>;
    config: InventreeCardConfig | null;
    strictWebSocketMode: boolean;
    recentlyChanged: string[];
    cache: {
        conditionResults: Record<string, boolean>;
        lastCleared: number;
    };
    parametersByPartId: Record<number, ParameterDetail[]>;
}
declare const parametersSlice: import("@reduxjs/toolkit").Slice<ParametersState, {
    setConfig(state: ParametersState, action: PayloadAction<InventreeCardConfig>): void;
    setStrictWebSocketMode(state: ParametersState, action: PayloadAction<boolean>): void;
    clearConditionCache(state: ParametersState): void;
    clearCache(state: ParametersState): void;
    checkCondition(state: ParametersState, action: PayloadAction<{
        part: InventreeItem;
        condition: ParameterCondition;
    }>): void;
    updateValue(state: ParametersState, action: PayloadAction<{
        partId: number;
        paramName: string;
        value: string;
        source?: string;
    }>): void;
    webSocketUpdateReceived(state: ParametersState, action: PayloadAction<{
        partId: number;
        parameterName: string;
        value: any;
        source?: string;
    }>): void;
    markChanged(state: ParametersState, action: PayloadAction<{
        parameterId: string;
    }>): void;
    addParametersForPart(state: ParametersState, action: PayloadAction<{
        partId: number;
        parameters: ParameterDetail[];
    }>): void;
    updateParameterForPart(state: ParametersState, action: PayloadAction<{
        partId: number;
        parameterName: string;
        value: any;
    }>): void;
}, "parameters", "parameters", import("@reduxjs/toolkit").SliceSelectors<ParametersState>>;
export declare const setConfig: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeCardConfig, "parameters/setConfig">, setStrictWebSocketMode: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "parameters/setStrictWebSocketMode">, clearConditionCache: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"parameters/clearConditionCache">, clearCache: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"parameters/clearCache">, checkCondition: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    part: InventreeItem;
    condition: ParameterCondition;
}, "parameters/checkCondition">, updateValue: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    paramName: string;
    value: string;
    source?: string;
}, "parameters/updateValue">, webSocketUpdateReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameterName: string;
    value: any;
    source?: string;
}, "parameters/webSocketUpdateReceived">, markChanged: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    parameterId: string;
}, "parameters/markChanged">, addParametersForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameters: ParameterDetail[];
}, "parameters/addParametersForPart">, updateParameterForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameterName: string;
    value: any;
}, "parameters/updateParameterForPart">;
export declare const selectParameterLoadingStatus: (state: RootState, partId: number) => "idle" | "loading" | "succeeded" | "failed";
export declare const selectPartParameterError: (state: RootState, partId: number) => string | null;
export declare const selectParametersLoadingStatus: (state: RootState, partIds: number[]) => Record<number, "idle" | "loading" | "succeeded" | "failed">;
export declare const selectStrictWebSocketMode: (state: RootState) => boolean;
export declare const selectParameterConfig: (state: RootState) => InventreeCardConfig | null;
export declare const selectRecentlyChangedParameters: (state: RootState) => string[];
export declare const selectParametersForPart: (state: RootState, partId: number) => ParameterDetail[] | undefined;
export declare const selectParameterValue: (state: RootState, partId: number, paramName: string) => string | null;
declare const _default: import("redux").Reducer<ParametersState>;
export default _default;
export { parametersSlice };
