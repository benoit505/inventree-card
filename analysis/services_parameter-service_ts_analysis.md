# File Analysis: services/parameter-service.ts

## Overview

- **Line Count:** 1836
- **Function Count:** 50
- **Imports:** 9 modules
  - From `custom-card-helpers`: HomeAssistant, forwardHaptic
  - From `../core/types`: InventreeItem, ParameterCondition, ParameterAction, ParameterConfig, ParameterOperator
  - From `../utils/logger`: Logger
  - From `./api`: InvenTreeDirectAPI
  - From `./websocket`: WebSocketService
  - From `../core/inventree-state`: InventTreeState
  - From `./cache`: CacheService
  - From `../core/types`: InventreeCardConfig
  - From `lit`: html, nothing
- **Exports:** 0 items

## Functions Defined (50)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 36 | `get` | method | public | key: string | T | undefined | 507 |
| 56 | `set` | method | public | key: string, value: any, ttl: number | void | 338 |
| 69 | `clear` | method | public | none | void | 105 |
| 119 | `getInstance` | method | public | none | ParameterService | 222 |
| 126 | `initialize` | method | public | hass: HomeAssistant | ParameterService | 438 |
| 141 | `matchesConditionSyncVersion` | method | public | part: InventreeItem, condition: ParameterCondition | boolean | 482 |
| 146 | `processConditions` | method | public | part: InventreeItem, conditions: ParameterCondition[] | VisualModifiers | 758 |
| 177 | `matchesConditionAsync` | method | public | part: InventreeItem, condition: ParameterCondition | Promise<boolean> | 1234 |
| 208 | `checkCrossEntityCondition` | method | public | condition: ParameterCondition | boolean | 4427 |
| 333 | `checkCrossEntityConditionSync` | method | public | part: InventreeItem, condition: ParameterCondition | boolean | 2597 |
| 402 | `matchesCondition` | method | public | part: InventreeItem, condition: ParameterCondition | Promise<boolean> | 2118 |
| 449 | `checkCrossEntityConditionWithPart` | method | public | part: InventreeItem, condition: ParameterCondition | Promise<boolean> | 2454 |
| 516 | `matchesLocalCondition` | method | public | part: InventreeItem, condition: ParameterCondition | boolean | 2352 |
| 569 | `getParameterValueDirectly` | method | public | partId: number, paramName: string | Promise<string | null> | 1612 |
| 610 | `setFallbackState` | method | public | enabled: boolean | void | 614 |
| 626 | `diagnosticDump` | method | public | none | void | 3615 |
| 708 | `diagnoseCrossEntityCondition` | method | public | condition: ParameterCondition | boolean | 3778 |
| 803 | `clearParameterCache` | method | public | entityId: string, paramKey: string | void | 386 |
| 812 | `getApiStats` | method | public | none | { apiCalls: number, fallbackCalls: number } | 219 |
| 820 | `markParameterChanged` | method | public | entityId: string, paramName: string | void | 456 |
| 831 | `wasRecentlyChanged` | method | public | entityId: string, paramName: string | boolean | 248 |
| 842 | `syncApiDataToEntityState` | method | public | partId: number, paramName: string, value: string | void | 1314 |
| 877 | `findEntityForPart` | method | public | partId: number | string | null | 1057 |
| 903 | `runDiagnostics` | method | public | none | void | 2417 |
| 964 | `setDirectApi` | method | public | apiInstance: InvenTreeDirectAPI | null | void | 1400 |
| 1001 | `fetchParameterData` | method | public | partId: number, paramName: string | void | 3353 |
| 1080 | `clearCache` | method | public | none | void | 398 |
| 1097 | `applyAction` | method | public | modifiers: VisualModifiers, action: ParameterAction | string | undefined, value: string | undefined | void | 1789 |
| 1146 | `getActionButtons` | method | public | part: string, parameter: string, actions: ParameterAction[] | ParameterAction[] | 1163 |
| 1171 | `shouldShowPart` | method | public | part: InventreeItem | boolean | 1489 |
| 1208 | `compareFilterValues` | method | public | value: any, filterValue: string, operator: string | boolean | 1240 |
| 1249 | `updateParameter` | method | public | part: InventreeItem, paramName: string, value: string | Promise<boolean> | 1339 |
| 1282 | `hasInstance` | method | public | none | boolean | 172 |
| 1291 | `isDirectPartReference` | method | public | reference: string | boolean | 522 |
| 1305 | `getParameterValue` | method | public | reference: string | Promise<string | null> | 2122 |
| 1359 | `getParameterValueWithDirectReference` | method | public | reference: string | Promise<string | null> | 1606 |
| 1402 | `getParameterValueFromPart` | method | public | part: InventreeItem, paramName: string | string | null | 438 |
| 1414 | `checkValueMatch` | method | public | value: string | null, condition: ParameterCondition | boolean | 451 |
| 1428 | `compareValues` | method | public | value: string | null, expectedValue: string, operator: ParameterOperator, verbose: boolean | boolean | 630 |
| 1440 | `getParameterFromEntity` | method | public | entityId: string, paramName: string | Promise<string | null> | 3876 |
| 1533 | `isApiConnected` | method | public | none | boolean | 181 |
| 1541 | `updateHass` | method | public | hass: HomeAssistant | void | 194 |
| 1549 | `setStrictWebSocketMode` | method | public | enabled: boolean | void | 420 |
| 1564 | `markAsWebSocketCall` | method | public | none | void | 385 |
| 1576 | `clearWebSocketCallMark` | method | public | none | void | 369 |
| 1587 | `isWebSocketCall` | method | public | none | boolean | 165 |
| 1597 | `findParameterInAllEntities` | method | public | partId: number, paramName: string | Promise<string | null> | 6204 |
| 1736 | `findParameterInWebSocketData` | method | public | partInfo: any, parameterName: string | any | 1348 |
| 1769 | `findParameterInApiData` | method | public | partInfo: any, parameterName: string | any | 1276 |
| 1802 | `findParameterInHassData` | method | public | partInfo: any, parameterName: string | any | 1352 |

