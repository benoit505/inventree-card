# File Analysis: core/inventree-state.ts

## Overview

- **Line Count:** 1058
- **Function Count:** 39
- **Imports:** 3 modules
  - From `./types`: InventreeItem
  - From `custom-card-helpers`: HomeAssistant
  - From `../utils/logger`: Logger
- **Exports:** 0 items

## Functions Defined (39)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 92 | `getInstance` | method | public | none | InventTreeState | 236 |
| 102 | `setPriorityDataSource` | method | public | source: 'websocket' | 'api' | 'hass' | void | 452 |
| 118 | `trackLastUpdate` | method | public | source: string, entityId: string | void | 407 |
| 130 | `getLastUpdate` | method | public | source: string, entityId: string | number | 223 |
| 138 | `setWebSocketData` | method | public | entityId: string, data: any[] | void | 539 |
| 156 | `setApiData` | method | public | entityId: string, data: any[] | void | 497 |
| 174 | `setHassData` | method | public | entityId: string, data: any[] | void | 504 |
| 192 | `registerEntityOfInterest` | method | public | entityId: string | void | 326 |
| 202 | `setHass` | method | public | hass: HomeAssistant | void | 1302 |
| 241 | `getWebSocketData` | method | public | entityId: string | WebSocketInventreeItem[] | 179 |
| 248 | `getApiData` | method | public | entityId: string | ApiInventreeItem[] | 155 |
| 255 | `getHassData` | method | public | entityId: string | HassInventreeItem[] | 159 |
| 262 | `getNewestData` | method | public | entityId: string | BaseInventreeItem[] | 2978 |
| 374 | `updateParameter` | method | public | partId: number, paramName: string, value: string | void | 2454 |
| 444 | `updateParameterInSource` | method | public | source: Map<string, BaseInventreeItem[]>, entityId: string, partId: number, paramName: string, value: string | void | 728 |
| 471 | `_updateParameterCache` | method | private | entityId: string, partId: number, paramName: string, value: string | void | 375 |
| 483 | `getParameterValue` | method | public | entityId: string, partId: number, paramName: string | string | null | 768 |
| 510 | `findEntityForPart` | method | public | partId: number | string | undefined | 1187 |
| 543 | `clearCache` | method | public | none | void | 1145 |
| 583 | `_repopulateParametersFromHass` | method | private | entityIds: string[] | void | 1230 |
| 627 | `unregisterEntityOfInterest` | method | public | entityId: string | void | 527 |
| 643 | `getTrackedEntities` | method | public | none | string[] | 163 |
| 648 | `triggerRefresh` | method | public | none | void | 155 |
| 658 | `getParameterValueFromPart` | method | public | part: BaseInventreeItem, paramName: string | string | null | 863 |
| 685 | `isDirectPartReference` | method | public | reference: string | boolean | 477 |
| 699 | `getParameterValueWithDirectReference` | method | public | reference: string | Promise<string | null> | 845 |
| 729 | `_findPartById` | method | private | partId: number | BaseInventreeItem | null | 562 |
| 750 | `findParameterInAllEntities` | method | public | partId: number, paramName: string | Promise<string | null> | 1587 |
| 799 | `findParameterInWebSocketData` | method | public | partId: number, paramName: string | string | null | 517 |
| 816 | `findParameterInApiData` | method | public | partId: number, paramName: string | string | null | 499 |
| 833 | `findParameterInHassData` | method | public | partId: number, paramName: string | string | null | 968 |
| 863 | `storeOrphanedParameter` | method | public | partId: number, paramName: string, value: string | void | 921 |
| 887 | `isOrphanedPart` | method | public | partId: number | boolean | 304 |
| 896 | `getOrphanedPartIds` | method | public | none | number[] | 641 |
| 922 | `getOrphanedPartParameters` | method | public | partId: number | Record<string, string> | null | 866 |
| 949 | `getFilteredParts` | method | public | entityId: string | BaseInventreeItem[] | 216 |
| 956 | `getActionButtons` | method | public | part: BaseInventreeItem, actions: any[] | any[] | 3757 |
| 1050 | `isInitialDataLoaded` | method | public | entityId: string | boolean | 189 |
| 1055 | `markInitialDataLoaded` | method | public | entityId: string | void | 164 |

