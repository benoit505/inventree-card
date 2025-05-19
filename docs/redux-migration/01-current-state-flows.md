# Redux Migration: Current State Flows

## Overview

This document maps the current state management flows in the InventreeCard application, identifying key state providers, consumers, and the relationships between them.

## Primary State Sources

| State Provider | Type | Responsible For |
|---------------|------|-----------------|
| `InventTreeState` | Singleton | Part data, parameters, source prioritization, cross-entity lookups |
| `RenderingService` | Singleton | Render timing, callbacks, throttling, scheduling, performance metrics |
| `CardController` | Singleton | High-level orchestration, service coordination, lifecycle management |
| `WebSocketPlugin` | Singleton | Real-time data, connection management, message handling |
| `CacheService` | Singleton | Data caching and invalidation, TTL management, fallbacks |
| `ParameterService` | Singleton | Parameter handling, condition evaluation, formatting |

## Data Flow Diagram

```
                 ┌───────────────┐
                 │ Data Sources  │
                 └───────┬───────┘
                         │
                         ▼
┌───────────┐    ┌───────────────┐    ┌───────────────┐
│  WebSocket│    │InventTreeState│◄───│   HASS API    │
│  Plugin   │───►│   Singleton   │    │               │
└───────────┘    └───────┬───────┘    └───────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │CardController │
                 │   Singleton   │
                 └───────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌───────────────┐┌───────────────┐┌───────────────┐
│ParameterService││RenderingService││ Other Services│
│   Singleton   ││   Singleton   ││               │
└───────┬───────┘└───────┬───────┘└───────────────┘
        │                │
        │                ▼
        │         ┌───────────────┐
        │         │  Components   │
        │         │   Lifecycle   │
        │         └───────┬───────┘
        │                 │
        └─────────────────▼
                 ┌───────────────┐
                 │    Render     │
                 │               │
                 └───────────────┘
```

## State Consumer Hierarchy

- `BaseLayout` (abstract)
  - `InventreeCard` (main entry)
  - `GridLayout` (part grid view)
  - `ListLayout` (part list view)
  - `PartsLayout` (grouped parts view)
  - `DebugView` (debugging tools)
    - `DataFlowDebug` (data flow visualization)

## Key State Flows

### 1. Initialization Flow

1. `InventreeCard` is created and loaded by HASS
2. `setConfig()` is called by HASS with card configuration
3. Configuration is passed to `CardController` singleton
4. `setHass()` is called with Home Assistant instance
5. `CardController` initializes all services:
   - `ParameterService`
   - `RenderingService`
   - `WebSocketPlugin` (if configured)
   - `InvenTreeDirectAPI` (if configured)
6. Data is loaded from HASS entities
7. Initial render is triggered

### 2. Data Update Flow

#### From HASS:
1. HASS entity state changes
2. Changes detected in `setHass()` method
3. Data stored in `InventTreeState` singleton
4. Events dispatched: `inventree-entity-updated`
5. Components respond to events and re-render

#### From WebSocket:
1. WebSocket message received
2. `WebSocketPlugin` processes message
3. Parameter updates applied to parts
4. Updates stored in `InventTreeState`
5. Events dispatched: `inventree-parameter-updated`
6. Components respond to events and re-render

### 3. Render Pipeline Flow

1. Update event triggers `requestUpdate()` on component
2. Component calls `_renderingService.forceRender()`
3. Filtering applied via `_applyParameterFiltering()`
4. `RenderingService` throttles renders to maintain performance
5. Render callbacks executed at appropriate time
6. Timing metrics collected and reported

## Current Singleton Dependencies

```
BaseLayout
├── InventTreeState
├── CacheService
├── RenderingService
├── ParameterService
└── TimerManager

CardController
├── InventTreeState
├── RenderingService
├── WebSocketService/Plugin
├── ParameterService
└── CacheService
```

## Key State Objects

### 1. Part Data

- Stored in `InventTreeState._webSocketData`, `_apiData`, and `_hassData` maps
- Keyed by entity ID
- Tagged with source (`'websocket'`, `'api'`, or `'hass'`)
- Priority can be configured (`_prioritySource`)
- Includes parameter data when available

### 2. UI State

- Currently distributed across components as local state
- Layout configuration in `InventreeCardConfig`
- Visual modifiers managed by `ParameterService`
- Render timing tracked by `RenderingService`

### 3. Connectivity State

- WebSocket connection managed by `WebSocketPlugin`
- Connection states: DISCONNECTED, CONNECTING, CONNECTED, etc.
- Connection metrics tracked for diagnostics

## Current Redux Implementation Status

The application has started implementing Redux:

- Store configured with basic middleware
- Initial slices defined:
  - `partsSlice`: Store and update parts by entity
  - `parametersSlice`: Handle parameter definition and evaluation
  - `uiSlice`: Manage UI state and configurations
  - `counterSlice`: Simple sample slice
- Custom hooks defined in `hooks.ts`
- Not yet integrated with components or services

## Challenges for Migration

1. **Deep Singleton Integration**: Components and services are tightly coupled to singletons
2. **Complex State Relationships**: Parts reference each other, parameters cross-reference
3. **Real-time Updates**: WebSocket and API updates need careful coordination
4. **Performance Requirements**: Must maintain high performance during transitions
5. **Lifecycle Management**: Current lifecycle depends on singleton initialization order

## Opportunities for Improvement

1. **Clearer Data Flow**: Redux provides unidirectional data flow
2. **Better Testability**: Reducers and selectors are pure functions
3. **Time-Travel Debugging**: Redux DevTools enables powerful debugging
4. **Component Isolation**: Removes need for direct singleton access
5. **TypeScript Integration**: Better type checking with redux-toolkit 