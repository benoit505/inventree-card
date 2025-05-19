# Codebase Analysis

## Summary

- **Total Files:** 50
- **Total Functions:** 499
- **Total Lines of Code:** 19465
- **Public Functions:** 348 (70%)
- **Private Functions:** 151 (30%)
- **Average Functions Per File:** 9.98
- **Average Lines Per File:** 389.30

## Top 10 Files by Function Count

| File | Functions | Private | Public | Lines |
|------|-----------|---------|--------|-------|
| services/websocket.ts | 52 | 13 | 39 | 1705 |
| services/parameter-service.ts | 50 | 0 | 50 | 1836 |
| editors/editor.ts | 40 | 36 | 4 | 2484 |
| inventree-card.ts | 37 | 15 | 22 | 1326 |
| components/variant/variant-layout.ts | 32 | 28 | 4 | 943 |
| components/grid/grid-layout.ts | 27 | 21 | 6 | 1029 |
| services/rendering-service.ts | 26 | 0 | 26 | 653 |
| utils/logger.ts | 25 | 0 | 25 | 658 |
| core/inventree-state.ts | 22 | 1 | 21 | 406 |
| services/api.ts | 21 | 0 | 21 | 702 |

## Top 10 Files by Line Count

| File | Lines | Functions | Private | Public |
|------|-------|-----------|---------|--------|
| editors/editor.ts | 2484 | 40 | 36 | 4 |
| services/parameter-service.ts | 1836 | 50 | 0 | 50 |
| services/websocket.ts | 1705 | 52 | 13 | 39 |
| inventree-card.ts | 1326 | 37 | 15 | 22 |
| components/grid/grid-layout.ts | 1029 | 27 | 21 | 6 |
| components/variant/variant-layout.ts | 943 | 32 | 28 | 4 |
| components/common/base-layout.ts | 728 | 16 | 7 | 9 |
| services/api.ts | 702 | 21 | 0 | 21 |
| utils/logger.ts | 658 | 25 | 0 | 25 |
| services/rendering-service.ts | 653 | 26 | 0 | 26 |

## Directory Breakdown

| Directory | File Count |
|-----------|------------|
| services | 15 |
| components/part | 6 |
| styles | 5 |
| styles/layouts | 5 |
| core | 4 |
| styles/components | 3 |
| components/common | 2 |
| . | 2 |
| utils | 2 |
| components/detail | 1 |
| components/grid | 1 |
| components/list | 1 |
| components/parts | 1 |
| components/variant | 1 |
| editors | 1 |

## Functions By File

### components/common/base-layout.ts (16 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 56 | `_safeGetParameterService` | ✓ |
| 82 | `connectedCallback` |   |
| 119 | `_scheduleParameterServiceRetry` | ✓ |
| 148 | `disconnectedCallback` |   |
| 172 | `subscribeToState` |   |
| 174 | `addListener` |   |
| 235 | `_loadData` | ✓ |
| 362 | `_applyParameterFiltering` | ✓ |
| 488 | `getParts` |   |
| 498 | `refreshData` |   |
| 506 | `_computePartsHash` | ✓ |
| 512 | `updated` |   |
| 578 | `requestUpdate` |   |
| 611 | `_updateVisualModifiers` | ✓ |
| 617 | `updateFilteredParts` |   |
| 684 | `_applyParameterFilteringSync` | ✓ |

### components/common/variant-handler.ts (5 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 15 | `processItems` |   |
| 130 | `isVariant` |   |
| 136 | `calculateTotalStock` |   |
| 142 | `processVariants` |   |
| 160 | `getTotalStock` |   |

### components/detail/detail-layout.ts (8 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 28 | `firstUpdated` |   |
| 34 | `updated` |   |
| 43 | `_updateDisplayedStock` | ✓ |
| 52 | `_updateVisualModifiers` | ✓ |
| 86 | `_getContainerStyle` | ✓ |
| 104 | `_getTextStyle` | ✓ |
| 112 | `_handleImageError` | ✓ |
| 117 | `render` |   |

