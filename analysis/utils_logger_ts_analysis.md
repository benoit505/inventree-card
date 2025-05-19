# File Analysis: utils/logger.ts

## Overview

- **Line Count:** 671
- **Function Count:** 25
- **Imports:** 0 modules
- **Exports:** 0 items

## Functions Defined (25)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 124 | `getInstance` | method | public | none | Logger | 145 |
| 134 | `isEnabled` | method | public | system: string, subsystem: string | boolean | 1065 |
| 168 | `anyCategoryEnabled` | method | public | none | boolean | 208 |
| 177 | `getNextSequence` | method | public | none | number | 130 |
| 184 | `setDebug` | method | public | debug: boolean | void | 553 |
| 202 | `setVerboseMode` | method | public | verbose: boolean | void | 527 |
| 217 | `setDebugConfig` | method | public | config: any | void | 3045 |
| 274 | `processHierarchicalConfig` | method | public | config: any | void | 1127 |
| 309 | `formatSystemStatus` | method | public | system: string | string | 651 |
| 333 | `setLogLevel` | method | public | level: 'none' | 'error' | 'warn' | 'info' | 'debug' | void | 149 |
| 340 | `setCategoryDebug` | method | public | category: string, enabled: boolean | void | 367 |
| 352 | `setSubsystemDebug` | method | public | system: string, subsystem: string, enabled: boolean | void | 655 |
| 370 | `isDuplicate` | method | public | key: string | boolean | 637 |
| 396 | `pruneRecentLogs` | method | public | none | void | 305 |
| 409 | `log` | method | public | component: string, message: string, options: any, restArgs: any[] | void | 3381 |
| 494 | `info` | method | public | component: string, message: string, args: any[] | void | 1460 |
| 532 | `warn` | method | public | component: string, message: string, args: any[] | void | 920 |
| 556 | `error` | method | public | component: string, message: string, args: any[] | void | 1389 |
| 588 | `startPerformance` | method | public | label: string | number | 126 |
| 595 | `endPerformance` | method | public | component: string, message: string, startTime: number, options: { 
    category?: string, 
    subsystem?: string 
  } | void | 352 |
| 609 | `resetDebugConfig` | method | public | none | void | 615 |
| 632 | `setEnabled` | method | public | category: string, enabled: boolean | void | 202 |
| 639 | `getSystemsStatus` | method | public | none | Record<string, any> | 423 |
| 657 | `getSubsystems` | method | public | system: string | string[] | 239 |
| 668 | `isCategoryEnabled` | method | public | category: string | boolean | 142 |

## Outgoing Calls (31 unique functions)

### From `isEnabled`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `anyCategoryEnabled` | 1 | 136 |

### From `anyCategoryEnabled`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `some` | 1 | 169 |
| `keys` | 1 | 169 |

### From `setDebug`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `info` | 1 | 195 |

### From `setVerboseMode`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setDebug` | 1 | 204 |
| `info` | 1 | 209 |

### From `setDebugConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setDebug` | 1 | 221 |
| `setVerboseMode` | 3 | 225, 227, 236 |
| `anyCategoryEnabled` | 1 | 232 |
| `setCategoryDebug` | 8 | 239, 242, 243, 244, 245, 246, 247, 248 |
| `processHierarchicalConfig` | 1 | 252 |
| `info` | 1 | 254 |
| `formatSystemStatus` | 8 | 260, 261, 262, 263, 264, 265, 266, 267 |

### From `processHierarchicalConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setCategoryDebug` | 2 | 283, 291 |
| `setSubsystemDebug` | 1 | 297 |

### From `formatSystemStatus`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `join` | 1 | 321 |
| `filter` | 1 | 321 |
| `keys` | 1 | 321 |

### From `isDuplicate`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 371 |
| `get` | 1 | 374 |
| `set` | 1 | 380 |
| `pruneRecentLogs` | 1 | 386 |

### From `pruneRecentLogs`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 397 |
| `entries` | 1 | 398 |
| `delete` | 1 | 399 |

### From `log`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 412 |
| `isEnabled` | 1 | 423 |
| `isDuplicate` | 1 | 441 |
| `getNextSequence` | 1 | 446 |
| `now` | 3 | 447, 470, 484 |
| `groupCollapsed` | 1 | 456 |
| `log` | 6 | 460, 467, 469, 475, 481, 483 |
| `toFixed` | 4 | 468, 470, 482, 484 |
| `groupEnd` | 1 | 472 |

### From `info`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 496 |
| `shift` | 1 | 496 |
| `isEnabled` | 1 | 504 |
| `toFixed` | 3 | 508, 521, 523 |
| `now` | 3 | 508, 508, 523 |
| `getNextSequence` | 1 | 509 |
| `info` | 3 | 513, 520, 522 |

### From `warn`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 534 |
| `shift` | 1 | 534 |
| `toFixed` | 1 | 542 |
| `now` | 2 | 542, 542 |
| `getNextSequence` | 1 | 543 |
| `warn` | 1 | 547 |

### From `error`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 565 |
| `shift` | 1 | 566 |
| `toFixed` | 1 | 575 |
| `now` | 2 | 575, 575 |
| `getNextSequence` | 1 | 576 |
| `error` | 1 | 580 |

### From `startPerformance`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 589 |

### From `endPerformance`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 599 |
| `log` | 1 | 599 |

### From `resetDebugConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clear` | 1 | 621 |
| `info` | 1 | 624 |

### From `setEnabled`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setCategoryDebug` | 1 | 632 |

### From `getSubsystems`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `keys` | 1 | 662 |

### From `isCategoryEnabled`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isEnabled` | 1 | 669 |


## Incoming Calls (664 calls from other files)

### To `getInstance`

