# File Analysis: inventree-card.ts

## Overview

- **Line Count:** 1931
- **Function Count:** 44
- **Imports:** 42 modules
  - From `lit`: html, css, PropertyValues, TemplateResult, LitElement
  - From `lit/decorators.js`: customElement, property, state
  - From `custom-card-helpers`: HomeAssistant, LovelaceCard, LovelaceCardEditor
  - From `./adapters/timer-adapter`: TimerAdapter
  - From `./utils/logger`: Logger
  - From `./services/rendering-service`: RenderingService
  - From `./services/card-controller`: CardController
  - From `./core/inventree-state`: InventTreeState
  - From `./core/types`: InventreeCardConfig, InventreeItem, CustomCardEntry
  - From `./services/wled-service`: WLEDService
  - From `./services/print-label`: PrintService
  - From `./services/api`: InvenTreeDirectAPI
  - From `./services/websocket`: WebSocketService
  - From `./services/websocket-plugin`: WebSocketPlugin
  - From `./core/constants`: CARD_NAME, EDITOR_NAME, CARD_VERSION
  - From `./services/parameter-service`: ParameterService
  - From `./components/redux-lit-element`: ReduxLitElement
  - From `./adapters/feature-flags`: getFeatureFlag, initializeFeatureFlags
  - From `./store`: store, RootState
  - From `./adapters/state-adapter`: StateAdapter
  - From `./editors/editor`: InventreeCardEditor
  - From `./components/grid/grid-layout`: (default import)
  - From `./components/detail/detail-layout`: (default import)
  - From `./components/list/list-layout`: (default import)
  - From `./components/part/part-view`: (default import)
  - From `./components/part/part-details`: (default import)
  - From `./components/part/part-thumbnail`: (default import)
  - From `./components/part/part-container`: (default import)
  - From `./components/part/part-buttons`: (default import)
  - From `./services/adjust-stock`: (default import)
  - From `./services/print-label`: (default import)
  - From `./services/wled-service`: (default import)
  - From `./services/parameter-service`: (default import)
  - From `./components/common/variant-handler`: VariantHandler
  - From `./services/cache`: CacheService, DEFAULT_TTL, CacheCategory
  - From `./components/variant/variant-layout`: (default import)
  - From `./components/part/part-variant`: (default import)
  - From `./components/parts/parts-layout`: (default import)
  - From `./adapters/base-layout-adapter`: (default import)
  - From `./adapters/grid-layout-adapter`: (default import)
  - From `./adapters/list-layout-adapter`: (default import)
  - From `./adapters/parts-layout-adapter`: (default import)
- **Exports:** 0 items

