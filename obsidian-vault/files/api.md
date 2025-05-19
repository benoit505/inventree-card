---
aliases: [api.ts]
tags: [file, services]
---

# api.ts

**Path:** `services/api.ts`  
**Line Count:** 869  
**Functions:** 24  

## Overview

This file is part of the `services` directory.

## Imports

- [[logger|logger]]: Logger

## Exports

- `InvenTreeDirectAPI`

## Functions

### Class: InvenTreeDirectAPI

### `setParameterService` (🌐 Public) {#setParameterService}

**Parameters:**

- `service`: `any`

**Returns:** `void`

### `getParameterValue` (🌐 Public) {#getParameterValue}

**Parameters:**

- `partId`: `number`
- `paramName`: `string`
- `fallbackData`: `any`

**Returns:** `Promise<string | null>`

**Calls:**

- [[logger|logger]]#log
- `Date.now`
- `setTimeout`
- `performance.now`
- `url.endsWith`
- `headers.append`
- `fetch`
- `response.json`
- `Math.round`
- `data.find`
- `templateName.toLowerCase`
- `paramName.toLowerCase`
- [[parameter-service|parameter-service]]#syncApiDataToEntityState
- [[api|api]]#notifyParameterChanged
- `data.forEach`

**Called By:**

- From [[inventree-state|inventree-state]]:
  - `findParameterInAllEntities`
- From [[inventree-card|inventree-card]]:
  - `_testSpecificParameter`
- From [[api|api]]:
  - `fetchParameterData`

**Call Graph:**

