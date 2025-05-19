# File Analysis: services/card-controller.ts

## Overview

- **Line Count:** 671
- **Function Count:** 16
- **Imports:** 10 modules
  - From `custom-card-helpers`: HomeAssistant
  - From `../core/types`: InventreeCardConfig, InventreeItem
  - From `../utils/logger`: Logger
  - From `./websocket`: WebSocketService
  - From `./api`: InvenTreeDirectAPI
  - From `./parameter-service`: ParameterService
  - From `./websocket-plugin`: WebSocketPlugin
  - From `./rendering-service`: RenderingService
  - From `./cache`: CacheService, CacheCategory, DEFAULT_TTL
  - From `../core/inventree-state`: InventTreeState
- **Exports:** 0 items

## Functions Defined (16)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 86 | `getInstance` | method | public | none | CardController | 231 |
| 106 | `setConfig` | method | public | config: InventreeCardConfig | void | 1478 |
| 150 | `setHass` | method | public | hass: HomeAssistant | void | 873 |
| 182 | `initializeServices` | method | public | none | void | 2813 |
| 266 | `initializeApi` | method | public | none | void | 1427 |
| 316 | `loadEntityData` | method | public | entityId: string | void | 1660 |
| 364 | `getParts` | method | public | none | InventreeItem[] | 311 |
| 374 | `getParameterService` | method | public | none | ParameterService | null | 196 |
| 382 | `getRenderingService` | method | public | none | RenderingService | 140 |
| 389 | `getWebSocketService` | method | public | none | WebSocketService | 162 |
| 396 | `initializeWebSocketPlugin` | method | public | none | void | 3616 |
| 491 | `handleWebSocketMessage` | method | public | message: any | void | 4813 |
| 600 | `getWebSocketDiagnostics` | method | public | none | any | 455 |
| 617 | `subscribeToEntityChanges` | method | public | entityId: string, callback: () => void | () => void | 494 |
| 632 | `getWebSocketPlugin` | method | public | none | WebSocketPlugin | 134 |
| 639 | `resetApiFailures` | method | public | none | void | 1144 |

## Outgoing Calls (47 unique functions)

### From `setConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 106, 115, 121, 130 |
| `initializeServices` | 1 | 119 |
| `loadEntityData` | 1 | 136 |
| `setupRendering` | 1 | 142 |

### From `setHass`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 156 |
| `setHass` | 1 | 156 |
| `log` | 2 | 160, 166 |
| `initializeServices` | 1 | 164 |
| `loadEntityData` | 1 | 174 |

### From `initializeServices`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 182, 206, 212, 254 |
| `warn` | 1 | 188 |
| `getInstance` | 3 | 197, 206, 234 |
| `setHass` | 1 | 197 |
| `hasInstance` | 1 | 205 |
| `initialize` | 1 | 212 |
| `setConfig` | 1 | 221 |
| `error` | 1 | 224 |
| `setupRendering` | 1 | 237 |
| `initializeApi` | 1 | 244 |
| `initializeWebSocketPlugin` | 1 | 252 |

### From `initializeApi`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 266, 299 |
| `warn` | 1 | 272 |
| `error` | 2 | 280, 305 |
| `setParameterService` | 1 | 296 |
| `setDirectApi` | 1 | 297 |

### From `loadEntityData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 320 |
| `registerEntityOfInterest` | 1 | 320 |
| `isInitialDataLoaded` | 1 | 327 |
| `log` | 2 | 327, 341 |
| `setHassData` | 1 | 338 |
| `markInitialDataLoaded` | 1 | 340 |
| `warn` | 2 | 347, 353 |

### From `getParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 366 |
| `getNewestData` | 1 | 368 |

### From `getWebSocketService`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 390 |

### From `initializeWebSocketPlugin`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 6 | 398, 416, 422, 439, 444, 480 |
| `endsWith` | 1 | 412 |
| `slice` | 1 | 413 |
| `replace` | 3 | 416, 439, 439 |
| `error` | 1 | 429 |
| `startsWith` | 2 | 438, 438 |
| `getInstance` | 1 | 452 |
| `configure` | 1 | 462 |
| `onMessage` | 1 | 472 |
| `handleWebSocketMessage` | 1 | 475 |
| `connect` | 1 | 477 |

### From `handleWebSocketMessage`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 5 | 491, 512, 521, 532, 542 |
| `substring` | 1 | 492 |
| `stringify` | 1 | 492 |
| `includes` | 1 | 499 |
| `has` | 1 | 512 |
| `set` | 1 | 518 |
| `getInstance` | 1 | 529 |
| `isDirectPartReference` | 1 | 532 |
| `isApiConnected` | 1 | 532 |
| `catch` | 1 | 537 |
| `then` | 1 | 537 |
| `getParameterValueWithDirectReference` | 1 | 537 |
| `error` | 1 | 549 |
| `dispatchEvent` | 2 | 554, 572 |
| `updateParameter` | 1 | 570 |
| `warn` | 1 | 583 |
| `storeOrphanedParameter` | 1 | 587 |

