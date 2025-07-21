import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActionDefinition } from '../../types';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('actionsSlice');
ConditionalLoggerEngine.getInstance().registerCategory('actionsSlice', { enabled: false, level: 'info' });

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ActionRuntimeState {
  status: ActionStatus;
  actionName?: string;
  error?: string;
  lastRun?: number; // Timestamp
}

export interface InstanceActionsState {
  actionDefinitions: Record<string, ActionDefinition>;
  actionRuntimeStates: Record<string, ActionRuntimeState>;
}

export interface ActionsState {
  byInstance: Record<string, InstanceActionsState>;
}

const initialState: ActionsState = {
  byInstance: {},
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setActionDefinitions(state, action: PayloadAction<{ definitions: ActionDefinition[], cardInstanceId: string }>) {
      const { definitions, cardInstanceId } = action.payload;
      
      if (!state.byInstance[cardInstanceId]) {
        state.byInstance[cardInstanceId] = { actionDefinitions: {}, actionRuntimeStates: {} };
      }
      const instanceState = state.byInstance[cardInstanceId];

      const newDefinitions: Record<string, ActionDefinition> = {};
      for (const definition of definitions) {
        newDefinitions[definition.id] = definition;
      }
      instanceState.actionDefinitions = newDefinitions;
      logger.info('setActionDefinitions', `Set ${definitions.length} action definitions for instance ${cardInstanceId}.`);
      
      // Initialize runtime states for new definitions
      definitions.forEach(def => {
        if (!instanceState.actionRuntimeStates[def.id]) {
          instanceState.actionRuntimeStates[def.id] = { status: 'idle' };
        }
      });
    },
    updateActionRuntimeState(state, action: PayloadAction<{ cardInstanceId: string, actionId: string; runtimeState: Partial<ActionRuntimeState> }>) {
      const { cardInstanceId, actionId, runtimeState } = action.payload;
      const instanceState = state.byInstance[cardInstanceId];
      if (instanceState?.actionRuntimeStates[actionId]) {
        instanceState.actionRuntimeStates[actionId] = { ...instanceState.actionRuntimeStates[actionId], ...runtimeState };
      } else if (instanceState) {
        instanceState.actionRuntimeStates[actionId] = { status: 'idle', ...runtimeState };
      }
      logger.debug('updateActionRuntimeState', `Updated runtime state for action ${actionId} on instance ${cardInstanceId}:`, { data: runtimeState });
    },
    clearActionRuntimeState(state, action: PayloadAction<{ cardInstanceId: string, actionId: string }>) {
        const { cardInstanceId, actionId } = action.payload;
        const instanceState = state.byInstance[cardInstanceId];
        if (instanceState?.actionRuntimeStates[actionId]) {
            instanceState.actionRuntimeStates[actionId] = { status: 'idle' };
            logger.debug('clearActionRuntimeState', `Cleared runtime state for action ${actionId} on instance ${cardInstanceId}.`);
        }
    },
    removeInstance(state, action: PayloadAction<{ cardInstanceId: string }>) {
      delete state.byInstance[action.payload.cardInstanceId];
    }
  },
});

export const {
  setActionDefinitions,
  updateActionRuntimeState,
  clearActionRuntimeState,
  removeInstance
} = actionsSlice.actions;

// Selectors
export const selectActionDefinitionsForInstance = (state: RootState, cardInstanceId: string): Record<string, ActionDefinition> => state.actions.byInstance[cardInstanceId]?.actionDefinitions || {};
export const selectAllActionDefinitionsForInstance = (state: RootState, cardInstanceId: string): ActionDefinition[] => Object.values(state.actions.byInstance[cardInstanceId]?.actionDefinitions || {});
export const selectActionDefinitionForInstance = (state: RootState, cardInstanceId: string, actionId: string): ActionDefinition | undefined => state.actions.byInstance[cardInstanceId]?.actionDefinitions[actionId];

export const selectActionRuntimeStatesForInstance = (state: RootState, cardInstanceId: string): Record<string, ActionRuntimeState> => state.actions.byInstance[cardInstanceId]?.actionRuntimeStates || {};
export const selectActionRuntimeStateForInstance = (state: RootState, cardInstanceId: string, actionId: string): ActionRuntimeState | undefined => state.actions.byInstance[cardInstanceId]?.actionRuntimeStates[actionId];

export default actionsSlice.reducer;

export { actionsSlice }; 