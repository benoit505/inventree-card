# Redux Migration: Integration Points

## Overview

This document identifies key integration points between the current singleton-based architecture and the planned Redux implementation. These points will form the basis of our migration strategy, allowing us to gradually shift functionality while maintaining a working application.

## Integration Strategy Principles

1. **Incremental Migration**: One feature/component at a time
2. **Parallel Operation**: Both systems running during transition
3. **Feature Flags**: Toggle between implementations
4. **Adapter Pattern**: Bridge between old and new architectures
5. **Backward Compatibility**: Components work with both systems

## Key Integration Points

### 1. Component State Access

**Current Approach**: Components directly access singletons to get state
```typescript
// Current pattern in BaseLayout
private _getParts(): InventreeItem[] {
  return InventTreeState.getInstance().getNewestData(this.entity);
}
```

**Integration Pattern**: Create adapters that can source from either system
```typescript
// Adapter pattern
private _getParts(): InventreeItem[] {
  if (useReduxForParts()) {
    const store = getStore();
    return selectPartsByEntity(store.getState(), this.entity);
  } else {
    return InventTreeState.getInstance().getNewestData(this.entity);
  }
}
```

**Migration Phases**:
1. Add adapter functions to BaseLayout
2. Create React/Lit hooks for Redux state
3. Gradually switch components to use hooks
4. Remove legacy access patterns

### 2. State Updates

**Current Approach**: Direct method calls on singletons
```typescript
// Current pattern
InventTreeState.getInstance().updateParameter(partId, paramName, value);
```

**Integration Pattern**: Dispatch actions with adapter fallback
```typescript
// Adapter pattern
updateParameter(partId: number, paramName: string, value: string): void {
  if (useReduxForParameters()) {
    dispatch(parameters.actions.updateValue({ partId, paramName, value }));
  } else {
    InventTreeState.getInstance().updateParameter(partId, paramName, value);
  }
}
```

**Migration Phases**:
1. Wrap state updates in adapter methods
2. Create action creators for all state changes
3. Add action dispatch to adapter methods
4. Gradually remove direct singleton calls

### 3. Event Propagation

**Current Approach**: Custom events for state changes
```typescript
// Current pattern
window.dispatchEvent(new CustomEvent('inventree-parameter-updated', { 
  detail: { part_id: partId, parameter_name: paramName, value }
}));
```

**Integration Pattern**: Connect Redux actions to event system
```typescript
// Middleware to bridge events and Redux
const eventMiddleware = store => next => action => {
  const result = next(action);
  
  // For specific actions, also dispatch events for legacy components
  if (action.type === 'parameters/updateValue') {
    window.dispatchEvent(new CustomEvent('inventree-parameter-updated', {
      detail: { 
        part_id: action.payload.partId, 
        parameter_name: action.payload.paramName, 
        value: action.payload.value 
      }
    }));
  }
  
  return result;
};
```

**Migration Phases**:
1. Add middleware to dispatch events from Redux actions
2. Add action dispatches for received events
3. Gradually move components to Redux subscription model
4. Remove event listeners as components migrate

### 4. Service Integration

**Current Approach**: Singleton services with direct state access
```typescript
// Current pattern in RenderingService
public shouldRender(entityId: string, dataHash: string): boolean {
  // Direct cache access
  if (this.cache.has(`render:${entityId}:${dataHash}`)) {
    return false;
  }
  return true;
}
```

**Integration Pattern**: Service factories that use either Redux or singletons
```typescript
// Factory pattern
interface RenderingServiceInterface {
  shouldRender(entityId: string, dataHash: string): boolean;
  // other methods...
}

class ReduxRenderingService implements RenderingServiceInterface {
  shouldRender(entityId: string, dataHash: string): boolean {
    const state = getStore().getState();
    // Use Redux state to check render hash
    return !selectRenderHash(state, entityId, dataHash);
  }
}

class LegacyRenderingService implements RenderingServiceInterface {
  shouldRender(entityId: string, dataHash: string): boolean {
    // Original implementation
    return !this.cache.has(`render:${entityId}:${dataHash}`);
  }
}

// Get appropriate implementation based on feature flags
function getRenderingService(): RenderingServiceInterface {
  return useReduxForRendering() 
    ? new ReduxRenderingService() 
    : new LegacyRenderingService();
}
```

