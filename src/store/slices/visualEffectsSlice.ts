import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';
import { VisualModifiers } from '../../types';

const logger = Logger.getInstance();

// Interface for a single visual effect applicable to a part
export interface VisualEffect extends VisualModifiers {
  // id could be added if individual effects need unique identifiers beyond partId
  // For now, VisualModifiers covers all style and behavioral properties
  // Add opacity as an explicit property if it's commonly used
  opacity?: number; 
  customClasses?: string[]; // Allow adding custom CSS classes
}

// Interface for the state of this slice
export interface VisualEffectsState {
  effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
  // Consider adding a global effects record if some effects should apply to all cards
  // globalEffects: Record<number, VisualEffect>; 
}

const initialState: VisualEffectsState = {
  effectsByCardInstance: {},
  // globalEffects: {}
};

const visualEffectsSlice = createSlice({
  name: 'visualEffects',
  initialState,
  reducers: {
    // Sets or merges an effect for a specific part
    setVisualEffect(state, action: PayloadAction<{ cardInstanceId: string; partId: number; effect: Partial<VisualEffect> }>) {
      const { cardInstanceId, partId, effect } = action.payload;
      if (!state.effectsByCardInstance[cardInstanceId]) {
        state.effectsByCardInstance[cardInstanceId] = {};
      }
      state.effectsByCardInstance[cardInstanceId][partId] = {
        ...(state.effectsByCardInstance[cardInstanceId][partId] || {}),
        ...effect,
      };
      // logger.log('visualEffectsSlice', `Set visual effect for card ${cardInstanceId}, part ${partId}`, { data: effect, level: 'silly' });
    },

    // Sets a batch of effects for a specific card
    setVisualEffectsBatchForCard(state, action: PayloadAction<{ cardInstanceId: string; effects: Record<number, VisualEffect> }>) {
      const { cardInstanceId, effects } = action.payload;
      state.effectsByCardInstance[cardInstanceId] = effects;
      // logger.log('visualEffectsSlice', `Set visual effects batch for card ${cardInstanceId}`, { count: Object.keys(effects).length, level: 'debug' });
    },

    // Clears any visual effect for a specific part, reverting it to default appearance
    clearVisualEffectForPart(state, action: PayloadAction<{ cardInstanceId: string; partId: number }>) {
      const { cardInstanceId, partId } = action.payload;
      if (state.effectsByCardInstance[cardInstanceId]) {
        delete state.effectsByCardInstance[cardInstanceId][partId];
        // logger.log('visualEffectsSlice', `Cleared visual effect for card ${cardInstanceId}, part ${partId}`, {level: 'silly'});
      }
    },

    // Clears all visual effects for all parts
    clearAllVisualEffectsForCard(state, action: PayloadAction<{ cardInstanceId: string }>) {
      const { cardInstanceId } = action.payload;
      delete state.effectsByCardInstance[cardInstanceId];
      logger.log('visualEffectsSlice', `Cleared all visual effects for card ${cardInstanceId}.`, {level: 'debug'});
    },

    // Clears all visual effects for all parts
    clearEffectsForAllCardInstances(state) {
      state.effectsByCardInstance = {};
      logger.log('visualEffectsSlice', 'Cleared all visual effects for ALL card instances.', {level: 'debug'});
    },

    setConditionalPartEffect(state: VisualEffectsState, action: PayloadAction<{ cardInstanceId: string; partId: number; effect: VisualEffect }>) {
      const { cardInstanceId, partId, effect } = action.payload;
      if (!state.effectsByCardInstance[cardInstanceId]) {
        state.effectsByCardInstance[cardInstanceId] = {};
      }
      state.effectsByCardInstance[cardInstanceId][partId] = {
        ...(state.effectsByCardInstance[cardInstanceId][partId] || {}),
        ...effect,
      };
    },

    setConditionalPartEffectsBatch(state: VisualEffectsState, action: PayloadAction<{ cardInstanceId: string; effectsMap: Record<number, VisualEffect> }>) {
      const { cardInstanceId, effectsMap } = action.payload;
      // REMOVED: console.log(`%c[visualEffectsSlice] Reducer: setConditionalPartEffectsBatch for cardInstanceId: ${cardInstanceId}`, 'color: purple; font-weight: bold;', { effectsMap });
      
      if (!state.effectsByCardInstance[cardInstanceId]) {
        state.effectsByCardInstance[cardInstanceId] = {};
      }
      for (const partIdStr in effectsMap) {
        const partId = parseInt(partIdStr, 10);
        if (!isNaN(partId)) {
          state.effectsByCardInstance[cardInstanceId][partId] = {
            ...state.effectsByCardInstance[cardInstanceId][partId],
            ...effectsMap[partId],
          };
        }
      }
      // logger.log('visualEffectsSlice', `Batch set ${Object.keys(effectsMap).length} effects for card ${cardInstanceId}`, { level: 'debug' });
      // REMOVED: console.log(`%c[visualEffectsSlice] Reducer: State AFTER update for cardInstanceId ${cardInstanceId}:`, 'color: purple; font-weight: bold;', JSON.parse(JSON.stringify(state.effectsByCardInstance[cardInstanceId])));
      // REMOVED: console.log(`%c[visualEffectsSlice] Reducer: FULL visualEffects state AFTER update:`, 'color: purple; font-weight: bold;', JSON.parse(JSON.stringify(state.effectsByCardInstance)));
    },

    clearConditionalPartEffectsForPart(state: VisualEffectsState, action: PayloadAction<{ cardInstanceId: string; partId: number }>) {
      const { cardInstanceId, partId } = action.payload;
      if (state.effectsByCardInstance[cardInstanceId] && state.effectsByCardInstance[cardInstanceId][partId]) {
        state.effectsByCardInstance[cardInstanceId][partId] = {}; // Reset to empty effect object
      }
    },

    clearAllConditionalPartEffects(state: VisualEffectsState) {
      state.effectsByCardInstance = {};
    },

    clearConditionalPartEffectsForCard(state: VisualEffectsState, action: PayloadAction<{ cardInstanceId: string }>) {
      const { cardInstanceId } = action.payload;
      if (state.effectsByCardInstance[cardInstanceId]) {
        Object.keys(state.effectsByCardInstance[cardInstanceId]).forEach(partIdStr => {
          state.effectsByCardInstance[cardInstanceId][parseInt(partIdStr, 10)] = {}; // Reset to empty effect
        });
        logger.log('visualEffectsSlice', `Cleared all conditional part effects for cardInstanceId: ${cardInstanceId}`);
      }
    },
  },
});

