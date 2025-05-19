# System-Level Analysis

## Circular Dependencies

No circular dependencies detected! 🎉

## Component Coupling Matrix

Higher numbers indicate stronger coupling (more calls between components).

| Component | adapters | components | core | editors | hooks | index.ts | inventree-card.ts | services | store | styles | types | types.d.ts | utils |
|-----------|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **adapters** | 0 | 15 (1.2) | 47 (1.7) | 0 (0) | 0 (0) | 0 (0) | 7 (0.8) | 18 (1.3) | 5 (0.7) | 0 (0) | 0 (0) | 0 (0) | 3 (0.5) |
| **components** | 111 (2) | 0 | 265 (2.4) | 0 (0) | 0 (0) | 0 (0) | 1 (0) | 140 (2.1) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 23 (1.4) |
| **core** | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 44 (1.6) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **editors** | 3 (0.5) | 6 (0.8) | 13 (1.1) | 0 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 9 (1) |
| **hooks** | 0 (0) | 2 (0.3) | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) | 6 (0.8) | 3 (0.5) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **index.ts** | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| **inventree-card.ts** | 48 (1.7) | 13 (1.1) | 83 (1.9) | 0 (0) | 0 (0) | 0 (0) | 0 | 18 (1.3) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 1 (0) |
| **services** | 71 (1.9) | 5 (0.7) | 289 (2.5) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 15 (1.2) |
| **store** | 5 (0.7) | 7 (0.8) | 12 (1.1) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 1 (0) | 0 | 0 (0) | 0 (0) | 1 (0) | 8 (0.9) |
| **styles** | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) | 0 (0) |
| **types** | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 | 0 (0) | 0 (0) |
| **types.d.ts** | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 | 0 (0) |
| **utils** | 20 (1.3) | 0 (0) | 74 (1.9) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 72 (1.9) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 0 |

## Most Imported Modules

| Module | Import Count |
|--------|-------------|
| ../.. | 89 |
| ../core | 35 |
| ../utils | 28 |
| ./components | 23 |
| ./services | 18 |
| ../store | 16 |
| ./adapters | 14 |
| ./feature-flags | 10 |
| ../common | 8 |
| ../components | 7 |
| ./state-adapter | 7 |
| ../services | 6 |
| ./core | 5 |
| ./slices | 5 |
| ./parameter-service | 4 |
| ./cache | 4 |
| ../index | 4 |
| ./base-layout | 3 |
| ./utils | 3 |
| ./api | 3 |

## Top 20 Most Complex Functions

| Function | File | Complexity | Length | Parameters |
|----------|------|------------|--------|------------|
| `setDebugConfig` | utils/logger.legacy.ts | 52 | 3045 | 1 |
| `setDebugConfig` | utils/logger.ts | 52 | 3045 | 1 |
| `_renderPartWithSize` | components/list/list-layout.ts | 45 | 5192 | 2 |
| `log` | utils/logger.legacy.ts | 41 | 3381 | 4 |
| `log` | utils/logger.ts | 41 | 3381 | 4 |
| `log` | core/logger.ts | 41 | 420 | 3 |
| `_loadData` | components/common/base-layout.ts | 37 | 6248 | 0 |
| `parseState` | utils/helpers.ts | 35 | 2827 | 2 |
| `_renderPartsConfig` | editors/editor.ts | 33 | 8389 | 0 |
| `_valueChanged` | editors/editor.ts | 32 | 4536 | 1 |
| `handleClick` | components/part/part-buttons.ts | 29 | 5138 | 1 |
| `_renderActionValueInput` | editors/editor.ts | 25 | 4229 | 0 |
| `_processHassEntities` | services/websocket.ts | 23 | 5757 | 1 |
| `compareFilterValues` | services/parameter-service.ts | 23 | 1452 | 3 |
| `_renderDirectApiConfig` | editors/editor.ts | 22 | 6156 | 0 |
| `handleWebSocketMessage` | services/card-controller.ts | 22 | 4813 | 1 |
| `getButtonConfig` | components/part/part-buttons.ts | 22 | 2188 | 0 |
| `getButtonConfig` | components/grid/grid-layout.ts | 22 | 1415 | 0 |
| `_renderDataFlowDiagram` | components/common/data-flow-debug.ts | 21 | 3116 | 0 |
| `setTimeout` | utils/timer-manager.ts | 20 | 4547 | 4 |

## Top 20 Global Bottleneck Functions

| Function | Incoming Calls | Unique Callers | Bottleneck Score |
|----------|---------------|---------------|----------------|
| `log` | 91 | 33 | 3003 |
| `getFeatureFlag` | 33 | 20 | 660 |
| `getInstance` | 29 | 17 | 493 |
| `trackUsage` | 30 | 14 | 420 |
| `getState` | 19 | 11 | 209 |
| `dispatch` | 14 | 14 | 196 |
| `requestUpdate` | 13 | 10 | 130 |
| `warn` | 11 | 10 | 110 |
| `error` | 11 | 8 | 88 |
| `_loadData` | 10 | 7 | 70 |
| `setFeatureFlag` | 16 | 4 | 64 |
| `forEach` | 9 | 7 | 63 |
| `getNewestData` | 9 | 7 | 63 |
| `filter` | 12 | 4 | 48 |
| `_updateLayoutProps` | 9 | 4 | 36 |
| `stringify` | 11 | 3 | 33 |
| `has` | 8 | 4 | 32 |
| `map` | 8 | 4 | 32 |
| `set` | 6 | 5 | 30 |
| `push` | 6 | 5 | 30 |
