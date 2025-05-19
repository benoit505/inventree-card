---
aliases: [print-label.ts]
tags: [file, services]
---

# print-label.ts

**Path:** `services/print-label.ts`  
**Line Count:** 48  
**Functions:** 1  

## Overview

This file is part of the `services` directory.

## Imports

- custom-card-helpers: HomeAssistant, forwardHaptic
- [[types|types]]: InvenTreePart, PrintConfig

## Exports

- `PrintService`

## Functions

### Class: PrintService

### `printLabel` (🌐 Public) {#printLabel}

**Parameters:**

- `part`: `InvenTreePart | number`
- `config`: `PrintConfig`

**Returns:** `Promise<void>`

**Calls:**

- `Number`
- `this.hass.callService`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `handleClick`
- From [[part-view|part-view]]:
  - `_printLabel`
- From [[inventree-card|inventree-card]]:
  - `_handlePrintLabel`

**Call Graph:**

```mermaid
flowchart LR
    printLabel[printLabel]:::current
    Number[Number]
    printLabel -->|calls| Number
    this_hass_callService[this.hass.callService]
    printLabel -->|calls| this_hass_callService
    handleClick[handleClick]
    handleClick -->|calls| printLabel
    _printLabel[_printLabel]
    _printLabel -->|calls| printLabel
    _handlePrintLabel[_handlePrintLabel]
    _handlePrintLabel -->|calls| printLabel
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    print-label[print-label.ts]:::current
    types[types.ts]
    print-label -->|imports| types
    part_buttons[part-buttons.ts]
    part_buttons -->|imports| print-label
    part_view[part-view.ts]
    part_view -->|imports| print-label
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| print-label
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

