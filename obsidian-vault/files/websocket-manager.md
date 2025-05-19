---
aliases: [websocket-manager.ts]
tags: [file, services]
---

# websocket-manager.ts

**Path:** `services/websocket-manager.ts`  
**Line Count:** 412  
**Functions:** 19  

## Overview

This file is part of the `services` directory.

## Imports

- [[logger|logger]]: Logger

## Exports

- `WebSocketManager`

## Functions

### Class: WebSocketManager

### `getInstance` (🌐 Public) {#getInstance}

**Returns:** `WebSocketManager`

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

### `getConnection` (🌐 Public) {#getConnection}

**Parameters:**

- `url`: `string`
- `onOpen`: `(event: Event) => void`
- `onMessage`: `(event: MessageEvent) => void`

**Returns:** `WebSocket | null`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#get
- [[websocket-manager|websocket-manager]]#addOpenCallback
- [[websocket-manager|websocket-manager]]#addMessageCallback
- [[logger|logger]]#log
- [[websocket-manager|websocket-manager]]#closeConnection
- [[cache|cache]]#set
- [[cache|cache]]#set
- [[websocket-manager|websocket-manager]]#handleOpen
- [[websocket-manager|websocket-manager]]#handleMessage
- [[websocket-manager|websocket-manager]]#handleError
- [[websocket-manager|websocket-manager]]#handleClose
- [[websocket-manager|websocket-manager]]#setupKeepAlive
- [[logger|logger]]#error

**Called By:**

- From [[grid-layout|grid-layout]]:
  - `_setupWebSocketConnection`
- From [[websocket-manager|websocket-manager]]:
  - `handleClose`
- From [[websocket-plugin|websocket-plugin]]:
  - `connect`

**Call Graph:**

```mermaid
flowchart LR
    getConnection[getConnection]:::current
    this__connections_has[this._connections.has]
    getConnection -->|calls| this__connections_has
    this__connections_get[this._connections.get]
    getConnection -->|calls| this__connections_get
    this_addOpenCallback[this.addOpenCallback]
    getConnection -->|calls| this_addOpenCallback
    this_addMessageCallback[this.addMessageCallback]
    getConnection -->|calls| this_addMessageCallback
    this__logger_log[this._logger.log]
    getConnection -->|calls| this__logger_log
    this_closeConnection[this.closeConnection]
    getConnection -->|calls| this_closeConnection
    this__connections_set[this._connections.set]
    getConnection -->|calls| this__connections_set
    this__errorCounts_set[this._errorCounts.set]
    getConnection -->|calls| this__errorCounts_set
    this_handleOpen[this.handleOpen]
    getConnection -->|calls| this_handleOpen
    this_handleMessage[this.handleMessage]
    getConnection -->|calls| this_handleMessage
    this_handleError[this.handleError]
    getConnection -->|calls| this_handleError
    this_handleClose[this.handleClose]
    getConnection -->|calls| this_handleClose
    this_setupKeepAlive[this.setupKeepAlive]
    getConnection -->|calls| this_setupKeepAlive
    this__logger_error[this._logger.error]
    getConnection -->|calls| this__logger_error
    _setupWebSocketConnection[_setupWebSocketConnection]
    _setupWebSocketConnection -->|calls| getConnection
    handleClose[handleClose]
    handleClose -->|calls| getConnection
    connect[connect]
    connect -->|calls| getConnection
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `addOpenCallback` (🌐 Public) {#addOpenCallback}

**Parameters:**

- `url`: `string`
- `callback`: `(event: Event) => void`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#set
- `this._openCallbacks.get(url).add`
- [[cache|cache]]#get

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`
  - `handleClose`

**Call Graph:**

