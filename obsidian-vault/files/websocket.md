---
aliases: [websocket.ts]
tags: [file, services]
---

# websocket.ts

**Path:** `services/websocket.ts`  
**Line Count:** 445  
**Functions:** 20  

## Overview

This file is part of the `services` directory.

## Imports

- custom-card-helpers: HomeAssistant
- [[logger|logger]]: Logger
- [[types|types]]: InventreeItem
- [[inventree-state|inventree-state]]: InventTreeState
- [[api|api]]: InvenTreeDirectAPI

## Exports

- `WebSocketService`

## Functions

### Class: WebSocketService

### `getInstance` (🌐 Public) {#getInstance}

**Returns:** `WebSocketService`

**Called By:**

- From [[base-layout|base-layout]]:
  - `_safeGetParameterService`
  - `_loadData`
  - `getParts`
  - `updated`
  - `updateFilteredParts`
- From [[variant-handler|variant-handler]]:
  - `processItems`
- From [[detail-layout|detail-layout]]:
  - `_updateVisualModifiers`
- From [[grid-layout|grid-layout]]:
  - `_setupWebSocketConnection`
  - `_cleanupListeners`
  - `_actuallyFilterParts`
  - `_updateVisualModifiers`
  - `render`
- From [[list-layout|list-layout]]:
  - `_updateVisualModifiers`
  - `render`
- From [[parts-layout|parts-layout]]:
  - `loadPartsFromEntities`
  - `_updateVisualModifiers`
- From [[editor|editor]]:
  - `_renderDebuggingSection`
- From [[inventree-card|inventree-card]]:
  - `connectedCallback`
  - `_resetApiFailures`
  - `_initializeServices`
- From [[card-controller|card-controller]]:
  - `setHass`
  - `initializeServices`
  - `loadEntityData`
  - `getParts`
  - `getWebSocketService`
  - `initializeWebSocketPlugin`
  - `handleWebSocketMessage`
  - `getWebSocketDiagnostics`
- From [[parameter-service|parameter-service]]:
  - `getParameterValueFromPart`
  - `isDirectPartReference`
  - `getParameterValueWithDirectReference`
  - `findEntityForPart`
  - `storeOrphanedParameter`
  - `isOrphanedPart`
  - `getOrphanedPartIds`
  - `getOrphanedPartParameters`
  - `findParameterInWebSocketData`
  - `findParameterInApiData`
  - `findParameterInHassData`
  - `findParameterInAllEntities`
  - `syncApiDataToEntityState`
  - `getParameterFromEntity`
- From [[rendering-service|rendering-service]]:
  - `startIdleTimer`
- From [[variant-service|variant-service]]:
  - `processVariants`
- From [[websocket-plugin|websocket-plugin]]:
  - `_handleParameterUpdate`
- From [[websocket|websocket]]:
  - `_updateEntityState`

**Call Graph:**

