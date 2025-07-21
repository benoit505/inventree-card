import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { InventreeCardConfig, LayoutColumn, ReactGridLayout } from '../../types';
import { RootState } from '..';

export interface Layouts {
  [key: string]: Layout[];
}

export interface LayoutState {
  layoutsByInstance: {
    [cardInstanceId: string]: Layouts;
  };
  columnsByInstance: {
    [cardInstanceId: string]: LayoutColumn[];
  };
}

const initialState: LayoutState = {
  layoutsByInstance: {},
  columnsByInstance: {},
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayouts: (state, action: PayloadAction<{ cardInstanceId: string; layouts: Layouts }>) => {
      state.layoutsByInstance[action.payload.cardInstanceId] = action.payload.layouts;
    },
    setColumns: (state, action: PayloadAction<{ cardInstanceId: string; columns: LayoutColumn[] }>) => {
      state.columnsByInstance[action.payload.cardInstanceId] = action.payload.columns;
    },
    removeInstance: (state, action: PayloadAction<{ cardInstanceId: string }>) => {
      delete state.layoutsByInstance[action.payload.cardInstanceId];
      delete state.columnsByInstance[action.payload.cardInstanceId];
    },
  },
});

export const { setLayouts, setColumns, removeInstance } = layoutSlice.actions;

export const selectLayoutsForInstance = (state: RootState, cardInstanceId: string): ReactGridLayout.Layouts | undefined =>
  state.layout.layoutsByInstance[cardInstanceId];

export const selectColumnsForInstance = (state: RootState, cardInstanceId: string): LayoutColumn[] | undefined =>
  state.layout.columnsByInstance[cardInstanceId];

export default layoutSlice.reducer; 