## Outgoing Calls (61 unique functions)

### From `get`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 44 |
| `now` | 1 | 50 |
| `delete` | 1 | 50 |

### From `set`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `set` | 1 | 64 |
| `now` | 1 | 67 |

### From `clear`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clear` | 1 | 74 |

### From `initialize`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 128 |

### From `matchesConditionSyncVersion`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `matchesLocalCondition` | 1 | 145 |

### From `processConditions`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `matchesConditionSyncVersion` | 1 | 163 |
| `applyAction` | 1 | 163 |

### From `matchesConditionAsync`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isDirectPartReference` | 1 | 183 |
| `getParameterValue` | 2 | 184, 188 |
| `includes` | 1 | 187 |
| `matchesLocalCondition` | 1 | 192 |
| `compareValues` | 1 | 201 |

### From `checkCrossEntityCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 5 | 213, 265, 275, 284, 317 |
| `get` | 2 | 214, 223 |
| `set` | 5 | 215, 262, 272, 281, 312 |
| `includes` | 2 | 229, 302 |
| `split` | 1 | 233 |
| `find` | 1 | 250 |
| `toLowerCase` | 4 | 250, 251, 290, 291 |
| `String` | 1 | 290 |
| `Number` | 4 | 305, 305, 308, 308 |
| `error` | 1 | 321 |

### From `checkCrossEntityConditionSync`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 3 | 333, 340, 378 |
| `split` | 1 | 340 |
| `find` | 1 | 363 |
| `toLowerCase` | 2 | 363, 364 |
| `compareValues` | 1 | 378 |
| `error` | 1 | 387 |

### From `matchesCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 407 |
| `log` | 1 | 408 |
| `isDirectPartReference` | 1 | 422 |
| `getParameterValueWithDirectReference` | 1 | 423 |
| `getParameterValueFromPart` | 1 | 426 |
| `checkValueMatch` | 1 | 430 |
| `set` | 1 | 430 |
| `error` | 1 | 436 |

### From `checkCrossEntityConditionWithPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 2 | 450, 491 |
| `split` | 1 | 454 |
| `getParameterFromEntity` | 1 | 462 |
| `toLowerCase` | 2 | 479, 480 |
| `String` | 1 | 479 |
| `Number` | 4 | 494, 494, 497, 497 |
| `error` | 1 | 504 |

### From `matchesLocalCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 5 | 516, 529, 537, 549, 556 |
| `getInstance` | 1 | 523 |
| `findEntityForPart` | 1 | 524 |
| `getParameterValue` | 1 | 528 |
| `compareValues` | 2 | 535, 555 |
| `find` | 1 | 544 |
| `toLowerCase` | 2 | 544, 545 |

### From `getParameterValueDirectly`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 570 |
| `log` | 1 | 578 |
| `setTimeout` | 1 | 586 |
| `resolve` | 1 | 587 |
| `race` | 1 | 591 |
| `getParameterValue` | 1 | 591 |
| `error` | 1 | 599 |

### From `setFallbackState`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setFallbackEnabled` | 1 | 611 |
| `log` | 1 | 612 |
| `warn` | 1 | 617 |

### From `diagnosticDump`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 15 | 626, 630, 634, 641, 646, 651, 656, 661, 665, 669, 673, 677, 685, 694, 699 |
| `getApiStats` | 1 | 641 |
| `isFallbackEnabled` | 1 | 642 |
| `getPerformanceStats` | 1 | 646 |
| `getInstance` | 1 | 684 |
| `getTrackedEntities` | 1 | 685 |
| `join` | 1 | 686 |
| `getNewestData` | 1 | 692 |
| `forEach` | 1 | 693 |

