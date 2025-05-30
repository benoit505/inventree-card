import { RootState } from '../index';
export interface VisualEffect {
    isVisible?: boolean;
    highlight?: string;
    textColor?: string;
    border?: string;
    opacity?: number;
    icon?: string;
    badge?: string;
    isExpanded?: boolean;
    customClasses?: string[];
    priority?: 'high' | 'medium' | 'low' | string;
}
export interface VisualEffectsState {
    effectsByPartId: Record<number, VisualEffect>;
}
export declare const setVisualEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    partId: number;
    effect: Partial<VisualEffect>;
}, "visualEffects/setVisualEffect">, setVisualEffectsBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<Record<number, VisualEffect>, "visualEffects/setVisualEffectsBatch">, clearVisualEffect: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "visualEffects/clearVisualEffect">, clearAllVisualEffects: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"visualEffects/clearAllVisualEffects">;
export declare const selectAllVisualEffects: (state: RootState) => Record<number, VisualEffect>;
export declare const selectVisualEffectForPart: (state: RootState, partId: number) => VisualEffect | undefined;
declare const _default: import("redux").Reducer<VisualEffectsState>;
export default _default;