```mermaid
flowchart LR
    addOpenCallback[addOpenCallback]:::current
    this__openCallbacks_has[this._openCallbacks.has]
    addOpenCallback -->|calls| this__openCallbacks_has
    this__openCallbacks_set[this._openCallbacks.set]
    addOpenCallback -->|calls| this__openCallbacks_set
    this__openCallbacks_get_url__add[this._openCallbacks.get(url).add]
    addOpenCallback -->|calls| this__openCallbacks_get_url__add
    this__openCallbacks_get[this._openCallbacks.get]
    addOpenCallback -->|calls| this__openCallbacks_get
    getConnection[getConnection]
    getConnection -->|calls| addOpenCallback
    handleClose[handleClose]
    handleClose -->|calls| addOpenCallback
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `addMessageCallback` (🌐 Public) {#addMessageCallback}

**Parameters:**

- `url`: `string`
- `callback`: `(event: MessageEvent) => void`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#set
- `this._messageCallbacks.get(url).add`
- [[cache|cache]]#get

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`
  - `handleClose`

**Call Graph:**

```mermaid
flowchart LR
    addMessageCallback[addMessageCallback]:::current
    this__messageCallbacks_has[this._messageCallbacks.has]
    addMessageCallback -->|calls| this__messageCallbacks_has
    this__messageCallbacks_set[this._messageCallbacks.set]
    addMessageCallback -->|calls| this__messageCallbacks_set
    this__messageCallbacks_get_url__add[this._messageCallbacks.get(url).add]
    addMessageCallback -->|calls| this__messageCallbacks_get_url__add
    this__messageCallbacks_get[this._messageCallbacks.get]
    addMessageCallback -->|calls| this__messageCallbacks_get
    getConnection[getConnection]
    getConnection -->|calls| addMessageCallback
    handleClose[handleClose]
    handleClose -->|calls| addMessageCallback
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `removeCallbacks` (🌐 Public) {#removeCallbacks}

**Parameters:**

- `url`: `string`
- `openCallback`: `(event: Event) => void`
- `messageCallback`: `(event: MessageEvent) => void`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#delete
- [[cache|cache]]#get
- [[cache|cache]]#has
- [[cache|cache]]#delete
- [[cache|cache]]#get
- [[logger|logger]]#log
- [[websocket-manager|websocket-manager]]#closeConnection

**Called By:**

- From [[grid-layout|grid-layout]]:
  - `_cleanupListeners`

**Call Graph:**

```mermaid
flowchart LR
    removeCallbacks[removeCallbacks]:::current
    this__openCallbacks_has[this._openCallbacks.has]
    removeCallbacks -->|calls| this__openCallbacks_has
    this__openCallbacks_get_url__delete[this._openCallbacks.get(url).delete]
    removeCallbacks -->|calls| this__openCallbacks_get_url__delete
    this__openCallbacks_get[this._openCallbacks.get]
    removeCallbacks -->|calls| this__openCallbacks_get
    this__messageCallbacks_has[this._messageCallbacks.has]
    removeCallbacks -->|calls| this__messageCallbacks_has
    this__messageCallbacks_get_url__delete[this._messageCallbacks.get(url).delete]
    removeCallbacks -->|calls| this__messageCallbacks_get_url__delete
    this__messageCallbacks_get[this._messageCallbacks.get]
    removeCallbacks -->|calls| this__messageCallbacks_get
    this__logger_log[this._logger.log]
    removeCallbacks -->|calls| this__logger_log
    this_closeConnection[this.closeConnection]
    removeCallbacks -->|calls| this_closeConnection
    _cleanupListeners[_cleanupListeners]
    _cleanupListeners -->|calls| removeCallbacks
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `closeConnection` (🌐 Public) {#closeConnection}

**Parameters:**

- `url`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#get
- `connection.close`
- [[cache|cache]]#delete
- [[cache|cache]]#has
- [[cache|cache]]#get
- [[cache|cache]]#delete
- [[cache|cache]]#has
- [[cache|cache]]#get
- [[cache|cache]]#delete
- [[cache|cache]]#delete
- [[cache|cache]]#delete

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`
  - `removeCallbacks`
  - `closeAllConnections`
- From [[websocket-plugin|websocket-plugin]]:
  - `disconnect`

**Call Graph:**

```mermaid
flowchart LR
    closeConnection[closeConnection]:::current
    this__connections_get[this._connections.get]
    closeConnection -->|calls| this__connections_get
    connection_close[connection.close]
    closeConnection -->|calls| connection_close
    this__connections_delete[this._connections.delete]
    closeConnection -->|calls| this__connections_delete
    this__keepAliveTimers_has[this._keepAliveTimers.has]
    closeConnection -->|calls| this__keepAliveTimers_has
    this__keepAliveTimers_get[this._keepAliveTimers.get]
    closeConnection -->|calls| this__keepAliveTimers_get
    this__keepAliveTimers_delete[this._keepAliveTimers.delete]
    closeConnection -->|calls| this__keepAliveTimers_delete
    this__reconnectTimers_has[this._reconnectTimers.has]
    closeConnection -->|calls| this__reconnectTimers_has
    this__reconnectTimers_get[this._reconnectTimers.get]
    closeConnection -->|calls| this__reconnectTimers_get
    this__reconnectTimers_delete[this._reconnectTimers.delete]
    closeConnection -->|calls| this__reconnectTimers_delete
    this__openCallbacks_delete[this._openCallbacks.delete]
    closeConnection -->|calls| this__openCallbacks_delete
    this__messageCallbacks_delete[this._messageCallbacks.delete]
    closeConnection -->|calls| this__messageCallbacks_delete
    getConnection[getConnection]
    getConnection -->|calls| closeConnection
    removeCallbacks[removeCallbacks]
    removeCallbacks -->|calls| closeConnection
    closeAllConnections[closeAllConnections]
    closeAllConnections -->|calls| closeConnection
    disconnect[disconnect]
    disconnect -->|calls| closeConnection
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `closeAllConnections` (🌐 Public) {#closeAllConnections}

**Returns:** `void`

**Calls:**

- `this._connections.keys`
- [[websocket-manager|websocket-manager]]#closeConnection
- [[logger|logger]]#log

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `destroy`

**Call Graph:**

```mermaid
flowchart LR
    closeAllConnections[closeAllConnections]:::current
    this__connections_keys[this._connections.keys]
    closeAllConnections -->|calls| this__connections_keys
    this_closeConnection[this.closeConnection]
    closeAllConnections -->|calls| this_closeConnection
    this__logger_log[this._logger.log]
    closeAllConnections -->|calls| this__logger_log
    destroy[destroy]
    destroy -->|calls| closeAllConnections
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `handleOpen` (🌐 Public) {#handleOpen}

**Parameters:**

- `event`: `Event`
- `url`: `string`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[cache|cache]]#set
- [[cache|cache]]#has
- [[cache|cache]]#get
- `callback`
- [[logger|logger]]#error

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`

**Call Graph:**

```mermaid
flowchart LR
    handleOpen[handleOpen]:::current
    this__logger_log[this._logger.log]
    handleOpen -->|calls| this__logger_log
    this__errorCounts_set[this._errorCounts.set]
    handleOpen -->|calls| this__errorCounts_set
    this__openCallbacks_has[this._openCallbacks.has]
    handleOpen -->|calls| this__openCallbacks_has
    this__openCallbacks_get[this._openCallbacks.get]
    handleOpen -->|calls| this__openCallbacks_get
    callback[callback]
    handleOpen -->|calls| callback
    this__logger_error[this._logger.error]
    handleOpen -->|calls| this__logger_error
    getConnection[getConnection]
    getConnection -->|calls| handleOpen
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `handleMessage` (🌐 Public) {#handleMessage}

**Parameters:**

- `event`: `MessageEvent`
- `url`: `string`

**Returns:** `void`

**Calls:**

- `JSON.parse`
- [[websocket-manager|websocket-manager]]#_handleBasicMessage
- [[cache|cache]]#has
- [[logger|logger]]#log
- `this._processingMessages.add`
- `setTimeout`
- [[cache|cache]]#delete
- [[cache|cache]]#has
- [[cache|cache]]#get
- `callback`
- [[logger|logger]]#error

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`

**Call Graph:**

```mermaid
flowchart LR
    handleMessage[handleMessage]:::current
    JSON_parse[JSON.parse]
    handleMessage -->|calls| JSON_parse
    this__handleBasicMessage[this._handleBasicMessage]
    handleMessage -->|calls| this__handleBasicMessage
    this__processingMessages_has[this._processingMessages.has]
    handleMessage -->|calls| this__processingMessages_has
    this__logger_log[this._logger.log]
    handleMessage -->|calls| this__logger_log
    this__processingMessages_add[this._processingMessages.add]
    handleMessage -->|calls| this__processingMessages_add
    setTimeout[setTimeout]
    handleMessage -->|calls| setTimeout
    this__processingMessages_delete[this._processingMessages.delete]
    handleMessage -->|calls| this__processingMessages_delete
    this__messageCallbacks_has[this._messageCallbacks.has]
    handleMessage -->|calls| this__messageCallbacks_has
    this__messageCallbacks_get[this._messageCallbacks.get]
    handleMessage -->|calls| this__messageCallbacks_get
    callback[callback]
    handleMessage -->|calls| callback
    this__logger_error[this._logger.error]
    handleMessage -->|calls| this__logger_error
    getConnection[getConnection]
    getConnection -->|calls| handleMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_handleBasicMessage` (🔒 Private) {#_handleBasicMessage}

**Parameters:**

- `message`: `any`
- `url`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#get
- `connection.send`
- `JSON.stringify`
- `Date.now`
- [[logger|logger]]#error

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `handleMessage`

**Call Graph:**

```mermaid
flowchart LR
    _handleBasicMessage[_handleBasicMessage]:::current
    this__connections_get[this._connections.get]
    _handleBasicMessage -->|calls| this__connections_get
    connection_send[connection.send]
    _handleBasicMessage -->|calls| connection_send
    JSON_stringify[JSON.stringify]
    _handleBasicMessage -->|calls| JSON_stringify
    Date_now[Date.now]
    _handleBasicMessage -->|calls| Date_now
    this__logger_error[this._logger.error]
    _handleBasicMessage -->|calls| this__logger_error
    handleMessage[handleMessage]
    handleMessage -->|calls| _handleBasicMessage
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `handleError` (🌐 Public) {#handleError}

**Parameters:**

- `event`: `Event`
- `url`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#get
- [[cache|cache]]#set
- [[logger|logger]]#error

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`

**Call Graph:**

```mermaid
flowchart LR
    handleError[handleError]:::current
    this__errorCounts_get[this._errorCounts.get]
    handleError -->|calls| this__errorCounts_get
    this__errorCounts_set[this._errorCounts.set]
    handleError -->|calls| this__errorCounts_set
    this__logger_error[this._logger.error]
    handleError -->|calls| this__logger_error
    getConnection[getConnection]
    getConnection -->|calls| handleError
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `handleClose` (🌐 Public) {#handleClose}

**Parameters:**

- `event`: `CloseEvent`
- `url`: `string`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[cache|cache]]#delete
- [[cache|cache]]#has
- [[cache|cache]]#get
- [[cache|cache]]#delete
- [[cache|cache]]#get
- `Math.min`
- `Math.pow`
- [[cache|cache]]#get
- [[cache|cache]]#get
- [[cache|cache]]#delete
- [[cache|cache]]#delete
- [[websocket-manager|websocket-manager]]#getConnection
- [[websocket-manager|websocket-manager]]#addOpenCallback
- [[websocket-manager|websocket-manager]]#addMessageCallback
- [[cache|cache]]#set

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`

**Call Graph:**

```mermaid
flowchart LR
    handleClose[handleClose]:::current
    this__logger_log[this._logger.log]
    handleClose -->|calls| this__logger_log
    this__connections_delete[this._connections.delete]
    handleClose -->|calls| this__connections_delete
    this__keepAliveTimers_has[this._keepAliveTimers.has]
    handleClose -->|calls| this__keepAliveTimers_has
    this__keepAliveTimers_get[this._keepAliveTimers.get]
    handleClose -->|calls| this__keepAliveTimers_get
    this__keepAliveTimers_delete[this._keepAliveTimers.delete]
    handleClose -->|calls| this__keepAliveTimers_delete
    this__errorCounts_get[this._errorCounts.get]
    handleClose -->|calls| this__errorCounts_get
    Math_min[Math.min]
    handleClose -->|calls| Math_min
    Math_pow[Math.pow]
    handleClose -->|calls| Math_pow
    this__openCallbacks_get[this._openCallbacks.get]
    handleClose -->|calls| this__openCallbacks_get
    this__messageCallbacks_get[this._messageCallbacks.get]
    handleClose -->|calls| this__messageCallbacks_get
    this__openCallbacks_delete[this._openCallbacks.delete]
    handleClose -->|calls| this__openCallbacks_delete
    this__messageCallbacks_delete[this._messageCallbacks.delete]
    handleClose -->|calls| this__messageCallbacks_delete
    this_getConnection[this.getConnection]
    handleClose -->|calls| this_getConnection
    this_addOpenCallback[this.addOpenCallback]
    handleClose -->|calls| this_addOpenCallback
    this_addMessageCallback[this.addMessageCallback]
    handleClose -->|calls| this_addMessageCallback
    this__reconnectTimers_set[this._reconnectTimers.set]
    handleClose -->|calls| this__reconnectTimers_set
    getConnection[getConnection]
    getConnection -->|calls| handleClose
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `setupKeepAlive` (🌐 Public) {#setupKeepAlive}

**Parameters:**

- `url`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#get
- [[cache|cache]]#get
- `connection.send`
- `JSON.stringify`
- `Date.now`
- [[logger|logger]]#error
- [[cache|cache]]#set

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getConnection`

**Call Graph:**

```mermaid
flowchart LR
    setupKeepAlive[setupKeepAlive]:::current
    this__keepAliveTimers_has[this._keepAliveTimers.has]
    setupKeepAlive -->|calls| this__keepAliveTimers_has
    this__keepAliveTimers_get[this._keepAliveTimers.get]
    setupKeepAlive -->|calls| this__keepAliveTimers_get
    this__connections_get[this._connections.get]
    setupKeepAlive -->|calls| this__connections_get
    connection_send[connection.send]
    setupKeepAlive -->|calls| connection_send
    JSON_stringify[JSON.stringify]
    setupKeepAlive -->|calls| JSON_stringify
    Date_now[Date.now]
    setupKeepAlive -->|calls| Date_now
    this__logger_error[this._logger.error]
    setupKeepAlive -->|calls| this__logger_error
    this__keepAliveTimers_set[this._keepAliveTimers.set]
    setupKeepAlive -->|calls| this__keepAliveTimers_set
    getConnection[getConnection]
    getConnection -->|calls| setupKeepAlive
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `destroy` (🌐 Public) {#destroy}

**Returns:** `void`

**Calls:**

- [[websocket-manager|websocket-manager]]#closeAllConnections

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `disconnectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    destroy[destroy]:::current
    this_closeAllConnections[this.closeAllConnections]
    destroy -->|calls| this_closeAllConnections
    disconnectedCallback[disconnectedCallback]
    disconnectedCallback -->|calls| destroy
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `isConnected` (🌐 Public) {#isConnected}

**Parameters:**

- `url`: `string`

**Returns:** `boolean`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#get

**Called By:**

- From [[websocket|websocket]]:
  - `getDiagnostics`
  - `getConnectionStatus`

**Call Graph:**

```mermaid
flowchart LR
    isConnected[isConnected]:::current
    this__connections_has[this._connections.has]
    isConnected -->|calls| this__connections_has
    this__connections_get[this._connections.get]
    isConnected -->|calls| this__connections_get
    getDiagnostics[getDiagnostics]
    getDiagnostics -->|calls| isConnected
    getConnectionStatus[getConnectionStatus]
    getConnectionStatus -->|calls| isConnected
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getStats` (🌐 Public) {#getStats}

**Returns:** `{ activeConnections: number, connections: Record<string, any> }`

**Calls:**

- `this._connections.entries`
- [[websocket-manager|websocket-manager]]#getReadyStateString
- [[cache|cache]]#get
- [[cache|cache]]#get
- [[cache|cache]]#get
- [[cache|cache]]#has
- [[cache|cache]]#has

**Called By:**

- From [[card-controller|card-controller]]:
  - `getWebSocketDiagnostics`
- From [[websocket-manager|websocket-manager]]:
  - `getEnhancedStats`

**Call Graph:**

```mermaid
flowchart LR
    getStats[getStats]:::current
    this__connections_entries[this._connections.entries]
    getStats -->|calls| this__connections_entries
    this_getReadyStateString[this.getReadyStateString]
    getStats -->|calls| this_getReadyStateString
    this__errorCounts_get[this._errorCounts.get]
    getStats -->|calls| this__errorCounts_get
    this__openCallbacks_get[this._openCallbacks.get]
    getStats -->|calls| this__openCallbacks_get
    this__messageCallbacks_get[this._messageCallbacks.get]
    getStats -->|calls| this__messageCallbacks_get
    this__keepAliveTimers_has[this._keepAliveTimers.has]
    getStats -->|calls| this__keepAliveTimers_has
    this__reconnectTimers_has[this._reconnectTimers.has]
    getStats -->|calls| this__reconnectTimers_has
    getWebSocketDiagnostics[getWebSocketDiagnostics]
    getWebSocketDiagnostics -->|calls| getStats
    getEnhancedStats[getEnhancedStats]
    getEnhancedStats -->|calls| getStats
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getReadyStateString` (🌐 Public) {#getReadyStateString}

**Parameters:**

- `state`: `number`

**Returns:** `string`

**Called By:**

- From [[websocket-manager|websocket-manager]]:
  - `getStats`

**Call Graph:**

```mermaid
flowchart LR
    getReadyStateString[getReadyStateString]:::current
    getStats[getStats]
    getStats -->|calls| getReadyStateString
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_recordActivity` (🔒 Private) {#_recordActivity}

**Parameters:**

- `url`: `string`
- `type`: `'received' | 'sent' | 'error'`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[cache|cache]]#set
- `Date.now`
- [[cache|cache]]#get

**Call Graph:**

```mermaid
flowchart LR
    _recordActivity[_recordActivity]:::current
    this__connectionStats_has[this._connectionStats.has]
    _recordActivity -->|calls| this__connectionStats_has
    this__connectionStats_set[this._connectionStats.set]
    _recordActivity -->|calls| this__connectionStats_set
    Date_now[Date.now]
    _recordActivity -->|calls| Date_now
    this__connectionStats_get[this._connectionStats.get]
    _recordActivity -->|calls| this__connectionStats_get
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getEnhancedStats` (🌐 Public) {#getEnhancedStats}

**Returns:** `{ activeConnections: number, connections: Record<string, any> }`

**Calls:**

- [[cache|cache]]#getStats
- `this._connections.entries`
- [[cache|cache]]#get

**Call Graph:**

```mermaid
flowchart LR
    getEnhancedStats[getEnhancedStats]:::current
    this_getStats[this.getStats]
    getEnhancedStats -->|calls| this_getStats
    this__connections_entries[this._connections.entries]
    getEnhancedStats -->|calls| this__connections_entries
    this__connectionStats_get[this._connectionStats.get]
    getEnhancedStats -->|calls| this__connectionStats_get
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    websocket-manager[websocket-manager.ts]:::current
    logger[logger.ts]
    websocket-manager -->|imports| logger
    grid_layout[grid-layout.ts]
    grid_layout -->|imports| websocket-manager
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| websocket-manager
    card_controller[card-controller.ts]
    card_controller -->|imports| websocket-manager
    state[state.ts]
    state -->|imports| websocket-manager
    websocket_plugin[websocket-plugin.ts]
    websocket_plugin -->|imports| websocket-manager
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

