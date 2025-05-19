# File Analysis: services/websocket.ts

## Overview

- **Line Count:** 1705
- **Function Count:** 52
- **Imports:** 6 modules
  - From `custom-card-helpers`: HomeAssistant
  - From `../utils/logger`: Logger
  - From `./api`: InvenTreeDirectAPI
  - From `../core/types`: ParameterCondition, InventreeItem
  - From `../core/inventree-state`: InventTreeState
  - From `./websocket-manager`: WebSocketManager
- **Exports:** 0 items

## Functions Defined (52)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 46 | `getInstance` | method | public | none | WebSocketService | 239 |
| 56 | `getConnectionId` | method | public | hass: HomeAssistant | string | 281 |
| 67 | `setHass` | method | public | hass: HomeAssistant | void | 838 |
| 96 | `subscribeToEntity` | method | public | entityId: string, callback: (data: any) => void | () => void | 1497 |
| 132 | `_handleConnectionOpen` | method | private | entityId: string, event: Event | void | 460 |
| 147 | `_handleEntityMessage` | method | private | entityId: string, callback: (data: any) => void, event: MessageEvent | void | 608 |
| 164 | `setConfig` | method | public | config: { websocket_url?: string, api_key?: string } | void | 173 |
| 171 | `getConnectionStatus` | method | public | none | Record<string, boolean> | 413 |
| 188 | `subscribeToParameter` | method | public | entityId: string, partId: number, paramName: string, callback: (value: any) => void | () => void | 1510 |
| 197 | `filteredCallback` | arrow | public | data: any | void | 720 |
| 229 | `subscribeToParts` | method | public | entityId: string, callback: (parts: any[]) => void | () => void | 838 |
| 235 | `filteredCallback` | arrow | public | data: any | void | 353 |
| 250 | `_subscribeToEntity` | method | private | entityId: string | void | 2419 |
| 310 | `_unsubscribeFromEntity` | method | private | entityId: string | void | 2009 |
| 356 | `_resubscribeAll` | method | private | none | void | 2272 |
| 407 | `updateParameter` | method | public | partId: number, parameterName: string, value: string | Promise<void> | 1495 |
| 456 | `subscribeToCrossEntityParameter` | method | public | sourceEntityId: string, targetEntityId: string, targetParamName: string, callback: (value: any) => void | () => void | 3594 |
| 535 | `subscribeToFilteredParts` | method | public | entityId: string, conditions: any[], callback: (filteredParts: any[]) => void | () => void | 2906 |
| 618 | `isConnected` | method | public | none | boolean | 160 |
| 625 | `getDiagnostics` | method | public | none | object | 465 |
| 637 | `_startHealthCheck` | method | private | none | void | 849 |
| 711 | `destroy` | method | public | none | void | 356 |
| 725 | `setDirectApi` | method | public | api: InvenTreeDirectAPI | void | 900 |
| 750 | `testApiEndpoints` | method | public | quiet: boolean | Promise<void> | 982 |
| 780 | `checkFilterCondition` | method | public | condition: ParameterCondition, fallbackData: any | Promise<boolean> | 3792 |
| 872 | `checkConditionWithRetry` | method | public | condition: ParameterCondition, fallbackData: any | Promise<boolean> | 1134 |
| 912 | `getParameterWithFallbackLogic` | method | public | paramName: string, fallbackData: any | Promise<any> | 3057 |
| 985 | `getPartIdFromParameterName` | method | public | paramName: string | number | null | 1029 |
| 1015 | `useFallbackData` | method | public | paramName: string, fallbackData: any | any | 1035 |
| 1049 | `compareParameterValues` | method | public | paramValue: any, conditionValue: string, operator: string | boolean | 2701 |
| 1107 | `resetApiFailureCounter` | method | public | none | void | 308 |
| 1116 | `getApiStatus` | method | public | none | { 
    failureCount: number, 
    usingFallback: boolean, 
    recentSuccess: boolean 
  } | 347 |
