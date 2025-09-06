import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { VisualEffect, DisplayConfigKey } from '../../types';
import { createSelector } from 'reselect';

const logger = ConditionalLoggerEngine.getInstance().getLogger('visualEffectsSlice');
ConditionalLoggerEngine.getInstance().registerCategory('visualEffectsSlice', { enabled: false, level: 'info' });

// Interface for the state of this slice
export interface VisualEffectsState {
  effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
  elementVisibilityByCard: Record<string, Partial<Record<DisplayConfigKey, boolean>>>;
  layoutOverridesByCardInstance: Record<string, Record<string, { w?: number; h?: number; x?: number; y?: number }>>;
  layoutEffectsByCell: Record<string, Record<string, Partial<React.CSSProperties>>>;
  effectsByCellId: Record<string, Record<string, VisualEffect>>;
  // Consider adding a global effects record if some effects should apply to all cards
  // globalEffects: Record<number, VisualEffect>; 
}

const initialState: VisualEffectsState = {
  effectsByCardInstance: {},
  elementVisibilityByCard: {},
  layoutOverridesByCardInstance: {},
  layoutEffectsByCell: {},
  effectsByCellId: {},
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
      // logger.verbose(`Set visual effect for card ${cardInstanceId}, part ${partId}`, undefined, { data: effect });
    },

    // Sets a batch of effects for a specific card
    setVisualEffectsBatchForCard(state, action: PayloadAction<{ cardInstanceId: string; effects: Record<number, VisualEffect> }>) {
      const { cardInstanceId, effects } = action.payload;
      state.effectsByCardInstance[cardInstanceId] = effects;
      // logger.debug(`Set visual effects batch for card ${cardInstanceId}`, undefined, { count: Object.keys(effects).length });
    },

    // Clears any visual effect for a specific part, reverting it to default appearance
    clearVisualEffectForPart(state, action: PayloadAction<{ cardInstanceId: string; partId: number }>) {
      const { cardInstanceId, partId } = action.payload;
      if (state.effectsByCardInstance[cardInstanceId]) {
        delete state.effectsByCardInstance[cardInstanceId][partId];
        // logger.verbose(`Cleared visual effect for card ${cardInstanceId}, part ${partId}`);
      }
    },

    // Clears all visual effects for all parts
    clearAllVisualEffectsForCard(state, action: PayloadAction<{ cardInstanceId: string }>) {
      const { cardInstanceId } = action.payload;
      delete state.effectsByCardInstance[cardInstanceId];
      delete state.elementVisibilityByCard[cardInstanceId];
      delete state.layoutOverridesByCardInstance[cardInstanceId]; // Also clear layout overrides
      logger.debug('clearAllVisualEffectsForCard', `Cleared all visual effects and element visibility for card ${cardInstanceId}.`);
    },

    // Clears all visual effects for all parts
    clearEffectsForAllCardInstances(state) {
      state.effectsByCardInstance = {};
      state.elementVisibilityByCard = {};
      state.layoutOverridesByCardInstance = {}; // Also clear layout overrides
      logger.debug('clearEffectsForAllCardInstances', 'Cleared all visual effects and element visibilities for ALL card instances.');
    },

    setConditionalPartEffect(state: VisualEffectsState, action: PayloadAction<{ cardInstanceId: string; partId: number; effect: VisualEffect }>) {
      const { cardInstanceId, partId, effect } = action.payload;
      if (!state.effectsByCardInstance[cardInstanceId]) {
        state.effectsByCardInstance[cardInstanceId] = {};
      }
      state.effectsByCardInstance[cardInstanceId][partId] = effect;
    },

    setConditionalPartEffectsBatch(state, action: PayloadAction<{ cardInstanceId: string; effectsMap: Record<number, VisualEffect> }>) {
      const { cardInstanceId, effectsMap } = action.payload;
      state.effectsByCardInstance[cardInstanceId] = effectsMap;
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

    clearConditionalPartEffectsForCard(state, action: PayloadAction<{ cardInstanceId: string }>) {
      delete state.effectsByCardInstance[action.payload.cardInstanceId];
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

    setConditionalLayoutEffect(state, action: PayloadAction<{ cardInstanceId: string; cellId: string; layout: Partial<React.CSSProperties> }>) {
      const { cardInstanceId, cellId, layout } = action.payload;
      if (!state.layoutEffectsByCell[cardInstanceId]) {
        state.layoutEffectsByCell[cardInstanceId] = {};
      }
      if (!state.layoutEffectsByCell[cardInstanceId][cellId]) {
        state.layoutEffectsByCell[cardInstanceId][cellId] = {};
      }
      state.layoutEffectsByCell[cardInstanceId][cellId] = {
        ...state.layoutEffectsByCell[cardInstanceId][cellId],
        ...layout
      };
    },

    setConditionalCellEffect(state, action: PayloadAction<{ cardInstanceId: string; cellId: string; effect: Partial<VisualEffect> }>) {
      const { cardInstanceId, cellId, effect } = action.payload;
      if (!state.effectsByCellId[cardInstanceId]) {
        state.effectsByCellId[cardInstanceId] = {};
      }
      state.effectsByCellId[cardInstanceId][cellId] = {
        ...(state.effectsByCellId[cardInstanceId][cellId] || {}),
        ...effect,
      };
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
  setConditionalLayoutEffect,
  setConditionalCellEffect,
} = visualEffectsSlice.actions;

// Input selectors
const selectEffectsByCardInstance = (state: RootState) => state.visualEffects.effectsByCardInstance;
const selectCardInstanceId = (_state: RootState, cardInstanceId: string) => cardInstanceId;
const selectPartId = (_state: RootState, _cardInstanceId: string, partId: number) => partId;

// Selectors
export const selectVisualEffectForPart = (state: RootState, cardInstanceId: string, partId: number): VisualEffect | undefined => {
  return state.visualEffects.effectsByCardInstance[cardInstanceId]?.[partId];
};

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

export const selectLayoutOverridesForCard = (state: RootState, cardInstanceId: string): Record<string, any> | undefined => {
  return state.visualEffects.layoutOverridesByCardInstance[cardInstanceId];
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

export const selectLayoutEffectsForCell = (state: RootState, cardInstanceId: string, cellId: string): Partial<React.CSSProperties> | undefined => {
    return state.visualEffects.layoutEffectsByCell[cardInstanceId]?.[cellId];
};

export const selectVisualEffectsForCell = (state: RootState, cardInstanceId: string, cellId: string): VisualEffect | undefined => {
  return state.visualEffects.effectsByCellId[cardInstanceId]?.[cellId];
};

export default visualEffectsSlice.reducer; 