## Functions Defined (44)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 232 | `initReduxSelectors` | method | public | none | void | 744 |
| 318 | `getConfigElement` | method | public | none | Promise<LovelaceCardEditor> | 996 |
| 339 | `getStubConfig` | method | public | hass: HomeAssistant | InventreeCardConfig | 1239 |
| 372 | `setConfig` | method | public | config: InventreeCardConfig | void | 2236 |
| 429 | `_setupEntitySubscriptions` | method | private | none | void | 1940 |
| 452 | `subscribe` | arrow | public | entityIdToSubscribe: string | void | 924 |
| 474 | `_clearEntitySubscriptions` | method | private | none | void | 5199 |
| 589 | `_debouncedRender` | method | private | none | void | 473 |
| 597 | `updated` | method | public | changedProps: Map<string | number | symbol, unknown> | void | 813 |
| 615 | `render` | method | public | none | TemplateResult | void | 9299 |
| 800 | `_renderWithRedux` | method | private | none | TemplateResult | 2890 |
| 866 | `_computeHash` | method | private | str: string | number | 466 |
| 876 | `getSelectedPart` | method | public | parts: InventreeItem[] | InventreeItem | undefined | 437 |
| 892 | `getParts` | method | public | none | InventreeItem[] | 1109 |
| 922 | `_getReduxParts` | method | private | none | InventreeItem[] | 860 |
| 947 | `_updateReduxParts` | method | private | parts: InventreeItem[] | void | 778 |
| 967 | `getCardSize` | method | public | none | number | 650 |
| 984 | `handleLocateClick` | method | public | part: InventreeItem | void | 1589 |
| 1021 | `convertToInvenTreePart` | method | public | part: InventreeItem | InventreeItem | 2072 |
| 1070 | `_handleStockAdjustment` | method | private | e: CustomEvent | void | 1187 |
| 1094 | `_renderActionButtons` | method | private | part: InventreeItem | undefined | void | 855 |
| 1120 | `_handlePrintLabel` | method | private | part: InventreeItem | void | 1015 |
| 1141 | `getConfigForm` | method | public | none | void | 2389 |
| 1199 | `_compareValues` | method | private | value: any, filterValue: string, operator: string | boolean | 683 |
| 1221 | `_renderDebugInfo` | method | private | parts: InventreeItem[] | TemplateResult | 1009 |
| 1247 | `refreshParameterData` | method | public | partId: number, parameterName: string | Promise<void> | 993 |
| 1265 | `updateCrossEntityParameter` | method | public | parameterRef: string, value: string | Promise<void> | 2295 |
| 1316 | `updateParametersForMatchingParts` | method | public | conditionParam: string, conditionValue: string, updateParam: string, updateValue: string | Promise<void> | 2850 |
| 1386 | `handleParameterUpdateEvent` | method | public | event: CustomEvent | void | 674 |
| 1399 | `connectedCallback` | method | public | none | void | 3520 |
| 1485 | `_setupWebSocketSubscriptions` | method | private | none | void | 232 |
| 1492 | `_setupParameterEventListeners` | method | private | none | void | 190 |
| 1531 | `_initializeServices` | method | private | none | void | 1525 |
| 1560 | `requestUpdate` | method | public | name: PropertyKey, oldValue: unknown | void | 1365 |
| 1595 | `disconnectedCallback` | method | public | none | void | 2095 |
| 1649 | `_renderDebugTestPattern` | method | private | none | TemplateResult | 2807 |
| 1698 | `_setupDebugMode` | method | private | config: InventreeCardConfig | void | 1419 |
| 1736 | `_handleServiceInitialization` | method | private | none | void | 3109 |
| 1804 | `_runApiDiagnostics` | method | private | none | void | 1631 |
| 1838 | `_setupEventListeners` | method | private | none | void | 600 |
| 1854 | `dispatch` | method | public | action: any | void | 455 |
| 1874 | `setConfig` | method | public | config: InventreeCardConfig | void | 140 |
| 1886 | `getCardSize` | method | public | none | number | 105 |
| 1899 | `render` | method | public | none | void | 535 |

## Outgoing Calls (88 unique functions)

### From `initReduxSelectors`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 234 |
| `connectToRedux` | 2 | 238, 241 |

### From `getConfigElement`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 321 |
| `log` | 4 | 321, 325, 330, 334 |
| `error` | 1 | 327 |
| `createElement` | 1 | 334 |

### From `getStubConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `find` | 1 | 341 |
| `keys` | 1 | 341 |
| `startsWith` | 1 | 341 |

### From `setConfig`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 375 |
| `stringify` | 1 | 377 |
| `info` | 3 | 377, 404, 413 |
| `initializeFeatureFlags` | 1 | 389 |
| `_initializeServices` | 1 | 392 |
| `setConfig` | 1 | 395 |
| `_setupDebugMode` | 1 | 398 |
| `registerEntityOfInterest` | 2 | 408, 419 |
| `isArray` | 1 | 413 |
| `forEach` | 1 | 417 |
| `requestUpdate` | 1 | 423 |

### From `_setupEntitySubscriptions`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `_clearEntitySubscriptions` | 1 | 429 |
| `warn` | 2 | 434, 441 |
| `log` | 1 | 447 |
| `subscribe` | 1 | 468 |

### From `subscribe`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `subscribeEvents` | 1 | 455 |
| `log` | 2 | 457, 463 |
| `requestUpdate` | 1 | 458 |
| `set` | 1 | 461 |
| `error` | 1 | 465 |

### From `_clearEntitySubscriptions`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 5 | 474, 499, 528, 552, 576 |
| `values` | 1 | 486 |
| `unsubscribe` | 1 | 487 |
| `clear` | 1 | 490 |
| `getInstance` | 3 | 495, 524, 548 |
| `subscribeToEntity` | 2 | 498, 527 |
| `requestUpdate` | 2 | 503, 532 |
| `error` | 2 | 505, 534 |
| `set` | 2 | 511, 540 |
| `isArray` | 1 | 517 |
| `has` | 1 | 520 |
| `getNewestData` | 1 | 551 |
| `setHassData` | 1 | 556 |

