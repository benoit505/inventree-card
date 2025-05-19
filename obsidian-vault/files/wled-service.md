---
aliases: [wled-service.ts]
tags: [file, services]
---

# wled-service.ts

**Path:** `services/wled-service.ts`  
**Line Count:** 102  
**Functions:** 2  

## Overview

This file is part of the `services` directory.

## Imports

- custom-card-helpers: HomeAssistant, forwardHaptic
- [[types|types]]: InvenTreePart, WLEDConfig

## Exports

- `WLEDService`

## Functions

### Class: WLEDService

### `toggleLED` (🌐 Public) {#toggleLED}

**Parameters:**

- `entityId`: `string`

**Returns:** `Promise<void>`

**Calls:**

- `forwardHaptic`
- `this.hass.callService`

**Call Graph:**

```mermaid
flowchart LR
    toggleLED[toggleLED]:::current
    forwardHaptic[forwardHaptic]
    toggleLED -->|calls| forwardHaptic
    this_hass_callService[this.hass.callService]
    toggleLED -->|calls| this_hass_callService
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `locatePart` (🌐 Public) {#locatePart}

**Parameters:**

- `part`: `InvenTreePart`
- `config`: `WLEDConfig`

**Returns:** `Promise<void>`

**Calls:**

- `forwardHaptic`
- `part.parameters.find`
- `parseInt`
- `config.ip_address.replace`
- `this.hass.callService`
- `JSON.stringify`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `handleClick`
- From [[part-view|part-view]]:
  - `_locateInWLED`
- From [[inventree-card|inventree-card]]:
  - `handleLocateClick`

**Call Graph:**

```mermaid
flowchart LR
    locatePart[locatePart]:::current
    forwardHaptic[forwardHaptic]
    locatePart -->|calls| forwardHaptic
    part_parameters_find[part.parameters.find]
    locatePart -->|calls| part_parameters_find
    parseInt[parseInt]
    locatePart -->|calls| parseInt
    config_ip_address_replace[config.ip_address.replace]
    locatePart -->|calls| config_ip_address_replace
    this_hass_callService[this.hass.callService]
    locatePart -->|calls| this_hass_callService
    JSON_stringify[JSON.stringify]
    locatePart -->|calls| JSON_stringify
    handleClick[handleClick]
    handleClick -->|calls| locatePart
    _locateInWLED[_locateInWLED]
    _locateInWLED -->|calls| locatePart
    handleLocateClick[handleLocateClick]
    handleLocateClick -->|calls| locatePart
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    wled-service[wled-service.ts]:::current
    types[types.ts]
    wled-service -->|imports| types
    part_buttons[part-buttons.ts]
    part_buttons -->|imports| wled-service
    part_view[part-view.ts]
    part_view -->|imports| wled-service
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| wled-service
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

