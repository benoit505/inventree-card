# Redux Migration: Phase 2 Implementation Plan

## Overview

This document outlines the detailed implementation plan for Phase 2 of the Redux migration: **Redux Foundation Implementation**. This phase focuses on establishing the core Redux infrastructure before integrating with components.

## Implementation Sequence

1. Complete core Redux infrastructure
2. Implement base slices
3. Develop middleware
4. Create selectors
5. Set up utilities and helpers

## 1. Core Redux Infrastructure

### 1.1 Store Setup

```typescript
// src/store/index.ts
import { configureStore, GetDefaultMiddleware } from '@reduxjs/toolkit';
import partsReducer from './slices/partsSlice';
import parametersReducer from './slices/parametersSlice';
import uiReducer from './slices/uiSlice';
import connectivityReducer from './slices/connectivitySlice';
import configReducer from './slices/configSlice';

// Import middleware
import { websocketMiddleware } from './middleware/websocket';
import { apiMiddleware } from './middleware/api';
import { hassMiddleware } from './middleware/hass';
import { eventMiddleware } from './middleware/events';
import { loggingMiddleware } from './middleware/logging';

export const store = configureStore({
  reducer: {
    parts: partsReducer,
    parameters: parametersReducer,
    ui: uiReducer,
    connectivity: connectivityReducer,
    config: configReducer
  },
  middleware: (getDefaultMiddleware: GetDefaultMiddleware) => 
    getDefaultMiddleware({ 
      serializableCheck: {
        // Ignore non-serializable values in specific action types
        ignoredActions: ['hass/setHass', 'config/setConfig']
      }
    })
    .concat(websocketMiddleware)
    .concat(apiMiddleware)
    .concat(hassMiddleware)
    .concat(eventMiddleware)
    .concat(loggingMiddleware)
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Singleton accessor for use without React context
let _store = store;
export const getStore = () => _store;
```

### 1.2 Feature Flag System

```typescript
// src/store/feature-flags.ts
export interface FeatureFlags {
  useReduxForParts: boolean;
  useReduxForParameters: boolean;
  useReduxForRendering: boolean;
  useReduxForWebSocket: boolean;
  useReduxForFiltering: boolean;
}

const defaultFlags: FeatureFlags = {
  useReduxForParts: false,
  useReduxForParameters: false,
  useReduxForRendering: false,
  useReduxForWebSocket: false,
  useReduxForFiltering: false
};

// Get feature flags with localStorage override for development
export function getFeatureFlags(): FeatureFlags {
  try {
    const storedFlags = localStorage.getItem('inventree-redux-flags');
    return storedFlags ? { ...defaultFlags, ...JSON.parse(storedFlags) } : defaultFlags;
  } catch (e) {
    console.error('Error parsing feature flags:', e);
    return defaultFlags;
  }
}

// Feature flag accessor functions
export function useReduxForParts(): boolean {
  return getFeatureFlags().useReduxForParts;
}

export function useReduxForParameters(): boolean {
  return getFeatureFlags().useReduxForParameters;
}

export function useReduxForRendering(): boolean {
  return getFeatureFlags().useReduxForRendering;
}

export function useReduxForWebSocket(): boolean {
  return getFeatureFlags().useReduxForWebSocket;
}

export function useReduxForFiltering(): boolean {
  return getFeatureFlags().useReduxForFiltering;
}

// For development: toggle feature flags
export function setFeatureFlag(feature: keyof FeatureFlags, value: boolean): void {
  try {
    const currentFlags = getFeatureFlags();
    const newFlags = { ...currentFlags, [feature]: value };
    localStorage.setItem('inventree-redux-flags', JSON.stringify(newFlags));
    console.log(`Feature flag ${feature} set to ${value}`);
  } catch (e) {
    console.error('Error setting feature flag:', e);
  }
}
```

### 1.3 Store Provider

```typescript
// src/store/provider.ts
import { RootState, getStore } from './index';
import { useReduxForParts, useReduxForParameters } from './feature-flags';

// Generic state selector
export function select<T>(selector: (state: RootState) => T): T {
  return selector(getStore().getState());
}

// Dispatch wrapper
export function dispatch(action: any): void {
  getStore().dispatch(action);
}

// Subscribe to store changes
export function subscribe(listener: () => void): () => void {
  return getStore().subscribe(listener);
}

// Initialize store with application state
export function initializeStore(config: any, hass: any): void {
  const store = getStore();
  
  // Initialize config and HASS
  store.dispatch({ type: 'config/setCardConfig', payload: config });
  store.dispatch({ type: 'hass/setHass', payload: hass });
  
  console.log('Redux store initialized with config and HASS');
}
```