### components/grid/grid-layout.ts (27 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 60 | `connectedCallback` |   |
| 77 | `_setupListeners` | ✓ |
| 104 | `_setupParameterListener` | ✓ |
| 115 | `_setupEntityListener` | ✓ |
| 133 | `_setupWebSocketConnection` | ✓ |
| 201 | `_setupIdleRenderTimer` | ✓ |
| 222 | `_handleWebSocketOpen` | ✓ |
| 237 | `_sendWebSocketAuthentication` | ✓ |
| 250 | `_sendWebSocketSubscription` | ✓ |
| 263 | `_handleWebSocketMessage` | ✓ |
| 322 | `_notifyParameterChanged` | ✓ |
| 339 | `_cleanupListeners` | ✓ |
| 367 | `disconnectedCallback` |   |
| 384 | `_haveConditionsChanged` | ✓ |
| 402 | `_handleParameterChange` | ✓ |
| 426 | `forceImmediateFilter` |   |
| 432 | `_filterParts` | ✓ |
| 450 | `_actuallyFilterParts` | ✓ |
| 608 | `_updateVisualModifiers` | ✓ |
| 646 | `updated` |   |
| 718 | `_getContainerStyle` | ✓ |
| 740 | `_getTextStyle` | ✓ |
| 745 | `_handleImageError` | ✓ |
| 751 | `getButtonConfig` |   |
| 789 | `_checkAndRecoverState` | ✓ |
| 821 | `render` |   |
| 1020 | `_handleResetFilters` | ✓ |

### components/list/list-layout.ts (7 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 17 | `updated` |   |
| 30 | `_updateVisualModifiers` | ✓ |
| 63 | `render` |   |
| 130 | `_renderPartWithSize` | ✓ |
| 224 | `_getContainerStyle` | ✓ |
| 246 | `_getTextStyle` | ✓ |
| 251 | `_handleImageError` | ✓ |

### components/part/part-buttons.ts (9 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 45 | `updated` |   |
| 64 | `connectedCallback` |   |
| 71 | `handleClick` |   |
| 194 | `isLEDActiveForPart` |   |
| 215 | `render` |   |
| 240 | `getButtonColor` |   |
| 254 | `getButtonTitle` |   |
| 265 | `getDefaultLabel` |   |
| 275 | `getButtonConfig` |   |

### components/part/part-container.ts (3 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 138 | `updated` |   |
| 163 | `render` |   |
| 233 | `_handleImageError` | ✓ |

### components/part/part-details.ts (1 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 8 | `render` |   |

### components/part/part-thumbnail.ts (1 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 9 | `render` |   |

### components/part/part-variant.ts (6 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 18 | `updated` |   |
| 39 | `logVariantDetails` |   |
| 59 | `render` |   |
| 93 | `renderGridView` |   |
| 135 | `renderListView` |   |
| 187 | `renderTreeView` |   |

### components/part/part-view.ts (7 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 24 | `updated` |   |
| 144 | `render` |   |
| 233 | `_adjustStock` | ✓ |
| 240 | `_locateInWLED` | ✓ |
| 247 | `_printLabel` | ✓ |
| 254 | `getStockStatus` |   |
| 265 | `getStockColor` |   |

### components/parts/parts-layout.ts (13 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 22 | `updated` |   |
| 35 | `loadPartsFromEntities` |   |
| 65 | `_updateVisualModifiers` | ✓ |
| 96 | `applyFilters` |   |
| 127 | `matchesFilter` |   |
| 147 | `matchesParameterFilter` |   |
| 172 | `_compareFilterValues` | ✓ |
| 193 | `_getContainerStyle` | ✓ |
| 212 | `_getTextStyle` | ✓ |
| 221 | `_handleImageError` | ✓ |
| 226 | `render` |   |
| 244 | `_renderGridView` | ✓ |
| 276 | `_renderListView` | ✓ |

