import { RootState, AppDispatch } from '../store';
import { ConditionalLogicItem } from '../types';
export declare class ConditionalEffectsEngine {
    private dispatch;
    private getState;
    private logger;
    constructor(dispatch: AppDispatch, getState: () => RootState);
    private applyEffectsToTargets;
    evaluateAndApplyEffects(cardInstanceId: string, forceReevaluation?: boolean, logicItemsToEvaluate?: ConditionalLogicItem[]): Promise<void>;
}