## 2. Implement Base Slices

### 2.1 Parts Slice

```typescript
// src/store/slices/partsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { InventreeItem } from '../../core/types';
import { RootState } from '../index';

// Define state shape
interface PartsState {
  byEntity: Record<string, number[]>; // Maps entity IDs to arrays of part IDs
  byId: Record<number, InventreeItem>; // Maps part IDs to part objects
  filteredByEntity: Record<string, number[]>; // Maps entity IDs to filtered part IDs
  loading: Record<string, boolean>; // Loading status by entity
  errors: Record<string, string | null>; // Error states
  metadata: {
    lastUpdated: Record<string, Record<string, number>>; // entity -> source -> timestamp
    sourcePriority: 'websocket' | 'api' | 'hass';
  };
}

// Initial state
const initialState: PartsState = {
  byEntity: {},
  byId: {},
  filteredByEntity: {},
  loading: {},
  errors: {},
  metadata: {
    lastUpdated: {},
    sourcePriority: 'hass'
  }
};

// Async thunk for fetching parts
export const fetchParts = createAsyncThunk(
  'parts/fetchParts',
  async (entityId: string, { rejectWithValue }) => {
    try {
      // Implementation will be added during integration
      return { entityId, parts: [] };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Parts slice
const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    // Store parts from a data source
    receiveParts(state, action: PayloadAction<{ 
      entityId: string, 
      parts: InventreeItem[], 
      source: 'websocket' | 'api' | 'hass' 
    }>) {
      const { entityId, parts, source } = action.payload;
      
      // Update byId mapping
      parts.forEach(part => {
        state.byId[part.pk] = part;
      });
      
      // Update byEntity mapping
      state.byEntity[entityId] = parts.map(part => part.pk);
      
      // Update timestamps
      if (!state.metadata.lastUpdated[entityId]) {
        state.metadata.lastUpdated[entityId] = {};
      }
      state.metadata.lastUpdated[entityId][source] = Date.now();
    },
    
    // Update a single part
    updatePart(state, action: PayloadAction<{ 
      entityId: string, 
      part: InventreeItem 
    }>) {
      const { entityId, part } = action.payload;
      
      // Update the part in byId
      state.byId[part.pk] = part;
      
      // Ensure part is in the entity's list
      if (state.byEntity[entityId]) {
        if (!state.byEntity[entityId].includes(part.pk)) {
          state.byEntity[entityId].push(part.pk);
        }
      } else {
        // Create entity entry if it doesn't exist
        state.byEntity[entityId] = [part.pk];
      }
    },
    
    // Update a parameter on a part
    updateParameter(state, action: PayloadAction<{ 
      partId: number, 
      paramName: string, 
      value: string 
    }>) {
      const { partId, paramName, value } = action.payload;
      const part = state.byId[partId];
      
      if (part) {
        // Find and update existing parameter
        if (part.parameters) {
          const paramIndex = part.parameters.findIndex(
            p => p.template_detail && p.template_detail.name === paramName
          );
          
          if (paramIndex >= 0) {
            part.parameters[paramIndex].data = value;
          } else {
            // Add new parameter if not found
            part.parameters.push({
              pk: 0, // Temporary ID
              part: partId,
              template: 0, // Unknown template
              template_detail: {
                name: paramName,
                pk: 0,
                units: '',
                description: '',
                checkbox: false,
                choices: '',
                selectionlist: null
              },
              data: value,
              data_numeric: null
            });
          }
        } else {
          // Initialize parameters array if it doesn't exist
          part.parameters = [{
            pk: 0,
            part: partId,
            template: 0,
            template_detail: {
              name: paramName,
              pk: 0,
              units: '',
              description: '',
              checkbox: false,
              choices: '',
              selectionlist: null
            },
            data: value,
            data_numeric: null
          }];
        }
      }
    },
    
    // Set data source priority
    setSourcePriority(state, action: PayloadAction<'websocket' | 'api' | 'hass'>) {
      state.metadata.sourcePriority = action.payload;
    },
    
    // Store filtered parts for an entity
    setFilteredParts(state, action: PayloadAction<{ 
      entityId: string, 
      partIds: number[] 
    }>) {
      const { entityId, partIds } = action.payload;
      state.filteredByEntity[entityId] = partIds;
    },
    
    // Clear all parts for an entity
    clearEntity(state, action: PayloadAction<string>) {
      const entityId = action.payload;
      
      // Get part IDs for this entity
      const partIds = state.byEntity[entityId] || [];
      
      // Remove from byEntity
      delete state.byEntity[entityId];
      delete state.filteredByEntity[entityId];
      
      // Remove from byId if not referenced by other entities
      partIds.forEach(partId => {
        let isReferenced = false;
        
        // Check if any other entity references this part
        Object.values(state.byEntity).forEach(entityParts => {
          if (entityParts.includes(partId)) {
            isReferenced = true;
          }
        });
        
        // If not referenced, remove from byId
        if (!isReferenced) {
          delete state.byId[partId];
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParts.pending, (state, action) => {
        const entityId = action.meta.arg;
        state.loading[entityId] = true;
        state.errors[entityId] = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        const { entityId, parts } = action.payload;
        state.loading[entityId] = false;
        
        // Use receiveParts logic
        parts.forEach(part => {
          state.byId[part.pk] = part;
        });
        
        state.byEntity[entityId] = parts.map(part => part.pk);
      })
      .addCase(fetchParts.rejected, (state, action) => {
        const entityId = action.meta.arg;
        state.loading[entityId] = false;
        state.errors[entityId] = action.payload as string || 'An error occurred';
      });
  }
});

// Export actions and reducer
export const { 
  receiveParts, 
  updatePart, 
  updateParameter, 
  setSourcePriority, 
  setFilteredParts,
  clearEntity 
} = partsSlice.actions;

export default partsSlice.reducer;

// Selectors
export const selectPartsByEntity = (state: RootState, entityId: string): InventreeItem[] => {
  const partIds = state.parts.byEntity[entityId] || [];
  return partIds.map(id => state.parts.byId[id]).filter(Boolean);
};

export const selectFilteredPartsByEntity = (state: RootState, entityId: string): InventreeItem[] => {
  const partIds = state.parts.filteredByEntity[entityId] || state.parts.byEntity[entityId] || [];
  return partIds.map(id => state.parts.byId[id]).filter(Boolean);
};

export const selectPartById = (state: RootState, partId: number): InventreeItem | undefined => {
  return state.parts.byId[partId];
};

export const selectLoadingStatus = (state: RootState, entityId: string): boolean => {
  return state.parts.loading[entityId] || false;
};

export const selectSourcePriority = (state: RootState): 'websocket' | 'api' | 'hass' => {
  return state.parts.metadata.sourcePriority;
};

// Memoized selector for parts by category
export const selectPartsByCategory = createSelector(
  [
    (state: RootState) => state.parts.byId,
    (state: RootState, entityId: string) => state.parts.byEntity[entityId] || [],
    (state: RootState, entityId: string, category: string) => category
  ],
  (partsById, entityPartIds, category) => {
    return entityPartIds
      .map(id => partsById[id])
      .filter(part => part && part.category_name === category);
  }
);
```