### components/variant/variant-layout.ts (32 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 49 | `connectedCallback` |   |
| 58 | `_setupListeners` | ✓ |
| 85 | `_setupParameterListener` | ✓ |
| 96 | `_setupEntityListener` | ✓ |
| 117 | `_setupWebSocketConnection` | ✓ |
| 175 | `_setupIdleRenderTimer` | ✓ |
| 198 | `_handleWebSocketOpen` | ✓ |
| 213 | `_sendWebSocketAuthentication` | ✓ |
| 226 | `_sendWebSocketSubscription` | ✓ |
| 239 | `_sendWebSocketKeepAlive` | ✓ |
| 252 | `_handleWebSocketMessage` | ✓ |
| 290 | `_notifyParameterChanged` | ✓ |
| 307 | `_handleWebSocketError` | ✓ |
| 312 | `_handleWebSocketClose` | ✓ |
| 337 | `_cleanupListeners` | ✓ |
| 372 | `disconnectedCallback` |   |
| 383 | `_handleParameterChange` | ✓ |
| 408 | `updated` |   |
| 430 | `_processVariants` | ✓ |
| 473 | `_updateVisualModifiers` | ✓ |
| 514 | `_getContainerStyle` | ✓ |
| 533 | `_getTextStyle` | ✓ |
| 542 | `_handleImageError` | ✓ |
| 547 | `render` |   |
| 561 | `_renderVariantGroups` | ✓ |
| 583 | `_renderDropdownView` | ✓ |
| 639 | `_renderTabsView` | ✓ |
| 695 | `_renderListView` | ✓ |
| 765 | `_renderTreeView` | ✓ |
| 840 | `_renderGridView` | ✓ |
| 925 | `_selectVariantGroup` | ✓ |
| 929 | `_toggleGroup` | ✓ |

### core/inventree-state.ts (22 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 45 | `getInstance` |   |
| 55 | `setPriorityDataSource` |   |
| 66 | `trackLastUpdate` |   |
| 78 | `getLastUpdate` |   |
| 86 | `setWebSocketData` |   |
| 95 | `setApiData` |   |
| 104 | `setHassData` |   |
| 113 | `registerEntityOfInterest` |   |
| 123 | `setHass` |   |
| 145 | `getWebSocketData` |   |
| 152 | `getApiData` |   |
| 159 | `getHassData` |   |
| 174 | `getNewestData` |   |
| 202 | `updateParameter` |   |
| 272 | `updateParameterInSource` |   |
| 299 | `_updateParameterCache` | ✓ |
| 311 | `getParameterValue` |   |
| 338 | `findEntityForPart` |   |
| 371 | `clearCache` |   |
| 382 | `unregisterEntityOfInterest` |   |
| 398 | `getTrackedEntities` |   |
| 403 | `triggerRefresh` |   |

### core/settings.ts (2 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 193 | `validateSetting` |   |
| 198 | `getSettingGroup` |   |

