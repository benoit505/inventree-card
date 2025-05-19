import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeView: string;
  selectedPartId: number | null;
  debug: {
    showDebugPanel: boolean;
    activeTab: string;
  };
  loading: boolean;
}

const initialState: UiState = {
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
    setActiveView(state: UiState, action: PayloadAction<string>) {
      state.activeView = action.payload;
    },
    setSelectedPart(state: UiState, action: PayloadAction<number | null>) {
      state.selectedPartId = action.payload;
    },
    toggleDebugPanel(state: UiState) {
      state.debug.showDebugPanel = !state.debug.showDebugPanel;
    },
    setDebugTab(state: UiState, action: PayloadAction<string>) {
      state.debug.activeTab = action.payload;
    },
    setLoading(state: UiState, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  }
});

export const { 
  setActiveView, 
  setSelectedPart, 
  toggleDebugPanel, 
  setDebugTab, 
  setLoading 
} = uiSlice.actions;

export default uiSlice.reducer;