| Caller | File | Line |
|--------|------|------|
| `render` | components/common/base-layout-view.ts | 129 |
| `render` | components/common/base-layout-view.ts | 130 |
| `_debugResetState` | components/common/base-layout-view.ts | 320 |
| `_debugResetState` | components/common/base-layout-view.ts | 323 |
| `_debugFixData` | components/common/base-layout-view.ts | 345 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 290 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 300 |
| `_safeGetParameterService` | components/common/base-layout.ts | 324 |
| `_safeGetParameterService` | components/common/base-layout.ts | 329 |
| `_safeGetParameterService` | components/common/base-layout.ts | 342 |
| `_loadData` | components/common/base-layout.ts | 426 |
| `_loadData` | components/common/base-layout.ts | 452 |
| `_loadData` | components/common/base-layout.ts | 470 |
| `_loadData` | components/common/base-layout.ts | 471 |
| `getParts` | components/common/base-layout.ts | 817 |
| `updateFilteredParts` | components/common/base-layout.ts | 1106 |
| `updateFilteredParts` | components/common/base-layout.ts | 1107 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 328 |
| `_debugClearCache` | components/common/data-flow-debug.ts | 427 |
| `_renderWebSocketDiagnostics` | components/common/data-flow-debug.ts | 522 |
| `_renderCacheStats` | components/common/data-flow-debug.ts | 582 |
| `_debugClearCache` | components/common/debug-view.ts | 782 |
| `_debugClearCache` | components/common/debug-view.ts | 783 |
| `_renderPartsDebug` | components/common/debug-view.ts | 985 |
| `_handleWebSocketEvent` | components/common/debug-view.ts | 1168 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1186 |
| `_getLastSourceUpdate` | components/common/debug-view.ts | 1223 |
| `_updateCacheStats` | components/common/debug-view.ts | 1238 |
| `_renderWebSocketStatus` | components/common/debug-view.ts | 1383 |
| `_sendPing` | components/common/debug-view.ts | 1423 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1435 |
| `_renderRawEntityData` | components/common/debug-view.ts | 1532 |
| `_renderOrphanedPartsData` | components/common/debug-view.ts | 1636 |
| `_getParameterService` | components/common/debug-view.ts | 1695 |
| `_handleClearCache` | components/common/debug-view.ts | 1768 |
| `_handleClearCache` | components/common/debug-view.ts | 1769 |
| `_renderCacheStats` | components/common/debug-view.ts | 1890 |
| `processItems` | components/common/variant-handler.ts | 22 |
| `processItems` | components/common/variant-handler.ts | 124 |
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 66 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 480 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 134 |
| `render` | components/list/list-layout.ts | 192 |
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 41 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 84 |
| `_updateSubsystem` | editors/editor.ts | 2368 |
| `_clearEntitySubscriptions` | inventree-card.ts | 457 |
| `_clearEntitySubscriptions` | inventree-card.ts | 486 |
| `_clearEntitySubscriptions` | inventree-card.ts | 510 |
| `render` | inventree-card.ts | 648 |
| `connectedCallback` | inventree-card.ts | 1322 |
| `connectedCallback` | inventree-card.ts | 1332 |
| `connectedCallback` | inventree-card.ts | 1336 |
| `connectedCallback` | inventree-card.ts | 1364 |
| `connectedCallback` | inventree-card.ts | 1405 |
| `_handleServiceInitialization` | inventree-card.ts | 1457 |
| `_initializeServices` | inventree-card.ts | 1596 |
| `_initializeServices` | inventree-card.ts | 1611 |
| `_initializeServices` | inventree-card.ts | 1612 |
| `_initializeServices` | inventree-card.ts | 1613 |
| `_initializeServices` | inventree-card.ts | 1614 |
| `_renderDebugTestPattern` | inventree-card.ts | 1731 |
| `_renderDebugTestPattern` | inventree-card.ts | 1733 |
| `_setupDebugMode` | inventree-card.ts | 1768 |
| `setHass` | services/card-controller.ts | 156 |
| `initializeServices` | services/card-controller.ts | 197 |
| `initializeServices` | services/card-controller.ts | 206 |
| `initializeServices` | services/card-controller.ts | 234 |
| `loadEntityData` | services/card-controller.ts | 320 |
| `getParts` | services/card-controller.ts | 366 |
| `getWebSocketService` | services/card-controller.ts | 390 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 452 |
| `handleWebSocketMessage` | services/card-controller.ts | 529 |
| `getWebSocketDiagnostics` | services/card-controller.ts | 601 |
| `getWebSocketDiagnostics` | services/card-controller.ts | 602 |
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
| `_handleParameterUpdate` | services/websocket-plugin.ts | 726 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 730 |

### To `log`