### editors/editor.ts (40 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 604 | `setConfig` |   |
| 613 | `_updateConfig` | ✓ |
| 635 | `render` |   |
| 1088 | `_renderPartsConfig` | ✓ |
| 1234 | `_entitySelected` | ✓ |
| 1251 | `_removeEntity` | ✓ |
| 1262 | `_valueChanged` | ✓ |
| 1361 | `getConfigForm` |   |
| 1382 | `getStubConfig` |   |
| 1417 | `_getOperatorLabel` | ✓ |
| 1441 | `_addFilter` | ✓ |
| 1469 | `_removeFilter` | ✓ |
| 1480 | `_showParameterFilterDialog` | ✓ |
| 1485 | `_addParameterFilter` | ✓ |
| 1521 | `_getActionLabel` | ✓ |
| 1536 | `_addCondition` | ✓ |
| 1547 | `_editCondition` | ✓ |
| 1565 | `_closeConditionDialog` | ✓ |
| 1571 | `_saveCondition` | ✓ |
| 1624 | `_removeCondition` | ✓ |
| 1641 | `_addAction` | ✓ |
| 1653 | `_editAction` | ✓ |
| 1672 | `_closeActionDialog` | ✓ |
| 1678 | `_saveAction` | ✓ |
| 1722 | `_removeAction` | ✓ |
| 1739 | `_renderConditionDialog` | ✓ |
| 1891 | `_renderActionValueInput` | ✓ |
| 1977 | `_renderActionDialog` | ✓ |
| 2084 | `_renderDirectApiConfig` | ✓ |
| 2176 | `_renderDebuggingSection` | ✓ |
| 2285 | `_formatSystemName` | ✓ |
| 2302 | `_getSubsystem` | ✓ |
| 2313 | `_updateSubsystem` | ✓ |
| 2368 | `_formatSubsystemName` | ✓ |
| 2378 | `_getPerformanceSetting` | ✓ |
| 2395 | `_updatePerformanceSetting` | ✓ |
| 2423 | `_parameterTypeChanged` | ✓ |
| 2448 | `_getMethodDescription` | ✓ |
| 2464 | `_renderScheduledJobs` | ✓ |
| 2476 | `_showAddJobDialog` | ✓ |

### inventree-card.ts (37 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 174 | `getConfigElement` |   |
| 183 | `getStubConfig` |   |
| 215 | `setConfig` |   |
| 252 | `_setupEntitySubscriptions` | ✓ |
| 268 | `subscribe` |   |
| 290 | `_clearEntitySubscriptions` | ✓ |
| 303 | `debouncedRender` |   |
| 332 | `updated` |   |
| 350 | `render` |   |
| 469 | `_computeHash` | ✓ |
| 479 | `getSelectedPart` |   |
| 495 | `getParts` |   |
| 534 | `getCardSize` |   |
| 551 | `handleLocateClick` |   |
| 588 | `convertToInvenTreePart` |   |
| 637 | `_handleStockAdjustment` | ✓ |
| 661 | `_renderActionButtons` | ✓ |
| 687 | `_handlePrintLabel` | ✓ |
| 708 | `getConfigForm` |   |
| 764 | `_compareValues` | ✓ |
| 786 | `_renderDebugInfo` | ✓ |
| 812 | `refreshParameterData` |   |
| 830 | `updateCrossEntityParameter` |   |
| 850 | `handleParameterUpdateEvent` |   |
| 865 | `updateParametersForMatchingParts` |   |
| 888 | `handleParameterUpdate` |   |
| 904 | `connectedCallback` |   |
| 997 | `disconnectedCallback` |   |
| 1049 | `forceUpdateEntity` |   |
| 1066 | `_checkForEntityChanges` | ✓ |
| 1085 | `updateParameterWithImmediateRefresh` |   |
| 1123 | `_renderDiagnosticTools` | ✓ |
| 1157 | `_runApiDiagnostics` | ✓ |
| 1183 | `_fetchAllParameters` | ✓ |
| 1210 | `_testSpecificParameter` | ✓ |
| 1252 | `_resetApiFailures` | ✓ |
| 1262 | `_initializeServices` | ✓ |

### services/adjust-stock.ts (2 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 7 | `adjustStock` |   |
| 37 | `getEntityId` |   |

### services/api.ts (21 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 102 | `setParameterService` |   |
| 109 | `getParameterValue` |   |
| 205 | `getFallbackParameterValue` |   |
| 232 | `setFallbackEnabled` |   |
| 238 | `testConnection` |   |
| 320 | `getApiStats` |   |
| 327 | `getApiUrl` |   |
| 332 | `testBasicAuth` |   |
| 369 | `getPartParameters` |   |
| 424 | `testBasicAuthWithEndpoint` |   |
| 461 | `testConnectionExactFormat` |   |
| 521 | `testParameterAPI` |   |
| 564 | `destroy` |   |
| 571 | `logApiStats` |   |
| 575 | `updateParameterDirectly` |   |
| 617 | `getPerformanceStats` |   |
| 639 | `getLastKnownParameterValue` |   |
| 643 | `updateLastKnownParameterValue` |   |
| 650 | `notifyParameterChanged` |   |
| 691 | `isFallbackEnabled` |   |
| 698 | `resetRateLimiting` |   |

