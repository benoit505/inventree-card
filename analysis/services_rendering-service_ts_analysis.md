# File Analysis: services/rendering-service.ts

## Overview

- **Line Count:** 944
- **Function Count:** 32
- **Imports:** 5 modules
  - From `../core/types`: DirectApiConfig
  - From `../core/inventree-state`: InventTreeState
  - From `../utils/logger`: Logger
  - From `./cache`: CacheService, DEFAULT_TTL, CacheCategory
  - From `../utils/timer-manager`: TimerManager
- **Exports:** 0 items

## Functions Defined (32)

| Line | Function | Type | Privacy | Parameters | Return Type | Length | Complexity |
|------|----------|------|---------|------------|-------------|--------|------------|
| 168 | `getInstance` | method | public | none | RenderingService | 190 | 5 |
| 173 | `setupRendering` | method | public | config: DirectApiConfig | void | 2489 | 8 |
| 251 | `handleWebSocketUpdate` | method | public | detail: any | void | 2411 | 7 |
| 307 | `startIdleTimer` | method | public | none | void | 1757 | 5 |
| 362 | `executeIdleRender` | method | public | autoRestart: boolean | void | 445 | 2 |
| 375 | `restartIdleTimer` | method | public | none | void | 430 | 2 |
| 394 | `registerRenderCallback` | method | public | callback: () => void | () => void | 401 | 2 |
| 422 | `notifyRenderCallbacks` | method | public | none | void | 2066 | 3 |
| 471 | `executeRenderCallbacks` | method | public | none | void | 714 | 3 |
| 483 | `forceRender` | method | public | none | void | 154 | 1 |
| 505 | `shouldRender` | method | public | entityId: string, dataHash: string | boolean | 1141 | 2 |
| 530 | `notifyRenderComplete` | method | public | none | void | 668 | 2 |
| 549 | `startScheduler` | method | public | none | void | 779 | 2 |
| 572 | `stopScheduler` | method | public | none | void | 522 | 2 |
| 593 | `processScheduledJobs` | method | public | none | void | 1426 | 7 |
| 638 | `shouldRunJob` | method | public | job: ScheduledJobConfig, now: Date | boolean | 1538 | 11 |
| 669 | `evaluateCronExpression` | method | public | cronExpression: string, now: Date | boolean | 1093 | 6 |
| 698 | `matchesCronPart` | method | public | cronPart: string, currentValue: number, min: number, max: number | boolean | 1349 | 11 |
| 737 | `calculateNextRunTime` | method | public | job: ScheduledJobConfig, now: Date | number | 494 | 3 |
| 751 | `addScheduledJob` | method | public | jobConfig: ScheduledJobConfig | void | 341 | 2 |
| 760 | `removeScheduledJob` | method | public | jobId: string | boolean | 322 | 1 |
| 770 | `updateScheduledJob` | method | public | jobId: string, updates: Partial<ScheduledJobConfig> | boolean | 407 | 2 |
| 783 | `getScheduledJobs` | method | public | none | ScheduledJobConfig[] | 152 | 1 |
| 790 | `getScheduledJob` | method | public | jobId: string | ScheduledJobConfig | undefined | 170 | 1 |
| 792 | `destroy` | method | public | none | void | 932 | 1 |
| 830 | `getTimerStats` | method | public | none | any | 171 | 1 |
| 839 | `getTimerDetails` | method | public | none | any | 196 | 1 |
| 848 | `getRenderingState` | method | public | none | {
    lastRenderTime: number,
    timeSinceLastRender: number,
    pendingRenders: number,
    maxRenderFrequency: number
  } | 543 | 1 |
| 866 | `getIdleTimerStatus` | method | public | none | {active: boolean, timeRemaining: number} | 319 | 1 |
| 878 | `getSchedulerStatus` | method | public | none | {
    active: boolean,
    jobCount: number,
    nextJobs: Array<{id: string, description?: string, nextRun: number}>
  } | 784 | 6 |
| 908 | `trackRenderTiming` | method | public | timingData: RenderTimingData | void | 1249 | 4 |
| 941 | `getRenderTimings` | method | public | none | RenderTimingData[] | 198 | 1 |

## Function Responsibility Analysis