### From `diagnoseCrossEntityCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 8 | 708, 722, 744, 758, 766, 776, 783, 792 |
| `includes` | 1 | 714 |
| `error` | 4 | 714, 728, 738, 752 |
| `split` | 1 | 722 |
| `isArray` | 1 | 752 |
| `find` | 1 | 772 |
| `toLowerCase` | 2 | 772, 773 |
| `compareValues` | 1 | 783 |

### From `clearParameterCache`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `delete` | 1 | 804 |
| `log` | 1 | 805 |

### From `getApiStats`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getApiStats` | 1 | 816 |

### From `markParameterChanged`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `add` | 1 | 821 |
| `setTimeout` | 1 | 822 |
| `delete` | 1 | 825 |

### From `wasRecentlyChanged`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 1 | 833 |

### From `syncApiDataToEntityState`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `findEntityForPart` | 1 | 844 |
| `warn` | 1 | 845 |
| `log` | 1 | 851 |
| `dispatchEvent` | 1 | 867 |

### From `findEntityForPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 883 |
| `getTrackedEntities` | 1 | 884 |

### From `runDiagnostics`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 11 | 903, 907, 911, 919, 924, 930, 934, 940, 944, 954, 958 |
| `isApiConnected` | 1 | 912 |
| `getApiStats` | 1 | 919 |
| `getInstance` | 1 | 953 |
| `getTrackedEntities` | 1 | 954 |

### From `setDirectApi`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 3 | 969, 974, 981 |
| `setParameterService` | 1 | 978 |
| `warn` | 1 | 987 |

### From `fetchParameterData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 3 | 1002, 1011, 1049 |
| `has` | 1 | 1021 |
| `log` | 3 | 1021, 1032, 1041 |
| `add` | 1 | 1027 |
| `finally` | 1 | 1036 |
| `catch` | 1 | 1036 |
| `then` | 1 | 1036 |
| `getParameterValue` | 1 | 1036 |
| `syncApiDataToEntityState` | 1 | 1045 |
| `error` | 2 | 1056, 1066 |
| `delete` | 2 | 1062, 1070 |

### From `clearCache`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clear` | 4 | 1080, 1081, 1082, 1083 |
| `log` | 1 | 1084 |

### From `applyAction`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 1129 |

### From `getActionButtons`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isArray` | 1 | 1147 |
| `map` | 1 | 1152 |

### From `shouldShowPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 1 | 1186 |
| `split` | 1 | 1187 |
| `getParameterValueFromPart` | 1 | 1188 |
| `compareFilterValues` | 1 | 1195 |

### From `compareFilterValues`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `toLowerCase` | 2 | 1215, 1216 |
| `String` | 1 | 1215 |
| `includes` | 1 | 1227 |
| `Number` | 4 | 1230, 1230, 1233, 1233 |

### From `updateParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 1 | 1250 |
| `resolve` | 4 | 1255, 1266, 1273, 1276 |
| `log` | 1 | 1256 |
| `findEntityForPart` | 1 | 1270 |
| `syncApiDataToEntityState` | 1 | 1271 |

### From `isDirectPartReference`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `startsWith` | 1 | 1297 |
| `includes` | 1 | 1297 |
| `substring` | 1 | 1297 |

### From `getParameterValue`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 1 | 1306 |
| `warn` | 2 | 1306, 1344 |
| `split` | 1 | 1314 |
| `findParameterInWebSocketData` | 1 | 1317 |
| `log` | 3 | 1318, 1328, 1338 |
| `findParameterInApiData` | 1 | 1327 |
| `findParameterInHassData` | 1 | 1337 |

### From `getParameterValueWithDirectReference`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `isDirectPartReference` | 1 | 1360 |
| `warn` | 2 | 1360, 1375 |
| `split` | 1 | 1370 |
| `parseInt` | 1 | 1372 |
| `isNaN` | 1 | 1375 |
| `findParameterInAllEntities` | 1 | 1384 |
| `error` | 1 | 1386 |

### From `getParameterFromEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1440, 1497 |
| `includes` | 1 | 1447 |
| `split` | 1 | 1450 |
| `parseInt` | 1 | 1452 |
| `findParameterInAllEntities` | 2 | 1458, 1507 |
| `error` | 2 | 1461, 1520 |
| `warn` | 3 | 1471, 1481, 1513 |
| `find` | 1 | 1493 |
| `toLowerCase` | 2 | 1493, 1494 |

### From `setStrictWebSocketMode`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 1550 |

### From `markAsWebSocketCall`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 1565 |

### From `clearWebSocketCallMark`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 1577 |