### From `getWebSocketDiagnostics`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 2 | 601, 602 |
| `getConnectionStatus` | 1 | 605 |
| `getApiStatus` | 1 | 606 |
| `getStats` | 1 | 607 |

### From `subscribeToEntityChanges`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 620 |
| `subscribeToEntity` | 1 | 626 |
| `getWebSocketService` | 1 | 626 |

### From `resetApiFailures`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `logApiStats` | 2 | 641, 654 |
| `log` | 1 | 649 |
| `error` | 1 | 658 |
| `warn` | 1 | 664 |


## Incoming Calls (120 calls from other files)

### To `getInstance`

| Caller | File | Line |
|--------|------|------|
| `_updateListLayoutProps` | adapters/list-layout-adapter.ts | 107 |
| `_updateListLayoutProps` | adapters/list-layout-adapter.ts | 114 |
| `ReduxLitMixin` | adapters/redux-lit-mixin.ts | 43 |
| `getParts` | adapters/state-adapter.ts | 58 |
| `getPartById` | adapters/state-adapter.ts | 85 |
| `updateParameter` | adapters/state-adapter.ts | 109 |
| `updateParameter` | adapters/state-adapter.ts | 116 |
| `getDataSourcePriority` | adapters/state-adapter.ts | 139 |
| `setDataSourcePriority` | adapters/state-adapter.ts | 158 |
| `render` | components/common/base-layout-view.ts | 129 |
| `render` | components/common/base-layout-view.ts | 130 |
| `_debugResetState` | components/common/base-layout-view.ts | 320 |
| `_debugResetState` | components/common/base-layout-view.ts | 323 |
| `_debugFixData` | components/common/base-layout-view.ts | 345 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 239 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 249 |
| `_safeGetParameterService` | components/common/base-layout.ts | 273 |
| `_safeGetParameterService` | components/common/base-layout.ts | 278 |
| `_safeGetParameterService` | components/common/base-layout.ts | 291 |
| `_loadData` | components/common/base-layout.ts | 375 |
| `_loadData` | components/common/base-layout.ts | 401 |
| `_loadData` | components/common/base-layout.ts | 419 |
| `_loadData` | components/common/base-layout.ts | 420 |
| `getParts` | components/common/base-layout.ts | 766 |
| `updateFilteredParts` | components/common/base-layout.ts | 1065 |
| `updateFilteredParts` | components/common/base-layout.ts | 1066 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 328 |
| `_debugClearCache` | components/common/data-flow-debug.ts | 427 |
| `_renderWebSocketDiagnostics` | components/common/data-flow-debug.ts | 522 |
| `_renderCacheStats` | components/common/data-flow-debug.ts | 582 |
| `_debugClearCache` | components/common/debug-view.ts | 782 |
| `_debugClearCache` | components/common/debug-view.ts | 783 |
| `_renderPartsDebug` | components/common/debug-view.ts | 985 |
| `_handleWebSocketEvent` | components/common/debug-view.ts | 1173 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1191 |
| `_getLastSourceUpdate` | components/common/debug-view.ts | 1228 |
| `_updateCacheStats` | components/common/debug-view.ts | 1243 |
| `_renderWebSocketStatus` | components/common/debug-view.ts | 1388 |
| `_sendPing` | components/common/debug-view.ts | 1428 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1440 |
| `_renderRawEntityData` | components/common/debug-view.ts | 1537 |
| `_renderOrphanedPartsData` | components/common/debug-view.ts | 1641 |
| `_getParameterService` | components/common/debug-view.ts | 1700 |
| `_handleClearCache` | components/common/debug-view.ts | 1773 |
| `_handleClearCache` | components/common/debug-view.ts | 1774 |
| `_renderCacheStats` | components/common/debug-view.ts | 1895 |
| `processItems` | components/common/variant-handler.ts | 22 |
| `processItems` | components/common/variant-handler.ts | 124 |
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 66 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 485 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 131 |
| `render` | components/list/list-layout.ts | 189 |
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 41 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 84 |
| `_updateSubsystem` | editors/editor.ts | 2472 |
| `_clearEntitySubscriptions` | inventree-card.ts | 494 |
| `_clearEntitySubscriptions` | inventree-card.ts | 523 |
| `_clearEntitySubscriptions` | inventree-card.ts | 547 |
| `render` | inventree-card.ts | 696 |
| `_initializeServices` | inventree-card.ts | 1555 |
| `_initializeServices` | inventree-card.ts | 1556 |
| `_initializeServices` | inventree-card.ts | 1557 |
| `_initializeServices` | inventree-card.ts | 1558 |
| `_renderDebugTestPattern` | inventree-card.ts | 1702 |
| `_renderDebugTestPattern` | inventree-card.ts | 1704 |
| `_setupDebugMode` | inventree-card.ts | 1739 |
| `_handleServiceInitialization` | inventree-card.ts | 1791 |
| `matchesConditionSyncVersion` | services/parameter-service.ts | 216 |
| `getParameterValueFromPart` | services/parameter-service.ts | 460 |
| `getParameterValueWithDirectReference` | services/parameter-service.ts | 486 |
| `findEntityForPart` | services/parameter-service.ts | 512 |
| `storeOrphanedParameter` | services/parameter-service.ts | 521 |
| `isOrphanedPart` | services/parameter-service.ts | 529 |
| `getOrphanedPartIds` | services/parameter-service.ts | 537 |
| `getOrphanedPartParameters` | services/parameter-service.ts | 545 |
| `findParameterInWebSocketData` | services/parameter-service.ts | 553 |
| `findParameterInApiData` | services/parameter-service.ts | 561 |
| `findParameterInHassData` | services/parameter-service.ts | 569 |
| `findParameterInAllEntities` | services/parameter-service.ts | 577 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 686 |
| `getParameterFromEntity` | services/parameter-service.ts | 717 |
| `processVariants` | services/variant-service.ts | 73 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 735 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 739 |
| `loggingMiddleware` | store/middleware/logging-middleware.ts | 17 |
| `servicesMiddleware` | store/middleware/services-middleware.ts | 15 |
| `servicesMiddleware` | store/middleware/services-middleware.ts | 26 |
| `servicesMiddleware` | store/middleware/services-middleware.ts | 48 |
| `safelyRegisterElement` | utils/custom-element-registry.ts | 15 |

