import { PayloadAction } from '@reduxjs/toolkit';
import { InventreeCardConfig } from '../../types';
import { RootState } from '../index';
export interface ParametersState {
    config: InventreeCardConfig | null;
    recentlyChanged: string[];
    cache: {
        lastCleared: number;
    };
}
declare const parametersSlice: import("@reduxjs/toolkit").Slice<ParametersState, {
    setConfig(state: ParametersState, action: PayloadAction<InventreeCardConfig>): void;
    clearCache(state: ParametersState): void;
    webSocketUpdateReceived(state: ParametersState, action: PayloadAction<{
        partId: number;
        parameterName: string;
        value: any;
        source?: string;
    }>): void;
    markChanged(state: ParametersState, action: PayloadAction<{
        parameterId: string;
    }>): void;
}, "parameters", "parameters", import("@reduxjs/toolkit").SliceSelectors<ParametersState>>;
export declare const setConfig: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeCardConfig, "parameters/setConfig">, clearCache: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"parameters/clearCache">, webSocketUpdateReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    parameterName: string;
    value: any;
    source?: string;
}, "parameters/webSocketUpdateReceived">, markChanged: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    parameterId: string;
}, "parameters/markChanged">;
export declare const selectParameterLoadingStatus: (state: RootState, partId: number) => string;
export declare const selectPartParameterError: (state: RootState, partId: number) => null;
export declare const selectParametersLoadingStatus: (state: RootState, partIds: number[]) => {};
export declare const selectParameterValue: (state: RootState, partId: number, paramName: string) => null;
export declare const selectParameterConfig: (state: RootState) => InventreeCardConfig | null;
export declare const selectRecentlyChangedParameters: (state: RootState) => string[];
declare const _default: import("redux").Reducer<ParametersState>;
export default _default;
export { parametersSlice };