## Outgoing Calls (48 unique functions)

### From `setPriorityDataSource`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 104 |
| `triggerRefresh` | 1 | 109 |

### From `trackLastUpdate`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 122 |
| `set` | 1 | 122 |
| `log` | 1 | 123 |

### From `getLastUpdate`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 132 |

### From `setWebSocketData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 140 |
| `set` | 1 | 143 |
| `trackLastUpdate` | 1 | 145 |
| `log` | 1 | 146 |

### From `setApiData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 158 |
| `set` | 1 | 161 |
| `trackLastUpdate` | 1 | 163 |
| `log` | 1 | 164 |

### From `setHassData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 176 |
| `set` | 1 | 179 |
| `trackLastUpdate` | 1 | 181 |
| `log` | 1 | 182 |

### From `registerEntityOfInterest`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `add` | 1 | 193 |
| `log` | 1 | 195 |

### From `setHass`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setHassData` | 1 | 213 |
| `markInitialDataLoaded` | 1 | 215 |
| `trackLastUpdate` | 1 | 218 |
| `log` | 1 | 221 |
| `error` | 1 | 228 |

### From `getWebSocketData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 242 |

### From `getApiData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 249 |

### From `getHassData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 256 |

### From `getNewestData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isInitialDataLoaded` | 1 | 269 |
| `getHassData` | 4 | 273, 299, 324, 335 |
| `markInitialDataLoaded` | 1 | 275 |
| `getWebSocketData` | 3 | 285, 317, 342 |
| `getApiData` | 3 | 292, 310, 349 |
| `log` | 1 | 360 |

### From `updateParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `entries` | 1 | 379 |
| `find` | 1 | 380 |
| `log` | 1 | 387 |
| `has` | 1 | 395 |
| `set` | 2 | 395, 400 |
| `get` | 1 | 400 |
| `dispatchEvent` | 2 | 413, 437 |
| `updateParameterInSource` | 3 | 417, 420, 421 |
| `_updateParameterCache` | 1 | 422 |

### From `updateParameterInSource`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 451 |
| `find` | 2 | 455, 459 |
| `toLowerCase` | 2 | 459, 460 |

### From `_updateParameterCache`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 1 | 472 |
| `set` | 2 | 472, 476 |
| `get` | 1 | 476 |

### From `getParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 4 | 485, 488, 495, 498 |

### From `findEntityForPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 4 | 514, 515, 516, 525 |
| `some` | 3 | 519, 520, 521 |
| `keys` | 1 | 528 |
| `startsWith` | 1 | 529 |

### From `clearCache`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 543, 570 |
| `clear` | 5 | 547, 550, 551, 557, 563 |
| `from` | 1 | 563 |
| `keys` | 1 | 563 |
| `_repopulateParametersFromHass` | 1 | 564 |
| `dispatchEvent` | 1 | 567 |

### From `_repopulateParametersFromHass`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `markInitialDataLoaded` | 1 | 589 |
| `getHassData` | 1 | 594 |
| `_updateParameterCache` | 1 | 600 |
| `trackLastUpdate` | 1 | 612 |
| `log` | 1 | 616 |

### From `unregisterEntityOfInterest`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `delete` | 4 | 628, 630, 633, 634 |
| `log` | 1 | 635 |

### From `getTrackedEntities`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `from` | 1 | 644 |

### From `triggerRefresh`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `dispatchEvent` | 1 | 648 |

### From `getParameterValueFromPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 664 |
| `find` | 1 | 669 |
| `toLowerCase` | 2 | 669, 670 |