| 1128 | `_notifyParameterChanged` | method | private | entityId: string | undefined, paramName: string, paramValue: any | void | 1513 |
| 1171 | `getPartIdFromEntityId` | method | public | entityId: string | undefined | number | null | 327 |
| 1181 | `getParameterFromEntityState` | method | public | entityId: string | undefined, paramName: string, fallbackData: any | any | 636 |
| 1197 | `logApiUsageStats` | method | public | none | void | 556 |
| 1209 | `findEntityForPart` | method | public | partId: number | string | undefined | 792 |
| 1236 | `getMaxApiFailures` | method | public | none | number | 150 |
| 1243 | `checkCrossEntityCondition` | method | public | entityId: string, paramName: string, operator: string, value: string | boolean | 1570 |
| 1291 | `useFallbackForCondition` | method | public | condition: ParameterCondition, fallbackData: any | boolean | 2866 |
| 1362 | `onParameterChange` | method | public | data: any | void | 1860 |
| 1419 | `findEntityForPartAndTrack` | method | public | partId: number | string | undefined | 425 |
| 1431 | `_handleWebSocketMessage` | method | private | event: MessageEvent | void | 630 |
| 1446 | `updateEntityData` | method | public | entityId: string, data: InventreeItem[] | void | 526 |
| 1467 | `testStateIntegration` | method | public | none | Promise<boolean> | 1562 |
| 1513 | `initStateIntegration` | method | public | none | void | 1154 |
| 1547 | `testConnection` | method | public | none | Promise<boolean> | 1105 |
| 1577 | `_classicSubscribeToEntity` | method | private | entityId: string, callback: (data: any) => void | () => void | 1067 |
| 1610 | `_sendAuthentication` | method | private | none | void | 843 |
| 1634 | `_sendSubscription` | method | private | entityId: string | void | 827 |
| 1658 | `_isMessageForEntity` | method | private | message: any, entityId: string | boolean | 763 |
| 1683 | `_processMessage` | method | private | message: any | any | 593 |

## Outgoing Calls (84 unique functions)

### From `getConnectionId`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 2 | 58, 61 |

### From `setHass`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 71 |
| `getConnectionId` | 1 | 80 |
| `log` | 1 | 81 |
| `_resubscribeAll` | 1 | 83 |
| `random` | 1 | 88 |
| `testApiEndpoints` | 1 | 88 |

### From `subscribeToEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 96, 110 |
| `getConnection` | 1 | 104 |
| `bind` | 4 | 105, 106, 115, 116 |
| `removeCallbacks` | 1 | 113 |
| `warn` | 1 | 121 |
| `_classicSubscribeToEntity` | 1 | 126 |

### From `_handleConnectionOpen`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 132 |
| `_sendAuthentication` | 1 | 136 |
| `_sendSubscription` | 1 | 138 |

### From `_handleEntityMessage`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `parse` | 1 | 149 |
| `_isMessageForEntity` | 1 | 152 |
| `callback` | 1 | 152 |
| `_processMessage` | 1 | 154 |
| `error` | 1 | 156 |

### From `getConnectionStatus`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `reduce` | 1 | 175 |
| `isConnected` | 1 | 176 |

### From `subscribeToParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 193 |
| `subscribeToEntity` | 1 | 221 |

### From `filteredCallback`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `find` | 2 | 203, 210 |
| `toLowerCase` | 2 | 210, 211 |
| `log` | 2 | 214, 238 |
| `callback` | 2 | 215, 240 |

### From `subscribeToParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 232 |
| `subscribeToEntity` | 1 | 244 |

### From `_subscribeToEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 251 |
| `log` | 4 | 256, 268, 275, 297 |
| `subscribeEvents` | 1 | 263 |
| `get` | 1 | 273 |
| `forEach` | 1 | 276 |
| `callback` | 1 | 278 |
| `error` | 4 | 280, 289, 299, 302 |
| `set` | 1 | 295 |

### From `_unsubscribeFromEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 311 |
| `log` | 2 | 314, 342 |
| `then` | 2 | 317, 323 |
| `resolve` | 1 | 317 |
| `unsub` | 1 | 321 |
| `catch` | 1 | 323 |
| `unsubFunc` | 1 | 326 |
| `error` | 3 | 329, 333, 344 |
| `warn` | 1 | 337 |
| `delete` | 2 | 339, 345 |

