import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    activeView: 'detail',
    selectedPartId: null,
    debug: {
        showDebugPanel: false,
        activeTab: 'data'
    },
    loading: false
};
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveView(state, action) {
            state.activeView = action.payload;
        },
        setSelectedPart(state, action) {
            state.selectedPartId = action.payload;
        },
        toggleDebugPanel(state) {
            state.debug.showDebugPanel = !state.debug.showDebugPanel;
        },
        setDebugTab(state, action) {
            state.debug.activeTab = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        }
    }
});
export const { setActiveView, setSelectedPart, toggleDebugPanel, setDebugTab, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
//# sourceMappingURL=uiSlice.js.map