import { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
export interface ComponentRecord {
    isActive: boolean;
    registeredAt: number;
    lastActive: number;
}
export interface ComponentState {
    registeredComponents: Record<string, ComponentRecord>;
}
export declare const componentSlice: import("@reduxjs/toolkit").Slice<ComponentState, {
    registerComponent: (state: ComponentState, action: PayloadAction<string>) => void;
    disconnectComponent: (state: ComponentState, action: PayloadAction<string>) => void;
    reconnectComponent: (state: ComponentState, action: PayloadAction<string>) => void;
    updateComponentActivity: (state: ComponentState, action: PayloadAction<string>) => void;
    removeComponent: (state: ComponentState, action: PayloadAction<string>) => void;
}, "components", "components", import("@reduxjs/toolkit").SliceSelectors<ComponentState>>;
export declare const registerComponent: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "components/registerComponent">, disconnectComponent: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "components/disconnectComponent">, reconnectComponent: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "components/reconnectComponent">, updateComponentActivity: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "components/updateComponentActivity">, removeComponent: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "components/removeComponent">;
export declare const selectIsComponentActive: (state: RootState, componentId: string) => boolean;
export declare const selectAllComponents: (state: RootState) => Record<string, ComponentRecord>;
export declare const selectActiveComponentCount: (state: RootState) => number;
export declare const selectActiveCardInstanceIds: (state: RootState) => string[];
declare const _default: import("redux").Reducer<ComponentState>;
export default _default;
