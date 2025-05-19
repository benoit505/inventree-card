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
}
export interface VisualEffectsState {
    effectsByPartId: Record<number, VisualEffect>;
}
export declare const setVisualEffect: any, setVisualEffectsBatch: any, clearVisualEffect: any, clearAllVisualEffects: any;
export declare const selectAllVisualEffects: (state: RootState) => Record<number, VisualEffect>;
export declare const selectVisualEffectForPart: (state: RootState, partId: number) => VisualEffect | undefined;
declare const _default: any;
export default _default;