### From `findParameterInAllEntities`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 7 | 1597, 1619, 1637, 1655, 1667, 1675, 1709 |
| `getInstance` | 1 | 1606 |
| `findEntityForPart` | 1 | 1607 |
| `getWebSocketData` | 1 | 1611 |
| `find` | 7 | 1612, 1614, 1630, 1632, 1648, 1650, 1704 |
| `toLowerCase` | 8 | 1614, 1615, 1632, 1633, 1650, 1651, 1704, 1705 |
| `getApiData` | 1 | 1629 |
| `getHassData` | 1 | 1647 |
| `getParameterValueDirectly` | 1 | 1673 |
| `error` | 2 | 1682, 1720 |
| `getTrackedEntities` | 1 | 1695 |
| `warn` | 1 | 1726 |

### From `findParameterInWebSocketData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 1737, 1746, 1754, 1760 |
| `find` | 1 | 1745 |

### From `findParameterInApiData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 1770, 1779, 1787, 1793 |
| `find` | 1 | 1778 |

### From `findParameterInHassData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 1803, 1814, 1822, 1828 |


## Incoming Calls (288 calls from other files)

### To `getInstance`

| Caller | File | Line |
|--------|------|------|
| `_safeGetParameterService` | components/common/base-layout.ts | 59 |
| `_safeGetParameterService` | components/common/base-layout.ts | 72 |
| `_loadData` | components/common/base-layout.ts | 280 |
| `_loadData` | components/common/base-layout.ts | 306 |
| `_loadData` | components/common/base-layout.ts | 324 |
| `_loadData` | components/common/base-layout.ts | 325 |
| `getParts` | components/common/base-layout.ts | 491 |
| `updated` | components/common/base-layout.ts | 558 |
| `updateFilteredParts` | components/common/base-layout.ts | 624 |
| `updateFilteredParts` | components/common/base-layout.ts | 625 |
| `processItems` | components/common/variant-handler.ts | 22 |
| `processItems` | components/common/variant-handler.ts | 124 |
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 66 |
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 180 |
| `_cleanupListeners` | components/grid/grid-layout.ts | 353 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 538 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 566 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 635 |
| `render` | components/grid/grid-layout.ts | 863 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 54 |
| `render` | components/list/list-layout.ts | 85 |
| `loadPartsFromEntities` | components/parts/parts-layout.ts | 41 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 84 |
| `_renderDebuggingSection` | editors/editor.ts | 2180 |
| `connectedCallback` | inventree-card.ts | 912 |
| `connectedCallback` | inventree-card.ts | 917 |
| `connectedCallback` | inventree-card.ts | 927 |
| `connectedCallback` | inventree-card.ts | 947 |
| `connectedCallback` | inventree-card.ts | 986 |
| `updateParameterWithImmediateRefresh` | inventree-card.ts | 1102 |
| `_runApiDiagnostics` | inventree-card.ts | 1161 |
| `_resetApiFailures` | inventree-card.ts | 1253 |
| `_initializeServices` | inventree-card.ts | 1286 |
| `_initializeServices` | inventree-card.ts | 1297 |
| `setHass` | services/card-controller.ts | 106 |
| `initializeServices` | services/card-controller.ts | 143 |
| `initializeServices` | services/card-controller.ts | 192 |
| `loadEntityData` | services/card-controller.ts | 381 |
| `getParts` | services/card-controller.ts | 395 |
| `getWebSocketService` | services/card-controller.ts | 419 |
| `initializeWebSocketPlugin` | services/card-controller.ts | 460 |
| `handleWebSocketMessage` | services/card-controller.ts | 562 |
| `getWebSocketDiagnostics` | services/card-controller.ts | 592 |
| `getWebSocketDiagnostics` | services/card-controller.ts | 593 |
| `getWebSocketDiagnostics` | services/card-controller.ts | 598 |
| `startIdleTimer` | services/rendering-service.ts | 236 |
| `processVariants` | services/variant-service.ts | 73 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 223 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 226 |
| `updateParameter` | services/websocket.ts | 441 |
| `onParameterChange` | services/websocket.ts | 1376 |
| `findEntityForPartAndTrack` | services/websocket.ts | 1424 |
| `updateEntityData` | services/websocket.ts | 1453 |
| `testStateIntegration` | services/websocket.ts | 1472 |
| `initStateIntegration` | services/websocket.ts | 1534 |

### To `hasInstance`

| Caller | File | Line |
|--------|------|------|
| `_safeGetParameterService` | components/common/base-layout.ts | 70 |
| `initializeServices` | services/card-controller.ts | 141 |

### To `updateHass`

| Caller | File | Line |
|--------|------|------|
| `_scheduleParameterServiceRetry` | components/common/base-layout.ts | 136 |
| `updated` | components/common/base-layout.ts | 536 |
| `updated` | components/grid/grid-layout.ts | 670 |
| `updated` | components/variant/variant-layout.ts | 416 |
| `initializeServices` | services/card-controller.ts | 149 |
| `initializeServices` | services/card-controller.ts | 186 |

### To `get`

