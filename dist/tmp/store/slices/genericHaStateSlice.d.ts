import { RootState } from '../index';
export interface HaEntityState {
    entity_id: string;
    state: string | number | boolean;
    attributes: Record<string, any>;
    last_updated: string;
    last_changed: string;
}
export interface GenericHaStates {
    entities: Record<string, HaEntityState | undefined>;
}
export declare const setEntityState: import("@reduxjs/toolkit").ActionCreatorWithPayload<HaEntityState, "genericHaStates/setEntityState">, setEntityStatesBatch: import("@reduxjs/toolkit").ActionCreatorWithPayload<HaEntityState[], "genericHaStates/setEntityStatesBatch">, removeEntityState: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "genericHaStates/removeEntityState">, clearAllGenericHaStates: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"genericHaStates/clearAllGenericHaStates">;
export declare const selectAllGenericHaStates: (state: RootState) => Record<string, HaEntityState | undefined>;
export declare const selectGenericHaEntityState: (state: RootState, entityId: string) => HaEntityState | undefined;
export declare const selectGenericHaEntityActualState: (state: RootState, entityId: string) => string | number | boolean | undefined;
export declare const selectGenericHaEntityAttribute: (state: RootState, entityId: string, attributeName: string) => any | undefined;
declare const _default: import("redux").Reducer<GenericHaStates>;
export default _default;