### services/cache.ts (8 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 17 | `getInstance` |   |
| 22 | `set` |   |
| 34 | `get` |   |
| 58 | `has` |   |
| 79 | `delete` |   |
| 88 | `prune` |   |
| 103 | `clear` |   |
| 112 | `getStats` |   |

### services/card-controller.ts (15 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 31 | `getInstance` |   |
| 51 | `setConfig` |   |
| 95 | `setHass` |   |
| 123 | `initializeServices` |   |
| 228 | `initializeApi` |   |
| 363 | `loadEntityData` |   |
| 393 | `getParts` |   |
| 403 | `getParameterService` |   |
| 411 | `getRenderingService` |   |
| 418 | `getWebSocketService` |   |
| 425 | `initializeWebSocketPlugin` |   |
| 484 | `handleWebSocketMessage` |   |
| 591 | `getWebSocketDiagnostics` |   |
| 606 | `subscribeToEntityChanges` |   |
| 620 | `getWebSocketPlugin` |   |

### services/parameter-service.ts (50 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 36 | `get` |   |
| 56 | `set` |   |
| 69 | `clear` |   |
| 119 | `getInstance` |   |
| 126 | `initialize` |   |
| 141 | `matchesConditionSyncVersion` |   |
| 146 | `processConditions` |   |
| 177 | `matchesConditionAsync` |   |
| 208 | `checkCrossEntityCondition` |   |
| 333 | `checkCrossEntityConditionSync` |   |
| 402 | `matchesCondition` |   |
| 449 | `checkCrossEntityConditionWithPart` |   |
| 516 | `matchesLocalCondition` |   |
| 569 | `getParameterValueDirectly` |   |
| 610 | `setFallbackState` |   |
| 626 | `diagnosticDump` |   |
| 708 | `diagnoseCrossEntityCondition` |   |
| 803 | `clearParameterCache` |   |
| 812 | `getApiStats` |   |
| 820 | `markParameterChanged` |   |
| 831 | `wasRecentlyChanged` |   |
| 842 | `syncApiDataToEntityState` |   |
| 877 | `findEntityForPart` |   |
| 903 | `runDiagnostics` |   |
| 964 | `setDirectApi` |   |
| 1001 | `fetchParameterData` |   |
| 1080 | `clearCache` |   |
| 1097 | `applyAction` |   |
| 1146 | `getActionButtons` |   |
| 1171 | `shouldShowPart` |   |
| 1208 | `compareFilterValues` |   |
| 1249 | `updateParameter` |   |
| 1282 | `hasInstance` |   |
| 1291 | `isDirectPartReference` |   |
| 1305 | `getParameterValue` |   |
| 1359 | `getParameterValueWithDirectReference` |   |
| 1402 | `getParameterValueFromPart` |   |
| 1414 | `checkValueMatch` |   |
| 1428 | `compareValues` |   |
| 1440 | `getParameterFromEntity` |   |
| 1533 | `isApiConnected` |   |
| 1541 | `updateHass` |   |
| 1549 | `setStrictWebSocketMode` |   |
| 1564 | `markAsWebSocketCall` |   |
| 1576 | `clearWebSocketCallMark` |   |
| 1587 | `isWebSocketCall` |   |
| 1597 | `findParameterInAllEntities` |   |
| 1736 | `findParameterInWebSocketData` |   |
| 1769 | `findParameterInApiData` |   |
| 1802 | `findParameterInHassData` |   |

### services/print-label.ts (1 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 12 | `printLabel` |   |