| Function | State Mgmt | UI Rendering | Data Fetching | Event Handling | Service Init | Error Handling | Timer Mgmt | Responsibility Spread |
|----------|------------|--------------|---------------|----------------|--------------|----------------|-----------|----------------------|
| `getInstance` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| `setupRendering` | 0 | 17 | 0 | 1 | 0 | 0 | 0 | 2 |
| `handleWebSocketUpdate` | 0 | 3 | 0 | 0 | 0 | 0 | 2 | 2 |
| `startIdleTimer` | 0 | 4 | 0 | 0 | 5 | 6 | 5 | 4 |
| `executeIdleRender` | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 1 |
| `restartIdleTimer` | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 2 |
| `registerRenderCallback` | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 1 |
| `notifyRenderCallbacks` | 0 | 12 | 0 | 0 | 0 | 0 | 2 | 2 |
| `executeRenderCallbacks` | 0 | 3 | 0 | 0 | 0 | 3 | 0 | 2 |
| `forceRender` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| `shouldRender` | 0 | 9 | 0 | 0 | 0 | 0 | 0 | 1 |
| `notifyRenderComplete` | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 1 |
| `startScheduler` | 0 | 1 | 0 | 0 | 0 | 0 | 2 | 2 |
| `stopScheduler` | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 2 |
| `processScheduledJobs` | 0 | 2 | 0 | 0 | 0 | 3 | 0 | 2 |
| `shouldRunJob` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `evaluateCronExpression` | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |
| `matchesCronPart` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `calculateNextRunTime` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `addScheduledJob` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| `removeScheduledJob` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| `updateScheduledJob` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| `getScheduledJobs` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `getScheduledJob` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `destroy` | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 |
| `getTimerStats` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `getTimerDetails` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `getRenderingState` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `getIdleTimerStatus` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `getSchedulerStatus` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `trackRenderTiming` | 0 | 7 | 0 | 0 | 0 | 4 | 0 | 2 |
| `getRenderTimings` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |

## Outgoing Calls (57 unique functions)

### From `setupRendering`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 5 | 187, 194, 202, 209, 230 |
| `max` | 1 | 201 |
| `min` | 1 | 201 |
| `addEventListener` | 1 | 211 |
| `handleWebSocketUpdate` | 1 | 215 |
| `startIdleTimer` | 1 | 217 |
| `addScheduledJob` | 1 | 220 |
| `notifyRenderCallbacks` | 1 | 229 |

### From `handleWebSocketUpdate`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `add` | 1 | 255 |
| `clearTimeout` | 1 | 261 |
| `setTimeout` | 1 | 267 |
| `log` | 2 | 269, 280 |
| `join` | 1 | 276 |
| `sort` | 1 | 276 |
| `from` | 1 | 276 |
| `has` | 1 | 280 |
| `clear` | 2 | 284, 293 |
| `set` | 1 | 287 |
| `notifyRenderCallbacks` | 1 | 290 |

### From `startIdleTimer`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 309 |
| `warn` | 2 | 318, 319 |
| `error` | 2 | 328, 349 |
| `setTimeout` | 3 | 329, 342, 350 |
| `executeIdleRender` | 3 | 332, 344, 353 |

### From `executeIdleRender`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 362 |
| `notifyRenderCallbacks` | 1 | 366 |
| `startIdleTimer` | 1 | 372 |

### From `restartIdleTimer`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `log` | 1 | 380 |
| `clearTimeout` | 1 | 387 |
| `startIdleTimer` | 1 | 390 |

### From `registerRenderCallback`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `push` | 1 | 399 |
| `indexOf` | 1 | 404 |
| `splice` | 1 | 405 |

### From `notifyRenderCallbacks`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 424 |
| `substring` | 1 | 431 |
| `random` | 1 | 431 |
| `add` | 1 | 431 |
| `has` | 1 | 435 |
| `clearTimeout` | 1 | 435 |
| `get` | 1 | 436 |
| `setTimeout` | 1 | 440 |
| `delete` | 2 | 440, 442 |
| `executeRenderCallbacks` | 2 | 443, 455 |
| `set` | 1 | 447 |
| `log` | 1 | 450 |

### From `executeRenderCallbacks`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 473 |
| `callback` | 1 | 477 |
| `error` | 1 | 479 |

### From `forceRender`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `executeRenderCallbacks` | 1 | 488 |

### From `shouldRender`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `has` | 1 | 509 |
| `log` | 1 | 509 |
| `set` | 1 | 515 |

### From `notifyRenderComplete`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 532 |
| `log` | 1 | 535 |

### From `startScheduler`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearInterval` | 1 | 551 |
| `setInterval` | 1 | 559 |
| `processScheduledJobs` | 1 | 559 |
| `log` | 1 | 561 |

### From `stopScheduler`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `clearInterval` | 1 | 573 |
| `log` | 1 | 578 |

### From `processScheduledJobs`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `shouldRunJob` | 1 | 603 |
| `getTime` | 1 | 608 |
| `calculateNextRunTime` | 1 | 611 |
| `log` | 1 | 611 |
| `callback` | 1 | 614 |
| `error` | 1 | 618 |