| Caller | File | Line |
|--------|------|------|
| `_debugLoadData` | components/common/base-layout-view.ts | 284 |
| `_debugForceFilter` | components/common/base-layout-view.ts | 294 |
| `_debugResetState` | components/common/base-layout-view.ts | 312 |
| `_debugFixData` | components/common/base-layout-view.ts | 338 |
| `_debugFixData` | components/common/base-layout-view.ts | 350 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 285 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 293 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 303 |
| `_safeGetParameterService` | components/common/base-layout.ts | 331 |
| `_safeGetParameterService` | components/common/base-layout.ts | 342 |
| `_loadData` | components/common/base-layout.ts | 373 |
| `_loadData` | components/common/base-layout.ts | 387 |
| `_loadData` | components/common/base-layout.ts | 406 |
| `_loadData` | components/common/base-layout.ts | 411 |
| `_loadData` | components/common/base-layout.ts | 446 |
| `_loadData` | components/common/base-layout.ts | 453 |
| `_loadData` | components/common/base-layout.ts | 459 |
| `_loadData` | components/common/base-layout.ts | 464 |
| `_loadData` | components/common/base-layout.ts | 466 |
| `_loadData` | components/common/base-layout.ts | 467 |
| `_loadData` | components/common/base-layout.ts | 470 |
| `_loadData` | components/common/base-layout.ts | 471 |
| `_loadData` | components/common/base-layout.ts | 480 |
| `_loadData` | components/common/base-layout.ts | 486 |
| `_loadData` | components/common/base-layout.ts | 495 |
| `_loadData` | components/common/base-layout.ts | 504 |
| `_loadData` | components/common/base-layout.ts | 506 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 531 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 537 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 548 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 560 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 581 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 602 |
| `filterParts` | components/common/base-layout.ts | 619 |
| `filterParts` | components/common/base-layout.ts | 635 |
| `filterParts` | components/common/base-layout.ts | 648 |
| `filterParts` | components/common/base-layout.ts | 664 |
| `filterParts` | components/common/base-layout.ts | 672 |
| `filterParts` | components/common/base-layout.ts | 683 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 698 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 709 |
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 742 |
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 755 |
| `subscribeToState` | components/common/base-layout.ts | 877 |
| `subscribeToState` | components/common/base-layout.ts | 891 |
| `subscribeToState` | components/common/base-layout.ts | 912 |
| `connectedCallback` | components/common/base-layout.ts | 933 |
| `_scheduleParameterServiceRetry` | components/common/base-layout.ts | 961 |
| `_scheduleParameterServiceRetry` | components/common/base-layout.ts | 966 |
| `disconnectedCallback` | components/common/base-layout.ts | 1006 |
| `requestUpdate` | components/common/base-layout.ts | 1035 |
| `reportRenderTiming` | components/common/base-layout.ts | 1066 |
| `updateFilteredParts` | components/common/base-layout.ts | 1101 |
| `updateFilteredParts` | components/common/base-layout.ts | 1113 |
| `updateFilteredParts` | components/common/base-layout.ts | 1151 |
| `_addTraceEntry` | components/common/data-flow-debug.ts | 320 |
| `_debugForceRedraw` | components/common/debug-view.ts | 757 |
| `_debugRefreshData` | components/common/debug-view.ts | 765 |
| `_debugClearCache` | components/common/debug-view.ts | 775 |
| `processItems` | components/common/variant-handler.ts | 15 |
| `processItems` | components/common/variant-handler.ts | 41 |
| `processItems` | components/common/variant-handler.ts | 45 |
| `processItems` | components/common/variant-handler.ts | 78 |
| `processItems` | components/common/variant-handler.ts | 83 |
| `processItems` | components/common/variant-handler.ts | 120 |
| `connectedCallback` | components/grid/grid-layout.ts | 83 |
| `_setupParameterListener` | components/grid/grid-layout.ts | 121 |
| `_setupEntityListener` | components/grid/grid-layout.ts | 129 |
| `_setupEntityListener` | components/grid/grid-layout.ts | 139 |
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 170 |
| `_setupIdleRenderTimer` | components/grid/grid-layout.ts | 192 |
| `_setupIdleRenderTimer` | components/grid/grid-layout.ts | 202 |
| `_handleWebSocketOpen` | components/grid/grid-layout.ts | 208 |
| `_sendWebSocketAuthentication` | components/grid/grid-layout.ts | 232 |
| `_sendWebSocketSubscription` | components/grid/grid-layout.ts | 245 |
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 254 |
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 258 |
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 274 |
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 299 |
| `disconnectedCallback` | components/grid/grid-layout.ts | 362 |
| `_handleParameterChange` | components/grid/grid-layout.ts | 402 |
| `forceImmediateFilter` | components/grid/grid-layout.ts | 409 |
| `_filterParts` | components/grid/grid-layout.ts | 430 |
| `updated` | components/grid/grid-layout.ts | 498 |
| `updated` | components/grid/grid-layout.ts | 506 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 595 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 603 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 615 |
| `render` | components/grid/grid-layout.ts | 629 |
| `_handleResetFilters` | components/grid/grid-layout.ts | 780 |
| `connectedCallback` | components/list/list-layout.ts | 50 |
| `connectedCallback` | components/list/list-layout.ts | 51 |
| `connectedCallback` | components/list/list-layout.ts | 58 |
| `connectedCallback` | components/list/list-layout.ts | 60 |
| `updated` | components/list/list-layout.ts | 74 |
| `updated` | components/list/list-layout.ts | 75 |
| `updated` | components/list/list-layout.ts | 85 |
| `updated` | components/list/list-layout.ts | 87 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 104 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 115 |
| `render` | components/list/list-layout.ts | 143 |
| `render` | components/list/list-layout.ts | 162 |
| `render` | components/list/list-layout.ts | 172 |
| `render` | components/list/list-layout.ts | 181 |
| `render` | components/list/list-layout.ts | 183 |
| `render` | components/list/list-layout.ts | 193 |
| `render` | components/list/list-layout.ts | 199 |
| `render` | components/list/list-layout.ts | 204 |
| `render` | components/list/list-layout.ts | 206 |
| `updated` | components/part/part-buttons.ts | 58 |
| `updated` | components/part/part-buttons.ts | 59 |
| `updated` | components/part/part-buttons.ts | 60 |
| `updated` | components/part/part-container.ts | 167 |
| `updated` | components/part/part-container.ts | 188 |
| `updated` | components/part/part-container.ts | 193 |
| `render` | components/part/part-container.ts | 203 |
| `render` | components/part/part-container.ts | 204 |
| `render` | components/part/part-container.ts | 210 |
| `render` | components/part/part-container.ts | 217 |
| `updated` | components/part/part-variant.ts | 28 |
| `logVariantDetails` | components/part/part-variant.ts | 40 |
| `logVariantDetails` | components/part/part-variant.ts | 49 |
| `logVariantDetails` | components/part/part-variant.ts | 51 |
| `logVariantDetails` | components/part/part-variant.ts | 52 |
| `logVariantDetails` | components/part/part-variant.ts | 54 |
| `logVariantDetails` | components/part/part-variant.ts | 56 |
| `logVariantDetails` | components/part/part-variant.ts | 57 |
| `render` | components/part/part-variant.ts | 62 |
| `render` | components/part/part-variant.ts | 65 |
| `render` | components/part/part-variant.ts | 77 |
| `renderGridView` | components/part/part-variant.ts | 94 |
| `renderListView` | components/part/part-variant.ts | 136 |
| `renderTreeView` | components/part/part-variant.ts | 188 |
| `updated` | components/part/part-view.ts | 121 |
| `updated` | components/part/part-view.ts | 125 |
| `render` | components/part/part-view.ts | 261 |
| `render` | components/part/part-view.ts | 266 |
| `render` | components/part/part-view.ts | 270 |
| `render` | components/part/part-view.ts | 272 |
| `_adjustStock` | components/part/part-view.ts | 378 |
| `_locateInWLED` | components/part/part-view.ts | 398 |
| `_printLabel` | components/part/part-view.ts | 418 |
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 50 |
| `_setupParameterListener` | components/variant/variant-layout.ts | 93 |
| `_setupEntityListener` | components/variant/variant-layout.ts | 101 |
| `_setupEntityListener` | components/variant/variant-layout.ts | 114 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 146 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 149 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 151 |
| `_setupIdleRenderTimer` | components/variant/variant-layout.ts | 182 |
| `_setupIdleRenderTimer` | components/variant/variant-layout.ts | 192 |
| `_handleWebSocketOpen` | components/variant/variant-layout.ts | 200 |
| `_sendWebSocketAuthentication` | components/variant/variant-layout.ts | 224 |
| `_sendWebSocketSubscription` | components/variant/variant-layout.ts | 237 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 258 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 284 |
| `_handleWebSocketClose` | components/variant/variant-layout.ts | 314 |
| `_handleWebSocketClose` | components/variant/variant-layout.ts | 330 |
| `_handleWebSocketClose` | components/variant/variant-layout.ts | 333 |
| `_handleParameterChange` | components/variant/variant-layout.ts | 395 |
| `_processVariants` | components/variant/variant-layout.ts | 467 |
| `setPriorityDataSource` | core/inventree-state.ts | 104 |
| `trackLastUpdate` | core/inventree-state.ts | 123 |
| `setWebSocketData` | core/inventree-state.ts | 146 |
| `setApiData` | core/inventree-state.ts | 164 |
| `setHassData` | core/inventree-state.ts | 182 |
| `registerEntityOfInterest` | core/inventree-state.ts | 195 |
| `setHass` | core/inventree-state.ts | 221 |
| `getNewestData` | core/inventree-state.ts | 360 |
| `updateParameter` | core/inventree-state.ts | 387 |
| `clearCache` | core/inventree-state.ts | 543 |
| `clearCache` | core/inventree-state.ts | 570 |
| `_repopulateParametersFromHass` | core/inventree-state.ts | 616 |
| `unregisterEntityOfInterest` | core/inventree-state.ts | 635 |
| `storeOrphanedParameter` | core/inventree-state.ts | 874 |
| `getActionButtons` | core/inventree-state.ts | 1029 |
| `disconnectedCallback` | editors/editor.ts | 624 |
| `_updateConfig` | editors/editor.ts | 652 |
| `render` | editors/editor.ts | 726 |
| `render` | editors/editor.ts | 738 |
| `render` | editors/editor.ts | 750 |
| `render` | editors/editor.ts | 762 |
| `_valueChanged` | editors/editor.ts | 1393 |
| `_addFilter` | editors/editor.ts | 1493 |
| `_addParameterFilter` | editors/editor.ts | 1527 |
| `_addParameterFilter` | editors/editor.ts | 1541 |
| `_addParameterFilter` | editors/editor.ts | 1543 |
| `_addParameterFilter` | editors/editor.ts | 1547 |
| `_setupEventListeners` | inventree-card.ts | 210 |
| `setConfig` | inventree-card.ts | 340 |
| `_setupEntitySubscriptions` | inventree-card.ts | 409 |
| `subscribe` | inventree-card.ts | 419 |
| `subscribe` | inventree-card.ts | 425 |
| `_clearEntitySubscriptions` | inventree-card.ts | 436 |
| `_clearEntitySubscriptions` | inventree-card.ts | 461 |
| `_clearEntitySubscriptions` | inventree-card.ts | 490 |
| `_clearEntitySubscriptions` | inventree-card.ts | 514 |
| `_clearEntitySubscriptions` | inventree-card.ts | 538 |
| `render` | inventree-card.ts | 582 |
| `render` | inventree-card.ts | 635 |
| `render` | inventree-card.ts | 649 |
| `render` | inventree-card.ts | 673 |
| `getParts` | inventree-card.ts | 824 |
| `getParts` | inventree-card.ts | 849 |
| `_handleStockAdjustment` | inventree-card.ts | 997 |
| `refreshParameterData` | inventree-card.ts | 1161 |
| `refreshParameterData` | inventree-card.ts | 1166 |
| `updateCrossEntityParameter` | inventree-card.ts | 1212 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1255 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1276 |
| `connectedCallback` | inventree-card.ts | 1316 |
| `connectedCallback` | inventree-card.ts | 1349 |
| `connectedCallback` | inventree-card.ts | 1365 |
| `connectedCallback` | inventree-card.ts | 1412 |
| `_handleServiceInitialization` | inventree-card.ts | 1430 |
| `_handleServiceInitialization` | inventree-card.ts | 1446 |
| `_handleServiceInitialization` | inventree-card.ts | 1457 |
| `_handleServiceInitialization` | inventree-card.ts | 1467 |
| `_runApiDiagnostics` | inventree-card.ts | 1506 |
| `_initializeServices` | inventree-card.ts | 1596 |
| `_initializeServices` | inventree-card.ts | 1602 |
| `_initializeServices` | inventree-card.ts | 1614 |
| `requestUpdate` | inventree-card.ts | 1640 |
| `disconnectedCallback` | inventree-card.ts | 1675 |
| `_setupDebugMode` | inventree-card.ts | 1753 |
| `getParameterValue` | services/api.ts | 112 |
| `getParameterValue` | services/api.ts | 124 |
| `getParameterValue` | services/api.ts | 131 |
| `getParameterValue` | services/api.ts | 142 |
| `getParameterValue` | services/api.ts | 156 |
| `getParameterValue` | services/api.ts | 189 |
| `getParameterValue` | services/api.ts | 202 |
| `getParameterValue` | services/api.ts | 210 |
| `getParameterValue` | services/api.ts | 222 |
| `getParameterValue` | services/api.ts | 227 |
| `getFallbackParameterValue` | services/api.ts | 247 |
| `testConnection` | services/api.ts | 290 |
| `testConnection` | services/api.ts | 308 |
| `testBasicAuth` | services/api.ts | 381 |
| `testBasicAuth` | services/api.ts | 396 |
| `testBasicAuth` | services/api.ts | 399 |
| `getPartParameters` | services/api.ts | 431 |
| `getPartParameters` | services/api.ts | 450 |
| `getPartParameters` | services/api.ts | 453 |
| `testBasicAuthWithEndpoint` | services/api.ts | 473 |
| `testBasicAuthWithEndpoint` | services/api.ts | 488 |
| `testBasicAuthWithEndpoint` | services/api.ts | 492 |
| `testConnectionExactFormat` | services/api.ts | 508 |
| `testParameterAPI` | services/api.ts | 567 |
| `logApiStats` | services/api.ts | 612 |
| `updateParameterDirectly` | services/api.ts | 621 |
| `updateParameterDirectly` | services/api.ts | 637 |
| `notifyParameterChanged` | services/api.ts | 696 |
| `notifyParameterChanged` | services/api.ts | 717 |
| `resetRateLimiting` | services/api.ts | 739 |
| `updateParameter` | services/api.ts | 751 |
| `updateParameter` | services/api.ts | 761 |
| `updateParameter` | services/api.ts | 843 |
| `fetchParameterData` | services/api.ts | 876 |
| `fetchParameterData` | services/api.ts | 889 |
| `_startPruneInterval` | services/cache.ts | 71 |
| `set` | services/cache.ts | 111 |
| `get` | services/cache.ts | 124 |
| `get` | services/cache.ts | 132 |
| `get` | services/cache.ts | 142 |
| `get` | services/cache.ts | 150 |
| `get` | services/cache.ts | 161 |
| `_handleCacheMiss` | services/cache.ts | 173 |
| `_handleCacheMiss` | services/cache.ts | 183 |
| `registerMissCallback` | services/cache.ts | 199 |
| `setFallback` | services/cache.ts | 209 |
| `updateTTL` | services/cache.ts | 245 |
| `delete` | services/cache.ts | 268 |
| `delete` | services/cache.ts | 270 |
| `prune` | services/cache.ts | 297 |
| `clear` | services/cache.ts | 309 |
| `clearPattern` | services/cache.ts | 374 |
| `clearPattern` | services/cache.ts | 380 |
| `destroy` | services/cache.ts | 429 |
| `setConfig` | services/card-controller.ts | 106 |
| `setConfig` | services/card-controller.ts | 115 |
| `setConfig` | services/card-controller.ts | 121 |
| `setConfig` | services/card-controller.ts | 130 |
| `setHass` | services/card-controller.ts | 160 |
| `setHass` | services/card-controller.ts | 166 |
| `initializeServices` | services/card-controller.ts | 182 |
| `initializeServices` | services/card-controller.ts | 206 |
| `initializeServices` | services/card-controller.ts | 212 |
| `initializeServices` | services/card-controller.ts | 254 |
| `initializeApi` | services/card-controller.ts | 266 |
| `initializeApi` | services/card-controller.ts | 299 |
| `loadEntityData` | services/card-controller.ts | 327 |
| `loadEntityData` | services/card-controller.ts | 341 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 398 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 416 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 422 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 439 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 444 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 480 |
| `handleWebSocketMessage` | services/card-controller.ts | 491 |
| `handleWebSocketMessage` | services/card-controller.ts | 512 |
| `handleWebSocketMessage` | services/card-controller.ts | 521 |
| `handleWebSocketMessage` | services/card-controller.ts | 532 |
| `handleWebSocketMessage` | services/card-controller.ts | 542 |
| `subscribeToEntityChanges` | services/card-controller.ts | 620 |
| `resetApiFailures` | services/card-controller.ts | 649 |
| `diagnosticDump` | services/parameter-service.ts | 165 |
| `diagnosticDump` | services/parameter-service.ts | 169 |
| `diagnosticDump` | services/parameter-service.ts | 175 |
| `diagnosticDump` | services/parameter-service.ts | 181 |
| `clearCache` | services/parameter-service.ts | 193 |
| `markParameterChanged` | services/parameter-service.ts | 201 |
| `fetchParameterData` | services/parameter-service.ts | 636 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 679 |
| `handleCacheCleared` | services/parameter-service.ts | 840 |
| `handleCacheCleared` | services/parameter-service.ts | 850 |
| `printLabel` | services/print-label.ts | 19 |
| `printLabel` | services/print-label.ts | 21 |
| `printLabel` | services/print-label.ts | 22 |
| `printLabel` | services/print-label.ts | 35 |
| `printLabel` | services/print-label.ts | 39 |
| `setupRendering` | services/rendering-service.ts | 187 |
| `setupRendering` | services/rendering-service.ts | 194 |
| `setupRendering` | services/rendering-service.ts | 202 |
| `setupRendering` | services/rendering-service.ts | 209 |
| `setupRendering` | services/rendering-service.ts | 230 |
| `handleWebSocketUpdate` | services/rendering-service.ts | 269 |
| `handleWebSocketUpdate` | services/rendering-service.ts | 280 |
| `startIdleTimer` | services/rendering-service.ts | 309 |
| `executeIdleRender` | services/rendering-service.ts | 362 |
| `restartIdleTimer` | services/rendering-service.ts | 380 |
| `notifyRenderCallbacks` | services/rendering-service.ts | 450 |
| `shouldRender` | services/rendering-service.ts | 509 |
| `notifyRenderComplete` | services/rendering-service.ts | 535 |
| `startScheduler` | services/rendering-service.ts | 561 |
| `stopScheduler` | services/rendering-service.ts | 578 |
| `processScheduledJobs` | services/rendering-service.ts | 611 |
| `addScheduledJob` | services/rendering-service.ts | 752 |
| `removeScheduledJob` | services/rendering-service.ts | 761 |
| `updateScheduledJob` | services/rendering-service.ts | 774 |
| `destroy` | services/rendering-service.ts | 817 |
| `trackRenderTiming` | services/rendering-service.ts | 921 |
| `_getParameterService` | services/state.ts | 119 |
| `detectVariantGroups` | services/variant-service.ts | 108 |
| `detectVariantGroups` | services/variant-service.ts | 137 |
| `detectVariantGroups` | services/variant-service.ts | 218 |
| `detectVariantGroups` | services/variant-service.ts | 243 |
| `configure` | services/websocket-plugin.ts | 132 |
| `_setConnectionState` | services/websocket-plugin.ts | 170 |
| `connect` | services/websocket-plugin.ts | 227 |
| `connect` | services/websocket-plugin.ts | 237 |
| `connect` | services/websocket-plugin.ts | 257 |
| `_onConnectionOpen` | services/websocket-plugin.ts | 302 |
| `_debouncedProcessMessage` | services/websocket-plugin.ts | 388 |
| `_onConnectionClose` | services/websocket-plugin.ts | 445 |
| `_sendPing` | services/websocket-plugin.ts | 549 |
| `_scheduleReconnect` | services/websocket-plugin.ts | 632 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 733 |
| `reset` | services/websocket-plugin.ts | 804 |
| `sendMessage` | services/websocket-plugin.ts | 853 |
| `setHass` | services/websocket.ts | 51 |
| `subscribeToEntity` | services/websocket.ts | 72 |
| `subscribeToEntity` | services/websocket.ts | 88 |
| `updateHass` | services/websocket.ts | 113 |
| `_processHassEntities` | services/websocket.ts | 127 |
| `_processHassEntities` | services/websocket.ts | 213 |
| `refreshAllEntities` | services/websocket.ts | 241 |
| `reset` | services/websocket.ts | 252 |
| `setDirectApi` | services/websocket.ts | 312 |
| `getInstance` | utils/timer-manager.ts | 95 |
| `getInstance` | utils/timer-manager.ts | 103 |
| `registerComponent` | utils/timer-manager.ts | 142 |
| `deregisterComponent` | utils/timer-manager.ts | 191 |
| `setTimeout` | utils/timer-manager.ts | 258 |
| `setTimeout` | utils/timer-manager.ts | 310 |
| `clearTimeout` | utils/timer-manager.ts | 349 |
| `setInterval` | utils/timer-manager.ts | 429 |
| `setInterval` | utils/timer-manager.ts | 465 |
| `clearInterval` | utils/timer-manager.ts | 503 |
| `requestAnimationFrame` | utils/timer-manager.ts | 550 |
| `cancelAnimationFrame` | utils/timer-manager.ts | 582 |
| `clearComponentTimers` | utils/timer-manager.ts | 633 |
| `clearAll` | utils/timer-manager.ts | 669 |