### services/rendering-service.ts (26 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 70 | `getInstance` |   |
| 75 | `setupRendering` |   |
| 176 | `handleWebSocketUpdate` |   |
| 224 | `startIdleTimer` |   |
| 245 | `restartIdleTimer` |   |
| 252 | `registerRenderCallback` |   |
| 272 | `notifyRenderCallbacks` |   |
| 305 | `executeRenderCallbacks` |   |
| 317 | `forceRender` |   |
| 334 | `shouldRender` |   |
| 351 | `startScheduler` |   |
| 369 | `stopScheduler` |   |
| 382 | `processScheduledJobs` |   |
| 418 | `shouldRunJob` |   |
| 455 | `evaluateCronExpression` |   |
| 484 | `matchesCronPart` |   |
| 523 | `calculateNextRunTime` |   |
| 537 | `addScheduledJob` |   |
| 546 | `removeScheduledJob` |   |
| 556 | `updateScheduledJob` |   |
| 569 | `getScheduledJobs` |   |
| 576 | `getScheduledJob` |   |
| 578 | `destroy` |   |
| 603 | `notifyRenderComplete` |   |
| 617 | `getIdleTimerStatus` |   |
| 632 | `getSchedulerStatus` |   |

### services/state.ts (11 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 25 | `getInstance` |   |
| 30 | `setHass` |   |
| 34 | `getFilteredParts` |   |
| 38 | `getAllParts` |   |
| 42 | `findEntityForPart` |   |
| 46 | `updateEntityParts` |   |
| 50 | `subscribe` |   |
| 56 | `shouldShowPart` |   |
| 70 | `checkConditionForPart` |   |
| 116 | `_getParameterService` | ✓ |
| 127 | `getActionButtons` |   |

### services/thumbnail.ts (1 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 5 | `getThumbnailPath` |   |

### services/variant-service.ts (15 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 13 | `getTemplateKey` |   |
| 31 | `getVariants` |   |
| 43 | `groupVariants` |   |
| 65 | `processVariants` |   |
| 79 | `getTotalStock` |   |
| 87 | `isVariant` |   |
| 91 | `isTemplate` |   |
| 95 | `getVariants` |   |
| 106 | `detectVariantGroups` |   |
| 141 | `processVariantGroups` |   |
| 184 | `getTotalStock` |   |
| 194 | `getVariantData` |   |
| 218 | `detectVariantGroups` |   |
| 255 | `getTotalStock` |   |
| 273 | `processConfiguredVariants` |   |

### services/websocket-manager.ts (19 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 20 | `getInstance` |   |
| 32 | `getConnection` |   |
| 78 | `addOpenCallback` |   |
| 86 | `addMessageCallback` |   |
| 94 | `removeCallbacks` |   |
| 114 | `closeConnection` |   |
| 141 | `closeAllConnections` |   |
| 149 | `handleOpen` |   |
| 168 | `handleMessage` |   |
| 217 | `_handleBasicMessage` | ✓ |
| 236 | `handleError` |   |
| 245 | `handleClose` |   |
| 295 | `setupKeepAlive` |   |
| 322 | `destroy` |   |
| 327 | `isConnected` |   |
| 332 | `getStats` |   |
| 356 | `getReadyStateString` |   |
| 369 | `_recordActivity` | ✓ |
| 395 | `getEnhancedStats` |   |

### services/websocket-plugin.ts (13 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 37 | `getInstance` |   |
| 55 | `configure` |   |
| 68 | `connect` |   |
| 100 | `disconnect` |   |
| 117 | `onMessage` |   |
| 132 | `_handleOpen` | ✓ |
| 144 | `_handleMessage` | ✓ |
| 183 | `_getMessageId` | ✓ |
| 201 | `_processMessage` | ✓ |
| 212 | `_handleParameterUpdate` | ✓ |
| 263 | `_scheduleReconnect` | ✓ |
| 279 | `isConnected` |   |
| 286 | `getStats` |   |

