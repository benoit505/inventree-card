import { RootState } from '../index';
import { VisualModifiers } from '../../types';
export interface VisualEffect extends VisualModifiers {
    opacity?: number;
    customClasses?: string[];
}
export interface VisualEffectsState {
    effectsByCardInstance: Record<string, Record<number, VisualEffect>>;
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
}, "visualEffects/clearConditionalPartEffectsForCard">;
export declare const selectVisualEffectForPart: (state: RootState, cardInstanceId: string, partId: number) => VisualEffect | undefined;
export declare const selectAllVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
export declare const selectAllEffectsByCardInstance: (state: RootState) => Record<string, Record<number, VisualEffect>>;
export declare const selectVisualEffectsForCard: (state: RootState, cardInstanceId: string) => Record<number, VisualEffect> | undefined;
declare const _default: import("redux").Reducer<VisualEffectsState>;
export default _default;