### From `_debouncedRender`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearTimeout` | 1 | 589 |
| `setTimeout` | 1 | 592 |
| `requestUpdate` | 1 | 592 |

### From `updated`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `updated` | 1 | 597 |
| `has` | 1 | 600 |
| `setConfig` | 1 | 600 |
| `_setupEntitySubscriptions` | 1 | 601 |
| `setupRendering` | 1 | 604 |

### From `render`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `_renderWithRedux` | 1 | 619 |
| `log` | 4 | 620, 671, 685, 709 |
| `getParts` | 6 | 671, 709, 747, 766, 773, 780 |
| `getInstance` | 1 | 684 |
| `getNewestData` | 1 | 685 |
| `_renderDebugInfo` | 1 | 699 |
| `getSelectedPart` | 1 | 703 |
| `setTimeout` | 1 | 710 |
| `notifyRenderComplete` | 1 | 713 |
| `String` | 1 | 791 |
| `error` | 1 | 791 |

### From `_renderWithRedux`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `_getReduxParts` | 1 | 803 |
| `getSelectedPart` | 1 | 804 |
| `log` | 1 | 804 |
| `String` | 1 | 856 |
| `error` | 1 | 856 |

### From `_computeHash`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `charCodeAt` | 1 | 869 |
| `abs` | 1 | 873 |

### From `getSelectedPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `find` | 1 | 881 |

### From `getParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 895 |
| `getNewestData` | 1 | 902 |
| `set` | 1 | 902 |
| `_updateReduxParts` | 1 | 907 |
| `error` | 1 | 913 |

### From `_getReduxParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 1 | 938 |

### From `_updateReduxParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `dispatch` | 1 | 955 |
| `error` | 1 | 962 |

### From `getCardSize`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `parse` | 1 | 974 |
| `ceil` | 1 | 975 |

### From `handleLocateClick`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `convertToInvenTreePart` | 1 | 1000 |
| `locatePart` | 1 | 1009 |

### From `convertToInvenTreePart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 1055 |
| `filter` | 1 | 1055 |

### From `_handleStockAdjustment`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getParameterService` | 1 | 1075 |
| `error` | 2 | 1076, 1088 |
| `catch` | 1 | 1079 |
| `then` | 1 | 1079 |
| `updateParameter` | 1 | 1079 |
| `String` | 1 | 1082 |
| `log` | 1 | 1083 |
| `requestUpdate` | 1 | 1084 |

### From `_renderActionButtons`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `push` | 2 | 1100, 1109 |
| `handleLocateClick` | 1 | 1102 |
| `_handlePrintLabel` | 1 | 1111 |

### From `_handlePrintLabel`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `printLabel` | 1 | 1132 |
| `String` | 1 | 1136 |

### From `_compareValues`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `String` | 2 | 1204, 1206 |
| `includes` | 1 | 1206 |
| `toLowerCase` | 2 | 1206, 1206 |
| `Number` | 4 | 1208, 1208, 1210, 1210 |

### From `_renderDebugInfo`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `stringify` | 2 | 1230, 1234 |

### From `refreshParameterData`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1247, 1252 |
| `fetchParameterData` | 1 | 1252 |
| `error` | 1 | 1254 |

### From `updateCrossEntityParameter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 2 | 1266, 1305 |
| `getParameterService` | 1 | 1276 |
| `warn` | 1 | 1277 |
| `isDirectPartReference` | 1 | 1286 |
| `split` | 1 | 1288 |
| `updateParameter` | 1 | 1294 |
| `parseInt` | 1 | 1295 |
| `log` | 1 | 1298 |

### From `updateParametersForMatchingParts`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `error` | 3 | 1322, 1335, 1375 |
| `getParts` | 1 | 1332 |
| `getParameterService` | 1 | 1333 |
| `log` | 2 | 1341, 1362 |
| `matchesCondition` | 1 | 1360 |
| `updateParameter` | 1 | 1369 |
| `requestUpdate` | 1 | 1371 |