export const {
  setVisualEffect,
  setVisualEffectsBatchForCard,
  clearVisualEffectForPart,
  clearAllVisualEffectsForCard,
  clearEffectsForAllCardInstances,
  setConditionalPartEffect,
  setConditionalPartEffectsBatch,
  clearConditionalPartEffectsForPart,
  clearAllConditionalPartEffects,
  clearConditionalPartEffectsForCard,
} = visualEffectsSlice.actions;

// Selectors
export const selectVisualEffectForPart = (
  state: RootState,
  cardInstanceId: string,
  partId: number
): VisualEffect | undefined => {
  return state.visualEffects.effectsByCardInstance[cardInstanceId]?.[partId];
};

export const selectAllVisualEffectsForCard = (
  state: RootState,
  cardInstanceId: string
): Record<number, VisualEffect> | undefined => {
  return state.visualEffects.effectsByCardInstance[cardInstanceId];
};

// Potentially a selector for all effects across all cards if ever needed for debugging
export const selectAllEffectsByCardInstance = (state: RootState): Record<string, Record<number, VisualEffect>> => {
    return state.visualEffects.effectsByCardInstance;
};

export const selectVisualEffectsForCard = (state: RootState, cardInstanceId: string): Record<number, VisualEffect> | undefined => {
  return state.visualEffects.effectsByCardInstance[cardInstanceId];
};

export default visualEffectsSlice.reducer; 