### From `isDirectPartReference`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `startsWith` | 1 | 691 |
| `includes` | 1 | 691 |
| `substring` | 1 | 691 |

### From `getParameterValueWithDirectReference`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isDirectPartReference` | 1 | 700 |
| `split` | 1 | 705 |
| `parseInt` | 1 | 707 |
| `isNaN` | 1 | 710 |
| `_findPartById` | 1 | 715 |
| `getParameterValueFromPart` | 1 | 717 |

### From `_findPartById`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getTrackedEntities` | 1 | 731 |
| `getNewestData` | 1 | 734 |
| `find` | 1 | 735 |

### From `findParameterInAllEntities`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `findEntityForPart` | 1 | 752 |
| `getParameterValue` | 1 | 756 |
| `get` | 2 | 761, 764 |
| `findParameterInWebSocketData` | 1 | 773 |
| `findParameterInApiData` | 1 | 779 |
| `findParameterInHassData` | 1 | 785 |

### From `findParameterInWebSocketData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `entries` | 1 | 800 |
| `find` | 1 | 801 |
| `getParameterValueFromPart` | 1 | 803 |

### From `findParameterInApiData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `entries` | 1 | 817 |
| `find` | 1 | 818 |
| `getParameterValueFromPart` | 1 | 820 |

### From `findParameterInHassData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `entries` | 1 | 834 |
| `find` | 2 | 835, 846 |
| `getParameterValueFromPart` | 2 | 837, 848 |

### From `storeOrphanedParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 1 | 868 |
| `set` | 2 | 868, 873 |
| `get` | 1 | 873 |
| `log` | 1 | 874 |

### From `isOrphanedPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `findEntityForPart` | 1 | 888 |

### From `getOrphanedPartIds`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 897 |
| `keys` | 1 | 905 |
| `split` | 1 | 907 |
| `parseInt` | 1 | 908 |
| `isNaN` | 1 | 909 |
| `add` | 1 | 909 |
| `from` | 1 | 914 |

### From `getOrphanedPartParameters`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 923 |
| `entries` | 1 | 932 |
| `split` | 1 | 934 |
| `parseInt` | 1 | 935 |

### From `getFilteredParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getNewestData` | 1 | 950 |

### From `getActionButtons`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 957 |
| `String` | 9 | 964, 987, 987, 988, 988, 992, 992, 994, 994 |
| `map` | 1 | 969 |
| `filter` | 1 | 969 |
| `getParameterValueFromPart` | 1 | 976 |
| `toLowerCase` | 8 | 987, 987, 988, 988, 992, 992, 994, 994 |
| `includes` | 1 | 1012 |
| `Number` | 4 | 1014, 1014, 1016, 1016 |
| `log` | 1 | 1029 |
| `dispatchEvent` | 1 | 1033 |

### From `isInitialDataLoaded`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 1051 |

### From `markInitialDataLoaded`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `set` | 1 | 1055 |


## Incoming Calls (205 calls from other files)

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
| `updateFilteredParts` | components/common/base-layout.ts | 1102 |
| `updateFilteredParts` | components/common/base-layout.ts | 1103 |
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
| `setConfig` | inventree-card.ts | 338 |
| `setConfig` | inventree-card.ts | 359 |
| `setConfig` | inventree-card.ts | 364 |
| `getParts` | inventree-card.ts | 681 |
| `connectedCallback` | inventree-card.ts | 1149 |
| `connectedCallback` | inventree-card.ts | 1159 |
| `connectedCallback` | inventree-card.ts | 1163 |
| `connectedCallback` | inventree-card.ts | 1191 |
| `connectedCallback` | inventree-card.ts | 1230 |
| `_handleServiceInitialization` | inventree-card.ts | 1282 |
| `_initializeServices` | inventree-card.ts | 1421 |
| `_initializeServices` | inventree-card.ts | 1436 |
| `_initializeServices` | inventree-card.ts | 1437 |
| `_initializeServices` | inventree-card.ts | 1438 |
| `_initializeServices` | inventree-card.ts | 1439 |
| `_renderDebugTestPattern` | inventree-card.ts | 1556 |
| `_renderDebugTestPattern` | inventree-card.ts | 1558 |
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