**Migration Phases**:
1. Create interfaces for key services
2. Implement Redux-based versions of services
3. Create factory functions to get appropriate implementation
4. Gradually switch service usage in components

### 5. Life Cycle Management

**Current Approach**: Initialization order of singletons
```typescript
// Current pattern in CardController
private initializeServices(): void {
  // Specific initialization order
  const state = InventTreeState.getInstance();
  state.setHass(this._hass);
  
  this._parameterService = ParameterService.getInstance();
  this._renderingService = RenderingService.getInstance();
  // etc.
}
```

**Integration Pattern**: Redux store initialization with legacy support
```typescript
// Redux store initialization
function initializeStore(config: InventreeCardConfig, hass: HomeAssistant) {
  const store = getStore();
  
  // Initialize config
  store.dispatch(config.actions.setCardConfig(config));
  
  // Initialize HASS integration
  store.dispatch(hass.actions.setHass(hass));
  
  // For legacy support, also initialize singletons
  if (!fullyMigratedToRedux()) {
    const state = InventTreeState.getInstance();
    state.setHass(hass);
    // etc.
  }
}
```

**Migration Phases**:
1. Create store initialization logic
2. Add conditional legacy initialization
3. Extract initialization from component life cycles
4. Gradually remove singleton initialization

### 6. Data Source Management

**Current Approach**: Singleton state manager with source priority
```typescript
// Current pattern
export class InventTreeState {
  private _prioritySource: 'websocket' | 'api' | 'hass' = 'hass';
  
  public getNewestData(entityId: string): BaseInventreeItem[] {
    // Choose source based on priority
    if (this._prioritySource === 'websocket' && this._webSocketData.has(entityId)) {
      return this._webSocketData.get(entityId) || [];
    }
    // etc.
  }
}
```

**Integration Pattern**: Redux selectors with source preference
```typescript
// Redux selector with source priority
export const selectPartsByEntityWithPriority = createSelector(
  [selectPartsByEntityAllSources, selectDataSourcePriority],
  (partsBySource, priority) => {
    // Choose source based on priority setting
    if (priority === 'websocket' && partsBySource.websocket?.length > 0) {
      return partsBySource.websocket;
    }
    // etc.
  }
);
```

**Migration Phases**:
1. Create selectors that replicate current logic
2. Add source preference to Redux state
3. Connect data sources to Redux
4. Gradually move data access to Redux selectors

### 7. Filtering Logic

**Current Approach**: Parameter filtering in BaseLayout
```typescript
// Current pattern
protected async _applyParameterFiltering(parts: InventreeItem[]): Promise<InventreeItem[]> {
  // Complex filtering logic
}
```

**Integration Pattern**: Redux middleware for filtering with legacy fallback
```typescript
// Redux middleware for filtering
const filterMiddleware = store => next => action => {
  const result = next(action);
  
  // When parts are updated, apply filtering
  if (action.type === 'parts/receiveParts') {
    store.dispatch(parts.actions.applyFilters({ entityId: action.payload.entityId }));
  }
  
  return result;
};

// Filter action implementation
const applyFilters = createAsyncThunk(
  'parts/applyFilters',
  async ({ entityId }, { getState, dispatch }) => {
    const state = getState();
    const allParts = selectAllPartsByEntity(state, entityId);
    const conditions = selectActiveConditions(state);
    
    // Reuse legacy service during transition if needed
    let filteredParts;
    if (useServiceForFiltering()) {
      const paramService = ParameterService.getInstance();
      filteredParts = await paramService.filterPartsByConditions(allParts, conditions);
    } else {
      // New Redux-based implementation
      filteredParts = await filterPartsByConditions(allParts, conditions, state);
    }
    
    dispatch(parts.actions.setFilteredParts({ entityId, parts: filteredParts }));
  }
);
```

