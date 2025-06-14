import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';
import { VisualModifiers, DisplayConfigKey } from '../../types';
import { createSelector } from 'reselect';

const logger = Logger.getInstance();

// Interface for a single visual effect applicable to a part
export interface VisualEffect extends VisualModifiers {
  // id could be added if individual effects need unique identifiers beyond partId
  // For now, VisualModifiers covers all style and behavioral properties
  // Add opacity as an explicit property if it's commonly used
  opacity?: number; 
  customClasses?: string[]; // Allow adding custom CSS classes
  animation?: { // NEW: For Framer Motion
    variants?: object; // Use object to avoid Immer/RTK issues with complex types
    initial?: string | boolean;
    animate?: object; // Allow direct animation objects
    transition?: object;
    whileHover?: object;
    whileTap?: object;
  };
}

// Interface for the state of this slice
export interface VisualEffectsState {
  effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
  elementVisibilityByCard: Record<string, Partial<Record<DisplayConfigKey, boolean>>>;
  // Consider adding a global effects record if some effects should apply to all cards
  // globalEffects: Record<number, VisualEffect>; 
}

const initialState: VisualEffectsState = {
  effectsByCardInstance: {},
  elementVisibilityByCard: {},
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
      delete state.elementVisibilityByCard[cardInstanceId];
      logger.log('visualEffectsSlice', `Cleared all visual effects and element visibility for card ${cardInstanceId}.`, {level: 'debug'});
    },

    // Clears all visual effects for all parts
    clearEffectsForAllCardInstances(state) {
      state.effectsByCardInstance = {};
      state.elementVisibilityByCard = {};
      logger.log('visualEffectsSlice', 'Cleared all visual effects and element visibilities for ALL card instances.', {level: 'debug'});
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
          if (effectsMap[partId].animation) {
            logger.log('visualEffectsSlice', `Reducer applying animation effect for part ${partId} in card ${cardInstanceId}`, { animation: effectsMap[partId].animation });
          }
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

    // NEW REDUCERS for element visibility
    setElementVisibility(state, action: PayloadAction<{ cardInstanceId: string; displayKey: DisplayConfigKey; isVisible: boolean }>) {
      const { cardInstanceId, displayKey, isVisible } = action.payload;
      if (!state.elementVisibilityByCard[cardInstanceId]) {
        state.elementVisibilityByCard[cardInstanceId] = {};
      }
      state.elementVisibilityByCard[cardInstanceId][displayKey] = isVisible;
    },
    setElementVisibilitiesBatch(state, action: PayloadAction<{ cardInstanceId: string; visibilities: Partial<Record<DisplayConfigKey, boolean>> }>) {
      const { cardInstanceId, visibilities } = action.payload;
      if (!state.elementVisibilityByCard[cardInstanceId]) {
        state.elementVisibilityByCard[cardInstanceId] = {};
      }
      state.elementVisibilityByCard[cardInstanceId] = {
        ...state.elementVisibilityByCard[cardInstanceId],
        ...visibilities,
      };
    },
    clearElementVisibilitiesForCard(state, action: PayloadAction<{ cardInstanceId: string }>) {
      const { cardInstanceId } = action.payload;
      delete state.elementVisibilityByCard[cardInstanceId];
    },
    clearAllElementVisibilities(state) {
      state.elementVisibilityByCard = {};
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
  // Export new actions
  setElementVisibility,
  setElementVisibilitiesBatch,
  clearElementVisibilitiesForCard,
  clearAllElementVisibilities,
} = visualEffectsSlice.actions;

// Input selectors
const selectEffectsByCardInstance = (state: RootState) => state.visualEffects.effectsByCardInstance;
const selectCardInstanceId = (_state: RootState, cardInstanceId: string) => cardInstanceId;
const selectPartId = (_state: RootState, _cardInstanceId: string, partId: number) => partId;

// Selectors
export const selectVisualEffectForPart = createSelector(
  [selectEffectsByCardInstance, selectCardInstanceId, selectPartId],
  (effectsByCardInstance, cardInstanceId, partId) => {
    const instanceEffects = effectsByCardInstance[cardInstanceId]?.[partId];
    // Check for effects applied to a 'global' or 'undefined_card' instance
    const globalEffects = effectsByCardInstance['undefined_card']?.[partId];

    if (!instanceEffects && !globalEffects) {
      return undefined;
    }

    // Merge global and instance-specific effects, with instance effects taking precedence
    const finalEffect = {
      ...(globalEffects || {}),
      ...(instanceEffects || {}),
    };
    
    // logger.log('selectVisualEffectForPart', `Computed effect for part ${partId} in card ${cardInstanceId}`, { data: finalEffect, level: 'silly' });
    return finalEffect;
  }
);

export const selectAllVisualEffectsForCard = (
  state: RootState,
  cardInstanceId: string
): Record<number, VisualEffect> | undefined => {
  const instanceCardEffects = state.visualEffects.effectsByCardInstance[cardInstanceId];
  const globalCardEffects = state.visualEffects.effectsByCardInstance['undefined_card'];

  if (!instanceCardEffects && !globalCardEffects) {
    return undefined;
  }

  // Deep merge part by part is necessary here.
  const allPartIds = new Set([
    ...Object.keys(instanceCardEffects || {}).map(Number),
    ...Object.keys(globalCardEffects || {}).map(Number)
  ]);

  const mergedEffects: Record<number, VisualEffect> = {};

  for (const partId of allPartIds) {
    const instancePartEffects = instanceCardEffects?.[partId];
    const globalPartEffects = globalCardEffects?.[partId];
    if (instancePartEffects || globalPartEffects) {
        mergedEffects[partId] = {
            ...(globalPartEffects || {}),
            ...(instancePartEffects || {}),
        };
    }
  }

  return mergedEffects;
};

// Potentially a selector for all effects across all cards if ever needed for debugging
export const selectAllEffectsByCardInstance = (state: RootState): Record<string, Record<number, VisualEffect>> => {
    return state.visualEffects.effectsByCardInstance;
};

export const selectVisualEffectsForCard = (state: RootState, cardInstanceId: string): Record<number, VisualEffect> | undefined => {
  return state.visualEffects.effectsByCardInstance[cardInstanceId];
};

// NEW SELECTORS for element visibility
export const selectElementVisibility = (
  state: RootState,
  cardInstanceId: string,
  displayKey: DisplayConfigKey
): boolean | undefined => {
  return state.visualEffects.elementVisibilityByCard[cardInstanceId]?.[displayKey];
};

export const selectAllElementVisibilitiesForCard = (
  state: RootState,
  cardInstanceId: string
): Partial<Record<DisplayConfigKey, boolean>> | undefined => {
  return state.visualEffects.elementVisibilityByCard[cardInstanceId];
};

export default visualEffectsSlice.reducer; 