### To `warn`

| Caller | File | Line |
|--------|------|------|
| `_debugForceFilter` | components/common/base-layout-view.ts | 304 |
| `_debugFixData` | components/common/base-layout-view.ts | 355 |
| `_safeGetParameterService` | components/common/base-layout.ts | 335 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 571 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 588 |
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 799 |
| `connectedCallback` | components/common/base-layout.ts | 928 |
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 148 |
| `_adjustStock` | components/part/part-view.ts | 372 |
| `_locateInWLED` | components/part/part-view.ts | 392 |
| `_printLabel` | components/part/part-view.ts | 412 |
| `_setupEntitySubscriptions` | inventree-card.ts | 396 |
| `_setupEntitySubscriptions` | inventree-card.ts | 403 |
| `getParts` | inventree-card.ts | 788 |
| `getParts` | inventree-card.ts | 842 |
| `updateCrossEntityParameter` | inventree-card.ts | 1191 |
| `getParameterValue` | services/api.ts | 221 |
| `testConnection` | services/api.ts | 328 |
| `testConnection` | services/api.ts | 336 |
| `testConnection` | services/api.ts | 340 |
| `testConnection` | services/api.ts | 349 |
| `testConnection` | services/api.ts | 354 |
| `testConnectionExactFormat` | services/api.ts | 541 |
| `testConnectionExactFormat` | services/api.ts | 548 |
| `testConnectionExactFormat` | services/api.ts | 554 |
| `testParameterAPI` | services/api.ts | 591 |
| `testParameterAPI` | services/api.ts | 597 |
| `updateParameter` | services/api.ts | 815 |
| `initializeServices` | services/card-controller.ts | 188 |
| `initializeApi` | services/card-controller.ts | 272 |
| `loadEntityData` | services/card-controller.ts | 347 |
| `loadEntityData` | services/card-controller.ts | 353 |
| `handleWebSocketMessage` | services/card-controller.ts | 583 |
| `resetApiFailures` | services/card-controller.ts | 664 |
| `fetchParameterData` | services/parameter-service.ts | 646 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 668 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 691 |
| `getParameterFromEntity` | services/parameter-service.ts | 709 |
| `getParameterFromEntity` | services/parameter-service.ts | 720 |
| `startIdleTimer` | services/rendering-service.ts | 318 |
| `startIdleTimer` | services/rendering-service.ts | 319 |
| `getThumbnailPath` | services/thumbnail.ts | 9 |
| `getThumbnailPath` | services/thumbnail.ts | 19 |
| `getThumbnailPath` | services/thumbnail.ts | 25 |
| `getThumbnailPath` | services/thumbnail.ts | 28 |
| `processVariantGroups` | services/variant-service.ts | 152 |
| `_setConnectionState` | services/websocket-plugin.ts | 160 |
| `connect` | services/websocket-plugin.ts | 217 |
| `connect` | services/websocket-plugin.ts | 269 |
| `_checkPingTimeout` | services/websocket-plugin.ts | 579 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 697 |
| `sendMessage` | services/websocket-plugin.ts | 838 |
| `_processHassEntities` | services/websocket.ts | 142 |
| `_processHassEntities` | services/websocket.ts | 182 |
| `_processHassEntities` | services/websocket.ts | 226 |
| `parseState` | utils/helpers.ts | 8 |
| `parseState` | utils/helpers.ts | 36 |
| `parseState` | utils/helpers.ts | 69 |
| `registerComponent` | utils/timer-manager.ts | 130 |
| `setTimeout` | utils/timer-manager.ts | 234 |
| `setInterval` | utils/timer-manager.ts | 406 |
| `requestAnimationFrame` | utils/timer-manager.ts | 520 |