### services/websocket.ts (52 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 46 | `getInstance` |   |
| 56 | `getConnectionId` |   |
| 67 | `setHass` |   |
| 96 | `subscribeToEntity` |   |
| 132 | `_handleConnectionOpen` | ✓ |
| 147 | `_handleEntityMessage` | ✓ |
| 164 | `setConfig` |   |
| 171 | `getConnectionStatus` |   |
| 188 | `subscribeToParameter` |   |
| 197 | `filteredCallback` |   |
| 229 | `subscribeToParts` |   |
| 235 | `filteredCallback` |   |
| 250 | `_subscribeToEntity` | ✓ |
| 310 | `_unsubscribeFromEntity` | ✓ |
| 356 | `_resubscribeAll` | ✓ |
| 407 | `updateParameter` |   |
| 456 | `subscribeToCrossEntityParameter` |   |
| 535 | `subscribeToFilteredParts` |   |
| 618 | `isConnected` |   |
| 625 | `getDiagnostics` |   |
| 637 | `_startHealthCheck` | ✓ |
| 711 | `destroy` |   |
| 725 | `setDirectApi` |   |
| 750 | `testApiEndpoints` |   |
| 780 | `checkFilterCondition` |   |
| 872 | `checkConditionWithRetry` |   |
| 912 | `getParameterWithFallbackLogic` |   |
| 985 | `getPartIdFromParameterName` |   |
| 1015 | `useFallbackData` |   |
| 1049 | `compareParameterValues` |   |
| 1107 | `resetApiFailureCounter` |   |
| 1116 | `getApiStatus` |   |
| 1128 | `_notifyParameterChanged` | ✓ |
| 1171 | `getPartIdFromEntityId` |   |
| 1181 | `getParameterFromEntityState` |   |
| 1197 | `logApiUsageStats` |   |
| 1209 | `findEntityForPart` |   |
| 1236 | `getMaxApiFailures` |   |
| 1243 | `checkCrossEntityCondition` |   |
| 1291 | `useFallbackForCondition` |   |
| 1362 | `onParameterChange` |   |
| 1419 | `findEntityForPartAndTrack` |   |
| 1431 | `_handleWebSocketMessage` | ✓ |
| 1446 | `updateEntityData` |   |
| 1467 | `testStateIntegration` |   |
| 1513 | `initStateIntegration` |   |
| 1547 | `testConnection` |   |
| 1577 | `_classicSubscribeToEntity` | ✓ |
| 1610 | `_sendAuthentication` | ✓ |
| 1634 | `_sendSubscription` | ✓ |
| 1658 | `_isMessageForEntity` | ✓ |
| 1683 | `_processMessage` | ✓ |

### services/wled-service.ts (2 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 9 | `toggleLED` |   |
| 40 | `locatePart` |   |

### utils/helpers.ts (2 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 4 | `parseState` |   |
| 75 | `shouldUpdate` |   |

### utils/logger.ts (25 functions)

| Line | Function Name | Private |
|------|--------------|--------|
| 105 | `getInstance` |   |
| 115 | `isEnabled` |   |
| 149 | `anyCategoryEnabled` |   |
| 158 | `getNextSequence` |   |
| 165 | `setDebug` |   |
| 180 | `setVerboseMode` |   |
| 192 | `setDebugConfig` |   |
| 246 | `processHierarchicalConfig` |   |
| 281 | `formatSystemStatus` |   |
| 305 | `setLogLevel` |   |
| 312 | `setCategoryDebug` |   |
| 327 | `setSubsystemDebug` |   |
| 343 | `isDuplicate` |   |
| 369 | `pruneRecentLogs` |   |
| 382 | `log` |   |
| 467 | `info` |   |
| 505 | `warn` |   |
| 529 | `error` |   |
| 561 | `startPerformance` |   |
| 568 | `endPerformance` |   |
| 582 | `resetDebugConfig` |   |
| 605 | `setEnabled` |   |
| 612 | `getSystemsStatus` |   |
| 630 | `getSubsystems` |   |
| 641 | `isCategoryEnabled` |   |

