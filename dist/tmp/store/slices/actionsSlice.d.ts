import { ActionDefinition } from '../../types';
import { RootState } from '../index';
export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';
export interface ActionRuntimeState {
    status: ActionStatus;
    actionName?: string;
    error?: string;
    lastRun?: number;
}
export interface ActionsState {
    actionDefinitions: Record<string, ActionDefinition>;
    actionRuntimeStates: Record<string, ActionRuntimeState>;
}
export declare const setActionDefinitions: import("@reduxjs/toolkit").ActionCreatorWithPayload<ActionDefinition[], "actions/setActionDefinitions">, updateActionRuntimeState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    actionId: string;
    runtimeState: Partial<ActionRuntimeState>;
}, "actions/updateActionRuntimeState">, clearActionRuntimeState: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    actionId: string;
}, "actions/clearActionRuntimeState">, clearAllActionRuntimeStates: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"actions/clearAllActionRuntimeStates">;
export declare const selectActionDefinitions: (state: RootState) => Record<string, ActionDefinition>;
export declare const selectAllActionDefinitions: (state: RootState) => ActionDefinition[];
export declare const selectActionDefinition: (state: RootState, actionId: string) => ActionDefinition | undefined;
export declare const selectActionRuntimeStates: (state: RootState) => Record<string, ActionRuntimeState>;
export declare const selectActionRuntimeState: (state: RootState, actionId: string) => ActionRuntimeState | undefined;
declare const _default: import("redux").Reducer<ActionsState>;
export default _default;