### To `error`

| Caller | File | Line |
|--------|------|------|
| `_safeGetParameterService` | components/common/base-layout.ts | 345 |
| `_safeGetParameterService` | components/common/base-layout.ts | 351 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 718 |
| `_scheduleParameterServiceRetry` | components/common/base-layout.ts | 954 |
| `requestUpdate` | components/common/base-layout.ts | 1039 |
| `reportRenderTiming` | components/common/base-layout.ts | 1081 |
| `_renderWebSocketDiagnostics` | components/common/data-flow-debug.ts | 528 |
| `_getParameterService` | components/common/debug-view.ts | 1696 |
| `processItems` | components/common/variant-handler.ts | 124 |
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 167 |
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 181 |
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 303 |
| `_cleanupListeners` | components/grid/grid-layout.ts | 342 |
| `_filterParts` | components/grid/grid-layout.ts | 440 |
| `handleClick` | components/part/part-buttons.ts | 158 |
| `handleClick` | components/part/part-buttons.ts | 171 |
| `handleClick` | components/part/part-buttons.ts | 188 |
| `logVariantDetails` | components/part/part-variant.ts | 46 |
| `render` | components/part/part-variant.ts | 74 |
| `_adjustStock` | components/part/part-view.ts | 380 |
| `_locateInWLED` | components/part/part-view.ts | 400 |
| `_printLabel` | components/part/part-view.ts | 420 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 120 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 129 |
| `_setupWebSocketConnection` | components/variant/variant-layout.ts | 172 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 287 |
| `_handleWebSocketError` | components/variant/variant-layout.ts | 309 |
| `setHass` | core/inventree-state.ts | 228 |
| `_setupEventListeners` | inventree-card.ts | 216 |
| `subscribe` | inventree-card.ts | 427 |
| `_clearEntitySubscriptions` | inventree-card.ts | 467 |
| `_clearEntitySubscriptions` | inventree-card.ts | 496 |
| `getParts` | inventree-card.ts | 857 |
| `_handleStockAdjustment` | inventree-card.ts | 990 |
| `_handleStockAdjustment` | inventree-card.ts | 1002 |
| `refreshParameterData` | inventree-card.ts | 1168 |
| `updateCrossEntityParameter` | inventree-card.ts | 1180 |
| `updateCrossEntityParameter` | inventree-card.ts | 1219 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1236 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1249 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1289 |
| `handleParameterUpdateEvent` | inventree-card.ts | 1307 |
| `_handleServiceInitialization` | inventree-card.ts | 1481 |
| `_runApiDiagnostics` | inventree-card.ts | 1525 |
| `_initializeServices` | inventree-card.ts | 1622 |
| `requestUpdate` | inventree-card.ts | 1654 |
| `requestUpdate` | inventree-card.ts | 1656 |
| `adjustStock` | services/adjust-stock.ts | 30 |
| `getParameterValue` | services/api.ts | 176 |
| `getParameterValue` | services/api.ts | 178 |
| `getParameterValue` | services/api.ts | 235 |
| `getParameterValue` | services/api.ts | 237 |
| `testBasicAuth` | services/api.ts | 403 |
| `getPartParameters` | services/api.ts | 443 |
| `getPartParameters` | services/api.ts | 458 |
| `testBasicAuthWithEndpoint` | services/api.ts | 496 |
| `updateParameterDirectly` | services/api.ts | 640 |
| `updateParameterDirectly` | services/api.ts | 644 |
| `updateParameterDirectly` | services/api.ts | 646 |
| `updateParameterDirectly` | services/api.ts | 652 |
| `updateParameter` | services/api.ts | 798 |
| `updateParameter` | services/api.ts | 833 |
| `updateParameter` | services/api.ts | 859 |
| `fetchParameterData` | services/api.ts | 895 |
| `_startPruneInterval` | services/cache.ts | 74 |
| `_startPruneInterval` | services/cache.ts | 75 |
| `_handleCacheMiss` | services/cache.ts | 186 |
| `initializeServices` | services/card-controller.ts | 224 |
| `initializeApi` | services/card-controller.ts | 280 |
| `initializeApi` | services/card-controller.ts | 305 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 429 |
| `handleWebSocketMessage` | services/card-controller.ts | 549 |
| `resetApiFailures` | services/card-controller.ts | 658 |
| `fetchParameterData` | services/parameter-service.ts | 630 |
| `fetchParameterData` | services/parameter-service.ts | 652 |
| `printLabel` | services/print-label.ts | 42 |
| `startIdleTimer` | services/rendering-service.ts | 328 |
| `startIdleTimer` | services/rendering-service.ts | 349 |
| `executeRenderCallbacks` | services/rendering-service.ts | 479 |
| `processScheduledJobs` | services/rendering-service.ts | 618 |
| `trackRenderTiming` | services/rendering-service.ts | 928 |
| `_getParameterService` | services/state.ts | 121 |
| `processVariants` | services/variant-service.ts | 73 |
| `getVariants` | services/variant-service.ts | 102 |
| `getVariantData` | services/variant-service.ts | 206 |
| `connect` | services/websocket-plugin.ts | 289 |
| `_onConnectionMessage` | services/websocket-plugin.ts | 352 |
| `_notifyMessageCallbacks` | services/websocket-plugin.ts | 416 |
| `_onConnectionError` | services/websocket-plugin.ts | 428 |
| `_closeConnection` | services/websocket-plugin.ts | 487 |
| `_sendPing` | services/websocket-plugin.ts | 555 |
| `_checkPingTimeout` | services/websocket-plugin.ts | 586 |
| `sendMessage` | services/websocket-plugin.ts | 861 |
| `_processHassEntities` | services/websocket.ts | 220 |
| `_processHassEntities` | services/websocket.ts | 230 |
| `toggleLED` | services/wled-service.ts | 34 |
| `locatePart` | services/wled-service.ts | 96 |
| `registerComponent` | utils/timer-manager.ts | 149 |
| `setTimeout` | utils/timer-manager.ts | 243 |
| `setTimeout` | utils/timer-manager.ts | 286 |
| `clearTimeout` | utils/timer-manager.ts | 354 |
| `setInterval` | utils/timer-manager.ts | 415 |
| `setInterval` | utils/timer-manager.ts | 441 |
| `requestAnimationFrame` | utils/timer-manager.ts | 535 |

