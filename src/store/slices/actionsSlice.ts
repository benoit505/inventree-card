import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActionDefinition } from '../../types';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ActionRuntimeState {
  status: ActionStatus;
  actionName?: string;
  error?: string;
  lastRun?: number; // Timestamp
}

export interface ActionsState {
  actionDefinitions: Record<string, ActionDefinition>;
  actionRuntimeStates: Record<string, ActionRuntimeState>;
}

const initialState: ActionsState = {
  actionDefinitions: {},
  actionRuntimeStates: {},
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setActionDefinitions(state, action: PayloadAction<ActionDefinition[]>) {
      const newDefinitions: Record<string, ActionDefinition> = {};
      for (const definition of action.payload) {
        newDefinitions[definition.id] = definition;
      }
      state.actionDefinitions = newDefinitions;
      logger.log('actionsSlice', `Set ${action.payload.length} action definitions.`);
      // Initialize runtime states for new definitions
      action.payload.forEach(def => {
        if (!state.actionRuntimeStates[def.id]) {
          state.actionRuntimeStates[def.id] = { status: 'idle' };
        }
      });
    },
    updateActionRuntimeState(state, action: PayloadAction<{ actionId: string; runtimeState: Partial<ActionRuntimeState> }>) {
      const { actionId, runtimeState } = action.payload;
      if (state.actionRuntimeStates[actionId]) {
        state.actionRuntimeStates[actionId] = { ...state.actionRuntimeStates[actionId], ...runtimeState };
      } else {
        state.actionRuntimeStates[actionId] = { status: 'idle', ...runtimeState };
      }
      logger.log('actionsSlice', `Updated runtime state for action ${actionId}:`, { data: runtimeState });
    },
    clearActionRuntimeState(state, action: PayloadAction<{ actionId: string }>) {
        const { actionId } = action.payload;
        if (state.actionRuntimeStates[actionId]) {
            state.actionRuntimeStates[actionId] = { status: 'idle' };
            logger.log('actionsSlice', `Cleared runtime state for action ${actionId}.`);
        }
    },
    clearAllActionRuntimeStates(state) {
        Object.keys(state.actionRuntimeStates).forEach(actionId => {
            state.actionRuntimeStates[actionId] = { status: 'idle' };
        });
        logger.log('actionsSlice', 'Cleared all action runtime states.');
    }
  },
});

export const {
  setActionDefinitions,
  updateActionRuntimeState,
  clearActionRuntimeState,
  clearAllActionRuntimeStates
} = actionsSlice.actions;

// Selectors
export const selectActionDefinitions = (state: RootState): Record<string, ActionDefinition> => state.actions.actionDefinitions;
export const selectAllActionDefinitions = (state: RootState): ActionDefinition[] => Object.values(state.actions.actionDefinitions);
export const selectActionDefinition = (state: RootState, actionId: string): ActionDefinition | undefined => state.actions.actionDefinitions[actionId];

export const selectActionRuntimeStates = (state: RootState): Record<string, ActionRuntimeState> => state.actions.actionRuntimeStates;
export const selectActionRuntimeState = (state: RootState, actionId: string): ActionRuntimeState | undefined => state.actions.actionRuntimeStates[actionId];

export default actionsSlice.reducer; 