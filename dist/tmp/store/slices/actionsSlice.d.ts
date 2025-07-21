import { PayloadAction } from '@reduxjs/toolkit';
import { ActionDefinition } from '../../types';
import { RootState } from '../index';
export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';
export interface ActionRuntimeState {
    status: ActionStatus;
    actionName?: string;
    error?: string;
    lastRun?: number;
}
export interface InstanceActionsState {
    actionDefinitions: Record<string, ActionDefinition>;
    actionRuntimeStates: Record<string, ActionRuntimeState>;
}
export interface ActionsState {
    byInstance: Record<string, InstanceActionsState>;
}
declare const actionsSlice: import("@reduxjs/toolkit").Slice<ActionsState, {
    setActionDefinitions(state: import("immer").WritableDraft<ActionsState>, action: PayloadAction<{
        definitions: ActionDefinition[];
        cardInstanceId: string;
    }>): void;
    updateActionRuntimeState(state: import("immer").WritableDraft<ActionsState>, action: PayloadAction<{
        cardInstanceId: string;
        actionId: string;
        runtimeState: Partial<ActionRuntimeState>;
    }>): void;
    clearActionRuntimeState(state: import("immer").WritableDraft<ActionsState>, action: PayloadAction<{
        cardInstanceId: string;
        actionId: string;
    }>): void;
    removeInstance(state: import("immer").WritableDraft<ActionsState>, action: PayloadAction<{
        cardInstanceId: string;
    }>): void;
}, "actions", "actions", import("@reduxjs/toolkit").SliceSelectors<ActionsState>>;
export declare const setActionDefinitions: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    definitions: ActionDefinition[];
    cardInstanceId: string;
}, "actions/setActionDefinitions">, updateActionRuntimeState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    actionId: string;
    runtimeState: Partial<ActionRuntimeState>;
}, "actions/updateActionRuntimeState">, clearActionRuntimeState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    actionId: string;
}, "actions/clearActionRuntimeState">, removeInstance: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "actions/removeInstance">;
export declare const selectActionDefinitionsForInstance: (state: RootState, cardInstanceId: string) => Record<string, ActionDefinition>;
export declare const selectAllActionDefinitionsForInstance: (state: RootState, cardInstanceId: string) => ActionDefinition[];
export declare const selectActionDefinitionForInstance: (state: RootState, cardInstanceId: string, actionId: string) => ActionDefinition | undefined;
export declare const selectActionRuntimeStatesForInstance: (state: RootState, cardInstanceId: string) => Record<string, ActionRuntimeState>;
export declare const selectActionRuntimeStateForInstance: (state: RootState, cardInstanceId: string, actionId: string) => ActionRuntimeState | undefined;
declare const _default: import("redux").Reducer<ActionsState>;
export default _default;
export { actionsSlice };