### To `getNewestData`

| Caller | File | Line |
|--------|------|------|
| `render` | components/common/base-layout-view.ts | 131 |
| `_debugFixData` | components/common/base-layout-view.ts | 346 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 291 |
| `_loadData` | components/common/base-layout.ts | 446 |
| `_loadData` | components/common/base-layout.ts | 471 |
| `getParts` | components/common/base-layout.ts | 818 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 346 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1505 |
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 46 |
| `getParts` | inventree-card.ts | 684 |
| `getParts` | services/card-controller.ts | 368 |
| `getParameterFromEntity` | services/parameter-service.ts | 718 |
| `getFilteredParts` | services/state.ts | 37 |
| `getAllParts` | services/state.ts | 41 |

### To `clearCache`

| Caller | File | Line |
|--------|------|------|
| `_debugResetState` | components/common/base-layout-view.ts | 323 |
| `_debugResetState` | components/common/base-layout-view.ts | 327 |
| `_debugClearCache` | components/common/data-flow-debug.ts | 424 |
| `_debugClearCache` | components/common/data-flow-debug.ts | 427 |
| `_debugClearCache` | components/common/debug-view.ts | 786 |
| `_handleClearCache` | components/common/debug-view.ts | 1772 |

### To `getWebSocketData`

| Caller | File | Line |
|--------|------|------|
| `_loadData` | components/common/base-layout.ts | 433 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 334 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1194 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1490 |
| `_renderRawEntityData` | components/common/debug-view.ts | 1533 |

### To `getApiData`

| Caller | File | Line |
|--------|------|------|
| `_loadData` | components/common/base-layout.ts | 436 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 338 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1199 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1495 |
| `_renderRawEntityData` | components/common/debug-view.ts | 1534 |

### To `getHassData`

| Caller | File | Line |
|--------|------|------|
| `_loadData` | components/common/base-layout.ts | 440 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 342 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1204 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1500 |
| `_renderRawEntityData` | components/common/debug-view.ts | 1535 |

### To `isDirectPartReference`

| Caller | File | Line |
|--------|------|------|
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 769 |
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 784 |
| `updateFilteredParts` | components/common/base-layout.ts | 1123 |
| `updateCrossEntityParameter` | inventree-card.ts | 1027 |
| `handleWebSocketMessage` | services/card-controller.ts | 532 |
| `matchesConditionSyncVersion` | services/parameter-service.ts | 214 |
| `matchesCondition` | services/parameter-service.ts | 293 |
| `getParameterValueWithDirectReference` | services/parameter-service.ts | 469 |

### To `getParameterValueWithDirectReference`

| Caller | File | Line |
|--------|------|------|
| `updateFilteredParts` | components/common/base-layout.ts | 1125 |
| `handleWebSocketMessage` | services/card-controller.ts | 537 |
| `matchesCondition` | services/parameter-service.ts | 294 |

### To `getLastUpdate`

| Caller | File | Line |
|--------|------|------|
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 335 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 339 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 343 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 347 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 348 |
| `_updateDataSourceStats` | components/common/data-flow-debug.ts | 349 |
| `_getLastSourceUpdate` | components/common/debug-view.ts | 1228 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1491 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1496 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1501 |

### To `getParameterValueFromPart`

| Caller | File | Line |
|--------|------|------|
| `_captureParameterCache` | components/common/data-flow-debug.ts | 371 |
| `matchesParameterFilter` | components/parts/parts-layout.ts | 161 |
| `matchesConditionSyncVersion` | services/parameter-service.ts | 243 |
| `matchesCondition` | services/parameter-service.ts | 297 |
| `getParameterValueFromPart` | services/parameter-service.ts | 461 |
| `getParameterFromEntity` | services/parameter-service.ts | 730 |

