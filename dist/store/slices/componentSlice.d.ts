import { RootState } from '../index';
export interface ComponentRecord {
    isActive: boolean;
    registeredAt: number;
    lastActive: number;
}
export declare const componentSlice: any;
export declare const registerComponent: any, disconnectComponent: any, reconnectComponent: any, updateComponentActivity: any, removeComponent: any;
export declare const selectIsComponentActive: (state: RootState, componentId: string) => any;
export declare const selectAllComponents: (state: RootState) => any;
export declare const selectActiveComponentCount: (state: RootState) => number;
declare const _default: any;
export default _default;