### From `handleParameterUpdateEvent`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `catch` | 1 | 1390 |
| `updateCrossEntityParameter` | 1 | 1390 |
| `String` | 1 | 1392 |
| `error` | 1 | 1393 |

### From `connectedCallback`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `connectedCallback` | 1 | 1404 |
| `log` | 5 | 1407, 1423, 1435, 1459, 1463 |
| `initializeFeatureFlags` | 1 | 1415 |
| `getFeatureFlag` | 1 | 1420 |
| `dispatch` | 1 | 1430 |
| `getWebSocketPlugin` | 1 | 1459 |
| `_setupWebSocketSubscriptions` | 1 | 1468 |
| `_setupParameterEventListeners` | 1 | 1471 |
| `error` | 2 | 1476, 1477 |

### From `_initializeServices`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 2 | 1535, 1546 |
| `getInstance` | 4 | 1543, 1544, 1545, 1546 |
| `String` | 1 | 1554 |
| `error` | 1 | 1554 |

### From `requestUpdate`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `requestUpdate` | 1 | 1566 |
| `log` | 1 | 1572 |
| `setConfig` | 1 | 1579 |
| `_debouncedRender` | 1 | 1581 |
| `error` | 2 | 1586, 1588 |

### From `disconnectedCallback`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `disconnectedCallback` | 1 | 1598 |
| `clearAll` | 1 | 1602 |
| `removeEventListener` | 1 | 1608 |
| `_clearEntitySubscriptions` | 1 | 1611 |
| `forEach` | 2 | 1614, 1618 |
| `unsubscribe` | 1 | 1617 |
| `cleanup` | 1 | 1621 |
| `dispatch` | 1 | 1629 |
| `log` | 1 | 1634 |
| `error` | 1 | 1643 |

### From `_renderDebugTestPattern`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getParts` | 1 | 1651 |
| `getInstance` | 2 | 1678, 1680 |
| `stringify` | 2 | 1685, 1690 |
| `slice` | 1 | 1685 |

### From `_setupDebugMode`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `setDebugConfig` | 1 | 1698 |
| `log` | 1 | 1700 |
| `getInstance` | 1 | 1715 |
| `configure` | 1 | 1719 |
| `connect` | 1 | 1725 |

### From `_handleServiceInitialization`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 4 | 1740, 1756, 1767, 1777 |
| `getInstance` | 1 | 1767 |
| `setParameterService` | 1 | 1774 |
| `setTimeout` | 1 | 1787 |
| `_runApiDiagnostics` | 1 | 1787 |
| `error` | 1 | 1791 |

### From `_runApiDiagnostics`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 3 | 1806, 1809, 1815 |
| `catch` | 1 | 1811 |
| `then` | 1 | 1811 |
| `testConnection` | 1 | 1811 |
| `setTimeout` | 2 | 1820, 1830 |
| `_runApiDiagnostics` | 2 | 1820, 1830 |
| `error` | 1 | 1825 |

### From `_setupEventListeners`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 1838 |
| `requestUpdate` | 1 | 1843 |
| `addEventListener` | 1 | 1845 |

### From `dispatch`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `dispatch` | 1 | 1854 |
| `log` | 1 | 1856 |


## Incoming Calls (128 calls from other files)

### To `connectedCallback`

| Caller | File | Line |
|--------|------|------|
| `connectedCallback` | adapters/base-layout-adapter.ts | 45 |
| `connectedCallback` | adapters/grid-layout-adapter.ts | 45 |
| `connectedCallback` | adapters/list-layout-adapter.ts | 48 |
| `connectedCallback` | adapters/part-view-adapter.ts | 55 |
| `connectedCallback` | adapters/parts-layout-adapter.ts | 46 |
| `connectedCallback` | adapters/redux-lit-mixin.ts | 48 |
| `connectedCallback` | adapters/variant-layout-adapter.ts | 42 |
| `connectedCallback` | components/common/base-layout.ts | 870 |
| `connectedCallback` | components/common/debug-view.ts | 1112 |
| `connectedCallback` | components/debug/redux-debug.ts | 209 |
| `connectedCallback` | components/grid/grid-layout.ts | 73 |
| `connectedCallback` | components/list/list-layout.ts | 54 |
| `connectedCallback` | components/part/part-buttons.ts | 66 |
| `connectedCallback` | components/redux-lit-element.ts | 10 |
| `connectedCallback` | components/variant/variant-layout.ts | 68 |

