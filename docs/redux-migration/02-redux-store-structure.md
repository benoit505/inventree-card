# Redux Migration: Store Structure Design

## Overview

This document defines the planned Redux store structure for the InventreeCard application, organizing state into logical slices and establishing clear patterns for state management.

## Store Structure

```
store
├── parts                  # Part data from all sources
│   ├── byEntity           # Maps entity IDs to arrays of parts
│   ├── byId               # Maps part IDs to part objects
│   ├── loading            # Loading status by entity
│   ├── errors             # Error states by entity
│   └── metadata           # Last updated timestamps, counts, etc.
│
├── parameters             # Parameter configuration and values
│   ├── definitions        # Parameter templates and types
│   ├── values             # Current parameter values by part ID and parameter name
│   ├── conditions         # Parameter-based conditions
│   ├── actions            # Parameter-triggered actions
│   └── history            # Recent parameter changes
│
├── ui                     # UI state management
│   ├── layout             # Current layout settings
│   ├── view               # Active view selection
│   ├── filters            # Applied filters
│   ├── visualModifiers    # Visual state for parts (highlight, badges, etc.)
│   ├── renderTiming       # Performance metrics
│   └── debug              # Debug panel state
│
├── connectivity           # WebSocket and API connection state
│   ├── websocket          # WebSocket connection status
│   ├── api                # API connection status
│   ├── history            # Connection event history
│   └── messages           # Recent message log
│
└── config                 # Application configuration
    ├── card               # Card configuration from HASS
    ├── datasources        # Data source priorities
    ├── integrations       # Integration settings (WLED, etc.)
    └── debug              # Debug configuration
```

## Slices and Responsibilities

### 1. Parts Slice

**State Shape:**
```typescript
interface PartsState {
  byEntity: Record<string, number[]>;  // Maps entity IDs to arrays of part IDs
  byId: Record<number, InventreeItem>; // Maps part IDs to part objects
  loading: Record<string, boolean>;    // Loading status by entity
  errors: Record<string, string | null>; // Error states
  metadata: {
    lastUpdated: Record<string, Record<string, number>>; // entity -> source -> timestamp
    sourcePriority: 'websocket' | 'api' | 'hass';
  };
}
```

**Key Actions:**
- `parts/fetchParts`: Load parts for an entity
- `parts/receiveParts`: Store parts from a data source
- `parts/updatePart`: Update a specific part
- `parts/updateParameter`: Update a parameter on a part
- `parts/setSourcePriority`: Set which data source has priority
- `parts/clearEntity`: Remove all parts for an entity

**Selectors:**
- `selectPartsByEntity`: Get all parts for an entity
- `selectPartById`: Get a specific part by ID
- `selectPartsByCategory`: Get parts filtered by category
- `selectPartsByFilter`: Get parts matching filter criteria

### 2. Parameters Slice

**State Shape:**
```typescript
interface ParametersState {
  definitions: Record<number, ParameterDefinition>; // Template definitions
  values: Record<string, string | number>; // part:param -> value
  conditions: ParameterCondition[];
  actions: ParameterAction[];
  history: {
    recent: Array<{
      partId: number;
      parameter: string;
      value: string;
      timestamp: number;
      source: string;
    }>;
    maxItems: number;
  };
}
```

**Key Actions:**
- `parameters/setConditions`: Set parameter conditions from config
- `parameters/setActions`: Set parameter actions from config
- `parameters/updateValue`: Update a parameter value
- `parameters/evaluateCondition`: Evaluate a condition against a part
- `parameters/executeAction`: Trigger a parameter action
- `parameters/clearHistory`: Clear parameter history

**Selectors:**
- `selectParameterValue`: Get specific parameter value
- `selectParametersByPart`: Get all parameters for a part
- `selectConditionsForParameter`: Get all conditions for a parameter
- `selectActionsForParameter`: Get all actions for a parameter

### 3. UI Slice

**State Shape:**
```typescript
interface UIState {
  layout: {
    type: ViewType;
    columns: number;
    spacing: number;
    itemHeight: number;
  };
  view: {
    activeEntity: string | null;
    selectedPart: number | null;
    expanded: Set<number>; // Expanded part IDs
  };
  filters: {
    active: boolean;
    applied: FilterConfig[];
  };
  visualModifiers: Record<number, VisualModifiers>; // By part ID
  renderTiming: {
    history: RenderTimingData[];
    maxStored: number;
  };
  debug: {
    active: boolean;
    tab: string;
    expanded: Set<string>;
  };
}
```

**Key Actions:**
- `ui/setLayout`: Set layout type and options
- `ui/selectPart`: Select a specific part
- `ui/expandPart`: Expand/collapse a part's details
- `ui/setFilters`: Set active filters
- `ui/applyVisualModifiers`: Apply visual effects based on conditions
- `ui/recordRenderTiming`: Store render timing data
- `ui/setDebugMode`: Toggle debug features

**Selectors:**
- `selectLayoutSettings`: Get current layout settings
- `selectActiveEntity`: Get currently active entity
- `selectSelectedPart`: Get selected part
- `selectPartVisualModifiers`: Get visual modifiers for a part
- `selectRenderTimingHistory`: Get render timing metrics