### From `shouldRunJob`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getTime` | 1 | 644 |
| `getHours` | 1 | 649 |
| `getMinutes` | 1 | 650 |
| `padStart` | 2 | 651, 651 |
| `includes` | 1 | 654 |
| `evaluateCronExpression` | 1 | 659 |

### From `evaluateCronExpression`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `split` | 1 | 671 |
| `getMinutes` | 1 | 679 |
| `getHours` | 1 | 680 |
| `getDate` | 1 | 681 |
| `getMonth` | 1 | 682 |
| `getDay` | 1 | 683 |
| `matchesCronPart` | 5 | 686, 687, 688, 689, 690 |

### From `matchesCronPart`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 5 | 703, 705, 709, 715, 723 |
| `map` | 3 | 704, 710, 724 |
| `split` | 4 | 704, 710, 716, 724 |
| `parseInt` | 5 | 704, 710, 717, 724, 731 |

### From `calculateNextRunTime`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getTime` | 2 | 740, 745 |

### From `addScheduledJob`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `set` | 1 | 751 |
| `log` | 1 | 752 |

### From `removeScheduledJob`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `delete` | 1 | 761 |
| `log` | 1 | 761 |

### From `updateScheduledJob`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 771 |
| `assign` | 1 | 772 |
| `log` | 1 | 774 |

### From `getScheduledJobs`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `from` | 1 | 784 |
| `values` | 1 | 784 |

### From `getScheduledJob`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 791 |

### From `destroy`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getActiveTimers` | 1 | 800 |
| `clearAll` | 1 | 802 |
| `clear` | 2 | 810, 814 |
| `log` | 1 | 817 |

### From `getTimerStats`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getStats` | 1 | 831 |

### From `getTimerDetails`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getActiveTimers` | 1 | 840 |

### From `getRenderingState`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 854 |

### From `getSchedulerStatus`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 887 |
| `slice` | 1 | 887 |
| `sort` | 1 | 887 |
| `filter` | 1 | 887 |
| `from` | 1 | 887 |
| `values` | 1 | 887 |

### From `trackRenderTiming`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `now` | 1 | 912 |
| `push` | 1 | 913 |
| `shift` | 1 | 919 |
| `log` | 1 | 921 |
| `error` | 1 | 928 |


## Incoming Calls (131 calls from other files)

### To `getInstance`