### To `disconnectedCallback`

| Caller | File | Line |
|--------|------|------|
| `disconnectedCallback` | adapters/base-layout-adapter.ts | 59 |
| `disconnectedCallback` | adapters/grid-layout-adapter.ts | 62 |
| `disconnectedCallback` | adapters/list-layout-adapter.ts | 72 |
| `disconnectedCallback` | adapters/part-view-adapter.ts | 69 |
| `disconnectedCallback` | adapters/parts-layout-adapter.ts | 63 |
| `disconnectedCallback` | adapters/redux-lit-mixin.ts | 65 |
| `disconnectedCallback` | adapters/variant-layout-adapter.ts | 90 |
| `disconnectedCallback` | components/common/base-layout.ts | 936 |
| `disconnectedCallback` | components/common/debug-view.ts | 1147 |
| `disconnectedCallback` | components/debug/redux-debug.ts | 226 |
| `disconnectedCallback` | components/grid/grid-layout.ts | 355 |
| `disconnectedCallback` | components/part/part-view.ts | 444 |
| `disconnectedCallback` | components/redux-lit-element.ts | 42 |
| `disconnectedCallback` | components/variant/variant-layout.ts | 390 |
| `disconnectedCallback` | editors/editor.ts | 720 |

### To `subscribe`

| Caller | File | Line |
|--------|------|------|
| `_connectToReduxStore` | adapters/base-layout-adapter.ts | 117 |
| `_connectToReduxStore` | adapters/grid-layout-adapter.ts | 121 |
| `_connectToReduxStore` | adapters/part-view-adapter.ts | 124 |
| `_connectToReduxStore` | adapters/parts-layout-adapter.ts | 125 |
| `_subscribeToStore` | adapters/redux-lit-mixin.ts | 132 |
| `registerRenderCallback` | adapters/rendering-service-adapter.ts | 40 |
| `connectedCallback` | adapters/variant-layout-adapter.ts | 53 |
| `connectedCallback` | components/redux-lit-element.ts | 20 |

### To `dispatch`

| Caller | File | Line |
|--------|------|------|
| `updateParameterValue` | adapters/base-layout-adapter.ts | 143 |
| `adjustStock` | adapters/part-view-adapter.ts | 166 |
| `dispatchRedux` | adapters/redux-lit-mixin.ts | 109 |
| `forceRender` | adapters/rendering-service-adapter.ts | 32 |
| `registerRenderCallback` | adapters/rendering-service-adapter.ts | 43 |
| `trackRenderTiming` | adapters/rendering-service-adapter.ts | 53 |
| `setIdleRenderTime` | adapters/rendering-service-adapter.ts | 69 |
| `updateParameter` | adapters/state-adapter.ts | 101 |
| `setDataSourcePriority` | adapters/state-adapter.ts | 148 |
| `setTimeout` | adapters/timer-adapter.ts | 54 |
| `clearTimeout` | adapters/timer-adapter.ts | 61 |
| `setInterval` | adapters/timer-adapter.ts | 73 |
| `clearInterval` | adapters/timer-adapter.ts | 80 |
| `clearAll` | adapters/timer-adapter.ts | 87 |
| `loadParts` | components/part-list.ts | 33 |
| `_increment` | components/redux-example.ts | 55 |
| `_decrement` | components/redux-example.ts | 59 |
| `_incrementByAmount` | components/redux-example.ts | 63 |
| `_reset` | components/redux-example.ts | 67 |
| `dispatch` | components/redux-lit-element.ts | 61 |
| `loadParts` | hooks/useParts.ts | 25 |
| `timerMiddleware` | store/middleware/timer-middleware.ts | 14 |
| `createTimeout` | store/slices/timerSlice.ts | 145 |
| `createInterval` | store/slices/timerSlice.ts | 174 |
| `clearTimeout` | store/slices/timerSlice.ts | 194 |
| `clearInterval` | store/slices/timerSlice.ts | 205 |
| `clearTimersForComponent` | store/slices/timerSlice.ts | 224 |
| `clearAllTimersAction` | store/slices/timerSlice.ts | 235 |

### To `setConfig`

| Caller | File | Line |
|--------|------|------|
| `setConfig` | adapters/card-controller-adapter.ts | 52 |
| `initializeServices` | services/card-controller.ts | 225 |