| Caller | File | Line |
|--------|------|------|
| `_loadData` | components/common/base-layout.ts | 251 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 384 |
| `render` | components/detail/detail-layout.ts | 126 |
| `render` | components/detail/detail-layout.ts | 127 |
| `_getContainerStyle` | components/grid/grid-layout.ts | 719 |
| `_getTextStyle` | components/grid/grid-layout.ts | 741 |
| `render` | components/grid/grid-layout.ts | 984 |
| `render` | components/grid/grid-layout.ts | 986 |
| `render` | components/grid/grid-layout.ts | 999 |
| `render` | components/grid/grid-layout.ts | 1000 |
| `render` | components/grid/grid-layout.ts | 1003 |
| `render` | components/grid/grid-layout.ts | 1004 |
| `_renderPartWithSize` | components/list/list-layout.ts | 194 |
| `_renderPartWithSize` | components/list/list-layout.ts | 196 |
| `_renderPartWithSize` | components/list/list-layout.ts | 211 |
| `_renderPartWithSize` | components/list/list-layout.ts | 212 |
| `_renderPartWithSize` | components/list/list-layout.ts | 216 |
| `_renderPartWithSize` | components/list/list-layout.ts | 217 |
| `_getContainerStyle` | components/list/list-layout.ts | 225 |
| `_getTextStyle` | components/list/list-layout.ts | 247 |
| `updated` | components/part/part-container.ts | 145 |
| `_getContainerStyle` | components/parts/parts-layout.ts | 194 |
| `_getTextStyle` | components/parts/parts-layout.ts | 213 |
| `_processVariants` | components/variant/variant-layout.ts | 445 |
| `_getContainerStyle` | components/variant/variant-layout.ts | 515 |
| `_getTextStyle` | components/variant/variant-layout.ts | 534 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 605 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 616 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 618 |
| `_renderTabsView` | components/variant/variant-layout.ts | 661 |
| `_renderTabsView` | components/variant/variant-layout.ts | 672 |
| `_renderTabsView` | components/variant/variant-layout.ts | 674 |
| `_renderListView` | components/variant/variant-layout.ts | 711 |
| `_renderListView` | components/variant/variant-layout.ts | 731 |
| `_renderListView` | components/variant/variant-layout.ts | 733 |
| `_renderTreeView` | components/variant/variant-layout.ts | 785 |
| `_renderTreeView` | components/variant/variant-layout.ts | 805 |
| `_renderTreeView` | components/variant/variant-layout.ts | 807 |
| `_renderGridView` | components/variant/variant-layout.ts | 849 |
| `_renderGridView` | components/variant/variant-layout.ts | 894 |
| `_renderGridView` | components/variant/variant-layout.ts | 896 |
| `getLastUpdate` | core/inventree-state.ts | 80 |
| `getWebSocketData` | core/inventree-state.ts | 146 |
| `getApiData` | core/inventree-state.ts | 153 |
| `getHassData` | core/inventree-state.ts | 168 |
| `updateParameter` | core/inventree-state.ts | 228 |
| `updateParameterInSource` | core/inventree-state.ts | 279 |
| `_updateParameterCache` | core/inventree-state.ts | 304 |
| `getParameterValue` | core/inventree-state.ts | 313 |
| `getParameterValue` | core/inventree-state.ts | 316 |
| `getParameterValue` | core/inventree-state.ts | 323 |
| `getParameterValue` | core/inventree-state.ts | 326 |
| `findEntityForPart` | core/inventree-state.ts | 342 |
| `findEntityForPart` | core/inventree-state.ts | 343 |
| `findEntityForPart` | core/inventree-state.ts | 344 |
| `findEntityForPart` | core/inventree-state.ts | 353 |
| `getConfigElement` | inventree-card.ts | 176 |
| `getParts` | inventree-card.ts | 505 |
| `getLastKnownParameterValue` | services/api.ts | 640 |
| `get` | services/cache.ts | 42 |
| `has` | services/cache.ts | 66 |
| `updateScheduledJob` | services/rendering-service.ts | 557 |
| `getScheduledJob` | services/rendering-service.ts | 577 |
| `getConnection` | services/websocket-manager.ts | 34 |
| `getConnection` | services/websocket-manager.ts | 35 |
| `addOpenCallback` | services/websocket-manager.ts | 81 |
| `addMessageCallback` | services/websocket-manager.ts | 89 |
| `removeCallbacks` | services/websocket-manager.ts | 95 |
| `removeCallbacks` | services/websocket-manager.ts | 99 |
| `removeCallbacks` | services/websocket-manager.ts | 105 |
| `removeCallbacks` | services/websocket-manager.ts | 106 |
| `closeConnection` | services/websocket-manager.ts | 115 |
| `closeConnection` | services/websocket-manager.ts | 126 |
| `closeConnection` | services/websocket-manager.ts | 131 |
| `handleOpen` | services/websocket-manager.ts | 157 |
| `handleMessage` | services/websocket-manager.ts | 203 |
| `_handleBasicMessage` | services/websocket-manager.ts | 220 |
| `handleError` | services/websocket-manager.ts | 238 |
| `handleClose` | services/websocket-manager.ts | 253 |
| `handleClose` | services/websocket-manager.ts | 258 |
| `handleClose` | services/websocket-manager.ts | 267 |
| `handleClose` | services/websocket-manager.ts | 268 |
| `setupKeepAlive` | services/websocket-manager.ts | 298 |
| `setupKeepAlive` | services/websocket-manager.ts | 303 |
| `isConnected` | services/websocket-manager.ts | 328 |
| `getStats` | services/websocket-manager.ts | 345 |
| `getStats` | services/websocket-manager.ts | 346 |
| `getStats` | services/websocket-manager.ts | 347 |
| `_recordActivity` | services/websocket-manager.ts | 379 |
| `getEnhancedStats` | services/websocket-manager.ts | 401 |
| `_subscribeToEntity` | services/websocket.ts | 273 |
| `_unsubscribeFromEntity` | services/websocket.ts | 311 |
| `subscribeToCrossEntityParameter` | services/websocket.ts | 482 |
| `checkConditionWithRetry` | services/websocket.ts | 880 |
| `_classicSubscribeToEntity` | services/websocket.ts | 1581 |
| `_classicSubscribeToEntity` | services/websocket.ts | 1594 |
| `isDuplicate` | utils/logger.ts | 347 |