### From `_resubscribeAll`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 356, 361, 396, 399 |
| `forEach` | 2 | 357, 393 |
| `then` | 2 | 364, 370 |
| `resolve` | 1 | 364 |
| `unsub` | 1 | 368 |
| `catch` | 1 | 370 |
| `unsubFunc` | 1 | 373 |
| `error` | 2 | 376, 380 |
| `warn` | 2 | 384, 387 |
| `clear` | 1 | 391 |
| `_subscribeToEntity` | 1 | 397 |

### From `updateParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 2 | 412, 443 |
| `log` | 2 | 417, 424 |
| `callService` | 1 | 420 |
| `dispatchEvent` | 1 | 426 |
| `getInstance` | 1 | 441 |
| `updateParameter` | 1 | 441 |

### From `subscribeToCrossEntityParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 5 | 461, 476, 500, 516, 519 |
| `subscribeToEntity` | 1 | 468 |
| `stringify` | 2 | 475, 476 |
| `get` | 1 | 482 |
| `find` | 1 | 489 |
| `toLowerCase` | 2 | 489, 490 |
| `now` | 2 | 497, 507 |
| `set` | 1 | 502 |
| `clear` | 1 | 511 |
| `callback` | 1 | 513 |

### From `subscribeToFilteredParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 539, 563 |
| `subscribeToParts` | 2 | 544, 548 |
| `callback` | 3 | 549, 559, 607 |
| `some` | 1 | 555 |
| `includes` | 3 | 556, 588, 606 |
| `filter` | 5 | 568, 574, 588, 592, 606 |
| `checkFilterCondition` | 2 | 580, 598 |
| `push` | 2 | 581, 599 |

### From `getDiagnostics`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `from` | 2 | 629, 630 |
| `keys` | 1 | 629 |
| `map` | 1 | 630 |
| `entries` | 1 | 630 |

### From `_startHealthCheck`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearInterval` | 1 | 638 |
| `setInterval` | 1 | 642 |
| `warn` | 2 | 643, 651 |
| `forEach` | 1 | 646 |
| `_unsubscribeFromEntity` | 1 | 652 |
| `delete` | 1 | 653 |

### From `destroy`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearInterval` | 1 | 712 |
| `forEach` | 1 | 714 |
| `_unsubscribeFromEntity` | 1 | 717 |
| `clear` | 2 | 719, 721 |

### From `setDirectApi`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `startsWith` | 1 | 735 |
| `getApiUrl` | 1 | 735 |
| `setFallbackEnabled` | 2 | 735, 738 |
| `warn` | 1 | 736 |
| `log` | 1 | 740 |
| `setTimeout` | 1 | 741 |
| `testApiEndpoints` | 1 | 744 |

### From `testApiEndpoints`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 753 |
| `testConnectionExactFormat` | 1 | 758 |
| `warn` | 1 | 765 |
| `now` | 1 | 770 |
| `error` | 1 | 772 |

### From `checkFilterCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `stringify` | 1 | 785 |
| `has` | 1 | 792 |
| `log` | 4 | 792, 824, 826, 833 |
| `resolve` | 1 | 794 |
| `add` | 1 | 797 |
| `startsWith` | 1 | 807 |
| `split` | 2 | 808, 849 |
| `error` | 4 | 809, 817, 837, 850 |
| `parseInt` | 1 | 814 |
| `isNaN` | 1 | 817 |
| `getParameterValue` | 1 | 826 |
| `compareParameterValues` | 1 | 833 |
| `useFallbackForCondition` | 1 | 843 |
| `includes` | 1 | 847 |
| `checkCrossEntityCondition` | 1 | 856 |
| `checkConditionWithRetry` | 1 | 860 |
| `setTimeout` | 1 | 861 |
| `delete` | 1 | 863 |

### From `checkConditionWithRetry`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 880 |
| `now` | 1 | 881 |
| `getParameterWithFallbackLogic` | 1 | 887 |
| `compareParameterValues` | 1 | 893 |
| `set` | 1 | 897 |

### From `getParameterWithFallbackLogic`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 916 |
| `log` | 2 | 930, 946 |
| `getPartIdFromParameterName` | 1 | 934 |
| `error` | 2 | 935, 963 |
| `useFallbackData` | 4 | 937, 959, 971, 978 |
| `getParameterValue` | 1 | 941 |
| `warn` | 4 | 951, 955, 967, 975 |