### To `getParts`

| Caller | File | Line |
|--------|------|------|
| `render` | components/common/base-layout-view.ts | 132 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 250 |
| `_loadData` | components/common/base-layout.ts | 402 |
| `_loadData` | components/common/base-layout.ts | 419 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 607 |
| `render` | components/list/list-layout.ts | 190 |
| `render` | inventree-card.ts | 683 |
| `render` | inventree-card.ts | 721 |
| `render` | inventree-card.ts | 759 |
| `render` | inventree-card.ts | 778 |
| `render` | inventree-card.ts | 785 |
| `render` | inventree-card.ts | 792 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1344 |
| `_renderDebugTestPattern` | inventree-card.ts | 1675 |

### To `getParameterService`

| Caller | File | Line |
|--------|------|------|
| `_safeGetParameterService` | components/common/base-layout.ts | 279 |
| `_handleStockAdjustment` | inventree-card.ts | 1087 |
| `updateCrossEntityParameter` | inventree-card.ts | 1288 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1345 |

### To `getWebSocketPlugin`

| Caller | File | Line |
|--------|------|------|
| `_renderWebSocketDiagnostics` | components/common/data-flow-debug.ts | 526 |
| `_handleWebSocketEvent` | components/common/debug-view.ts | 1174 |
| `_renderWebSocketStatus` | components/common/debug-view.ts | 1389 |
| `_sendPing` | components/common/debug-view.ts | 1429 |
| `connectedCallback` | inventree-card.ts | 1471 |

### To `setConfig`

| Caller | File | Line |
|--------|------|------|
| `setConfig` | inventree-card.ts | 394 |
| `updated` | inventree-card.ts | 612 |
| `requestUpdate` | inventree-card.ts | 1591 |

### To `getWebSocketDiagnostics`

| Caller | File | Line |
|--------|------|------|
| `_runApiDiagnostics` | inventree-card.ts | 1837 |

### To `resetApiFailures`

| Caller | File | Line |
|--------|------|------|
| `_runApiDiagnostics` | inventree-card.ts | 1845 |

### To `setHass`

| Caller | File | Line |
|--------|------|------|
| `setHass` | services/state.ts | 32 |
| `setHass` | services/websocket.ts | 59 |
| `updateHass` | services/websocket.ts | 115 |


## File Dependencies

### Direct Dependencies (9)

- ../core/types
- ../utils/logger
- ./websocket
- ./api
- ./parameter-service
- ./websocket-plugin
- ./rendering-service
- ./cache
- ../core/inventree-state

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `handleWebSocketMessage` | 4813 | 1 | 1 |
| 2 | `initializeWebSocketPlugin` | 3616 | 1 | 0 |
| 3 | `initializeServices` | 2813 | 2 | 0 |
| 4 | `loadEntityData` | 1660 | 2 | 1 |
| 5 | `setConfig` | 1478 | 4 | 1 |
| 6 | `initializeApi` | 1427 | 1 | 0 |
| 7 | `resetApiFailures` | 1144 | 1 | 0 |
| 8 | `setHass` | 873 | 5 | 1 |
| 9 | `subscribeToEntityChanges` | 494 | 0 | 2 |
| 10 | `getWebSocketDiagnostics` | 455 | 1 | 0 |
| 11 | `getParts` | 311 | 14 | 0 |
| 12 | `getInstance` | 231 | 100 | 0 |
| 13 | `getParameterService` | 196 | 4 | 0 |
| 14 | `getWebSocketService` | 162 | 1 | 0 |
| 15 | `getRenderingService` | 140 | 0 | 0 |
| 16 | `getWebSocketPlugin` | 134 | 5 | 0 |
