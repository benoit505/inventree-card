import { RootState } from '../store';
import { AppDispatch } from '../store';
export declare class ConditionalEffectsEngine {
    private dispatch;
    private getState;
    constructor(dispatch: AppDispatch, getState: () => RootState);
    evaluateAndApplyEffects(): void;
}