### 2.2 Parameters Slice

```typescript
// src/store/slices/parametersSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { ParameterCondition, ParameterAction } from '../../core/types';
import { RootState } from '../index';

interface ParametersState {
  conditions: ParameterCondition[];
  actions: ParameterAction[];
  values: Record<string, string>; // partId:paramName -> value
  history: Array<{
    partId: number;
    parameter: string;
    value: string;
    timestamp: number;
    source: string;
  }>;
  maxHistoryItems: number;
}

const initialState: ParametersState = {
  conditions: [],
  actions: [],
  values: {},
  history: [],
  maxHistoryItems: 50
};

const parametersSlice = createSlice({
  name: 'parameters',
  initialState,
  reducers: {
    setConditions(state, action: PayloadAction<ParameterCondition[]>) {
      state.conditions = action.payload;
    },
    
    setActions(state, action: PayloadAction<ParameterAction[]>) {
      state.actions = action.payload;
    },
    
    updateValue(state, action: PayloadAction<{
      partId: number;
      paramName: string;
      value: string;
      source?: string;
    }>) {
      const { partId, paramName, value, source = 'unknown' } = action.payload;
      const key = `${partId}:${paramName}`;
      
      // Update value
      state.values[key] = value;
      
      // Add to history
      state.history.unshift({
        partId,
        parameter: paramName,
        value,
        timestamp: Date.now(),
        source
      });
      
      // Trim history if needed
      if (state.history.length > state.maxHistoryItems) {
        state.history = state.history.slice(0, state.maxHistoryItems);
      }
    },
    
    clearHistory(state) {
      state.history = [];
    },
    
    setMaxHistoryItems(state, action: PayloadAction<number>) {
      state.maxHistoryItems = action.payload;
      
      // Trim history if needed
      if (state.history.length > state.maxHistoryItems) {
        state.history = state.history.slice(0, state.maxHistoryItems);
      }
    }
  }
});

export const {
  setConditions,
  setActions,
  updateValue,
  clearHistory,
  setMaxHistoryItems
} = parametersSlice.actions;

export default parametersSlice.reducer;

// Selectors
export const selectConditions = (state: RootState): ParameterCondition[] => {
  return state.parameters.conditions;
};

export const selectActions = (state: RootState): ParameterAction[] => {
  return state.parameters.actions;
};

export const selectParameterValue = (state: RootState, partId: number, paramName: string): string | undefined => {
  const key = `${partId}:${paramName}`;
  return state.parameters.values[key];
};

export const selectParameterHistory = (state: RootState): Array<{
  partId: number;
  parameter: string;
  value: string;
  timestamp: number;
  source: string;
}> => {
  return state.parameters.history;
};

// Memoized selector for filtering conditions by parameter
export const selectConditionsForParameter = createSelector(
  [
    (state: RootState) => state.parameters.conditions,
    (state: RootState, paramName: string) => paramName
  ],
  (conditions, paramName) => {
    return conditions.filter(condition => condition.parameter === paramName);
  }
);

// Memoized selector for filtering actions by parameter
export const selectActionsForParameter = createSelector(
  [
    (state: RootState) => state.parameters.actions,
    (state: RootState, paramName: string) => paramName
  ],
  (actions, paramName) => {
    return actions.filter(action => action.parameter === paramName);
  }
);
```