### From `getPartIdFromParameterName`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `match` | 1 | 990 |
| `parseInt` | 1 | 992 |
| `findEntityForPart` | 1 | 997 |
| `error` | 1 | 1006 |

### From `useFallbackData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1015, 1031 |
| `isArray` | 1 | 1024 |
| `find` | 1 | 1027 |
| `toLowerCase` | 2 | 1027, 1028 |
| `error` | 1 | 1040 |

### From `compareParameterValues`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 9 | 1052, 1069, 1073, 1077, 1081, 1085, 1089, 1093, 1096 |
| `toLowerCase` | 2 | 1058, 1059 |
| `String` | 2 | 1058, 1059 |
| `isNaN` | 2 | 1062, 1063 |
| `Number` | 4 | 1062, 1062, 1063, 1063 |
| `includes` | 1 | 1077 |

### From `resetApiFailureCounter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 1109 |

### From `_notifyParameterChanged`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1130, 1142 |
| `has` | 1 | 1142 |
| `add` | 1 | 1145 |
| `setTimeout` | 1 | 1148 |
| `delete` | 1 | 1149 |
| `dispatchEvent` | 1 | 1163 |

### From `getParameterFromEntityState`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `find` | 2 | 1186, 1188 |
| `toLowerCase` | 2 | 1188, 1188 |

### From `logApiUsageStats`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 3 | 1198, 1203, 1204 |
| `getApiStats` | 1 | 1203 |

### From `findEntityForPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `filter` | 1 | 1213 |
| `keys` | 1 | 1213 |
| `startsWith` | 1 | 1214 |
| `isArray` | 1 | 1221 |
| `find` | 1 | 1224 |

### From `checkCrossEntityCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 2 | 1252, 1282 |
| `find` | 1 | 1264 |
| `toLowerCase` | 2 | 1264, 1265 |
| `log` | 1 | 1269 |
| `compareParameterValues` | 1 | 1281 |

### From `useFallbackForCondition`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1291, 1313 |
| `startsWith` | 1 | 1296 |
| `split` | 2 | 1297, 1327 |
| `error` | 2 | 1298, 1358 |
| `isArray` | 1 | 1306 |
| `find` | 2 | 1309, 1346 |
| `toLowerCase` | 4 | 1309, 1310, 1346, 1347 |
| `compareParameterValues` | 2 | 1315, 1351 |
| `includes` | 1 | 1326 |
| `checkCrossEntityCondition` | 1 | 1334 |

### From `onParameterChange`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 1376 |
| `findEntityForPart` | 1 | 1379 |
| `trackLastUpdate` | 1 | 1382 |
| `updateParameter` | 1 | 1384 |
| `log` | 1 | 1387 |
| `dispatchEvent` | 2 | 1390, 1402 |
| `warn` | 1 | 1408 |
| `error` | 1 | 1411 |

### From `findEntityForPartAndTrack`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `findEntityForPart` | 1 | 1420 |
| `getInstance` | 1 | 1424 |
| `trackLastUpdate` | 1 | 1424 |

### From `_handleWebSocketMessage`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `parse` | 1 | 1433 |
| `log` | 1 | 1436 |
| `onParameterChange` | 1 | 1437 |
| `error` | 1 | 1443 |

### From `updateEntityData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 1453 |
| `setWebSocketData` | 1 | 1453 |
| `log` | 1 | 1456 |
| `dispatchEvent` | 1 | 1458 |

### From `testStateIntegration`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1468, 1494 |
| `getInstance` | 1 | 1472 |
| `setWebSocketData` | 2 | 1485, 1498 |
| `getWebSocketData` | 1 | 1491 |
| `error` | 2 | 1496, 1504 |

### From `initStateIntegration`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1513, 1538 |
| `testStateIntegration` | 1 | 1514 |
| `addEventListener` | 1 | 1517 |
| `findEntityForPart` | 1 | 1530 |
| `getInstance` | 1 | 1534 |
| `trackLastUpdate` | 1 | 1534 |

### From `testConnection`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 1548 |
| `getConnection` | 1 | 1555 |
| `log` | 1 | 1564 |
| `error` | 1 | 1568 |

