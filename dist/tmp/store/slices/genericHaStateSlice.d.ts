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
export declare const setEntityState: any, setEntityStatesBatch: any, removeEntityState: any, clearAllGenericHaStates: any;
export declare const selectAllGenericHaStates: (state: RootState) => Record<string, HaEntityState | undefined>;
export declare const selectGenericHaEntityState: (state: RootState, entityId: string) => HaEntityState | undefined;
export declare const selectGenericHaEntityActualState: (state: RootState, entityId: string) => string | number | boolean | undefined;
export declare const selectGenericHaEntityAttribute: (state: RootState, entityId: string, attributeName: string) => any | undefined;
declare const _default: any;
export default _default;