## 3. Develop Middleware

### 3.1 WebSocket Middleware

```typescript
// src/store/middleware/websocket.ts
import { Middleware } from '@reduxjs/toolkit';
import { WebSocketPlugin, ConnectionState } from '../../services/websocket-plugin';
import { receiveParts, updateParameter } from '../slices/partsSlice';

export const websocketMiddleware: Middleware = store => {
  let webSocketPlugin: WebSocketPlugin | null = null;
  
  return next => action => {
    const result = next(action);
    
    // Handle WebSocket-related actions
    if (action.type === 'connectivity/connectWebSocket') {
      // Initialize WebSocket plugin if needed
      if (!webSocketPlugin) {
        webSocketPlugin = WebSocketPlugin.getInstance();
        
        // Set up message handler
        webSocketPlugin.onMessage(message => {
          handleWebSocketMessage(store, message);
        });
      }
      
      // Configure and connect
      webSocketPlugin.configure(action.payload);
      webSocketPlugin.connect();
      
      // Update connection state
      store.dispatch({
        type: 'connectivity/websocketStateChanged',
        payload: webSocketPlugin.getConnectionState()
      });
    }
    else if (action.type === 'connectivity/disconnectWebSocket') {
      if (webSocketPlugin) {
        webSocketPlugin.disconnect();
        
        // Update connection state
        store.dispatch({
          type: 'connectivity/websocketStateChanged',
          payload: ConnectionState.DISCONNECTED
        });
      }
    }
    
    return result;
  };
};

// Process WebSocket messages
function handleWebSocketMessage(store: any, message: any) {
  // Record message received
  store.dispatch({
    type: 'connectivity/messageReceived',
    payload: message
  });
  
  // Process by message type
  if (message.type === 'parts') {
    // Handle parts update
    const { entityId, parts } = message;
    
    store.dispatch(receiveParts({
      entityId,
      parts,
      source: 'websocket'
    }));
  }
  else if (message.type === 'parameter_updated') {
    // Handle parameter update
    const { part_id, parameter_name, value } = message;
    
    store.dispatch(updateParameter({
      partId: part_id,
      paramName: parameter_name,
      value,
      source: 'websocket'
    }));
  }
}
```

### 3.2 Event Middleware