### From `_classicSubscribeToEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 2 | 1579, 1586 |
| `set` | 1 | 1579 |
| `add` | 1 | 1581 |
| `get` | 2 | 1581, 1594 |
| `_subscribeToEntity` | 1 | 1586 |
| `log` | 1 | 1588 |
| `delete` | 2 | 1595, 1600 |
| `_unsubscribeFromEntity` | 1 | 1599 |

### From `_sendAuthentication`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 1611 |
| `getConnection` | 1 | 1617 |
| `send` | 1 | 1618 |
| `stringify` | 1 | 1619 |
| `log` | 1 | 1622 |
| `error` | 1 | 1626 |

### From `_sendSubscription`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `warn` | 1 | 1635 |
| `getConnection` | 1 | 1641 |
| `send` | 1 | 1642 |
| `stringify` | 1 | 1643 |
| `log` | 1 | 1646 |
| `error` | 1 | 1650 |

### From `_isMessageForEntity`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 1 | 1677 |
| `stringify` | 1 | 1677 |


## Incoming Calls (93 calls from other files)

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
| `matchesLocalCondition` | services/parameter-service.ts | 523 |
| `diagnosticDump` | services/parameter-service.ts | 684 |
| `findEntityForPart` | services/parameter-service.ts | 883 |
| `runDiagnostics` | services/parameter-service.ts | 953 |
| `findParameterInAllEntities` | services/parameter-service.ts | 1606 |
| `startIdleTimer` | services/rendering-service.ts | 236 |
| `processVariants` | services/variant-service.ts | 73 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 223 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 226 |

### To `findEntityForPart`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 284 |
| `_testSpecificParameter` | inventree-card.ts | 1236 |
| `matchesLocalCondition` | services/parameter-service.ts | 524 |
| `syncApiDataToEntityState` | services/parameter-service.ts | 844 |
| `updateParameter` | services/parameter-service.ts | 1270 |
| `findParameterInAllEntities` | services/parameter-service.ts | 1607 |
| `findEntityForPart` | services/state.ts | 45 |

### To `_notifyParameterChanged`

| Caller | File | Line |
|--------|------|------|
| `_handleWebSocketMessage` | components/grid/grid-layout.ts | 293 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 263 |

### To `checkFilterCondition`

| Caller | File | Line |
|--------|------|------|
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 539 |
| `_actuallyFilterParts` | components/grid/grid-layout.ts | 567 |

### To `setConfig`

| Caller | File | Line |
|--------|------|------|
| `setConfig` | inventree-card.ts | 236 |
| `updated` | inventree-card.ts | 335 |

### To `updateParameter`

| Caller | File | Line |
|--------|------|------|
| `_handleStockAdjustment` | inventree-card.ts | 646 |
| `updateParameterWithImmediateRefresh` | inventree-card.ts | 1102 |
| `handleWebSocketMessage` | services/card-controller.ts | 562 |
| `_handleParameterUpdate` | services/websocket-plugin.ts | 226 |

### To `setHass`

| Caller | File | Line |
|--------|------|------|
| `connectedCallback` | inventree-card.ts | 917 |
| `_initializeServices` | inventree-card.ts | 1279 |
| `setHass` | services/card-controller.ts | 106 |
| `initializeServices` | services/card-controller.ts | 192 |
| `setHass` | services/state.ts | 32 |

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

### To `subscribeToParts`

| Caller | File | Line |
|--------|------|------|
| `connectedCallback` | inventree-card.ts | 947 |
| `subscribeToEntityChanges` | services/card-controller.ts | 611 |

### To `destroy`

| Caller | File | Line |
|--------|------|------|
| `disconnectedCallback` | inventree-card.ts | 1004 |

### To `logApiUsageStats`

| Caller | File | Line |
|--------|------|------|
| `_runApiDiagnostics` | inventree-card.ts | 1162 |
| `_runApiDiagnostics` | inventree-card.ts | 1176 |

### To `resetApiFailureCounter`

| Caller | File | Line |
|--------|------|------|
| `_resetApiFailures` | inventree-card.ts | 1253 |

### To `getConnectionStatus`

| Caller | File | Line |
|--------|------|------|
| `getWebSocketDiagnostics` | services/card-controller.ts | 596 |

### To `getApiStatus`

