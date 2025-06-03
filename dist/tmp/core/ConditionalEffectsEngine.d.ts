import { RootState, AppDispatch } from '../store';
import { ConditionalLogicItem } from '../types';
export declare class ConditionalEffectsEngine {
    private dispatch;
    private getState;
    private logger;
    constructor(dispatch: AppDispatch, getState: () => RootState);
    evaluateAndApplyEffects(cardInstanceId: string, forceReevaluation?: boolean, logicItems?: ConditionalLogicItem[]): Promise<void>;
}