### To `getTrackedEntities`

| Caller | File | Line |
|--------|------|------|
| `_renderPartsDebug` | components/common/debug-view.ts | 989 |
| `_updateDataSourceStats` | components/common/debug-view.ts | 1189 |
| `_getLastSourceUpdate` | components/common/debug-view.ts | 1224 |
| `_renderRawStateDebug` | components/common/debug-view.ts | 1436 |
| `matchesConditionSyncVersion` | services/parameter-service.ts | 231 |

### To `getOrphanedPartIds`

| Caller | File | Line |
|--------|------|------|
| `_renderRawStateDebug` | components/common/debug-view.ts | 1437 |
| `_renderOrphanedPartsData` | components/common/debug-view.ts | 1637 |
| `getOrphanedPartIds` | services/parameter-service.ts | 538 |

### To `getOrphanedPartParameters`

| Caller | File | Line |
|--------|------|------|
| `_renderOrphanedPartsData` | components/common/debug-view.ts | 1646 |
| `getOrphanedPartParameters` | services/parameter-service.ts | 546 |

### To `getActionButtons`

| Caller | File | Line |
|--------|------|------|
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 67 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 482 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 136 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 86 |
| `_updateVisualModifiers` | components/variant/variant-layout.ts | 501 |
| `getActionButtons` | services/state.ts | 140 |

### To `findEntityForPart`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 270 |
| `findEntityForPart` | services/parameter-service.ts | 513 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 677 |
| `findEntityForPart` | services/state.ts | 45 |

### To `registerEntityOfInterest`

| Caller | File | Line |
|--------|------|------|
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 47 |
| `loadEntityData` | services/card-controller.ts | 320 |

### To `setHassData`

| Caller | File | Line |
|--------|------|------|
| `_clearEntitySubscriptions` | inventree-card.ts | 454 |
| `loadEntityData` | services/card-controller.ts | 338 |

### To `updateParameter`

| Caller | File | Line |
|--------|------|------|
| `_handleStockAdjustment` | inventree-card.ts | 820 |
| `updateCrossEntityParameter` | inventree-card.ts | 1035 |
| `updateParametersForMatchingParts` | inventree-card.ts | 1110 |
| `handleWebSocketMessage` | services/card-controller.ts | 570 |
| `updateParameter` | services/parameter-service.ts | 614 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 686 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 726 |

### To `setHass`

| Caller | File | Line |
|--------|------|------|
| `connectedCallback` | inventree-card.ts | 1149 |
| `setHass` | services/card-controller.ts | 156 |
| `initializeServices` | services/card-controller.ts | 197 |
| `setHass` | services/state.ts | 32 |

### To `getParameterValue`

| Caller | File | Line |
|--------|------|------|
| `fetchParameterData` | services/api.ts | 885 |
| `fetchParameterData` | services/api.ts | 888 |
| `matchesConditionSyncVersion` | services/parameter-service.ts | 232 |
| `getParameterValueWithDirectReference` | services/parameter-service.ts | 495 |

### To `isInitialDataLoaded`

| Caller | File | Line |
|--------|------|------|
| `loadEntityData` | services/card-controller.ts | 327 |

### To `markInitialDataLoaded`

| Caller | File | Line |
|--------|------|------|
| `loadEntityData` | services/card-controller.ts | 340 |

### To `storeOrphanedParameter`

| Caller | File | Line |
|--------|------|------|
| `handleWebSocketMessage` | services/card-controller.ts | 587 |
| `storeOrphanedParameter` | services/parameter-service.ts | 521 |
| `updateParameter` | services/parameter-service.ts | 615 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 695 |

### To `findParameterInAllEntities`