| Caller | File | Line |
|--------|------|------|
| `getWebSocketDiagnostics` | services/card-controller.ts | 597 |

### To `_processMessage`

| Caller | File | Line |
|--------|------|------|
| `_handleMessage` | services/websocket-plugin.ts | 171 |


## File Dependencies

### Direct Dependencies (5)

- ../utils/logger
- ./api
- ../core/types
- ../core/inventree-state
- ./websocket-manager

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `checkFilterCondition` | 3792 | 4 | 2 |
| 2 | `subscribeToCrossEntityParameter` | 3594 | 0 | 4 |
| 3 | `getParameterWithFallbackLogic` | 3057 | 1 | 2 |
| 4 | `subscribeToFilteredParts` | 2906 | 0 | 3 |
| 5 | `useFallbackForCondition` | 2866 | 1 | 2 |
| 6 | `compareParameterValues` | 2701 | 5 | 3 |
| 7 | `_subscribeToEntity` | 2419 | 2 | 1 |
| 8 | `_resubscribeAll` | 2272 | 1 | 0 |
| 9 | `_unsubscribeFromEntity` | 2009 | 3 | 1 |
| 10 | `onParameterChange` | 1860 | 1 | 1 |
| 11 | `checkCrossEntityCondition` | 1570 | 2 | 4 |
| 12 | `testStateIntegration` | 1562 | 1 | 0 |
| 13 | `_notifyParameterChanged` | 1513 | 2 | 3 |
| 14 | `subscribeToParameter` | 1510 | 0 | 4 |
| 15 | `subscribeToEntity` | 1497 | 3 | 2 |
| 16 | `updateParameter` | 1495 | 6 | 3 |
| 17 | `initStateIntegration` | 1154 | 0 | 0 |
| 18 | `checkConditionWithRetry` | 1134 | 1 | 2 |
| 19 | `testConnection` | 1105 | 0 | 0 |
| 20 | `_classicSubscribeToEntity` | 1067 | 1 | 2 |
| 21 | `useFallbackData` | 1035 | 4 | 2 |
| 22 | `getPartIdFromParameterName` | 1029 | 1 | 1 |
| 23 | `testApiEndpoints` | 982 | 2 | 1 |
| 24 | `setDirectApi` | 900 | 8 | 1 |
| 25 | `_startHealthCheck` | 849 | 0 | 0 |
| 26 | `_sendAuthentication` | 843 | 1 | 0 |
| 27 | `setHass` | 838 | 5 | 1 |
| 28 | `subscribeToParts` | 838 | 4 | 2 |
| 29 | `_sendSubscription` | 827 | 1 | 1 |
| 30 | `findEntityForPart` | 792 | 11 | 1 |
| 31 | `_isMessageForEntity` | 763 | 1 | 2 |
| 32 | `filteredCallback` | 720 | 0 | 1 |
| 33 | `getParameterFromEntityState` | 636 | 0 | 3 |
| 34 | `_handleWebSocketMessage` | 630 | 0 | 1 |
| 35 | `_handleEntityMessage` | 608 | 0 | 3 |
| 36 | `_processMessage` | 593 | 2 | 1 |
| 37 | `logApiUsageStats` | 556 | 2 | 0 |
| 38 | `updateEntityData` | 526 | 0 | 2 |
| 39 | `getDiagnostics` | 465 | 0 | 0 |
| 40 | `_handleConnectionOpen` | 460 | 0 | 2 |
| 41 | `findEntityForPartAndTrack` | 425 | 0 | 1 |
| 42 | `getConnectionStatus` | 413 | 1 | 0 |
| 43 | `destroy` | 356 | 1 | 0 |
| 44 | `filteredCallback` | 353 | 0 | 1 |
| 45 | `getApiStatus` | 347 | 1 | 0 |
| 46 | `getPartIdFromEntityId` | 327 | 0 | 1 |
| 47 | `resetApiFailureCounter` | 308 | 1 | 0 |
| 48 | `getConnectionId` | 281 | 1 | 1 |
| 49 | `getInstance` | 239 | 60 | 0 |
| 50 | `setConfig` | 173 | 2 | 1 |
| 51 | `isConnected` | 160 | 1 | 0 |
| 52 | `getMaxApiFailures` | 150 | 0 | 0 |
