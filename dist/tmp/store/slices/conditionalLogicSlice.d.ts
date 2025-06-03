import { ConditionalLogicItem } from '../../types';
import { RootState } from '../index';
export interface ConditionalLogicState {
    definedLogicItems: ConditionalLogicItem[];
}
export declare const setDefinedLogicItems: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConditionalLogicItem[], "conditionalLogic/setDefinedLogicItems">, clearAllConditions: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"conditionalLogic/clearAllConditions">;
export declare const selectDefinedLogicItems: (state: RootState) => ConditionalLogicItem[];
declare const _default: import("redux").Reducer<ConditionalLogicState>;
export default _default;
