import { createSlice } from '@reduxjs/toolkit';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const initialState = {
    effectsByPartId: {},
};
const visualEffectsSlice = createSlice({
    name: 'visualEffects',
    initialState,
    reducers: {
        // Sets or merges an effect for a specific part
        setVisualEffect(state, action) {
            const { partId, effect } = action.payload;
            if (!state.effectsByPartId[partId]) {
                state.effectsByPartId[partId] = {};
            }
            // Merge the new partial effect with any existing effects for that part
            state.effectsByPartId[partId] = Object.assign(Object.assign({}, state.effectsByPartId[partId]), effect);
            logger.log('visualEffectsSlice', `Visual effect set/merged for part ${partId}.`, { partId, newEffect: effect, level: 'debug' });
        },
        // Replaces the entire batch of effects. Useful for re-evaluation results.
        setVisualEffectsBatch(state, action) {
            state.effectsByPartId = action.payload;
            logger.log('visualEffectsSlice', 'Visual effects batch updated.', { count: Object.keys(action.payload).length, level: 'debug' });
        },
        // Clears any visual effect for a specific part, reverting it to default appearance
        clearVisualEffect(state, action) {
            const partId = action.payload;
            delete state.effectsByPartId[partId];
            logger.log('visualEffectsSlice', `Visual effects cleared for part ${partId}.`, { partId, level: 'debug' });
        },
        // Clears all visual effects for all parts
        clearAllVisualEffects(state) {
            state.effectsByPartId = {};
            logger.log('visualEffectsSlice', 'All visual effects cleared.', { level: 'debug' });
        },
    },
});
export const { setVisualEffect, setVisualEffectsBatch, clearVisualEffect, clearAllVisualEffects, } = visualEffectsSlice.actions;
// Selectors
export const selectAllVisualEffects = (state) => state.visualEffects.effectsByPartId;
export const selectVisualEffectForPart = (state, partId) => state.visualEffects.effectsByPartId[partId];
// Example of a more specific selector if needed:
// export const selectPartVisibility = (state: RootState, partId: number): boolean => {
//   const effect = state.visualEffects.effectsByPartId[partId];
//   return effect?.isVisible !== undefined ? effect.isVisible : true; // Default to visible
// };
export default visualEffectsSlice.reducer;
//# sourceMappingURL=visualEffectsSlice.js.map