### To `getSystemsStatus`

| Caller | File | Line |
|--------|------|------|
| `_renderDebuggingSection` | editors/editor.ts | 2237 |

### To `setSubsystemDebug`

| Caller | File | Line |
|--------|------|------|
| `_updateSubsystem` | editors/editor.ts | 2368 |
| `_valueChangedDebug` | editors/editor.ts | 2543 |

### To `setCategoryDebug`

| Caller | File | Line |
|--------|------|------|
| `_updateSubsystem` | editors/editor.ts | 2372 |
| `_updateSubsystem` | editors/editor.ts | 2374 |
| `_valueChangedDebug` | editors/editor.ts | 2526 |
| `_valueChangedDebug` | editors/editor.ts | 2562 |

### To `setDebug`

| Caller | File | Line |
|--------|------|------|
| `_valueChangedDebug` | editors/editor.ts | 2517 |
| `registerComponent` | utils/timer-manager.ts | 145 |

### To `setVerboseMode`

| Caller | File | Line |
|--------|------|------|
| `_valueChangedDebug` | editors/editor.ts | 2521 |

### To `info`

| Caller | File | Line |
|--------|------|------|
| `setConfig` | inventree-card.ts | 342 |
| `setConfig` | inventree-card.ts | 366 |
| `setConfig` | inventree-card.ts | 375 |
| `getParts` | inventree-card.ts | 794 |
| `getParts` | inventree-card.ts | 803 |
| `_processHassEntities` | services/websocket.ts | 133 |
| `_processHassEntities` | services/websocket.ts | 155 |
| `_processHassEntities` | services/websocket.ts | 167 |
| `_processHassEntities` | services/websocket.ts | 172 |
| `_processHassEntities` | services/websocket.ts | 179 |
| `_processHassEntities` | services/websocket.ts | 187 |
| `_processHassEntities` | services/websocket.ts | 205 |