### To `getParts`

| Caller | File | Line |
|--------|------|------|
| `getParts` | adapters/card-controller-adapter.ts | 69 |
| `render` | components/common/base-layout-view.ts | 132 |
| `_registerCacheMissCallbacks` | components/common/base-layout.ts | 250 |
| `_loadData` | components/common/base-layout.ts | 402 |
| `_loadData` | components/common/base-layout.ts | 419 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 607 |
| `render` | components/list/list-layout.ts | 190 |

### To `requestUpdate`

| Caller | File | Line |
|--------|------|------|
| `_subscribeToStore` | adapters/redux-lit-mixin.ts | 153 |
| `_debugLoadData` | components/common/base-layout-view.ts | 289 |
| `_debugForceFilter` | components/common/base-layout-view.ts | 301 |
| `_debugResetState` | components/common/base-layout-view.ts | 333 |
| `_debugFixData` | components/common/base-layout-view.ts | 349 |
| `refreshData` | components/common/base-layout.ts | 774 |
| `subscribeToState` | components/common/base-layout.ts | 828 |
| `subscribeToState` | components/common/base-layout.ts | 846 |
| `subscribeToState` | components/common/base-layout.ts | 853 |
| `subscribeToState` | components/common/base-layout.ts | 859 |
| `connectedCallback` | components/common/base-layout.ts | 889 |
| `_scheduleParameterServiceRetry` | components/common/base-layout.ts | 924 |
| `_debugReloadData` | components/common/data-flow-debug.ts | 414 |
| `render` | components/common/data-flow-debug.ts | 652 |
| `render` | components/common/data-flow-debug.ts | 656 |
| `render` | components/common/data-flow-debug.ts | 660 |
| `render` | components/common/data-flow-debug.ts | 664 |
| `_togglePartExpansion` | components/common/debug-view.ts | 753 |
| `_debugForceRedraw` | components/common/debug-view.ts | 761 |
| `_debugRefreshData` | components/common/debug-view.ts | 770 |
| `_debugClearCache` | components/common/debug-view.ts | 796 |
| `_handleParameterUpdateEvent` | components/common/debug-view.ts | 1167 |
| `_handleWebSocketEvent` | components/common/debug-view.ts | 1185 |
| `_handleClearCache` | components/common/debug-view.ts | 1787 |
| `_filterParts` | components/grid/grid-layout.ts | 441 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 612 |
| `_checkAndRecoverState` | components/grid/grid-layout.ts | 624 |
| `_handleResetFilters` | components/grid/grid-layout.ts | 784 |
| `connectedCallback` | components/list/list-layout.ts | 66 |
| `updated` | components/part/part-container.ts | 184 |
| `connectedCallback` | components/redux-lit-element.ts | 36 |
| `_setupEntityListener` | components/variant/variant-layout.ts | 121 |
| `_setupIdleRenderTimer` | components/variant/variant-layout.ts | 210 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 279 |
| `_handleParameterChange` | components/variant/variant-layout.ts | 426 |
| `_selectVariantGroup` | components/variant/variant-layout.ts | 932 |
| `_toggleGroup` | components/variant/variant-layout.ts | 941 |
| `_editCondition` | editors/editor.ts | 1701 |
| `_closeConditionDialog` | editors/editor.ts | 1715 |
| `_editAction` | editors/editor.ts | 1827 |
| `_closeActionDialog` | editors/editor.ts | 1835 |
| `_renderActionDialog` | editors/editor.ts | 2152 |
| `_parameterTypeChanged` | editors/editor.ts | 2598 |

### To `updated`

| Caller | File | Line |
|--------|------|------|
| `updated` | adapters/variant-layout-adapter.ts | 145 |
| `updated` | components/detail/detail-layout.ts | 34 |
| `updated` | components/grid/grid-layout.ts | 498 |
| `updated` | components/list/list-layout.ts | 80 |
| `updated` | components/part/part-buttons.ts | 45 |
| `updated` | components/part/part-container.ts | 165 |
| `updated` | components/part/part-view.ts | 115 |
| `updated` | components/part-list.ts | 25 |
| `updated` | components/parts/parts-layout.ts | 22 |
| `updated` | components/variant/variant-layout.ts | 431 |


## File Dependencies

