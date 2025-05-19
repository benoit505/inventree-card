import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface ComponentRecord {
  isActive: boolean;
  registeredAt: number;
  lastActive: number;
}

interface ComponentState {
  registeredComponents: Record<string, ComponentRecord>;
}

const initialState: ComponentState = {
  registeredComponents: {}
};

export const componentSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    registerComponent: (state: ComponentState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      const now = Date.now();
      
      state.registeredComponents[componentId] = {
        isActive: true,
        registeredAt: now,
        lastActive: now
      };
    },
    
    disconnectComponent: (state: ComponentState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      
      if (state.registeredComponents[componentId]) {
        state.registeredComponents[componentId].isActive = false;
      }
    },
    
    reconnectComponent: (state: ComponentState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      const now = Date.now();
      
      if (state.registeredComponents[componentId]) {
        state.registeredComponents[componentId].isActive = true;
        state.registeredComponents[componentId].lastActive = now;
      } else {
        // Register if not found
        state.registeredComponents[componentId] = {
          isActive: true,
          registeredAt: now,
          lastActive: now
        };
      }
    },
    
    updateComponentActivity: (state: ComponentState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      
      if (state.registeredComponents[componentId]) {
        state.registeredComponents[componentId].lastActive = Date.now();
      }
    },
    
    removeComponent: (state: ComponentState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      
      if (state.registeredComponents[componentId]) {
        delete state.registeredComponents[componentId];
      }
    }
  }
});

// Action creators
export const {
  registerComponent,
  disconnectComponent,
  reconnectComponent,
  updateComponentActivity,
  removeComponent
} = componentSlice.actions;

// Selectors
export const selectIsComponentActive = (state: RootState, componentId: string) => 
  state.components.registeredComponents[componentId]?.isActive || false;

export const selectAllComponents = (state: RootState) => 
  state.components.registeredComponents;

export const selectActiveComponentCount = (state: RootState) => 
  Object.values(state.components.registeredComponents)
    .filter((comp): comp is ComponentRecord => (comp as ComponentRecord).isActive !== undefined)
    .filter(comp => comp.isActive).length;

export default componentSlice.reducer; 