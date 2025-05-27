import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    registeredComponents: {}
};
export const componentSlice = createSlice({
    name: 'components',
    initialState,
    reducers: {
        registerComponent: (state, action) => {
            const componentId = action.payload;
            const now = Date.now();
            state.registeredComponents[componentId] = {
                isActive: true,
                registeredAt: now,
                lastActive: now
            };
        },
        disconnectComponent: (state, action) => {
            const componentId = action.payload;
            if (state.registeredComponents[componentId]) {
                state.registeredComponents[componentId].isActive = false;
            }
        },
        reconnectComponent: (state, action) => {
            const componentId = action.payload;
            const now = Date.now();
            if (state.registeredComponents[componentId]) {
                state.registeredComponents[componentId].isActive = true;
                state.registeredComponents[componentId].lastActive = now;
            }
            else {
                // Register if not found
                state.registeredComponents[componentId] = {
                    isActive: true,
                    registeredAt: now,
                    lastActive: now
                };
            }
        },
        updateComponentActivity: (state, action) => {
            const componentId = action.payload;
            if (state.registeredComponents[componentId]) {
                state.registeredComponents[componentId].lastActive = Date.now();
            }
        },
        removeComponent: (state, action) => {
            const componentId = action.payload;
            if (state.registeredComponents[componentId]) {
                delete state.registeredComponents[componentId];
            }
        }
    }
});
// Action creators
export const { registerComponent, disconnectComponent, reconnectComponent, updateComponentActivity, removeComponent } = componentSlice.actions;
// Selectors
export const selectIsComponentActive = (state, componentId) => { var _a; return ((_a = state.components.registeredComponents[componentId]) === null || _a === void 0 ? void 0 : _a.isActive) || false; };
export const selectAllComponents = (state) => state.components.registeredComponents;
export const selectActiveComponentCount = (state) => Object.values(state.components.registeredComponents)
    .filter((comp) => comp.isActive !== undefined)
    .filter(comp => comp.isActive).length;
export default componentSlice.reducer;
//# sourceMappingURL=componentSlice.js.map