### Direct Dependencies (36)

- ./adapters/timer-adapter
- ./utils/logger
- ./services/rendering-service
- ./services/card-controller
- ./core/inventree-state
- ./core/types
- ./services/wled-service
- ./services/print-label
- ./services/api
- ./services/websocket
- ./services/websocket-plugin
- ./core/constants
- ./services/parameter-service
- ./components/redux-lit-element
- ./adapters/feature-flags
- ./store
- ./adapters/state-adapter
- ./editors/editor
- ./components/grid/grid-layout
- ./components/detail/detail-layout
- ./components/list/list-layout
- ./components/part/part-view
- ./components/part/part-details
- ./components/part/part-thumbnail
- ./components/part/part-container
- ./components/part/part-buttons
- ./services/adjust-stock
- ./components/common/variant-handler
- ./services/cache
- ./components/variant/variant-layout
- ./components/part/part-variant
- ./components/parts/parts-layout
- ./adapters/base-layout-adapter
- ./adapters/grid-layout-adapter
- ./adapters/list-layout-adapter
- ./adapters/parts-layout-adapter

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `render` | 9299 | 0 | 0 |
| 2 | `_clearEntitySubscriptions` | 5199 | 2 | 0 |
| 3 | `connectedCallback` | 3520 | 16 | 0 |
| 4 | `_handleServiceInitialization` | 3109 | 0 | 0 |
| 5 | `_renderWithRedux` | 2890 | 1 | 0 |
| 6 | `updateParametersForMatchingParts` | 2850 | 0 | 4 |
| 7 | `_renderDebugTestPattern` | 2807 | 0 | 0 |
| 8 | `getConfigForm` | 2389 | 0 | 0 |
| 9 | `updateCrossEntityParameter` | 2295 | 1 | 2 |
| 10 | `setConfig` | 2236 | 5 | 1 |
| 11 | `disconnectedCallback` | 2095 | 16 | 0 |
| 12 | `convertToInvenTreePart` | 2072 | 1 | 1 |
| 13 | `_setupEntitySubscriptions` | 1940 | 1 | 0 |
| 14 | `_runApiDiagnostics` | 1631 | 3 | 0 |
| 15 | `handleLocateClick` | 1589 | 1 | 1 |
| 16 | `_initializeServices` | 1525 | 1 | 0 |
| 17 | `_setupDebugMode` | 1419 | 1 | 1 |
| 18 | `requestUpdate` | 1365 | 52 | 2 |
| 19 | `getStubConfig` | 1239 | 0 | 1 |
| 20 | `_handleStockAdjustment` | 1187 | 0 | 1 |
| 21 | `getParts` | 1109 | 15 | 0 |
| 22 | `_handlePrintLabel` | 1015 | 1 | 1 |
| 23 | `_renderDebugInfo` | 1009 | 1 | 1 |
| 24 | `getConfigElement` | 996 | 0 | 0 |
| 25 | `refreshParameterData` | 993 | 0 | 2 |
| 26 | `subscribe` | 924 | 9 | 1 |
| 27 | `_getReduxParts` | 860 | 1 | 0 |
| 28 | `_renderActionButtons` | 855 | 0 | 1 |
| 29 | `updated` | 813 | 11 | 1 |
| 30 | `_updateReduxParts` | 778 | 1 | 1 |
| 31 | `initReduxSelectors` | 744 | 0 | 0 |
| 32 | `_compareValues` | 683 | 0 | 3 |
| 33 | `handleParameterUpdateEvent` | 674 | 0 | 1 |
| 34 | `getCardSize` | 650 | 0 | 0 |
| 35 | `_setupEventListeners` | 600 | 0 | 0 |
| 36 | `render` | 535 | 0 | 0 |
| 37 | `_debouncedRender` | 473 | 1 | 0 |
| 38 | `_computeHash` | 466 | 0 | 1 |
| 39 | `dispatch` | 455 | 32 | 1 |
| 40 | `getSelectedPart` | 437 | 2 | 1 |
| 41 | `_setupWebSocketSubscriptions` | 232 | 1 | 0 |
| 42 | `_setupParameterEventListeners` | 190 | 1 | 0 |
| 43 | `setConfig` | 140 | 5 | 1 |
| 44 | `getCardSize` | 105 | 0 | 0 |