```typescript
// src/store/middleware/events.ts
import { Middleware } from '@reduxjs/toolkit';
import { updateParameter } from '../slices/parametersSlice';

export const eventMiddleware: Middleware = store => {
  // Set up event listeners when the middleware is created
  setupEventListeners(store);
  
  return next => action => {
    const result = next(action);
    
    // For specific actions, also dispatch legacy events
    if (action.type === 'parameters/updateValue') {
      const { partId, paramName, value } = action.payload;
      
      // Dispatch legacy event
      window.dispatchEvent(new CustomEvent('inventree-parameter-updated', {
        detail: {
          part_id: partId,
          parameter_name: paramName,
          value
        }
      }));
    }
    
    return result;
  };
};

// Set up event listeners
function setupEventListeners(store: any) {
  // Listen for parameter updates
  window.addEventListener('inventree-parameter-updated', (event: any) => {
    const { part_id, parameter_name, value } = event.detail;
    
    // Dispatch action to update parameter
    store.dispatch(updateParameter({
      partId: part_id,
      paramName: parameter_name,
      value,
      source: 'event'
    }));
  });
  
  // Add more event listeners as needed
}
```

### 3.3 Simple Logger Middleware

```typescript
// src/store/middleware/logging.ts
import { Middleware } from '@reduxjs/toolkit';
import { Logger } from '../../utils/logger';

export const loggingMiddleware: Middleware = store => {
  const logger = Logger.getInstance();
  
  return next => action => {
    // Log the action
    logger.log('Redux', `Action: ${action.type}`, {
      category: 'redux',
      subsystem: 'actions'
    });
    
    // Execute the action
    const result = next(action);
    
    // You could also log the new state here
    return result;
  };
};
```

## 4. Usage Metrics Tracking

```typescript
// src/store/metrics.ts
// Track migration progress

export const usageMetrics = {
  redux: {
    getParts: 0,
    updateParameter: 0,
    applyFilters: 0,
    render: 0,
    webSocketMessages: 0,
    other: 0
  },
  legacy: {
    getParts: 0,
    updateParameter: 0,
    applyFilters: 0,
    render: 0,
    webSocketMessages: 0,
    other: 0
  }
};

export function trackReduxUsage(operation: keyof typeof usageMetrics.redux): void {
  usageMetrics.redux[operation]++;
}

export function trackLegacyUsage(operation: keyof typeof usageMetrics.legacy): void {
  usageMetrics.legacy[operation]++;
}

export function logMigrationProgress(): void {
  console.group('Redux Migration Progress');
  console.table(usageMetrics);
  
  // Calculate percentage
  const totalOperations = Object.keys(usageMetrics.redux)
    .reduce((sum, key) => {
      const typedKey = key as keyof typeof usageMetrics.redux;
      return sum + usageMetrics.redux[typedKey] + usageMetrics.legacy[typedKey];
    }, 0);
  
  const reduxOperations = Object.values(usageMetrics.redux)
    .reduce((sum, value) => sum + value, 0);
  
  const migrationPercentage = totalOperations > 0 
    ? Math.round((reduxOperations / totalOperations) * 100) 
    : 0;
  
  console.log(`Migration progress: ${migrationPercentage}% using Redux`);
  console.groupEnd();
}
```

## 5. Implementation Steps

1. **Step 1: Create Core Structure**
   - Create store folder structure
   - Implement feature flag system
   - Create metrics tracking

2. **Step 2: Implement Core Slices**
   - Parts slice implementation
   - Parameters slice implementation
   - Minimal UI slice
   - Connectivity slice

3. **Step 3: Implement Middleware**
   - WebSocket middleware
   - Event middleware
   - Logging middleware

4. **Step 4: Create Store Provider**
   - Implement store singleton accessor
   - Create helper functions for state selection

5. **Step 5: Testing Infrastructure**
   - Unit tests for reducers
   - Integration tests for middleware
   - Add developer tools integration

6. **Step 6: Documentation**
   - Update documentation with implementation details
   - Create examples of store usage
   - Document transition strategies

## 6. Testing Plan

1. **Unit Testing**
   - Test each reducer function
   - Validate selectors
   - Test middleware in isolation

2. **Integration Testing**
   - Test interactions between slices
   - Test middleware chains
   - Validate event passing

3. **End-to-End Testing**
   - Validate with mock data
   - Test feature flags
   - Ensure adapters work correctly

## 7. Definition of Done

- All slices implemented with tests
- Middleware components complete
- Store configuration working
- Feature flag system in place
- Progress metrics tracking operational
- Documentation updated 