**Migration Phases**:
1. Extract filtering logic to standalone functions
2. Create Redux actions for filtering operations
3. Implement filtering middleware
4. Gradually move filtering login to Redux

## Parallel Operation Patterns

### Feature Flag System

```typescript
// Feature flag system for toggling between implementations
interface FeatureFlags {
  useReduxForParts: boolean;
  useReduxForParameters: boolean;
  useReduxForRendering: boolean;
  useReduxForWebSocket: boolean;
  useReduxForFiltering: boolean;
}

// Default configuration - start with all features off
const defaultFlags: FeatureFlags = {
  useReduxForParts: false,
  useReduxForParameters: false,
  useReduxForRendering: false,
  useReduxForWebSocket: false,
  useReduxForFiltering: false
};

// Get current flags, with ability to override via localStorage
function getFeatureFlags(): FeatureFlags {
  try {
    const storedFlags = localStorage.getItem('inventree-redux-flags');
    return storedFlags ? JSON.parse(storedFlags) : defaultFlags;
  } catch (e) {
    return defaultFlags;
  }
}

// Helper functions for each feature
export function useReduxForParts(): boolean {
  return getFeatureFlags().useReduxForParts;
}

// etc. for each feature
```

### Component Adapter Pattern

```typescript
// Higher-order component pattern for LitElement
function withRedux(BaseClass) {
  return class extends BaseClass {
    // Add Redux connection
    _reduxUnsubscribe = null;
    
    connectedCallback() {
      super.connectedCallback();
      
      // Subscribe to Redux if enabled
      if (isReduxEnabled()) {
        this._connectToRedux();
      }
    }
    
    disconnectedCallback() {
      super.disconnectedCallback();
      
      // Unsubscribe from Redux
      if (this._reduxUnsubscribe) {
        this._reduxUnsubscribe();
        this._reduxUnsubscribe = null;
      }
    }
    
    _connectToRedux() {
      const store = getStore();
      
      // Initial state update
      this._handleStateChange(store.getState());
      
      // Subscribe to store changes
      this._reduxUnsubscribe = store.subscribe(() => {
        this._handleStateChange(store.getState());
      });
    }
    
    _handleStateChange(state) {
      // Override in subclass
    }
  };
}
```

## Bootstrap Sequence

During the migration, we need a robust bootstrap process that initializes both systems:

```typescript
// Bootstrap process
export function initializeInventreeCard(config: InventreeCardConfig, hass: HomeAssistant) {
  console.log('Initializing InventreeCard with dual architecture');
  
  // Step 1: Initialize Redux store
  const store = configureStore({
    reducer: {
      parts: partsReducer,
      parameters: parametersReducer,
      ui: uiReducer,
      connectivity: connectivityReducer,
      config: configReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware()
      .concat(websocketMiddleware)
      .concat(apiMiddleware)
      .concat(eventMiddleware)
      .concat(loggingMiddleware)
  });
  
  // Step 2: Initialize Redux state
  store.dispatch(config.actions.setCardConfig(config));
  store.dispatch(hass.actions.setHass(hass));
  
  // Step 3: Initialize traditional singletons
  const controller = CardController.getInstance();
  controller.setConfig(config);
  controller.setHass(hass);
  
  // Step 4: Connect Redux to legacy event system
  connectReduxToEvents(store);
  
  return { store, controller };
}
```

## Progress Tracking

To monitor migration progress during development, we'll add instrumentation:

```typescript
// Track which system is handling requests
const usageMetrics = {
  redux: {
    getParts: 0,
    updateParameter: 0,
    applyFilters: 0,
    render: 0
  },
  legacy: {
    getParts: 0,
    updateParameter: 0,
    applyFilters: 0,
    render: 0
  }
};

// Example tracking in adapter
function _getParts() {
  if (useReduxForParts()) {
    usageMetrics.redux.getParts++;
    // Redux implementation...
  } else {
    usageMetrics.legacy.getParts++;
    // Legacy implementation...
  }
}

// Add devtools output
function logMigrationProgress() {
  console.table(usageMetrics);
}
``` 