---
aliases: [websocket-plugin.ts]
tags: [file, services]
---

# websocket-plugin.ts

**Path:** `services/websocket-plugin.ts`  
**Line Count:** 413  
**Functions:** 13  

## Overview

This file is part of the `services` directory.

## Imports

- [[inventree-state|inventree-state]]: InventTreeState
- [[websocket-manager|websocket-manager]]: WebSocketManager
- [[rendering-service|rendering-service]]: RenderingService
- [[logger|logger]]: Logger
- [[cache|cache]]: CacheService
- [[parameter-service|parameter-service]]: ParameterService

## Exports

- `WebSocketPlugin`

## Functions

### Class: WebSocketPlugin

### `getInstance` (🌐 Public) {#getInstance}

**Returns:** `WebSocketPlugin`

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

### `configure` (🌐 Public) {#configure}

**Parameters:**

- `config`: `InvenTreeWebSocketConfig`

**Returns:** `void`

**Calls:**

- [[websocket-plugin|websocket-plugin]]#connect
- [[websocket-plugin|websocket-plugin]]#disconnect

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `connectedCallback`
  - `_initializeServices`
- From [[card-controller|card-controller]]:
  - `initializeWebSocketPlugin`

**Call Graph:**

```mermaid
flowchart LR
    configure[configure]:::current
    this_connect[this.connect]
    configure -->|calls| this_connect
    this_disconnect[this.disconnect]
    configure -->|calls| this_disconnect
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| configure
    _initializeServices[_initializeServices]
    _initializeServices -->|calls| configure
    initializeWebSocketPlugin[initializeWebSocketPlugin]
    initializeWebSocketPlugin -->|calls| configure
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `connect` (🌐 Public) {#connect}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#warn
- [[logger|logger]]#log
- [[websocket-manager|websocket-manager]]#getConnection
- `this._handleOpen.bind`
- `this._handleMessage.bind`
- [[logger|logger]]#error
- [[websocket-plugin|websocket-plugin]]#_scheduleReconnect

**Called By:**

- From [[card-controller|card-controller]]:
  - `initializeWebSocketPlugin`
- From [[websocket-plugin|websocket-plugin]]:
  - `configure`
  - `_scheduleReconnect`

**Call Graph:**

```mermaid
flowchart LR
    connect[connect]:::current
    this_logger_warn[this.logger.warn]
    connect -->|calls| this_logger_warn
    this_logger_log[this.logger.log]
    connect -->|calls| this_logger_log
    this__webSocketManager_getConnection[this._webSocketManager.getConnection]
    connect -->|calls| this__webSocketManager_getConnection
    this__handleOpen_bind[this._handleOpen.bind]
    connect -->|calls| this__handleOpen_bind
    this__handleMessage_bind[this._handleMessage.bind]
    connect -->|calls| this__handleMessage_bind
    this_logger_error[this.logger.error]
    connect -->|calls| this_logger_error
    this__scheduleReconnect[this._scheduleReconnect]
    connect -->|calls| this__scheduleReconnect
    initializeWebSocketPlugin[initializeWebSocketPlugin]
    initializeWebSocketPlugin -->|calls| connect
    configure[configure]
    configure -->|calls| connect
    _scheduleReconnect[_scheduleReconnect]
    _scheduleReconnect -->|calls| connect
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `disconnect` (🌐 Public) {#disconnect}

**Returns:** `void`

**Calls:**

- [[websocket-manager|websocket-manager]]#closeConnection
- [[logger|logger]]#log

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `configure`

**Call Graph:**

```mermaid
flowchart LR
    disconnect[disconnect]:::current
    this__webSocketManager_closeConnection[this._webSocketManager.closeConnection]
    disconnect -->|calls| this__webSocketManager_closeConnection
    this_logger_log[this.logger.log]
    disconnect -->|calls| this_logger_log
    configure[configure]
    configure -->|calls| disconnect
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `onMessage` (🌐 Public) {#onMessage}

**Parameters:**

- `callback`: `(message: any) => void`

**Returns:** `() => void`

**Calls:**

- `this._messageCallbacks.push`
- `this._messageCallbacks.indexOf`
- `this._messageCallbacks.splice`

**Called By:**

- From [[card-controller|card-controller]]:
  - `initializeWebSocketPlugin`

**Call Graph:**

```mermaid
flowchart LR
    onMessage[onMessage]:::current
    this__messageCallbacks_push[this._messageCallbacks.push]
    onMessage -->|calls| this__messageCallbacks_push
    this__messageCallbacks_indexOf[this._messageCallbacks.indexOf]
    onMessage -->|calls| this__messageCallbacks_indexOf
    this__messageCallbacks_splice[this._messageCallbacks.splice]
    onMessage -->|calls| this__messageCallbacks_splice
    initializeWebSocketPlugin[initializeWebSocketPlugin]
    initializeWebSocketPlugin -->|calls| onMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_handleOpen` (🔒 Private) {#_handleOpen}

**Parameters:**

- `event`: `Event`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log

**Call Graph:**

```mermaid
flowchart LR
    _handleOpen[_handleOpen]:::current
    this_logger_log[this.logger.log]
    _handleOpen -->|calls| this_logger_log
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_handleMessage` (🔒 Private) {#_handleMessage}

**Parameters:**

- `event`: `MessageEvent`

**Returns:** `void`

**Calls:**

- `JSON.parse`
- `Date.now`
- [[websocket-plugin|websocket-plugin]]#_getMessageId
- [[cache|cache]]#has
- [[logger|logger]]#log
- [[cache|cache]]#set
- `this._messageCallbacks.forEach`
- `callback`
- [[logger|logger]]#error
- [[websocket-plugin|websocket-plugin]]#_processMessage

**Call Graph:**

```mermaid
flowchart LR
    _handleMessage[_handleMessage]:::current
    JSON_parse[JSON.parse]
    _handleMessage -->|calls| JSON_parse
    Date_now[Date.now]
    _handleMessage -->|calls| Date_now
    this__getMessageId[this._getMessageId]
    _handleMessage -->|calls| this__getMessageId
    this_cache_has[this.cache.has]
    _handleMessage -->|calls| this_cache_has
    this_logger_log[this.logger.log]
    _handleMessage -->|calls| this_logger_log
    this_cache_set[this.cache.set]
    _handleMessage -->|calls| this_cache_set
    this__messageCallbacks_forEach[this._messageCallbacks.forEach]
    _handleMessage -->|calls| this__messageCallbacks_forEach
    callback[callback]
    _handleMessage -->|calls| callback
    this_logger_error[this.logger.error]
    _handleMessage -->|calls| this_logger_error
    this__processMessage[this._processMessage]
    _handleMessage -->|calls| this__processMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_getMessageId` (🔒 Private) {#_getMessageId}

**Parameters:**

- `message`: `any`

**Returns:** `string | null`

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `_handleMessage`

**Call Graph:**

```mermaid
flowchart LR
    _getMessageId[_getMessageId]:::current
    _handleMessage[_handleMessage]
    _handleMessage -->|calls| _getMessageId
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_processMessage` (🔒 Private) {#_processMessage}

**Parameters:**

- `message`: `any`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- `JSON.stringify(message).substring`
- `JSON.stringify`
- [[websocket-plugin|websocket-plugin]]#_handleParameterUpdate
- [[logger|logger]]#warn

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `_handleMessage`
- From [[websocket|websocket]]:
  - `_handleEntityMessage`

**Call Graph:**

```mermaid
flowchart LR
    _processMessage[_processMessage]:::current
    this_logger_log[this.logger.log]
    _processMessage -->|calls| this_logger_log
    JSON_stringify_message__substring[JSON.stringify(message).substring]
    _processMessage -->|calls| JSON_stringify_message__substring
    JSON_stringify[JSON.stringify]
    _processMessage -->|calls| JSON_stringify
    this__handleParameterUpdate[this._handleParameterUpdate]
    _processMessage -->|calls| this__handleParameterUpdate
    this_logger_warn[this.logger.warn]
    _processMessage -->|calls| this_logger_warn
    _handleMessage[_handleMessage]
    _handleMessage -->|calls| _processMessage
    _handleEntityMessage[_handleEntityMessage]
    _handleEntityMessage -->|calls| _processMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_handleParameterUpdate` (🔒 Private) {#_handleParameterUpdate}

**Parameters:**

- `message`: `any`

**Returns:** `void`

**Calls:**

- `String`
- [[logger|logger]]#warn
- [[logger|logger]]#log
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#updateParameter
- [[rendering-service|rendering-service]]#restartIdleTimer
- [[parameter-service|parameter-service]]#hasInstance
- [[inventree-state|inventree-state]]#getInstance
- [[inventree-state|inventree-state]]#findEntityForPart
- [[parameter-service|parameter-service]]#markParameterChanged
- [[rendering-service|rendering-service]]#forceRender
- [[logger|logger]]#error

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `_processMessage`

**Call Graph:**

```mermaid
flowchart LR
    _handleParameterUpdate[_handleParameterUpdate]:::current
    String[String]
    _handleParameterUpdate -->|calls| String
    this_logger_warn[this.logger.warn]
    _handleParameterUpdate -->|calls| this_logger_warn
    this_logger_log[this.logger.log]
    _handleParameterUpdate -->|calls| this_logger_log
    InventTreeState_getInstance[InventTreeState.getInstance]
    _handleParameterUpdate -->|calls| InventTreeState_getInstance
    RenderingService_getInstance[RenderingService.getInstance]
    _handleParameterUpdate -->|calls| RenderingService_getInstance
    state_updateParameter[state.updateParameter]
    _handleParameterUpdate -->|calls| state_updateParameter
    renderingService_restartIdleTimer[renderingService.restartIdleTimer]
    _handleParameterUpdate -->|calls| renderingService_restartIdleTimer
    ParameterService_hasInstance[ParameterService.hasInstance]
    _handleParameterUpdate -->|calls| ParameterService_hasInstance
    ParameterService_getInstance[ParameterService.getInstance]
    _handleParameterUpdate -->|calls| ParameterService_getInstance
    paramService_findEntityForPart[paramService.findEntityForPart]
    _handleParameterUpdate -->|calls| paramService_findEntityForPart
    ParameterService_markParameterChanged[ParameterService.markParameterChanged]
    _handleParameterUpdate -->|calls| ParameterService_markParameterChanged
    renderingService_forceRender[renderingService.forceRender]
    _handleParameterUpdate -->|calls| renderingService_forceRender
    this_logger_error[this.logger.error]
    _handleParameterUpdate -->|calls| this_logger_error
    _processMessage[_processMessage]
    _processMessage -->|calls| _handleParameterUpdate
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_scheduleReconnect` (🔒 Private) {#_scheduleReconnect}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[websocket-plugin|websocket-plugin]]#connect

**Called By:**

- From [[websocket-plugin|websocket-plugin]]:
  - `connect`

**Call Graph:**

```mermaid
flowchart LR
    _scheduleReconnect[_scheduleReconnect]:::current
    this_logger_log[this.logger.log]
    _scheduleReconnect -->|calls| this_logger_log
    this_connect[this.connect]
    _scheduleReconnect -->|calls| this_connect
    connect[connect]
    connect -->|calls| _scheduleReconnect
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

### `getStats` (🌐 Public) {#getStats}

**Returns:** `{
    isConnected: boolean;
    messageCount: number;
    errorCount: number;
    lastMessageTime: number;
  }`

**Called By:**

- From [[card-controller|card-controller]]:
  - `getWebSocketDiagnostics`
- From [[websocket-manager|websocket-manager]]:
  - `getEnhancedStats`

**Call Graph:**

```mermaid
flowchart LR
    getStats[getStats]:::current
    getWebSocketDiagnostics[getWebSocketDiagnostics]
    getWebSocketDiagnostics -->|calls| getStats
    getEnhancedStats[getEnhancedStats]
    getEnhancedStats -->|calls| getStats
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    websocket-plugin[websocket-plugin.ts]:::current
    inventree_state[inventree-state.ts]
    websocket-plugin -->|imports| inventree_state
    websocket_manager[websocket-manager.ts]
    websocket-plugin -->|imports| websocket_manager
    rendering_service[rendering-service.ts]
    websocket-plugin -->|imports| rendering_service
    logger[logger.ts]
    websocket-plugin -->|imports| logger
    cache[cache.ts]
    websocket-plugin -->|imports| cache
    parameter_service[parameter-service.ts]
    websocket-plugin -->|imports| parameter_service
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| websocket-plugin
    card_controller[card-controller.ts]
    card_controller -->|imports| websocket-plugin
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