### To `setDebugConfig`

| Caller | File | Line |
|--------|------|------|
| `_setupDebugMode` | inventree-card.ts | 1751 |


## File Dependencies

### Direct Dependencies (0)

No direct file dependencies.

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `log` | 3381 | 390 | 4 |
| 2 | `setDebugConfig` | 3045 | 1 | 1 |
| 3 | `info` | 1460 | 19 | 3 |
| 4 | `error` | 1389 | 105 | 3 |
| 5 | `processHierarchicalConfig` | 1127 | 1 | 1 |
| 6 | `isEnabled` | 1065 | 3 | 2 |
| 7 | `warn` | 920 | 63 | 3 |
| 8 | `setSubsystemDebug` | 655 | 3 | 3 |
| 9 | `formatSystemStatus` | 651 | 8 | 1 |
| 10 | `isDuplicate` | 637 | 1 | 1 |
| 11 | `resetDebugConfig` | 615 | 0 | 0 |
| 12 | `setDebug` | 553 | 4 | 1 |
| 13 | `setVerboseMode` | 527 | 4 | 1 |
| 14 | `getSystemsStatus` | 423 | 1 | 0 |
| 15 | `setCategoryDebug` | 367 | 15 | 2 |
| 16 | `endPerformance` | 352 | 0 | 4 |
| 17 | `pruneRecentLogs` | 305 | 1 | 0 |
| 18 | `getSubsystems` | 239 | 0 | 1 |
| 19 | `anyCategoryEnabled` | 208 | 2 | 0 |
| 20 | `setEnabled` | 202 | 0 | 2 |
| 21 | `setLogLevel` | 149 | 0 | 1 |
| 22 | `getInstance` | 145 | 92 | 0 |
| 23 | `isCategoryEnabled` | 142 | 0 | 1 |
| 24 | `getNextSequence` | 130 | 4 | 0 |
| 25 | `startPerformance` | 126 | 0 | 1 |
