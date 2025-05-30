import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Logger } from '../../utils/logger';

const logger = Logger.getInstance();

// Interface for a single visual effect applicable to a part
export interface VisualEffect {
  isVisible?: boolean;
  highlight?: string; // e.g., color code like '#RRGGBB' or 'red'
  textColor?: string; // e.g., color code
  border?: string; // e.g., CSS border string like "2px solid red"
  opacity?: number; // 0.0 to 1.0
  // Add other style-related effect types as needed
  icon?: string; // mdi icon name to display
  badge?: string; // text for a badge overlay
  // Effects that might influence layout or other non-CSS properties
  isExpanded?: boolean; // For expandable sections within a part display
  customClasses?: string[]; // Array of CSS class names to apply
  priority?: 'high' | 'medium' | 'low' | string;
}

// Interface for the state of this slice
export interface VisualEffectsState {
  effectsByPartId: Record<number, VisualEffect>; // Stores active VisualEffect objects keyed by partId
  // We could add more state here if needed, e.g., global default effects
}

const initialState: VisualEffectsState = {
  effectsByPartId: {},
};

const visualEffectsSlice = createSlice({
  name: 'visualEffects',
  initialState,
  reducers: {
    // Sets or merges an effect for a specific part
    setVisualEffect(state: VisualEffectsState, action: PayloadAction<{ partId: number; effect: Partial<VisualEffect> }>) {
      const { partId, effect } = action.payload;
      if (!state.effectsByPartId[partId]) {
        state.effectsByPartId[partId] = {};
      }
      // Merge the new partial effect with any existing effects for that part
      state.effectsByPartId[partId] = { ...state.effectsByPartId[partId], ...effect };
      logger.log('visualEffectsSlice', `Visual effect set/merged for part ${partId}.`, { partId, newEffect: effect, level: 'debug' });
    },

    // Replaces the entire batch of effects. Useful for re-evaluation results.
    setVisualEffectsBatch(state: VisualEffectsState, action: PayloadAction<Record<number, VisualEffect>>) {
      state.effectsByPartId = action.payload;
      logger.log('visualEffectsSlice', 'Visual effects batch updated.', { count: Object.keys(action.payload).length, level: 'debug' });
    },

    // Clears any visual effect for a specific part, reverting it to default appearance
    clearVisualEffect(state: VisualEffectsState, action: PayloadAction<number>) {
      const partId = action.payload;
      delete state.effectsByPartId[partId];
      logger.log('visualEffectsSlice', `Visual effects cleared for part ${partId}.`, { partId, level: 'debug' });
    },

    // Clears all visual effects for all parts
    clearAllVisualEffects(state: VisualEffectsState) {
      state.effectsByPartId = {};
      logger.log('visualEffectsSlice', 'All visual effects cleared.', { level: 'debug' });
    },
  },
});

export const {
  setVisualEffect,
  setVisualEffectsBatch,
  clearVisualEffect,
  clearAllVisualEffects,
} = visualEffectsSlice.actions;

// Selectors
export const selectAllVisualEffects = (state: RootState): Record<number, VisualEffect> => state.visualEffects.effectsByPartId;

export const selectVisualEffectForPart = (state: RootState, partId: number): VisualEffect | undefined => state.visualEffects.effectsByPartId[partId];

// Example of a more specific selector if needed:
// export const selectPartVisibility = (state: RootState, partId: number): boolean => {
//   const effect = state.visualEffects.effectsByPartId[partId];
//   return effect?.isVisible !== undefined ? effect.isVisible : true; // Default to visible
// };

export default visualEffectsSlice.reducer; 