```mermaid
flowchart LR
    getInstance[getInstance]:::current
    _safeGetParameterService[_safeGetParameterService]
    _safeGetParameterService -->|calls| getInstance
    _loadData[_loadData]
    _loadData -->|calls| getInstance
    getParts[getParts]
    getParts -->|calls| getInstance
    updated[updated]
    updated -->|calls| getInstance
    updateFilteredParts[updateFilteredParts]
    updateFilteredParts -->|calls| getInstance
    processItems[processItems]
    processItems -->|calls| getInstance
    _updateVisualModifiers[_updateVisualModifiers]
    _updateVisualModifiers -->|calls| getInstance
    _setupWebSocketConnection[_setupWebSocketConnection]
    _setupWebSocketConnection -->|calls| getInstance
    _cleanupListeners[_cleanupListeners]
    _cleanupListeners -->|calls| getInstance
    _actuallyFilterParts[_actuallyFilterParts]
    _actuallyFilterParts -->|calls| getInstance
    render[render]
    render -->|calls| getInstance
    loadPartsFromEntities[loadPartsFromEntities]
    loadPartsFromEntities -->|calls| getInstance
    _renderDebuggingSection[_renderDebuggingSection]
    _renderDebuggingSection -->|calls| getInstance
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| getInstance
    _resetApiFailures[_resetApiFailures]
    _resetApiFailures -->|calls| getInstance
    _initializeServices[_initializeServices]
    _initializeServices -->|calls| getInstance
    setHass[setHass]
    setHass -->|calls| getInstance
    initializeServices[initializeServices]
    initializeServices -->|calls| getInstance
    loadEntityData[loadEntityData]
    loadEntityData -->|calls| getInstance
    getWebSocketService[getWebSocketService]
    getWebSocketService -->|calls| getInstance
    initializeWebSocketPlugin[initializeWebSocketPlugin]
    initializeWebSocketPlugin -->|calls| getInstance
    handleWebSocketMessage[handleWebSocketMessage]
    handleWebSocketMessage -->|calls| getInstance
    getWebSocketDiagnostics[getWebSocketDiagnostics]
    getWebSocketDiagnostics -->|calls| getInstance
    getParameterValueFromPart[getParameterValueFromPart]
    getParameterValueFromPart -->|calls| getInstance
    isDirectPartReference[isDirectPartReference]
    isDirectPartReference -->|calls| getInstance
    getParameterValueWithDirectReference[getParameterValueWithDirectReference]
    getParameterValueWithDirectReference -->|calls| getInstance
    findEntityForPart[findEntityForPart]
    findEntityForPart -->|calls| getInstance
    storeOrphanedParameter[storeOrphanedParameter]
    storeOrphanedParameter -->|calls| getInstance
    isOrphanedPart[isOrphanedPart]
    isOrphanedPart -->|calls| getInstance
    getOrphanedPartIds[getOrphanedPartIds]
    getOrphanedPartIds -->|calls| getInstance
    getOrphanedPartParameters[getOrphanedPartParameters]
    getOrphanedPartParameters -->|calls| getInstance
    findParameterInWebSocketData[findParameterInWebSocketData]
    findParameterInWebSocketData -->|calls| getInstance
    findParameterInApiData[findParameterInApiData]
    findParameterInApiData -->|calls| getInstance
    findParameterInHassData[findParameterInHassData]
    findParameterInHassData -->|calls| getInstance
    findParameterInAllEntities[findParameterInAllEntities]
    findParameterInAllEntities -->|calls| getInstance
    syncApiDataToEntityState[syncApiDataToEntityState]
    syncApiDataToEntityState -->|calls| getInstance
    getParameterFromEntity[getParameterFromEntity]
    getParameterFromEntity -->|calls| getInstance
    startIdleTimer[startIdleTimer]
    startIdleTimer -->|calls| getInstance
    processVariants[processVariants]
    processVariants -->|calls| getInstance
    _handleParameterUpdate[_handleParameterUpdate]
    _handleParameterUpdate -->|calls| getInstance
    _updateEntityState[_updateEntityState]
    _updateEntityState -->|calls| getInstance
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getConnectionId` (🌐 Public) {#getConnectionId}

**Parameters:**

- `hass`: `HomeAssistant`

**Returns:** `string`

**Calls:**

- `Date.now`

**Called By:**

- From [[websocket|websocket]]:
  - `setHass`

**Call Graph:**

```mermaid
flowchart LR
    getConnectionId[getConnectionId]:::current
    Date_now[Date.now]
    getConnectionId -->|calls| Date_now
    setHass[setHass]
    setHass -->|calls| getConnectionId
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `setHass` (🌐 Public) {#setHass}

**Parameters:**

- `hass`: `HomeAssistant`

**Returns:** `void`

**Calls:**

- `Date.now`
- [[websocket|websocket]]#getConnectionId
- [[logger|logger]]#log
- [[websocket|websocket]]#_resubscribeAll

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `connectedCallback`
  - `_initializeServices`
- From [[card-controller|card-controller]]:
  - `setHass`
  - `initializeServices`
- From [[state|state]]:
  - `setHass`

**Call Graph:**

```mermaid
flowchart LR
    setHass[setHass]:::current
    Date_now[Date.now]
    setHass -->|calls| Date_now
    this_getConnectionId[this.getConnectionId]
    setHass -->|calls| this_getConnectionId
    this_logger_log[this.logger.log]
    setHass -->|calls| this_logger_log
    this__resubscribeAll[this._resubscribeAll]
    setHass -->|calls| this__resubscribeAll
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| setHass
    _initializeServices[_initializeServices]
    _initializeServices -->|calls| setHass
    setHass[setHass]
    setHass -->|calls| setHass
    initializeServices[initializeServices]
    initializeServices -->|calls| setHass
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `subscribeToEntity` (🌐 Public) {#subscribeToEntity}

**Parameters:**

- `entityId`: `string`
- `callback`: `(data: any) => void`

**Returns:** `() => void`

**Calls:**

- [[logger|logger]]#log
- [[logger|logger]]#warn
- [[cache|cache]]#has
- [[cache|cache]]#set
- [[websocket|websocket]]#_subscribeToEntity
- [[cache|cache]]#get
- `callbacks.add`
- [[cache|cache]]#delete
- [[websocket|websocket]]#_unsubscribeFromEntity
- [[cache|cache]]#delete

**Called By:**

- From [[websocket|websocket]]:
  - `subscribeToParts`

**Call Graph:**

```mermaid
flowchart LR
    subscribeToEntity[subscribeToEntity]:::current
    this_logger_log[this.logger.log]
    subscribeToEntity -->|calls| this_logger_log
    this_logger_warn[this.logger.warn]
    subscribeToEntity -->|calls| this_logger_warn
    this__subscriptions_has[this._subscriptions.has]
    subscribeToEntity -->|calls| this__subscriptions_has
    this__subscriptions_set[this._subscriptions.set]
    subscribeToEntity -->|calls| this__subscriptions_set
    this__subscribeToEntity[this._subscribeToEntity]
    subscribeToEntity -->|calls| this__subscribeToEntity
    this__subscriptions_get[this._subscriptions.get]
    subscribeToEntity -->|calls| this__subscriptions_get
    callbacks_add[callbacks.add]
    subscribeToEntity -->|calls| callbacks_add
    callbacks_delete[callbacks.delete]
    subscribeToEntity -->|calls| callbacks_delete
    this__unsubscribeFromEntity[this._unsubscribeFromEntity]
    subscribeToEntity -->|calls| this__unsubscribeFromEntity
    this__subscriptions_delete[this._subscriptions.delete]
    subscribeToEntity -->|calls| this__subscriptions_delete
    subscribeToParts[subscribeToParts]
    subscribeToParts -->|calls| subscribeToEntity
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `subscribeToParts` (🌐 Public) {#subscribeToParts}

**Parameters:**

- `entityId`: `string`
- `callback`: `(parts: any[]) => void`

**Returns:** `() => void`

**Calls:**

- [[logger|logger]]#log
- [[websocket|websocket]]#subscribeToEntity
- `Array.isArray`
- `callback`

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `connectedCallback`
- From [[card-controller|card-controller]]:
  - `subscribeToEntityChanges`

**Call Graph:**

```mermaid
flowchart LR
    subscribeToParts[subscribeToParts]:::current
    this_logger_log[this.logger.log]
    subscribeToParts -->|calls| this_logger_log
    this_subscribeToEntity[this.subscribeToEntity]
    subscribeToParts -->|calls| this_subscribeToEntity
    Array_isArray[Array.isArray]
    subscribeToParts -->|calls| Array_isArray
    callback[callback]
    subscribeToParts -->|calls| callback
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| subscribeToParts
    subscribeToEntityChanges[subscribeToEntityChanges]
    subscribeToEntityChanges -->|calls| subscribeToParts
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_handleEntityMessage` (🔒 Private) {#_handleEntityMessage}

**Parameters:**

- `entityId`: `string`
- `callback`: `SubscriptionCallback`
- `event`: `MessageEvent`

**Returns:** `void`

**Calls:**

- `JSON.parse`
- [[websocket|websocket]]#_isMessageForEntity
- `callback`
- [[websocket-plugin|websocket-plugin]]#_processMessage
- [[logger|logger]]#error

**Call Graph:**

```mermaid
flowchart LR
    _handleEntityMessage[_handleEntityMessage]:::current
    JSON_parse[JSON.parse]
    _handleEntityMessage -->|calls| JSON_parse
    this__isMessageForEntity[this._isMessageForEntity]
    _handleEntityMessage -->|calls| this__isMessageForEntity
    callback[callback]
    _handleEntityMessage -->|calls| callback
    this__processMessage[this._processMessage]
    _handleEntityMessage -->|calls| this__processMessage
    this_logger_error[this.logger.error]
    _handleEntityMessage -->|calls| this_logger_error
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_subscribeToEntity` (🔒 Private) {#_subscribeToEntity}

**Parameters:**

- `entityId`: `string`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#warn
- [[logger|logger]]#log
- [[cache|cache]]#get
- `callbacks.forEach`
- `callback`
- [[logger|logger]]#error
- [[websocket|websocket]]#_updateEntityState

**Called By:**

- From [[websocket|websocket]]:
  - `subscribeToEntity`
  - `_resubscribeAll`

**Call Graph:**

```mermaid
flowchart LR
    _subscribeToEntity[_subscribeToEntity]:::current
    this_logger_warn[this.logger.warn]
    _subscribeToEntity -->|calls| this_logger_warn
    this_logger_log[this.logger.log]
    _subscribeToEntity -->|calls| this_logger_log
    this__subscriptions_get[this._subscriptions.get]
    _subscribeToEntity -->|calls| this__subscriptions_get
    callbacks_forEach[callbacks.forEach]
    _subscribeToEntity -->|calls| callbacks_forEach
    callback[callback]
    _subscribeToEntity -->|calls| callback
    this_logger_error[this.logger.error]
    _subscribeToEntity -->|calls| this_logger_error
    this__updateEntityState[this._updateEntityState]
    _subscribeToEntity -->|calls| this__updateEntityState
    subscribeToEntity[subscribeToEntity]
    subscribeToEntity -->|calls| _subscribeToEntity
    _resubscribeAll[_resubscribeAll]
    _resubscribeAll -->|calls| _subscribeToEntity
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_unsubscribeFromEntity` (🔒 Private) {#_unsubscribeFromEntity}

**Parameters:**

- `entityId`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#get
- [[logger|logger]]#log
- `subscription`
- [[cache|cache]]#delete
- [[logger|logger]]#error

**Called By:**

- From [[websocket|websocket]]:
  - `subscribeToEntity`
  - `destroy`

**Call Graph:**

```mermaid
flowchart LR
    _unsubscribeFromEntity[_unsubscribeFromEntity]:::current
    this__entitySubscriptions_get[this._entitySubscriptions.get]
    _unsubscribeFromEntity -->|calls| this__entitySubscriptions_get
    this_logger_log[this.logger.log]
    _unsubscribeFromEntity -->|calls| this_logger_log
    subscription[subscription]
    _unsubscribeFromEntity -->|calls| subscription
    this__entitySubscriptions_delete[this._entitySubscriptions.delete]
    _unsubscribeFromEntity -->|calls| this__entitySubscriptions_delete
    this_logger_error[this.logger.error]
    _unsubscribeFromEntity -->|calls| this_logger_error
    subscribeToEntity[subscribeToEntity]
    subscribeToEntity -->|calls| _unsubscribeFromEntity
    destroy[destroy]
    destroy -->|calls| _unsubscribeFromEntity
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_resubscribeAll` (🔒 Private) {#_resubscribeAll}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- `this._entitySubscriptions.entries`
- `subscription`
- [[logger|logger]]#error
- [[cache|cache]]#clear
- `this._subscriptions.keys`
- [[websocket|websocket]]#_subscribeToEntity

**Called By:**

- From [[websocket|websocket]]:
  - `setHass`

**Call Graph:**

```mermaid
flowchart LR
    _resubscribeAll[_resubscribeAll]:::current
    this_logger_log[this.logger.log]
    _resubscribeAll -->|calls| this_logger_log
    this__entitySubscriptions_entries[this._entitySubscriptions.entries]
    _resubscribeAll -->|calls| this__entitySubscriptions_entries
    subscription[subscription]
    _resubscribeAll -->|calls| subscription
    this_logger_error[this.logger.error]
    _resubscribeAll -->|calls| this_logger_error
    this__entitySubscriptions_clear[this._entitySubscriptions.clear]
    _resubscribeAll -->|calls| this__entitySubscriptions_clear
    this__subscriptions_keys[this._subscriptions.keys]
    _resubscribeAll -->|calls| this__subscriptions_keys
    this__subscribeToEntity[this._subscribeToEntity]
    _resubscribeAll -->|calls| this__subscribeToEntity
    setHass[setHass]
    setHass -->|calls| _resubscribeAll
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_updateEntityState` (🔒 Private) {#_updateEntityState}

**Parameters:**

- `entityId`: `string`
- `data`: `any`

**Returns:** `void`

**Calls:**

- `Array.isArray`
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#setHassData
- [[inventree-state|inventree-state]]#trackLastUpdate
- [[logger|logger]]#error

**Called By:**

- From [[websocket|websocket]]:
  - `_subscribeToEntity`
  - `_startHealthCheck`

**Call Graph:**

```mermaid
flowchart LR
    _updateEntityState[_updateEntityState]:::current
    Array_isArray[Array.isArray]
    _updateEntityState -->|calls| Array_isArray
    InventTreeState_getInstance[InventTreeState.getInstance]
    _updateEntityState -->|calls| InventTreeState_getInstance
    state_setHassData[state.setHassData]
    _updateEntityState -->|calls| state_setHassData
    state_trackLastUpdate[state.trackLastUpdate]
    _updateEntityState -->|calls| state_trackLastUpdate
    this_logger_error[this.logger.error]
    _updateEntityState -->|calls| this_logger_error
    _subscribeToEntity[_subscribeToEntity]
    _subscribeToEntity -->|calls| _updateEntityState
    _startHealthCheck[_startHealthCheck]
    _startHealthCheck -->|calls| _updateEntityState
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_isMessageForEntity` (🔒 Private) {#_isMessageForEntity}

**Parameters:**

- `message`: `any`
- `entityId`: `string`

**Returns:** `boolean`

**Calls:**

- `message.result.includes`

**Called By:**

- From [[websocket|websocket]]:
  - `_handleEntityMessage`

**Call Graph:**

```mermaid
flowchart LR
    _isMessageForEntity[_isMessageForEntity]:::current
    message_result_includes[message.result.includes]
    _isMessageForEntity -->|calls| message_result_includes
    _handleEntityMessage[_handleEntityMessage]
    _handleEntityMessage -->|calls| _isMessageForEntity
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_processMessage` (🔒 Private) {#_processMessage}

**Parameters:**

- `message`: `any`

**Returns:** `any`

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `_handleMessage`
- From [[websocket|websocket]]:
  - `_handleEntityMessage`

**Call Graph:**

```mermaid
flowchart LR
    _processMessage[_processMessage]:::current
    _handleMessage[_handleMessage]
    _handleMessage -->|calls| _processMessage
    _handleEntityMessage[_handleEntityMessage]
    _handleEntityMessage -->|calls| _processMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_startHealthCheck` (🔒 Private) {#_startHealthCheck}

**Returns:** `void`

**Calls:**

- `clearInterval`
- `setInterval`
- `this._subscriptions.forEach`
- [[websocket|websocket]]#_updateEntityState

**Call Graph:**

```mermaid
flowchart LR
    _startHealthCheck[_startHealthCheck]:::current
    clearInterval[clearInterval]
    _startHealthCheck -->|calls| clearInterval
    setInterval[setInterval]
    _startHealthCheck -->|calls| setInterval
    this__subscriptions_forEach[this._subscriptions.forEach]
    _startHealthCheck -->|calls| this__subscriptions_forEach
    this__updateEntityState[this._updateEntityState]
    _startHealthCheck -->|calls| this__updateEntityState
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `isConnected` (🌐 Public) {#isConnected}

**Returns:** `boolean`

**Called By:**

- From [[websocket|websocket]]:
  - `getDiagnostics`
  - `getConnectionStatus`

**Call Graph:**

```mermaid
flowchart LR
    isConnected[isConnected]:::current
    getDiagnostics[getDiagnostics]
    getDiagnostics -->|calls| isConnected
    getConnectionStatus[getConnectionStatus]
    getConnectionStatus -->|calls| isConnected
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getDiagnostics` (🌐 Public) {#getDiagnostics}

**Returns:** `object`

**Calls:**

- [[websocket-manager|websocket-manager]]#isConnected
- `Array.from`
- `this._subscriptions.keys`

**Call Graph:**

```mermaid
flowchart LR
    getDiagnostics[getDiagnostics]:::current
    this_isConnected[this.isConnected]
    getDiagnostics -->|calls| this_isConnected
    Array_from[Array.from]
    getDiagnostics -->|calls| Array_from
    this__subscriptions_keys[this._subscriptions.keys]
    getDiagnostics -->|calls| this__subscriptions_keys
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `destroy` (🌐 Public) {#destroy}

**Returns:** `void`

**Calls:**

- `clearInterval`
- `this._subscriptions.forEach`
- [[websocket|websocket]]#_unsubscribeFromEntity
- [[cache|cache]]#clear
- [[cache|cache]]#clear
- [[logger|logger]]#log

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `disconnectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    destroy[destroy]:::current
    clearInterval[clearInterval]
    destroy -->|calls| clearInterval
    this__subscriptions_forEach[this._subscriptions.forEach]
    destroy -->|calls| this__subscriptions_forEach
    this__unsubscribeFromEntity[this._unsubscribeFromEntity]
    destroy -->|calls| this__unsubscribeFromEntity
    this__subscriptions_clear[this._subscriptions.clear]
    destroy -->|calls| this__subscriptions_clear
    this__entitySubscriptions_clear[this._entitySubscriptions.clear]
    destroy -->|calls| this__entitySubscriptions_clear
    this_logger_log[this.logger.log]
    destroy -->|calls| this_logger_log
    disconnectedCallback[disconnectedCallback]
    disconnectedCallback -->|calls| destroy
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getConnectionStatus` (🌐 Public) {#getConnectionStatus}

**Returns:** `Record<string, boolean>`

**Calls:**

- [[websocket-manager|websocket-manager]]#isConnected

**Called By:**

- From [[card-controller|card-controller]]:
  - `getWebSocketDiagnostics`

**Call Graph:**

```mermaid
flowchart LR
    getConnectionStatus[getConnectionStatus]:::current
    this_isConnected[this.isConnected]
    getConnectionStatus -->|calls| this_isConnected
    getWebSocketDiagnostics[getWebSocketDiagnostics]
    getWebSocketDiagnostics -->|calls| getConnectionStatus
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getApiStatus` (🌐 Public) {#getApiStatus}

**Returns:** `{ 
    failureCount: number, 
    usingFallback: boolean, 
    recentSuccess: boolean 
  }`

**Called By:**

- From [[card-controller|card-controller]]:
  - `getWebSocketDiagnostics`

**Call Graph:**

```mermaid
flowchart LR
    getApiStatus[getApiStatus]:::current
    getWebSocketDiagnostics[getWebSocketDiagnostics]
    getWebSocketDiagnostics -->|calls| getApiStatus
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `setDirectApi` (🌐 Public) {#setDirectApi}

**Parameters:**

- `api`: `InvenTreeDirectAPI | null`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `connectedCallback`
- From [[card-controller|card-controller]]:
  - `initializeApi`

**Call Graph:**

```mermaid
flowchart LR
    setDirectApi[setDirectApi]:::current
    this_logger_log[this.logger.log]
    setDirectApi -->|calls| this_logger_log
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| setDirectApi
    initializeApi[initializeApi]
    initializeApi -->|calls| setDirectApi
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getDirectApi` (🌐 Public) {#getDirectApi}

**Returns:** `InvenTreeDirectAPI | null`

## Dependencies

```mermaid
flowchart TD
    websocket[websocket.ts]:::current
    logger[logger.ts]
    websocket -->|imports| logger
    types[types.ts]
    websocket -->|imports| types
    inventree_state[inventree-state.ts]
    websocket -->|imports| inventree_state
    api[api.ts]
    websocket -->|imports| api
    grid_layout[grid-layout.ts]
    grid_layout -->|imports| websocket
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| websocket
    card_controller[card-controller.ts]
    card_controller -->|imports| websocket
    state[state.ts]
    state -->|imports| websocket
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