| Caller | File | Line |
|--------|------|------|
| `_updateListLayoutProps` | `adapters/list-layout-adapter.ts` | 107 |
| `_updateListLayoutProps` | `adapters/list-layout-adapter.ts` | 114 |
| `ReduxLitMixin` | `adapters/redux-lit-mixin.ts` | 43 |
| `getParts` | `adapters/state-adapter.ts` | 58 |
| `getPartById` | `adapters/state-adapter.ts` | 85 |
| `updateParameter` | `adapters/state-adapter.ts` | 109 |
| `updateParameter` | `adapters/state-adapter.ts` | 116 |
| `getDataSourcePriority` | `adapters/state-adapter.ts` | 139 |
| `setDataSourcePriority` | `adapters/state-adapter.ts` | 158 |
| `render` | `components/common/base-layout-view.ts` | 129 |
| `render` | `components/common/base-layout-view.ts` | 130 |
| `_debugResetState` | `components/common/base-layout-view.ts` | 320 |
| `_debugResetState` | `components/common/base-layout-view.ts` | 323 |
| `_debugFixData` | `components/common/base-layout-view.ts` | 345 |
| `_registerCacheMissCallbacks` | `components/common/base-layout.ts` | 239 |
| `_registerCacheMissCallbacks` | `components/common/base-layout.ts` | 249 |
| `_safeGetParameterService` | `components/common/base-layout.ts` | 273 |
| `_safeGetParameterService` | `components/common/base-layout.ts` | 278 |
| `_safeGetParameterService` | `components/common/base-layout.ts` | 291 |
| `_loadData` | `components/common/base-layout.ts` | 375 |
| `_loadData` | `components/common/base-layout.ts` | 401 |
| `_loadData` | `components/common/base-layout.ts` | 419 |
| `_loadData` | `components/common/base-layout.ts` | 420 |
| `getParts` | `components/common/base-layout.ts` | 766 |
| `updateFilteredParts` | `components/common/base-layout.ts` | 1065 |
| `updateFilteredParts` | `components/common/base-layout.ts` | 1066 |
| `_updateDataSourceStats` | `components/common/data-flow-debug.ts` | 328 |
| `_debugClearCache` | `components/common/data-flow-debug.ts` | 427 |
| `_renderWebSocketDiagnostics` | `components/common/data-flow-debug.ts` | 522 |
| `_renderCacheStats` | `components/common/data-flow-debug.ts` | 582 |
| `_debugClearCache` | `components/common/debug-view.ts` | 782 |
| `_debugClearCache` | `components/common/debug-view.ts` | 783 |
| `_renderPartsDebug` | `components/common/debug-view.ts` | 985 |
| `_handleWebSocketEvent` | `components/common/debug-view.ts` | 1173 |
| `_updateDataSourceStats` | `components/common/debug-view.ts` | 1191 |
| `_getLastSourceUpdate` | `components/common/debug-view.ts` | 1228 |
| `_updateCacheStats` | `components/common/debug-view.ts` | 1243 |
| `_renderWebSocketStatus` | `components/common/debug-view.ts` | 1388 |
| `_sendPing` | `components/common/debug-view.ts` | 1428 |
| `_renderRawStateDebug` | `components/common/debug-view.ts` | 1440 |
| `_renderRawEntityData` | `components/common/debug-view.ts` | 1537 |
| `_renderOrphanedPartsData` | `components/common/debug-view.ts` | 1641 |
| `_getParameterService` | `components/common/debug-view.ts` | 1700 |
| `_handleClearCache` | `components/common/debug-view.ts` | 1773 |
| `_handleClearCache` | `components/common/debug-view.ts` | 1774 |
| `_renderCacheStats` | `components/common/debug-view.ts` | 1895 |
| `processItems` | `components/common/variant-handler.ts` | 22 |
| `processItems` | `components/common/variant-handler.ts` | 124 |
| `_updateVisualModifiers` | `components/detail/detail-layout.ts` | 66 |
| `_updateVisualModifiers` | `components/grid/grid-layout.ts` | 485 |
| `_updateVisualModifiers` | `components/list/list-layout.ts` | 131 |
| `render` | `components/list/list-layout.ts` | 189 |
| `loadPartsFromEntities` | `components/parts/parts-layout.ts` | 41 |
| `_updateVisualModifiers` | `components/parts/parts-layout.ts` | 84 |
| `_updateSubsystem` | `editors/editor.ts` | 2472 |
| `_clearEntitySubscriptions` | `inventree-card.ts` | 477 |
| `_clearEntitySubscriptions` | `inventree-card.ts` | 506 |
| `_clearEntitySubscriptions` | `inventree-card.ts` | 530 |
| `render` | `inventree-card.ts` | 666 |
| `_initializeServices` | `inventree-card.ts` | 1525 |
| `_initializeServices` | `inventree-card.ts` | 1526 |
| `_initializeServices` | `inventree-card.ts` | 1527 |
| `_initializeServices` | `inventree-card.ts` | 1528 |
| `_renderDebugTestPattern` | `inventree-card.ts` | 1650 |
| `_renderDebugTestPattern` | `inventree-card.ts` | 1652 |
| `_setupDebugMode` | `inventree-card.ts` | 1687 |
| `_handleServiceInitialization` | `inventree-card.ts` | 1739 |
| `setHass` | `services/card-controller.ts` | 179 |
| `initializeServices` | `services/card-controller.ts` | 220 |
| `initializeServices` | `services/card-controller.ts` | 229 |
| `initializeServices` | `services/card-controller.ts` | 257 |
| `loadEntityData` | `services/card-controller.ts` | 343 |
| `getParts` | `services/card-controller.ts` | 389 |
| `getWebSocketService` | `services/card-controller.ts` | 413 |
| `initializeWebSocketPlugin` | `services/card-controller.ts` | 475 |
| `handleWebSocketMessage` | `services/card-controller.ts` | 565 |
| `getWebSocketDiagnostics` | `services/card-controller.ts` | 637 |
| `getWebSocketDiagnostics` | `services/card-controller.ts` | 638 |
| `matchesConditionSyncVersion` | `services/parameter-service.ts` | 216 |
| `getParameterValueFromPart` | `services/parameter-service.ts` | 460 |
| `getParameterValueWithDirectReference` | `services/parameter-service.ts` | 486 |
| `findEntityForPart` | `services/parameter-service.ts` | 512 |
| `storeOrphanedParameter` | `services/parameter-service.ts` | 521 |
| `isOrphanedPart` | `services/parameter-service.ts` | 529 |
| `getOrphanedPartIds` | `services/parameter-service.ts` | 537 |
| `getOrphanedPartParameters` | `services/parameter-service.ts` | 545 |
| `findParameterInWebSocketData` | `services/parameter-service.ts` | 553 |
| `findParameterInApiData` | `services/parameter-service.ts` | 561 |
| `findParameterInHassData` | `services/parameter-service.ts` | 569 |
| `findParameterInAllEntities` | `services/parameter-service.ts` | 577 |
| `syncApiDataToEntityState` | `services/parameter-service.ts` | 686 |
| `getParameterFromEntity` | `services/parameter-service.ts` | 717 |
| `processVariants` | `services/variant-service.ts` | 73 |
| `_handleParameterUpdate` | `services/websocket-plugin.ts` | 735 |
| `_handleParameterUpdate` | `services/websocket-plugin.ts` | 739 |
| `loggingMiddleware` | `store/middleware/logging-middleware.ts` | 17 |
| `servicesMiddleware` | `store/middleware/services-middleware.ts` | 15 |
| `servicesMiddleware` | `store/middleware/services-middleware.ts` | 26 |
| `servicesMiddleware` | `store/middleware/services-middleware.ts` | 48 |
| `safelyRegisterElement` | `utils/custom-element-registry.ts` | 15 |
### To `forceRender`

