---
aliases: [helpers.ts]
tags: [file, utils]
---

# helpers.ts

**Path:** `utils/helpers.ts`  
**Line Count:** 99  
**Functions:** 2  

## Overview

This file is part of the `utils` directory.

## Imports

- custom-card-helpers: HomeAssistant
- [[types|types]]: InventreeItem

## Exports

- `parseState`
- `shouldUpdate`

## Functions

### `parseState` (🌐 Public) {#parseState}

**Parameters:**

- `hass`: `HomeAssistant`
- `entityId`: `string`

**Returns:** `InventreeItem[]`

**Calls:**

- `state.state.startsWith`
- `JSON.parse`
- `Array.isArray`
- `Number`

**Call Graph:**

```mermaid
flowchart LR
    parseState[parseState]:::current
    state_state_startsWith[state.state.startsWith]
    parseState -->|calls| state_state_startsWith
    JSON_parse[JSON.parse]
    parseState -->|calls| JSON_parse
    Array_isArray[Array.isArray]
    parseState -->|calls| Array_isArray
    Number[Number]
    parseState -->|calls| Number
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `shouldUpdate` (🌐 Public) {#shouldUpdate}

**Parameters:**

- `newHass`: `HomeAssistant`
- `oldHass`: `HomeAssistant`
- `entityId`: `string`

**Returns:** `boolean`

## Dependencies

```mermaid
flowchart TD
    helpers[helpers.ts]:::current
    types[types.ts]
    helpers -->|imports| types
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