### To `set`

| Caller | File | Line |
|--------|------|------|
| `_loadData` | components/common/base-layout.ts | 330 |
| `_applyParameterFiltering` | components/common/base-layout.ts | 477 |
| `_updateDisplayedStock` | components/detail/detail-layout.ts | 47 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 623 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 635 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 43 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 54 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 73 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 84 |
| `_processVariants` | components/variant/variant-layout.ts | 443 |
| `_updateVisualModifiers` | components/variant/variant-layout.ts | 492 |
| `_updateVisualModifiers` | components/variant/variant-layout.ts | 499 |
| `trackLastUpdate` | core/inventree-state.ts | 70 |
| `setWebSocketData` | core/inventree-state.ts | 86 |
| `setApiData` | core/inventree-state.ts | 95 |
| `setHassData` | core/inventree-state.ts | 104 |
| `updateParameter` | core/inventree-state.ts | 223 |
| `updateParameter` | core/inventree-state.ts | 228 |
| `_updateParameterCache` | core/inventree-state.ts | 300 |
| `_updateParameterCache` | core/inventree-state.ts | 304 |
| `subscribe` | inventree-card.ts | 277 |
| `debouncedRender` | inventree-card.ts | 311 |
| `getParts` | inventree-card.ts | 521 |
| `updateLastKnownParameterValue` | services/api.ts | 643 |
| `set` | services/cache.ts | 31 |
| `handleWebSocketMessage` | services/card-controller.ts | 511 |
| `setupRendering` | services/rendering-service.ts | 134 |
| `setupRendering` | services/rendering-service.ts | 164 |
| `handleWebSocketUpdate` | services/rendering-service.ts | 205 |
| `shouldRender` | services/rendering-service.ts | 341 |
| `addScheduledJob` | services/rendering-service.ts | 537 |
| `getConnection` | services/websocket-manager.ts | 50 |
| `getConnection` | services/websocket-manager.ts | 51 |
| `addOpenCallback` | services/websocket-manager.ts | 79 |
| `addMessageCallback` | services/websocket-manager.ts | 87 |
| `handleOpen` | services/websocket-manager.ts | 150 |
| `handleError` | services/websocket-manager.ts | 238 |
| `handleClose` | services/websocket-manager.ts | 289 |
| `setupKeepAlive` | services/websocket-manager.ts | 316 |
| `_recordActivity` | services/websocket-manager.ts | 370 |
| `_handleMessage` | services/websocket-plugin.ts | 160 |
| `_subscribeToEntity` | services/websocket.ts | 295 |
| `subscribeToCrossEntityParameter` | services/websocket.ts | 502 |
| `checkConditionWithRetry` | services/websocket.ts | 897 |
| `_classicSubscribeToEntity` | services/websocket.ts | 1579 |
| `isDuplicate` | utils/logger.ts | 353 |

### To `isDirectPartReference`

| Caller | File | Line |
|--------|------|------|
| `_applyParameterFiltering` | components/common/base-layout.ts | 423 |
| `updateFilteredParts` | components/common/base-layout.ts | 645 |
| `handleWebSocketMessage` | services/card-controller.ts | 522 |

### To `matchesCondition`

| Caller | File | Line |
|--------|------|------|
| `_applyParameterFiltering` | components/common/base-layout.ts | 428 |
| `updateFilteredParts` | components/common/base-layout.ts | 658 |