| Caller | File | Line |
|--------|------|------|
| `forceRender` | `adapters/rendering-service-adapter.ts` | 93 |
| `forceRender` | `adapters/rendering-service-adapter.ts` | 193 |
| `restartIdleTimer` | `adapters/rendering-service-adapter.ts` | 240 |
| `requestUpdate` | `components/common/base-layout.ts` | 985 |
| `_handleParameterUpdate` | `services/websocket-plugin.ts` | 739 |
### To `registerRenderCallback`

| Caller | File | Line |
|--------|------|------|
| `registerRenderCallback` | `adapters/rendering-service-adapter.ts` | 99 |
| `registerRenderCallback` | `adapters/rendering-service-adapter.ts` | 203 |
| `connectedCallback` | `components/common/base-layout.ts` | 888 |
### To `trackRenderTiming`

| Caller | File | Line |
|--------|------|------|
| `trackRenderTiming` | `adapters/rendering-service-adapter.ts` | 103 |
| `trackRenderTiming` | `adapters/rendering-service-adapter.ts` | 210 |
| `reportRenderTiming` | `components/common/base-layout.ts` | 1029 |
### To `getRenderTimings`

| Caller | File | Line |
|--------|------|------|
| `getRenderTimings` | `adapters/rendering-service-adapter.ts` | 109 |
| `getRenderTimings` | `adapters/rendering-service-adapter.ts` | 219 |
### To `restartIdleTimer`

| Caller | File | Line |
|--------|------|------|
| `setIdleRenderTime` | `adapters/rendering-service-adapter.ts` | 119 |
| `restartIdleTimer` | `adapters/rendering-service-adapter.ts` | 232 |
| `restartIdleTimer` | `adapters/rendering-service-adapter.ts` | 243 |
| `setIdleRenderTime` | `adapters/rendering-service-adapter.ts` | 268 |
### To `setupRendering`

| Caller | File | Line |
|--------|------|------|
| `setupRendering` | `adapters/rendering-service-adapter.ts` | 173 |
| `updated` | `inventree-card.ts` | 586 |
| `setConfig` | `services/card-controller.ts` | 165 |
| `initializeServices` | `services/card-controller.ts` | 260 |
### To `getIdleTimerStatus`

| Caller | File | Line |
|--------|------|------|
| `restartIdleTimer` | `adapters/rendering-service-adapter.ts` | 231 |
### To `notifyRenderComplete`

| Caller | File | Line |
|--------|------|------|
| `notifyRenderComplete` | `adapters/rendering-service-adapter.ts` | 252 |
| `updateFilteredParts` | `components/common/base-layout.ts` | 1116 |
| `render` | `inventree-card.ts` | 695 |
### To `addScheduledJob`

| Caller | File | Line |
|--------|------|------|
| `addScheduledJob` | `adapters/rendering-service-adapter.ts` | 260 |
### To `shouldRender`

| Caller | File | Line |
|--------|------|------|
| `shouldRender` | `adapters/rendering-service-adapter.ts` | 281 |
### To `getTimerStats`

| Caller | File | Line |
|--------|------|------|
| `getTimerStats` | `adapters/rendering-service-adapter.ts` | 295 |
| `getDiagnostics` | `services/websocket-plugin.ts` | 914 |
### To `getRenderingState`

| Caller | File | Line |
|--------|------|------|
| `getRenderingState` | `adapters/rendering-service-adapter.ts` | 303 |
### To `destroy`

| Caller | File | Line |
|--------|------|------|
| `destroy` | `adapters/rendering-service-adapter.ts` | 314 |