| Caller | File | Line |
|--------|------|------|
| `getParameterValueWithDirectReference` | services/parameter-service.ts | 487 |
| `findParameterInAllEntities` | services/parameter-service.ts | 578 |

### To `isOrphanedPart`

| Caller | File | Line |
|--------|------|------|
| `isOrphanedPart` | services/parameter-service.ts | 530 |

### To `findParameterInWebSocketData`

| Caller | File | Line |
|--------|------|------|
| `findParameterInWebSocketData` | services/parameter-service.ts | 554 |

### To `findParameterInApiData`

| Caller | File | Line |
|--------|------|------|
| `findParameterInApiData` | services/parameter-service.ts | 562 |

### To `findParameterInHassData`

| Caller | File | Line |
|--------|------|------|
| `findParameterInHassData` | services/parameter-service.ts | 570 |

### To `setWebSocketData`

| Caller | File | Line |
|--------|------|------|
| `updateEntityParts` | services/state.ts | 48 |


## File Dependencies

### Direct Dependencies (2)

- ./types
- ../utils/logger

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `getActionButtons` | 3757 | 6 | 2 |
| 2 | `getNewestData` | 2978 | 16 | 1 |
| 3 | `updateParameter` | 2454 | 7 | 3 |
| 4 | `findParameterInAllEntities` | 1587 | 2 | 2 |
| 5 | `setHass` | 1302 | 4 | 1 |
| 6 | `_repopulateParametersFromHass` | 1230 | 1 | 1 |
| 7 | `findEntityForPart` | 1187 | 6 | 1 |
| 8 | `clearCache` | 1145 | 6 | 0 |
| 9 | `findParameterInHassData` | 968 | 2 | 2 |
| 10 | `storeOrphanedParameter` | 921 | 4 | 3 |
| 11 | `getOrphanedPartParameters` | 866 | 2 | 1 |
| 12 | `getParameterValueFromPart` | 863 | 12 | 2 |
| 13 | `getParameterValueWithDirectReference` | 845 | 3 | 1 |
| 14 | `getParameterValue` | 768 | 5 | 3 |
| 15 | `updateParameterInSource` | 728 | 3 | 5 |
| 16 | `getOrphanedPartIds` | 641 | 3 | 0 |
| 17 | `_findPartById` | 562 | 1 | 1 |
| 18 | `setWebSocketData` | 539 | 1 | 2 |
| 19 | `unregisterEntityOfInterest` | 527 | 0 | 1 |
| 20 | `findParameterInWebSocketData` | 517 | 2 | 2 |
| 21 | `setHassData` | 504 | 3 | 2 |
| 22 | `findParameterInApiData` | 499 | 2 | 2 |
| 23 | `setApiData` | 497 | 0 | 2 |
| 24 | `isDirectPartReference` | 477 | 9 | 1 |
| 25 | `setPriorityDataSource` | 452 | 0 | 1 |
| 26 | `trackLastUpdate` | 407 | 5 | 2 |
| 27 | `_updateParameterCache` | 375 | 2 | 4 |
| 28 | `registerEntityOfInterest` | 326 | 2 | 1 |
| 29 | `isOrphanedPart` | 304 | 1 | 1 |
| 30 | `getInstance` | 236 | 91 | 0 |
| 31 | `getLastUpdate` | 223 | 10 | 2 |
| 32 | `getFilteredParts` | 216 | 0 | 1 |
| 33 | `isInitialDataLoaded` | 189 | 2 | 1 |
| 34 | `getWebSocketData` | 179 | 8 | 1 |
| 35 | `markInitialDataLoaded` | 164 | 4 | 1 |
| 36 | `getTrackedEntities` | 163 | 6 | 0 |
| 37 | `getHassData` | 159 | 10 | 1 |
| 38 | `getApiData` | 155 | 8 | 1 |
| 39 | `triggerRefresh` | 155 | 1 | 0 |