### To `matchesConditionSyncVersion`

| Caller | File | Line |
|--------|------|------|
| `_applyParameterFiltering` | components/common/base-layout.ts | 439 |
| `_applyParameterFilteringSync` | components/common/base-layout.ts | 711 |

### To `getParameterValueWithDirectReference`

| Caller | File | Line |
|--------|------|------|
| `updateFilteredParts` | components/common/base-layout.ts | 647 |
| `handleWebSocketMessage` | services/card-controller.ts | 527 |

### To `checkValueMatch`

| Caller | File | Line |
|--------|------|------|
| `updateFilteredParts` | components/common/base-layout.ts | 650 |

### To `processConditions`

| Caller | File | Line |
|--------|------|------|
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 60 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 627 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 46 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 76 |
| `_updateVisualModifiers` | components/variant/variant-layout.ts | 494 |

### To `getActionButtons`

| Caller | File | Line |
|--------|------|------|
| `_updateVisualModifiers` | components/detail/detail-layout.ts | 67 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 637 |
| `_updateVisualModifiers` | components/list/list-layout.ts | 56 |
| `_updateVisualModifiers` | components/parts/parts-layout.ts | 86 |
| `_updateVisualModifiers` | components/variant/variant-layout.ts | 503 |
| `getActionButtons` | services/state.ts | 140 |

### To `setStrictWebSocketMode`

| Caller | File | Line |
|--------|------|------|
| `_setupWebSocketConnection` | components/grid/grid-layout.ts | 143 |
| `updated` | components/grid/grid-layout.ts | 681 |
| `connectedCallback` | inventree-card.ts | 936 |
| `initializeApi` | services/card-controller.ts | 320 |
| `initializeApi` | services/card-controller.ts | 326 |
| `initializeApi` | services/card-controller.ts | 335 |

### To `markAsWebSocketCall`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 276 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 533 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 561 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 621 |

### To `findEntityForPart`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 284 |
| `_testSpecificParameter` | inventree-card.ts | 1236 |
| `findEntityForPart` | services/state.ts | 45 |
| `getPartIdFromParameterName` | services/websocket.ts | 997 |
| `onParameterChange` | services/websocket.ts | 1379 |
| `findEntityForPartAndTrack` | services/websocket.ts | 1420 |
| `initStateIntegration` | services/websocket.ts | 1530 |

### To `clearWebSocketCallMark`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 299 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 542 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 570 |
| `_updateVisualModifiers` | components/grid/grid-layout.ts | 642 |

### To `clear`

| Caller | File | Line |
|--------|------|------|
| `_handleResetFilters` | components/grid/grid-layout.ts | 1020 |
| `clearCache` | core/inventree-state.ts | 371 |
| `clearCache` | core/inventree-state.ts | 372 |
| `clearCache` | core/inventree-state.ts | 373 |
| `clearCache` | core/inventree-state.ts | 374 |
| `_clearEntitySubscriptions` | inventree-card.ts | 291 |
| `clear` | services/cache.ts | 109 |
| `handleWebSocketUpdate` | services/rendering-service.ts | 211 |
| `_resubscribeAll` | services/websocket.ts | 391 |
| `subscribeToCrossEntityParameter` | services/websocket.ts | 511 |
| `destroy` | services/websocket.ts | 719 |
| `destroy` | services/websocket.ts | 721 |
| `resetDebugConfig` | utils/logger.ts | 594 |

### To `getParameterValueFromPart`

| Caller | File | Line |
|--------|------|------|
| `matchesParameterFilter` | components/parts/parts-layout.ts | 161 |

### To `updateParameter`

| Caller | File | Line |
|--------|------|------|
| `_handleStockAdjustment` | inventree-card.ts | 646 |
| `updateParameterWithImmediateRefresh` | inventree-card.ts | 1102 |
| `handleWebSocketMessage` | services/card-controller.ts | 562 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 226 |
| `updateParameter` | services/websocket.ts | 441 |
| `onParameterChange` | services/websocket.ts | 1384 |

### To `fetchParameterData`

| Caller | File | Line |
|--------|------|------|
| `refreshParameterData` | inventree-card.ts | 817 |
| `_fetchAllParameters` | inventree-card.ts | 1201 |

### To `setDirectApi`

| Caller | File | Line |
|--------|------|------|
| `connectedCallback` | inventree-card.ts | 927 |
| `connectedCallback` | inventree-card.ts | 931 |
| `initializeApi` | services/card-controller.ts | 240 |
| `initializeApi` | services/card-controller.ts | 253 |
| `initializeApi` | services/card-controller.ts | 277 |
| `initializeApi` | services/card-controller.ts | 296 |
| `initializeApi` | services/card-controller.ts | 312 |
| `initializeApi` | services/card-controller.ts | 334 |

### To `isApiConnected`