```mermaid
flowchart LR
    getParameterValue[getParameterValue]:::current
    this_logger_log[this.logger.log]
    getParameterValue -->|calls| this_logger_log
    Date_now[Date.now]
    getParameterValue -->|calls| Date_now
    setTimeout[setTimeout]
    getParameterValue -->|calls| setTimeout
    performance_now[performance.now]
    getParameterValue -->|calls| performance_now
    url_endsWith[url.endsWith]
    getParameterValue -->|calls| url_endsWith
    headers_append[headers.append]
    getParameterValue -->|calls| headers_append
    fetch[fetch]
    getParameterValue -->|calls| fetch
    response_json[response.json]
    getParameterValue -->|calls| response_json
    Math_round[Math.round]
    getParameterValue -->|calls| Math_round
    data_find[data.find]
    getParameterValue -->|calls| data_find
    templateName_toLowerCase[templateName.toLowerCase]
    getParameterValue -->|calls| templateName_toLowerCase
    paramName_toLowerCase[paramName.toLowerCase]
    getParameterValue -->|calls| paramName_toLowerCase
    this_parameterService_syncApiDataToEntityState[this.parameterService.syncApiDataToEntityState]
    getParameterValue -->|calls| this_parameterService_syncApiDataToEntityState
    this_notifyParameterChanged[this.notifyParameterChanged]
    getParameterValue -->|calls| this_notifyParameterChanged
    data_forEach[data.forEach]
    getParameterValue -->|calls| data_forEach
    findParameterInAllEntities[findParameterInAllEntities]
    findParameterInAllEntities -->|calls| getParameterValue
    _testSpecificParameter[_testSpecificParameter]
    _testSpecificParameter -->|calls| getParameterValue
    fetchParameterData[fetchParameterData]
    fetchParameterData -->|calls| getParameterValue
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getFallbackParameterValue` (🌐 Public) {#getFallbackParameterValue}

**Parameters:**

- `paramName`: `string`
- `fallbackData`: `any`

**Returns:** `string | null`

**Calls:**

- [[logger|logger]]#log
- `Array.isArray`
- `part.parameters.find`
- `p.template_detail?.name.toLowerCase`
- `paramName.toLowerCase`

**Call Graph:**

```mermaid
flowchart LR
    getFallbackParameterValue[getFallbackParameterValue]:::current
    this_logger_log[this.logger.log]
    getFallbackParameterValue -->|calls| this_logger_log
    Array_isArray[Array.isArray]
    getFallbackParameterValue -->|calls| Array_isArray
    part_parameters_find[part.parameters.find]
    getFallbackParameterValue -->|calls| part_parameters_find
    p_template_detail__name_toLowerCase[p.template_detail?.name.toLowerCase]
    getFallbackParameterValue -->|calls| p_template_detail__name_toLowerCase
    paramName_toLowerCase[paramName.toLowerCase]
    getFallbackParameterValue -->|calls| paramName_toLowerCase
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `setFallbackEnabled` (🌐 Public) {#setFallbackEnabled}

**Parameters:**

- `enabled`: `boolean`

**Returns:** `void`

**Called By:**

- From [[api|api]]:
  - `testConnection`
  - `testParameterAPI`

**Call Graph:**

```mermaid
flowchart LR
    setFallbackEnabled[setFallbackEnabled]:::current
    testConnection[testConnection]
    testConnection -->|calls| setFallbackEnabled
    testParameterAPI[testParameterAPI]
    testParameterAPI -->|calls| setFallbackEnabled
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `testConnection` (🌐 Public) {#testConnection}

**Parameters:**

- `quiet`: `boolean`

**Returns:** `Promise<boolean>`

**Calls:**

- `this.apiUrl.endsWith`
- `headers.append`
- `fetch`
- `paramHeaders.append`
- [[api|api]]#setFallbackEnabled
- `response.text`

**Call Graph:**

```mermaid
flowchart LR
    testConnection[testConnection]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    testConnection -->|calls| this_apiUrl_endsWith
    headers_append[headers.append]
    testConnection -->|calls| headers_append
    fetch[fetch]
    testConnection -->|calls| fetch
    paramHeaders_append[paramHeaders.append]
    testConnection -->|calls| paramHeaders_append
    this_setFallbackEnabled[this.setFallbackEnabled]
    testConnection -->|calls| this_setFallbackEnabled
    response_text[response.text]
    testConnection -->|calls| response_text
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getApiStats` (🌐 Public) {#getApiStats}

**Returns:** `{ apiCalls: number, fallbackCalls: number }`

**Called By:**

- From [[parameter-service|parameter-service]]:
  - `getApiStats`

**Call Graph:**

```mermaid
flowchart LR
    getApiStats[getApiStats]:::current
    getApiStats[getApiStats]
    getApiStats -->|calls| getApiStats
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getApiUrl` (🌐 Public) {#getApiUrl}

**Returns:** `string`

### `testBasicAuth` (🌐 Public) {#testBasicAuth}

**Parameters:**

- `username`: `string`
- `password`: `string`

**Returns:** `Promise<boolean>`

**Calls:**

- `this.apiUrl.endsWith`
- [[logger|logger]]#log
- `btoa`
- `fetch`
- [[logger|logger]]#error

**Call Graph:**

```mermaid
flowchart LR
    testBasicAuth[testBasicAuth]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    testBasicAuth -->|calls| this_apiUrl_endsWith
    this_logger_log[this.logger.log]
    testBasicAuth -->|calls| this_logger_log
    btoa[btoa]
    testBasicAuth -->|calls| btoa
    fetch[fetch]
    testBasicAuth -->|calls| fetch
    this_logger_error[this.logger.error]
    testBasicAuth -->|calls| this_logger_error
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getPartParameters` (🌐 Public) {#getPartParameters}

**Parameters:**

- `partId`: `number`

**Returns:** `Promise<any[]>`

**Calls:**

- `url.startsWith`
- `url.replace`
- `url.endsWith`
- [[logger|logger]]#log
- `fetch`
- [[logger|logger]]#error
- `response.json`

**Call Graph:**

```mermaid
flowchart LR
    getPartParameters[getPartParameters]:::current
    url_startsWith[url.startsWith]
    getPartParameters -->|calls| url_startsWith
    url_replace[url.replace]
    getPartParameters -->|calls| url_replace
    url_endsWith[url.endsWith]
    getPartParameters -->|calls| url_endsWith
    this_logger_log[this.logger.log]
    getPartParameters -->|calls| this_logger_log
    fetch[fetch]
    getPartParameters -->|calls| fetch
    this_logger_error[this.logger.error]
    getPartParameters -->|calls| this_logger_error
    response_json[response.json]
    getPartParameters -->|calls| response_json
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `testBasicAuthWithEndpoint` (🌐 Public) {#testBasicAuthWithEndpoint}

**Parameters:**

- `username`: `string`
- `password`: `string`
- `endpoint`: `string`

**Returns:** `Promise<any>`

**Calls:**

- `this.apiUrl.endsWith`
- `btoa`
- `fetch`
- `response.json`

**Call Graph:**

```mermaid
flowchart LR
    testBasicAuthWithEndpoint[testBasicAuthWithEndpoint]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    testBasicAuthWithEndpoint -->|calls| this_apiUrl_endsWith
    btoa[btoa]
    testBasicAuthWithEndpoint -->|calls| btoa
    fetch[fetch]
    testBasicAuthWithEndpoint -->|calls| fetch
    response_json[response.json]
    testBasicAuthWithEndpoint -->|calls| response_json
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `testConnectionExactFormat` (🌐 Public) {#testConnectionExactFormat}

**Parameters:**

- `quiet`: `boolean`

**Returns:** `Promise<boolean>`

**Calls:**

- `this.apiUrl.endsWith`
- `this.apiUrl.slice`
- `fetch`
- `response.json`
- [[api|api]]#testParameterAPI

**Call Graph:**

```mermaid
flowchart LR
    testConnectionExactFormat[testConnectionExactFormat]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    testConnectionExactFormat -->|calls| this_apiUrl_endsWith
    this_apiUrl_slice[this.apiUrl.slice]
    testConnectionExactFormat -->|calls| this_apiUrl_slice
    fetch[fetch]
    testConnectionExactFormat -->|calls| fetch
    response_json[response.json]
    testConnectionExactFormat -->|calls| response_json
    this_testParameterAPI[this.testParameterAPI]
    testConnectionExactFormat -->|calls| this_testParameterAPI
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `testParameterAPI` (🌐 Public) {#testParameterAPI}

**Parameters:**

- `quiet`: `boolean`

**Returns:** `Promise<boolean>`

**Calls:**

- `this.apiUrl.endsWith`
- `this.apiUrl.slice`
- `fetch`
- `response.json`
- [[api|api]]#setFallbackEnabled

**Called By:**

- From [[api|api]]:
  - `testConnectionExactFormat`

**Call Graph:**

```mermaid
flowchart LR
    testParameterAPI[testParameterAPI]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    testParameterAPI -->|calls| this_apiUrl_endsWith
    this_apiUrl_slice[this.apiUrl.slice]
    testParameterAPI -->|calls| this_apiUrl_slice
    fetch[fetch]
    testParameterAPI -->|calls| fetch
    response_json[response.json]
    testParameterAPI -->|calls| response_json
    this_setFallbackEnabled[this.setFallbackEnabled]
    testParameterAPI -->|calls| this_setFallbackEnabled
    testConnectionExactFormat[testConnectionExactFormat]
    testConnectionExactFormat -->|calls| testParameterAPI
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `destroy` (🌐 Public) {#destroy}

**Returns:** `void`

**Calls:**

- `clearInterval`

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `disconnectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    destroy[destroy]:::current
    clearInterval[clearInterval]
    destroy -->|calls| clearInterval
    disconnectedCallback[disconnectedCallback]
    disconnectedCallback -->|calls| destroy
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `logApiStats` (🌐 Public) {#logApiStats}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `_runApiDiagnostics`
  - `_resetApiFailures`
- From [[card-controller|card-controller]]:
  - `resetApiFailures`

**Call Graph:**

```mermaid
flowchart LR
    logApiStats[logApiStats]:::current
    this_logger_log[this.logger.log]
    logApiStats -->|calls| this_logger_log
    _runApiDiagnostics[_runApiDiagnostics]
    _runApiDiagnostics -->|calls| logApiStats
    _resetApiFailures[_resetApiFailures]
    _resetApiFailures -->|calls| logApiStats
    resetApiFailures[resetApiFailures]
    resetApiFailures -->|calls| logApiStats
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `updateParameterDirectly` (🌐 Public) {#updateParameterDirectly}

**Parameters:**

- `partId`: `number`
- `parameterId`: `number`
- `value`: `string`

**Returns:** `Promise<boolean>`

**Calls:**

- `this.apiUrl.endsWith`
- `this.apiUrl.slice`
- [[logger|logger]]#log
- `fetch`
- `JSON.stringify`
- [[logger|logger]]#error
- `response.text`

**Call Graph:**

```mermaid
flowchart LR
    updateParameterDirectly[updateParameterDirectly]:::current
    this_apiUrl_endsWith[this.apiUrl.endsWith]
    updateParameterDirectly -->|calls| this_apiUrl_endsWith
    this_apiUrl_slice[this.apiUrl.slice]
    updateParameterDirectly -->|calls| this_apiUrl_slice
    this_logger_log[this.logger.log]
    updateParameterDirectly -->|calls| this_logger_log
    fetch[fetch]
    updateParameterDirectly -->|calls| fetch
    JSON_stringify[JSON.stringify]
    updateParameterDirectly -->|calls| JSON_stringify
    this_logger_error[this.logger.error]
    updateParameterDirectly -->|calls| this_logger_error
    response_text[response.text]
    updateParameterDirectly -->|calls| response_text
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getPerformanceStats` (🌐 Public) {#getPerformanceStats}

**Returns:** `{ 
    apiCalls: number, 
    successes: number, 
    failures: number, 
    fallbackCalls: number, 
    avgCallTime: number 
  }`

**Calls:**

- `Math.round`

**Call Graph:**

```mermaid
flowchart LR
    getPerformanceStats[getPerformanceStats]:::current
    Math_round[Math.round]
    getPerformanceStats -->|calls| Math_round
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getLastKnownParameterValue` (🌐 Public) {#getLastKnownParameterValue}

**Parameters:**

- `partId`: `number`
- `paramName`: `string`

**Returns:** `string`

**Calls:**

- [[cache|cache]]#get

**Call Graph:**

```mermaid
flowchart LR
    getLastKnownParameterValue[getLastKnownParameterValue]:::current
    this__parameterValues_get[this._parameterValues.get]
    getLastKnownParameterValue -->|calls| this__parameterValues_get
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `updateLastKnownParameterValue` (🌐 Public) {#updateLastKnownParameterValue}

**Parameters:**

- `partId`: `number`
- `paramName`: `string`
- `value`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#set

**Call Graph:**

```mermaid
flowchart LR
    updateLastKnownParameterValue[updateLastKnownParameterValue]:::current
    this__parameterValues_set[this._parameterValues.set]
    updateLastKnownParameterValue -->|calls| this__parameterValues_set
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `notifyParameterChanged` (🌐 Public) {#notifyParameterChanged}

**Parameters:**

- `partId`: `number`
- `paramName`: `string`
- `value`: `string`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[logger|logger]]#log
- `this._sentNotifications.add`
- `setTimeout`
- [[cache|cache]]#delete

**Called By:**

- From [[api|api]]:
  - `getParameterValue`
  - `updateParameter`

**Call Graph:**

```mermaid
flowchart LR
    notifyParameterChanged[notifyParameterChanged]:::current
    this__sentNotifications_has[this._sentNotifications.has]
    notifyParameterChanged -->|calls| this__sentNotifications_has
    this_logger_log[this.logger.log]
    notifyParameterChanged -->|calls| this_logger_log
    this__sentNotifications_add[this._sentNotifications.add]
    notifyParameterChanged -->|calls| this__sentNotifications_add
    setTimeout[setTimeout]
    notifyParameterChanged -->|calls| setTimeout
    this__sentNotifications_delete[this._sentNotifications.delete]
    notifyParameterChanged -->|calls| this__sentNotifications_delete
    getParameterValue[getParameterValue]
    getParameterValue -->|calls| notifyParameterChanged
    updateParameter[updateParameter]
    updateParameter -->|calls| notifyParameterChanged
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `isFallbackEnabled` (🌐 Public) {#isFallbackEnabled}

**Returns:** `boolean`

### `resetRateLimiting` (🌐 Public) {#resetRateLimiting}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `_testSpecificParameter`

**Call Graph:**

```mermaid
flowchart LR
    resetRateLimiting[resetRateLimiting]:::current
    this_logger_log[this.logger.log]
    resetRateLimiting -->|calls| this_logger_log
    _testSpecificParameter[_testSpecificParameter]
    _testSpecificParameter -->|calls| resetRateLimiting
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `updateParameter` (🌐 Public) {#updateParameter}

**Parameters:**

- `partId`: `number`
- `paramName`: `string`
- `value`: `string`

**Returns:** `Promise<boolean>`

**Calls:**

- [[logger|logger]]#log
- `Date.now`
- `setTimeout`
- `url.endsWith`
- `headers.append`
- `fetch`
- [[logger|logger]]#error
- `response.json`
- `data.find`
- `templateName.toLowerCase`
- `paramName.toLowerCase`
- [[logger|logger]]#warn
- `JSON.stringify`
- `updateResponse.json`
- [[parameter-service|parameter-service]]#syncApiDataToEntityState
- [[api|api]]#notifyParameterChanged

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `_handleStockAdjustment`
  - `updateParameterWithImmediateRefresh`
- From [[card-controller|card-controller]]:
  - `handleWebSocketMessage`
- From [[parameter-service|parameter-service]]:
  - `updateParameter`
  - `syncApiDataToEntityState`
- From [[websocket-plugin|websocket-plugin]]:
  - `_handleParameterUpdate`

**Call Graph:**

```mermaid
flowchart LR
    updateParameter[updateParameter]:::current
    this_logger_log[this.logger.log]
    updateParameter -->|calls| this_logger_log
    Date_now[Date.now]
    updateParameter -->|calls| Date_now
    setTimeout[setTimeout]
    updateParameter -->|calls| setTimeout
    url_endsWith[url.endsWith]
    updateParameter -->|calls| url_endsWith
    headers_append[headers.append]
    updateParameter -->|calls| headers_append
    fetch[fetch]
    updateParameter -->|calls| fetch
    this_logger_error[this.logger.error]
    updateParameter -->|calls| this_logger_error
    response_json[response.json]
    updateParameter -->|calls| response_json
    data_find[data.find]
    updateParameter -->|calls| data_find
    templateName_toLowerCase[templateName.toLowerCase]
    updateParameter -->|calls| templateName_toLowerCase
    paramName_toLowerCase[paramName.toLowerCase]
    updateParameter -->|calls| paramName_toLowerCase
    this_logger_warn[this.logger.warn]
    updateParameter -->|calls| this_logger_warn
    JSON_stringify[JSON.stringify]
    updateParameter -->|calls| JSON_stringify
    updateResponse_json[updateResponse.json]
    updateParameter -->|calls| updateResponse_json
    this_parameterService_syncApiDataToEntityState[this.parameterService.syncApiDataToEntityState]
    updateParameter -->|calls| this_parameterService_syncApiDataToEntityState
    this_notifyParameterChanged[this.notifyParameterChanged]
    updateParameter -->|calls| this_notifyParameterChanged
    _handleStockAdjustment[_handleStockAdjustment]
    _handleStockAdjustment -->|calls| updateParameter
    updateParameterWithImmediateRefresh[updateParameterWithImmediateRefresh]
    updateParameterWithImmediateRefresh -->|calls| updateParameter
    handleWebSocketMessage[handleWebSocketMessage]
    handleWebSocketMessage -->|calls| updateParameter
    updateParameter[updateParameter]
    updateParameter -->|calls| updateParameter
    syncApiDataToEntityState[syncApiDataToEntityState]
    syncApiDataToEntityState -->|calls| updateParameter
    _handleParameterUpdate[_handleParameterUpdate]
    _handleParameterUpdate -->|calls| updateParameter
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `fetchParameterData` (🌐 Public) {#fetchParameterData}

**Parameters:**

- `partId`: `number`
- `parameterName`: `string`

**Returns:** `Promise<void>`

**Calls:**

- [[logger|logger]]#log
- [[inventree-state|inventree-state]]#getParameterValue
- [[logger|logger]]#error

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `refreshParameterData`
  - `_fetchAllParameters`
- From [[parameter-service|parameter-service]]:
  - `fetchParameterData`

**Call Graph:**

```mermaid
flowchart LR
    fetchParameterData[fetchParameterData]:::current
    this_logger_log[this.logger.log]
    fetchParameterData -->|calls| this_logger_log
    this_getParameterValue[this.getParameterValue]
    fetchParameterData -->|calls| this_getParameterValue
    this_logger_error[this.logger.error]
    fetchParameterData -->|calls| this_logger_error
    refreshParameterData[refreshParameterData]
    refreshParameterData -->|calls| fetchParameterData
    _fetchAllParameters[_fetchAllParameters]
    _fetchAllParameters -->|calls| fetchParameterData
    fetchParameterData[fetchParameterData]
    fetchParameterData -->|calls| fetchParameterData
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `isApiConnected` (🌐 Public) {#isApiConnected}

**Returns:** `boolean`

**Called By:**

- From [[inventree-card|inventree-card]]:
  - `_renderDiagnosticTools`
- From [[card-controller|card-controller]]:
  - `handleWebSocketMessage`
- From [[parameter-service|parameter-service]]:
  - `isApiConnected`
  - `updateParameter`
  - `fetchParameterData`

**Call Graph:**

```mermaid
flowchart LR
    isApiConnected[isApiConnected]:::current
    _renderDiagnosticTools[_renderDiagnosticTools]
    _renderDiagnosticTools -->|calls| isApiConnected
    handleWebSocketMessage[handleWebSocketMessage]
    handleWebSocketMessage -->|calls| isApiConnected
    isApiConnected[isApiConnected]
    isApiConnected -->|calls| isApiConnected
    updateParameter[updateParameter]
    updateParameter -->|calls| isApiConnected
    fetchParameterData[fetchParameterData]
    fetchParameterData -->|calls| isApiConnected
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    api[api.ts]:::current
    logger[logger.ts]
    api -->|imports| logger
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| api
    card_controller[card-controller.ts]
    card_controller -->|imports| api
    parameter_service[parameter-service.ts]
    parameter_service -->|imports| api
    websocket[websocket.ts]
    websocket -->|imports| api
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

