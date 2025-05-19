---
aliases: [base-layout.ts]
tags: [file, components, common]
---

# base-layout.ts

**Path:** `components/common/base-layout.ts`  
**Line Count:** 849  
**Functions:** 17  

## Overview

This file is part of the `components/common` directory.

## Imports

- lit: LitElement, PropertyValues
- lit/decorators.js: property, state
- custom-card-helpers: HomeAssistant
- [[types|types]]: InventreeItem, InventreeCardConfig
- [[inventree-state|inventree-state]]: InventTreeState
- [[parameter-service|parameter-service]]: ParameterService
- [[rendering-service|rendering-service]]: RenderingService
- [[card-controller|card-controller]]: CardController
- [[logger|logger]]: Logger
- [[cache|cache]]: CacheService

## Exports

- `BaseLayout`

## Functions

### Class: BaseLayout

### `_safeGetParameterService` (🔒 Private) {#_safeGetParameterService}

**Returns:** `ParameterService | undefined`

**Calls:**

- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#getInstance
- [[card-controller|card-controller]]#getParameterService
- [[logger|logger]]#log
- [[logger|logger]]#warn
- [[parameter-service|parameter-service]]#hasInstance
- [[inventree-state|inventree-state]]#getInstance
- [[logger|logger]]#error

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`
  - `_scheduleParameterServiceRetry`

**Call Graph:**

```mermaid
flowchart LR
    _safeGetParameterService[_safeGetParameterService]:::current
    Logger_getInstance[Logger.getInstance]
    _safeGetParameterService -->|calls| Logger_getInstance
    CardController_getInstance[CardController.getInstance]
    _safeGetParameterService -->|calls| CardController_getInstance
    controller_getParameterService[controller.getParameterService]
    _safeGetParameterService -->|calls| controller_getParameterService
    this_logger_log[this.logger.log]
    _safeGetParameterService -->|calls| this_logger_log
    this_logger_warn[this.logger.warn]
    _safeGetParameterService -->|calls| this_logger_warn
    ParameterService_hasInstance[ParameterService.hasInstance]
    _safeGetParameterService -->|calls| ParameterService_hasInstance
    ParameterService_getInstance[ParameterService.getInstance]
    _safeGetParameterService -->|calls| ParameterService_getInstance
    this_logger_error[this.logger.error]
    _safeGetParameterService -->|calls| this_logger_error
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| _safeGetParameterService
    _scheduleParameterServiceRetry[_scheduleParameterServiceRetry]
    _scheduleParameterServiceRetry -->|calls| _safeGetParameterService
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `connectedCallback` (🌐 Public) {#connectedCallback}

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#connectedCallback
- [[base-layout|base-layout]]#_safeGetParameterService
- [[logger|logger]]#warn
- [[base-layout|base-layout]]#_scheduleParameterServiceRetry
- [[logger|logger]]#log
- [[rendering-service|rendering-service]]#registerRenderCallback
- [[base-layout|base-layout]]#requestUpdate
- [[base-layout|base-layout]]#subscribeToState
- [[base-layout|base-layout]]#_loadData

**Called By:**

- From [[grid-layout|grid-layout]]:
  - `connectedCallback`
- From [[part-buttons|part-buttons]]:
  - `connectedCallback`
- From [[variant-layout|variant-layout]]:
  - `connectedCallback`
- From [[inventree-card|inventree-card]]:
  - `connectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    connectedCallback[connectedCallback]:::current
    super_connectedCallback[super.connectedCallback]
    connectedCallback -->|calls| super_connectedCallback
    this__safeGetParameterService[this._safeGetParameterService]
    connectedCallback -->|calls| this__safeGetParameterService
    this_logger_warn[this.logger.warn]
    connectedCallback -->|calls| this_logger_warn
    this__scheduleParameterServiceRetry[this._scheduleParameterServiceRetry]
    connectedCallback -->|calls| this__scheduleParameterServiceRetry
    this_logger_log[this.logger.log]
    connectedCallback -->|calls| this_logger_log
    this__renderingService_registerRenderCallback[this._renderingService.registerRenderCallback]
    connectedCallback -->|calls| this__renderingService_registerRenderCallback
    this_requestUpdate[this.requestUpdate]
    connectedCallback -->|calls| this_requestUpdate
    this_subscribeToState[this.subscribeToState]
    connectedCallback -->|calls| this_subscribeToState
    this__loadData[this._loadData]
    connectedCallback -->|calls| this__loadData
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| connectedCallback
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_scheduleParameterServiceRetry` (🔒 Private) {#_scheduleParameterServiceRetry}

**Parameters:**

- `attempt`: `number`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#error
- `Math.min`
- `setTimeout`
- [[logger|logger]]#log
- [[base-layout|base-layout]]#_safeGetParameterService
- [[parameter-service|parameter-service]]#updateHass
- [[base-layout|base-layout]]#_loadData
- [[base-layout|base-layout]]#requestUpdate
- [[base-layout|base-layout]]#_scheduleParameterServiceRetry

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    _scheduleParameterServiceRetry[_scheduleParameterServiceRetry]:::current
    this_logger_error[this.logger.error]
    _scheduleParameterServiceRetry -->|calls| this_logger_error
    Math_min[Math.min]
    _scheduleParameterServiceRetry -->|calls| Math_min
    setTimeout[setTimeout]
    _scheduleParameterServiceRetry -->|calls| setTimeout
    this_logger_log[this.logger.log]
    _scheduleParameterServiceRetry -->|calls| this_logger_log
    this__safeGetParameterService[this._safeGetParameterService]
    _scheduleParameterServiceRetry -->|calls| this__safeGetParameterService
    this__parameterService_updateHass[this._parameterService.updateHass]
    _scheduleParameterServiceRetry -->|calls| this__parameterService_updateHass
    this__loadData[this._loadData]
    _scheduleParameterServiceRetry -->|calls| this__loadData
    this_requestUpdate[this.requestUpdate]
    _scheduleParameterServiceRetry -->|calls| this_requestUpdate
    this__scheduleParameterServiceRetry[this._scheduleParameterServiceRetry]
    _scheduleParameterServiceRetry -->|calls| this__scheduleParameterServiceRetry
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| _scheduleParameterServiceRetry
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `disconnectedCallback` (🌐 Public) {#disconnectedCallback}

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#disconnectedCallback
- `this._boundHandlers.forEach`
- `this._renderUnsubscribe`

**Called By:**

- From [[grid-layout|grid-layout]]:
  - `disconnectedCallback`
- From [[variant-layout|variant-layout]]:
  - `disconnectedCallback`
- From [[inventree-card|inventree-card]]:
  - `disconnectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    disconnectedCallback[disconnectedCallback]:::current
    super_disconnectedCallback[super.disconnectedCallback]
    disconnectedCallback -->|calls| super_disconnectedCallback
    this__boundHandlers_forEach[this._boundHandlers.forEach]
    disconnectedCallback -->|calls| this__boundHandlers_forEach
    this__renderUnsubscribe[this._renderUnsubscribe]
    disconnectedCallback -->|calls| this__renderUnsubscribe
    disconnectedCallback[disconnectedCallback]
    disconnectedCallback -->|calls| disconnectedCallback
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `subscribeToState` (🌐 Public) {#subscribeToState}

**Returns:** `void`

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    subscribeToState[subscribeToState]:::current
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| subscribeToState
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `addListener` (🌐 Public) {#addListener}

**Parameters:**

- `event`: `string`
- `callback`: `() => void`

**Returns:** `void`

**Calls:**

- `callback`
- `this._boundHandlers.push`

**Call Graph:**

```mermaid
flowchart LR
    addListener[addListener]:::current
    callback[callback]
    addListener -->|calls| callback
    this__boundHandlers_push[this._boundHandlers.push]
    addListener -->|calls| this__boundHandlers_push
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `addListener` (🌐 Public) {#addListener}

**Parameters:**

- `event`: `string`
- `callback`: `() => void`

**Returns:** `void`

**Calls:**

- `callback`
- `this._boundHandlers.push`

**Call Graph:**

```mermaid
flowchart LR
    addListener[addListener]:::current
    callback[callback]
    addListener -->|calls| callback
    this__boundHandlers_push[this._boundHandlers.push]
    addListener -->|calls| this__boundHandlers_push
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_loadData` (🔒 Private) {#_loadData}

**Returns:** `Promise<void>`

**Calls:**

- [[logger|logger]]#log
- [[base-layout|base-layout]]#_computePartsHash
- [[cache|cache]]#get
- [[base-layout|base-layout]]#_applyParameterFiltering
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#getWebSocketData
- [[inventree-state|inventree-state]]#getApiData
- [[inventree-state|inventree-state]]#getHassData
- [[inventree-state|inventree-state]]#getNewestData
- [[inventree-state|inventree-state]]#getInstance
- [[base-layout|base-layout]]#getParts
- [[base-layout|base-layout]]#getParts
- [[inventree-state|inventree-state]]#getNewestData
- [[cache|cache]]#set

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`
  - `_scheduleParameterServiceRetry`
  - `refreshData`
  - `updated`

**Call Graph:**

```mermaid
flowchart LR
    _loadData[_loadData]:::current
    this_logger_log[this.logger.log]
    _loadData -->|calls| this_logger_log
    this__computePartsHash[this._computePartsHash]
    _loadData -->|calls| this__computePartsHash
    this_cache_get[this.cache.get]
    _loadData -->|calls| this_cache_get
    this__applyParameterFiltering[this._applyParameterFiltering]
    _loadData -->|calls| this__applyParameterFiltering
    InventTreeState_getInstance[InventTreeState.getInstance]
    _loadData -->|calls| InventTreeState_getInstance
    state_getWebSocketData[state.getWebSocketData]
    _loadData -->|calls| state_getWebSocketData
    state_getApiData[state.getApiData]
    _loadData -->|calls| state_getApiData
    state_getHassData[state.getHassData]
    _loadData -->|calls| state_getHassData
    state_getNewestData[state.getNewestData]
    _loadData -->|calls| state_getNewestData
    CardController_getInstance[CardController.getInstance]
    _loadData -->|calls| CardController_getInstance
    controller_getParts[controller.getParts]
    _loadData -->|calls| controller_getParts
    CardController_getInstance___getParts[CardController.getInstance().getParts]
    _loadData -->|calls| CardController_getInstance___getParts
    InventTreeState_getInstance___getNewestData[InventTreeState.getInstance().getNewestData]
    _loadData -->|calls| InventTreeState_getInstance___getNewestData
    this_cache_set[this.cache.set]
    _loadData -->|calls| this_cache_set
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| _loadData
    _scheduleParameterServiceRetry[_scheduleParameterServiceRetry]
    _scheduleParameterServiceRetry -->|calls| _loadData
    refreshData[refreshData]
    refreshData -->|calls| _loadData
    updated[updated]
    updated -->|calls| _loadData
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_applyParameterFiltering` (🔒 Private) {#_applyParameterFiltering}

**Parameters:**

- `parts`: `InventreeItem[]`

**Returns:** `Promise<InventreeItem[]>`

**Calls:**

- [[logger|logger]]#log
- [[logger|logger]]#warn
- `JSON.stringify`
- [[base-layout|base-layout]]#_computePartsHash
- [[cache|cache]]#get
- `this.config.parameters.conditions.filter`
- `filterConditions.filter`
- `showConditions.filter`
- [[inventree-state|inventree-state]]#isDirectPartReference
- `parseInt`
- `condition.parameter.split`
- `isNaN`
- [[inventree-state|inventree-state]]#getParameterValueWithDirectReference
- [[parameter-service|parameter-service]]#compareValues
- `parts.find`
- `partsToShow.push`
- [[logger|logger]]#error
- [[parameter-service|parameter-service]]#matchesConditionSyncVersion
- `resultParts.filter`
- `partsToShow.includes`
- `hideConditions.filter`
- `partsToHide.push`
- `partsToHide.includes`
- [[cache|cache]]#set

**Called By:**

- From [[base-layout|base-layout]]:
  - `_loadData`

**Call Graph:**

```mermaid
flowchart LR
    _applyParameterFiltering[_applyParameterFiltering]:::current
    this_logger_log[this.logger.log]
    _applyParameterFiltering -->|calls| this_logger_log
    this_logger_warn[this.logger.warn]
    _applyParameterFiltering -->|calls| this_logger_warn
    JSON_stringify[JSON.stringify]
    _applyParameterFiltering -->|calls| JSON_stringify
    this__computePartsHash[this._computePartsHash]
    _applyParameterFiltering -->|calls| this__computePartsHash
    this_cache_get[this.cache.get]
    _applyParameterFiltering -->|calls| this_cache_get
    this_config_parameters_conditions_filter[this.config.parameters.conditions.filter]
    _applyParameterFiltering -->|calls| this_config_parameters_conditions_filter
    filterConditions_filter[filterConditions.filter]
    _applyParameterFiltering -->|calls| filterConditions_filter
    showConditions_filter[showConditions.filter]
    _applyParameterFiltering -->|calls| showConditions_filter
    this__parameterService_isDirectPartReference[this._parameterService.isDirectPartReference]
    _applyParameterFiltering -->|calls| this__parameterService_isDirectPartReference
    parseInt[parseInt]
    _applyParameterFiltering -->|calls| parseInt
    condition_parameter_split[condition.parameter.split]
    _applyParameterFiltering -->|calls| condition_parameter_split
    isNaN[isNaN]
    _applyParameterFiltering -->|calls| isNaN
    this__parameterService_getParameterValueWithDirectReference[this._parameterService.getParameterValueWithDirectReference]
    _applyParameterFiltering -->|calls| this__parameterService_getParameterValueWithDirectReference
    this__parameterService_compareValues[this._parameterService.compareValues]
    _applyParameterFiltering -->|calls| this__parameterService_compareValues
    parts_find[parts.find]
    _applyParameterFiltering -->|calls| parts_find
    partsToShow_push[partsToShow.push]
    _applyParameterFiltering -->|calls| partsToShow_push
    this_logger_error[this.logger.error]
    _applyParameterFiltering -->|calls| this_logger_error
    this__parameterService_matchesConditionSyncVersion[this._parameterService.matchesConditionSyncVersion]
    _applyParameterFiltering -->|calls| this__parameterService_matchesConditionSyncVersion
    resultParts_filter[resultParts.filter]
    _applyParameterFiltering -->|calls| resultParts_filter
    partsToShow_includes[partsToShow.includes]
    _applyParameterFiltering -->|calls| partsToShow_includes
    hideConditions_filter[hideConditions.filter]
    _applyParameterFiltering -->|calls| hideConditions_filter
    partsToHide_push[partsToHide.push]
    _applyParameterFiltering -->|calls| partsToHide_push
    partsToHide_includes[partsToHide.includes]
    _applyParameterFiltering -->|calls| partsToHide_includes
    this_cache_set[this.cache.set]
    _applyParameterFiltering -->|calls| this_cache_set
    _loadData[_loadData]
    _loadData -->|calls| _applyParameterFiltering
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getParts` (🌐 Public) {#getParts}

**Returns:** `InventreeItem[]`

**Calls:**

- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#getNewestData

**Called By:**

- From [[base-layout|base-layout]]:
  - `_loadData`
- From [[grid-layout|grid-layout]]:
  - `_checkAndRecoverState`
- From [[list-layout|list-layout]]:
  - `render`
- From [[inventree-card|inventree-card]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getParts[getParts]:::current
    InventTreeState_getInstance[InventTreeState.getInstance]
    getParts -->|calls| InventTreeState_getInstance
    state_getNewestData[state.getNewestData]
    getParts -->|calls| state_getNewestData
    _loadData[_loadData]
    _loadData -->|calls| getParts
    _checkAndRecoverState[_checkAndRecoverState]
    _checkAndRecoverState -->|calls| getParts
    render[render]
    render -->|calls| getParts
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `refreshData` (🌐 Public) {#refreshData}

**Returns:** `Promise<void>`

**Calls:**

- [[base-layout|base-layout]]#_loadData
- [[base-layout|base-layout]]#requestUpdate

**Call Graph:**

```mermaid
flowchart LR
    refreshData[refreshData]:::current
    this__loadData[this._loadData]
    refreshData -->|calls| this__loadData
    this_requestUpdate[this.requestUpdate]
    refreshData -->|calls| this_requestUpdate
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_computePartsHash` (🔒 Private) {#_computePartsHash}

**Parameters:**

- `parts`: `InventreeItem[]`

**Returns:** `string`

**Calls:**

- `parts.map(part => 
      `${part.pk}:${part.in_stock || 0}:${part.name}`
    ).join`
- `parts.map`

**Called By:**

- From [[base-layout|base-layout]]:
  - `_loadData`
  - `_applyParameterFiltering`
  - `updated`
  - `requestUpdate`

**Call Graph:**

```mermaid
flowchart LR
    _computePartsHash[_computePartsHash]:::current
    parts_map_part______________part_pk____part_in_stock____0____part_name_________join[parts.map(part => 
      `${part.pk}:${part.in_stock || 0}:${part.name}`
    ).join]
    _computePartsHash -->|calls| parts_map_part______________part_pk____part_in_stock____0____part_name_________join
    parts_map[parts.map]
    _computePartsHash -->|calls| parts_map
    _loadData[_loadData]
    _loadData -->|calls| _computePartsHash
    _applyParameterFiltering[_applyParameterFiltering]
    _applyParameterFiltering -->|calls| _computePartsHash
    updated[updated]
    updated -->|calls| _computePartsHash
    requestUpdate[requestUpdate]
    requestUpdate -->|calls| _computePartsHash
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `updated` (🌐 Public) {#updated}

**Parameters:**

- `changedProps`: `PropertyValues`

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#updated
- [[logger|logger]]#log
- [[logger|logger]]#warn
- [[base-layout|base-layout]]#_updateVisualModifiers
- [[cache|cache]]#has
- [[parameter-service|parameter-service]]#updateHass
- `this._loadData().catch`
- [[base-layout|base-layout]]#_loadData
- [[logger|logger]]#error
- [[base-layout|base-layout]]#_computePartsHash
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#setWebSocketData
- [[inventree-state|inventree-state]]#setApiData
- [[inventree-state|inventree-state]]#setHassData

**Called By:**

- From [[detail-layout|detail-layout]]:
  - `updated`
- From [[grid-layout|grid-layout]]:
  - `updated`
- From [[list-layout|list-layout]]:
  - `updated`
- From [[part-buttons|part-buttons]]:
  - `updated`
- From [[part-container|part-container]]:
  - `updated`
- From [[part-view|part-view]]:
  - `updated`
- From [[parts-layout|parts-layout]]:
  - `updated`
- From [[variant-layout|variant-layout]]:
  - `updated`
- From [[inventree-card|inventree-card]]:
  - `updated`

**Call Graph:**

```mermaid
flowchart LR
    updated[updated]:::current
    super_updated[super.updated]
    updated -->|calls| super_updated
    this_logger_log[this.logger.log]
    updated -->|calls| this_logger_log
    this_logger_warn[this.logger.warn]
    updated -->|calls| this_logger_warn
    this__updateVisualModifiers[this._updateVisualModifiers]
    updated -->|calls| this__updateVisualModifiers
    changedProps_has[changedProps.has]
    updated -->|calls| changedProps_has
    this__parameterService_updateHass[this._parameterService.updateHass]
    updated -->|calls| this__parameterService_updateHass
    this__loadData___catch[this._loadData().catch]
    updated -->|calls| this__loadData___catch
    this__loadData[this._loadData]
    updated -->|calls| this__loadData
    this_logger_error[this.logger.error]
    updated -->|calls| this_logger_error
    this__computePartsHash[this._computePartsHash]
    updated -->|calls| this__computePartsHash
    InventTreeState_getInstance[InventTreeState.getInstance]
    updated -->|calls| InventTreeState_getInstance
    state_setWebSocketData[state.setWebSocketData]
    updated -->|calls| state_setWebSocketData
    state_setApiData[state.setApiData]
    updated -->|calls| state_setApiData
    state_setHassData[state.setHassData]
    updated -->|calls| state_setHassData
    updated[updated]
    updated -->|calls| updated
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `requestUpdate` (🌐 Public) {#requestUpdate}

**Parameters:**

- `name`: `PropertyKey`
- `oldValue`: `unknown`

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#_computePartsHash
- [[rendering-service|rendering-service]]#shouldRender
- [[base-layout|base-layout]]#requestUpdate
- [[logger|logger]]#log

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`
  - `_scheduleParameterServiceRetry`
  - `refreshData`
- From [[grid-layout|grid-layout]]:
  - `_actuallyFilterParts`
  - `updated`
  - `_checkAndRecoverState`
  - `_handleResetFilters`
- From [[part-container|part-container]]:
  - `updated`
- From [[variant-layout|variant-layout]]:
  - `_setupEntityListener`
  - `_setupIdleRenderTimer`
  - `_handleWebSocketMessage`
  - `_handleParameterChange`
  - `_toggleGroup`
- From [[editor|editor]]:
  - `_editCondition`
  - `_closeConditionDialog`
  - `_editAction`
  - `_closeActionDialog`
  - `_renderActionDialog`
  - `_parameterTypeChanged`
- From [[inventree-card|inventree-card]]:
  - `subscribe`
  - `debouncedRender`
  - `_handleStockAdjustment`
  - `connectedCallback`
  - `updateParameterWithImmediateRefresh`

**Call Graph:**

```mermaid
flowchart LR
    requestUpdate[requestUpdate]:::current
    this__computePartsHash[this._computePartsHash]
    requestUpdate -->|calls| this__computePartsHash
    this__renderingService_shouldRender[this._renderingService.shouldRender]
    requestUpdate -->|calls| this__renderingService_shouldRender
    super_requestUpdate[super.requestUpdate]
    requestUpdate -->|calls| super_requestUpdate
    this_logger_log[this.logger.log]
    requestUpdate -->|calls| this_logger_log
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| requestUpdate
    _scheduleParameterServiceRetry[_scheduleParameterServiceRetry]
    _scheduleParameterServiceRetry -->|calls| requestUpdate
    refreshData[refreshData]
    refreshData -->|calls| requestUpdate
    _actuallyFilterParts[_actuallyFilterParts]
    _actuallyFilterParts -->|calls| requestUpdate
    updated[updated]
    updated -->|calls| requestUpdate
    _checkAndRecoverState[_checkAndRecoverState]
    _checkAndRecoverState -->|calls| requestUpdate
    _handleResetFilters[_handleResetFilters]
    _handleResetFilters -->|calls| requestUpdate
    _setupEntityListener[_setupEntityListener]
    _setupEntityListener -->|calls| requestUpdate
    _setupIdleRenderTimer[_setupIdleRenderTimer]
    _setupIdleRenderTimer -->|calls| requestUpdate
    _handleWebSocketMessage[_handleWebSocketMessage]
    _handleWebSocketMessage -->|calls| requestUpdate
    _handleParameterChange[_handleParameterChange]
    _handleParameterChange -->|calls| requestUpdate
    _toggleGroup[_toggleGroup]
    _toggleGroup -->|calls| requestUpdate
    _editCondition[_editCondition]
    _editCondition -->|calls| requestUpdate
    _closeConditionDialog[_closeConditionDialog]
    _closeConditionDialog -->|calls| requestUpdate
    _editAction[_editAction]
    _editAction -->|calls| requestUpdate
    _closeActionDialog[_closeActionDialog]
    _closeActionDialog -->|calls| requestUpdate
    _renderActionDialog[_renderActionDialog]
    _renderActionDialog -->|calls| requestUpdate
    _parameterTypeChanged[_parameterTypeChanged]
    _parameterTypeChanged -->|calls| requestUpdate
    subscribe[subscribe]
    subscribe -->|calls| requestUpdate
    debouncedRender[debouncedRender]
    debouncedRender -->|calls| requestUpdate
    _handleStockAdjustment[_handleStockAdjustment]
    _handleStockAdjustment -->|calls| requestUpdate
    updateParameterWithImmediateRefresh[updateParameterWithImmediateRefresh]
    updateParameterWithImmediateRefresh -->|calls| requestUpdate
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_updateVisualModifiers` (🔒 Private) {#_updateVisualModifiers}

**Returns:** `void`

**Called By:**

- From [[base-layout|base-layout]]:
  - `updated`
- From [[detail-layout|detail-layout]]:
  - `firstUpdated`
  - `updated`
- From [[grid-layout|grid-layout]]:
  - `updated`
- From [[list-layout|list-layout]]:
  - `updated`
- From [[parts-layout|parts-layout]]:
  - `updated`
  - `loadPartsFromEntities`
- From [[variant-layout|variant-layout]]:
  - `_setupEntityListener`
  - `_setupIdleRenderTimer`
  - `_handleWebSocketMessage`
  - `_handleParameterChange`
  - `updated`

**Call Graph:**

```mermaid
flowchart LR
    _updateVisualModifiers[_updateVisualModifiers]:::current
    updated[updated]
    updated -->|calls| _updateVisualModifiers
    firstUpdated[firstUpdated]
    firstUpdated -->|calls| _updateVisualModifiers
    loadPartsFromEntities[loadPartsFromEntities]
    loadPartsFromEntities -->|calls| _updateVisualModifiers
    _setupEntityListener[_setupEntityListener]
    _setupEntityListener -->|calls| _updateVisualModifiers
    _setupIdleRenderTimer[_setupIdleRenderTimer]
    _setupIdleRenderTimer -->|calls| _updateVisualModifiers
    _handleWebSocketMessage[_handleWebSocketMessage]
    _handleWebSocketMessage -->|calls| _updateVisualModifiers
    _handleParameterChange[_handleParameterChange]
    _handleParameterChange -->|calls| _updateVisualModifiers
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `updateFilteredParts` (🌐 Public) {#updateFilteredParts}

**Returns:** `Promise<void>`

**Calls:**

- [[logger|logger]]#log
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#getInstance
- `conditions.filter`
- [[inventree-state|inventree-state]]#isDirectPartReference
- [[inventree-state|inventree-state]]#getParameterValueWithDirectReference
- [[parameter-service|parameter-service]]#checkValueMatch
- `partsToShow.push`
- [[parameter-service|parameter-service]]#matchesCondition
- `filteredParts.filter`
- `partsToShow.includes`
- [[rendering-service|rendering-service]]#notifyRenderComplete

**Call Graph:**

```mermaid
flowchart LR
    updateFilteredParts[updateFilteredParts]:::current
    this_logger_log[this.logger.log]
    updateFilteredParts -->|calls| this_logger_log
    ParameterService_getInstance[ParameterService.getInstance]
    updateFilteredParts -->|calls| ParameterService_getInstance
    RenderingService_getInstance[RenderingService.getInstance]
    updateFilteredParts -->|calls| RenderingService_getInstance
    conditions_filter[conditions.filter]
    updateFilteredParts -->|calls| conditions_filter
    paramService_isDirectPartReference[paramService.isDirectPartReference]
    updateFilteredParts -->|calls| paramService_isDirectPartReference
    paramService_getParameterValueWithDirectReference[paramService.getParameterValueWithDirectReference]
    updateFilteredParts -->|calls| paramService_getParameterValueWithDirectReference
    paramService_checkValueMatch[paramService.checkValueMatch]
    updateFilteredParts -->|calls| paramService_checkValueMatch
    partsToShow_push[partsToShow.push]
    updateFilteredParts -->|calls| partsToShow_push
    paramService_matchesCondition[paramService.matchesCondition]
    updateFilteredParts -->|calls| paramService_matchesCondition
    filteredParts_filter[filteredParts.filter]
    updateFilteredParts -->|calls| filteredParts_filter
    partsToShow_includes[partsToShow.includes]
    updateFilteredParts -->|calls| partsToShow_includes
    renderService_notifyRenderComplete[renderService.notifyRenderComplete]
    updateFilteredParts -->|calls| renderService_notifyRenderComplete
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_applyParameterFilteringSync` (🔒 Private) {#_applyParameterFilteringSync}

**Parameters:**

- `parts`: `InventreeItem[]`

**Returns:** `InventreeItem[]`

**Calls:**

- `this.config.parameters.conditions.filter`
- [[logger|logger]]#log
- `filterConditions.filter`
- [[parameter-service|parameter-service]]#matchesConditionSyncVersion
- `partsToShow.push`
- `resultParts.filter`
- `partsToShow.includes`

**Call Graph:**

```mermaid
flowchart LR
    _applyParameterFilteringSync[_applyParameterFilteringSync]:::current
    this_config_parameters_conditions_filter[this.config.parameters.conditions.filter]
    _applyParameterFilteringSync -->|calls| this_config_parameters_conditions_filter
    this_logger_log[this.logger.log]
    _applyParameterFilteringSync -->|calls| this_logger_log
    filterConditions_filter[filterConditions.filter]
    _applyParameterFilteringSync -->|calls| filterConditions_filter
    this__parameterService__matchesConditionSyncVersion[this._parameterService!.matchesConditionSyncVersion]
    _applyParameterFilteringSync -->|calls| this__parameterService__matchesConditionSyncVersion
    partsToShow_push[partsToShow.push]
    _applyParameterFilteringSync -->|calls| partsToShow_push
    resultParts_filter[resultParts.filter]
    _applyParameterFilteringSync -->|calls| resultParts_filter
    partsToShow_includes[partsToShow.includes]
    _applyParameterFilteringSync -->|calls| partsToShow_includes
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    base-layout[base-layout.ts]:::current
    types[types.ts]
    base-layout -->|imports| types
    inventree_state[inventree-state.ts]
    base-layout -->|imports| inventree_state
    parameter_service[parameter-service.ts]
    base-layout -->|imports| parameter_service
    rendering_service[rendering-service.ts]
    base-layout -->|imports| rendering_service
    card_controller[card-controller.ts]
    base-layout -->|imports| card_controller
    logger[logger.ts]
    base-layout -->|imports| logger
    cache[cache.ts]
    base-layout -->|imports| cache
    detail_layout[detail-layout.ts]
    detail_layout -->|imports| base-layout
    list_layout[list-layout.ts]
    list_layout -->|imports| base-layout
    parts_layout[parts-layout.ts]
    parts_layout -->|imports| base-layout
    variant_layout[variant-layout.ts]
    variant_layout -->|imports| base-layout
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