### 4. Connectivity Slice

**State Shape:**
```typescript
interface ConnectivityState {
  websocket: {
    state: ConnectionState;
    lastConnected: number;
    lastMessage: number;
    attempts: number;
    error: string | null;
  };
  api: {
    connected: boolean;
    lastRequest: number;
    lastSuccess: number;
    error: string | null;
  };
  history: Array<{
    type: 'websocket' | 'api';
    event: string;
    timestamp: number;
    details?: any;
  }>;
  messages: {
    recent: any[];
    maxStored: number;
  };
}
```

**Key Actions:**
- `connectivity/connectWebSocket`: Establish WebSocket connection
- `connectivity/disconnectWebSocket`: Close WebSocket connection
- `connectivity/websocketStateChanged`: Update connection state
- `connectivity/messageReceived`: Process incoming message
- `connectivity/apiRequest`: Track API request
- `connectivity/apiSuccess`: Track API success
- `connectivity/apiError`: Track API error

**Selectors:**
- `selectWebSocketState`: Get current WebSocket connection state
- `selectWebSocketHistory`: Get WebSocket connection history
- `selectRecentMessages`: Get recently received messages
- `selectApiStatus`: Get API connection status

### 5. Config Slice

**State Shape:**
```typescript
interface ConfigState {
  card: InventreeCardConfig;
  dataSources: {
    priority: 'websocket' | 'api' | 'hass';
    enabled: {
      websocket: boolean;
      api: boolean;
      hass: boolean;
    };
  };
  integrations: {
    wled: WLEDConfig;
    print: PrintConfig;
  };
  debug: {
    hierarchical: Record<string, {
      enabled: boolean;
      subsystems: Record<string, boolean>;
    }>;
  };
}
```

**Key Actions:**
- `config/setCardConfig`: Set overall card configuration
- `config/setDataSourcePriority`: Set priority for data sources
- `config/toggleDataSource`: Enable/disable a data source
- `config/updateIntegration`: Update integration settings
- `config/setDebugConfig`: Configure debug settings

**Selectors:**
- `selectCardConfig`: Get full card configuration
- `selectDataSourcePriority`: Get current data source priority
- `selectIntegrationConfig`: Get integration settings
- `selectDebugSettings`: Get debug configuration

## Middleware Architecture

### 1. WebSocket Middleware

Responsible for:
- Managing WebSocket connections
- Processing incoming messages
- Dispatching actions based on message type
- Tracking connection state and metrics

```typescript
// Example middleware pattern
const websocketMiddleware = (store) => (next) => (action) => {
  // Handle actions like connectWebSocket, sendMessage, etc.
  if (action.type === 'connectivity/connectWebSocket') {
    // Establish connection...
  }
  
  // Continue to next middleware
  return next(action);
};
```

### 2. API Middleware

Responsible for:
- Handling API requests
- Caching responses
- Managing authentication
- Tracking API metrics

### 3. HASS Middleware

Responsible for:
- Integrating with Home Assistant
- Processing entity changes
- Handling service calls

### 4. Persistence Middleware

Responsible for:
- Saving selected state to localStorage
- Restoring state on reload
- Synchronizing across tabs

### 5. Logger Middleware

Responsible for:
- Logging actions and state changes
- Performance monitoring
- Debug information

## Thunk Actions for Complex Operations

For complex operations spanning multiple slices:

```typescript
// Example thunk for parameter updates
export const updateParameterAndRefresh = (partId, paramName, value) => {
  return async (dispatch, getState) => {
    // Update parameter
    dispatch(parameters.actions.updateValue({ partId, paramName, value }));
    
    // Find entity for this part
    const entityId = selectEntityForPart(getState(), partId);
    
    // Re-evaluate conditions for visual effects
    dispatch(ui.actions.refreshVisualModifiers({ partId }));
    
    // Refresh filtered parts if needed
    dispatch(parts.actions.applyFilters({ entityId }));
  };
};
```

## State Transition Strategy

To facilitate a gradual migration, we'll implement:

1. **Adapter Layer**: Translate between Redux and singletons
2. **Facade Pattern**: Abstract state access with dual implementations
3. **Feature Flags**: Toggle between old and new implementations

Example adapter function:
```typescript
// Adapter function in BaseLayout
private _getPartsFromState(): InventreeItem[] {
  if (REDUX_ENABLED) {
    // Redux implementation
    return this.useSelector(selectPartsByEntity(this.entity));
  } else {
    // Legacy implementation
    return InventTreeState.getInstance().getNewestData(this.entity);
  }
}
```

## Type Definitions

Strong TypeScript typing will be enforced throughout:

```typescript
// Action type definitions
export const partsActions = {
  fetchParts: createAsyncThunk<
    { entityId: string; parts: InventreeItem[] },
    string,
    { rejectValue: string }
  >('parts/fetchParts', async (entityId, { rejectWithValue }) => {
    try {
      // Implementation...
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }),
  // Other actions...
};
``` 