| Caller | File | Line |
|--------|------|------|
| `_renderDiagnosticTools` | inventree-card.ts | 1133 |
| `handleWebSocketMessage` | services/card-controller.ts | 522 |

### To `getParameterValue`

| Caller | File | Line |
|--------|------|------|
| `_testSpecificParameter` | inventree-card.ts | 1228 |
| `checkFilterCondition` | services/websocket.ts | 826 |
| `getParameterWithFallbackLogic` | services/websocket.ts | 941 |

### To `syncApiDataToEntityState`

| Caller | File | Line |
|--------|------|------|
| `getParameterValue` | services/api.ts | 181 |
| `handleWebSocketMessage` | services/card-controller.ts | 578 |

### To `checkCrossEntityCondition`

| Caller | File | Line |
|--------|------|------|
| `checkFilterCondition` | services/websocket.ts | 856 |
| `useFallbackForCondition` | services/websocket.ts | 1334 |

### To `getApiStats`

| Caller | File | Line |
|--------|------|------|
| `logApiUsageStats` | services/websocket.ts | 1203 |


## File Dependencies

### Direct Dependencies (6)

- ../core/types
- ../utils/logger
- ./api
- ./websocket
- ../core/inventree-state
- ./cache

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `findParameterInAllEntities` | 6204 | 3 | 2 |
| 2 | `checkCrossEntityCondition` | 4427 | 2 | 1 |
| 3 | `getParameterFromEntity` | 3876 | 1 | 2 |
| 4 | `diagnoseCrossEntityCondition` | 3778 | 0 | 1 |
| 5 | `diagnosticDump` | 3615 | 0 | 0 |
| 6 | `fetchParameterData` | 3353 | 2 | 2 |
| 7 | `checkCrossEntityConditionSync` | 2597 | 0 | 2 |
| 8 | `checkCrossEntityConditionWithPart` | 2454 | 0 | 2 |
| 9 | `runDiagnostics` | 2417 | 0 | 0 |
| 10 | `matchesLocalCondition` | 2352 | 2 | 2 |
| 11 | `getParameterValue` | 2122 | 8 | 1 |
| 12 | `matchesCondition` | 2118 | 2 | 2 |
| 13 | `applyAction` | 1789 | 1 | 3 |
| 14 | `getParameterValueDirectly` | 1612 | 1 | 2 |
| 15 | `getParameterValueWithDirectReference` | 1606 | 3 | 1 |
| 16 | `shouldShowPart` | 1489 | 0 | 1 |
| 17 | `setDirectApi` | 1400 | 8 | 1 |
| 18 | `findParameterInHassData` | 1352 | 1 | 2 |
| 19 | `findParameterInWebSocketData` | 1348 | 1 | 2 |
| 20 | `updateParameter` | 1339 | 6 | 3 |
| 21 | `syncApiDataToEntityState` | 1314 | 4 | 3 |
| 22 | `findParameterInApiData` | 1276 | 1 | 2 |
| 23 | `compareFilterValues` | 1240 | 1 | 3 |
| 24 | `matchesConditionAsync` | 1234 | 0 | 2 |
| 25 | `getActionButtons` | 1163 | 6 | 3 |
| 26 | `findEntityForPart` | 1057 | 11 | 1 |
| 27 | `processConditions` | 758 | 5 | 2 |
| 28 | `compareValues` | 630 | 5 | 4 |
| 29 | `setFallbackState` | 614 | 0 | 1 |
| 30 | `isDirectPartReference` | 522 | 6 | 1 |
| 31 | `get` | 507 | 101 | 1 |
| 32 | `matchesConditionSyncVersion` | 482 | 3 | 2 |
| 33 | `markParameterChanged` | 456 | 0 | 2 |
| 34 | `checkValueMatch` | 451 | 2 | 2 |
| 35 | `initialize` | 438 | 0 | 1 |
| 36 | `getParameterValueFromPart` | 438 | 3 | 2 |
| 37 | `setStrictWebSocketMode` | 420 | 6 | 1 |
| 38 | `clearCache` | 398 | 0 | 0 |
| 39 | `clearParameterCache` | 386 | 0 | 2 |
| 40 | `markAsWebSocketCall` | 385 | 4 | 0 |
| 41 | `clearWebSocketCallMark` | 369 | 4 | 0 |
| 42 | `set` | 338 | 53 | 3 |
| 43 | `wasRecentlyChanged` | 248 | 0 | 2 |
| 44 | `getInstance` | 222 | 60 | 0 |
| 45 | `getApiStats` | 219 | 4 | 0 |
| 46 | `updateHass` | 194 | 6 | 1 |
| 47 | `isApiConnected` | 181 | 3 | 0 |
| 48 | `hasInstance` | 172 | 2 | 0 |
| 49 | `isWebSocketCall` | 165 | 0 | 0 |
| 50 | `clear` | 105 | 18 | 0 |
