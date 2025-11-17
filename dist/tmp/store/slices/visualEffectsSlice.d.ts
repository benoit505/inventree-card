import { RootState } from '../index';
import { VisualEffect, DisplayConfigKey } from '../../types';
export interface VisualEffectsState {
    effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
    elementVisibilityByCard: Record<string, Partial<Record<DisplayConfigKey, boolean>>>;
    effectsByCellId: Record<string, Record<string, VisualEffect>>;
}
export declare const setVisualEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
    effect: Partial<VisualEffect>;
}, "visualEffects/setVisualEffect">, setVisualEffectsBatchForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    effects: Record<number, VisualEffect>;
}, "visualEffects/setVisualEffectsBatchForCard">, clearVisualEffectForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
}, "visualEffects/clearVisualEffectForPart">, clearAllVisualEffectsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearAllVisualEffectsForCard">, clearEffectsForAllCardInstances: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearEffectsForAllCardInstances">, setConditionalPartEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
    effect: VisualEffect;
}, "visualEffects/setConditionalPartEffect">, setConditionalPartEffectsBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    effectsMap: Record<number, VisualEffect>;
}, "visualEffects/setConditionalPartEffectsBatch">, clearConditionalPartEffectsForPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    partId: number;
}, "visualEffects/clearConditionalPartEffectsForPart">, clearAllConditionalPartEffects: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearAllConditionalPartEffects">, clearConditionalPartEffectsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearConditionalPartEffectsForCard">, clearConditionalCellEffectsForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearConditionalCellEffectsForCard">, setElementVisibility: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    displayKey: DisplayConfigKey;
    isVisible: boolean;
}, "visualEffects/setElementVisibility">, setElementVisibilitiesBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    visibilities: Partial<Record<DisplayConfigKey, boolean>>;
}, "visualEffects/setElementVisibilitiesBatch">, clearElementVisibilitiesForCard: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
}, "visualEffects/clearElementVisibilitiesForCard">, clearAllElementVisibilities: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearAllElementVisibilities">, setConditionalCellEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    cardInstanceId: string;
    cellId: string;
    effect: Partial<VisualEffect>;
}, "visualEffects/setConditionalCellEffect">;
export declare const selectVisualEffectForPart: (state: RootState, cardInstanceId: string, partId: number) => VisualEffect | undefined;
export declare const selectAllVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
export declare const selectAllEffectsByCardInstance: (state: RootState) => Record<string, Record<number, VisualEffect>>;
export declare const selectVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
export declare const selectElementVisibility: (state: RootState, cardInstanceId: string, displayKey: DisplayConfigKey) => boolean | undefined;
export declare const selectAllElementVisibilitiesForCard: (state: RootState, cardInstanceId: string) => Partial<Record<DisplayConfigKey, boolean>> | undefined;
export declare const selectVisualEffectsForCell: (state: RootState, cardInstanceId: string, cellId: string) => VisualEffect | undefined;
declare const _default: import("redux").Reducer<VisualEffectsState>;
export default _default;
