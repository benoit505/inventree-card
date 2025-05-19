---
aliases: [part-view.ts]
tags: [file, components, part]
---

# part-view.ts

**Path:** `components/part/part-view.ts`  
**Line Count:** 272  
**Functions:** 7  

## Overview

This file is part of the `components/part` directory.

## Imports

- lit: LitElement, html, css
- lit/decorators.js: customElement, property
- custom-card-helpers: HomeAssistant
- [[types|types]]: InventreeItem, InventreeCardConfig
- [[wled-service|wled-service]]: WLEDService
- [[print-label|print-label]]: PrintService
- [[adjust-stock|adjust-stock]]: StockService
- [[logger|logger]]: Logger

## Exports

- `InvenTreePartView`

## Functions

### Class: InvenTreePartView

### `updated` (🌐 Public) {#updated}

**Parameters:**

- `changedProps`: `Map<string, unknown>`

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#updated
- [[cache|cache]]#has
- [[logger|logger]]#log

**Called By:**

- From [[base-layout|base-layout]]:
  - `updated`
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
    changedProps_has[changedProps.has]
    updated -->|calls| changedProps_has
    this_logger_log[this.logger.log]
    updated -->|calls| this_logger_log
    updated[updated]
    updated -->|calls| updated
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `render` (🌐 Public) {#render}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[part-view|part-view]]#getStockStatus
- [[part-view|part-view]]#getStockColor
- [[part-view|part-view]]#_adjustStock

**Call Graph:**

```mermaid
flowchart LR
    render[render]:::current
    this_logger_log[this.logger.log]
    render -->|calls| this_logger_log
    this_getStockStatus[this.getStockStatus]
    render -->|calls| this_getStockStatus
    this_getStockColor[this.getStockColor]
    render -->|calls| this_getStockColor
    this__adjustStock[this._adjustStock]
    render -->|calls| this__adjustStock
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_adjustStock` (🔒 Private) {#_adjustStock}

**Parameters:**

- `amount`: `number`

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[adjust-stock|adjust-stock]]#adjustStock

**Called By:**

- From [[part-view|part-view]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    _adjustStock[_adjustStock]:::current
    this_logger_log[this.logger.log]
    _adjustStock -->|calls| this_logger_log
    this_stockService_adjustStock[this.stockService.adjustStock]
    _adjustStock -->|calls| this_stockService_adjustStock
    render[render]
    render -->|calls| _adjustStock
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_locateInWLED` (🔒 Private) {#_locateInWLED}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[wled-service|wled-service]]#locatePart

**Call Graph:**

```mermaid
flowchart LR
    _locateInWLED[_locateInWLED]:::current
    this_logger_log[this.logger.log]
    _locateInWLED -->|calls| this_logger_log
    this_wledService_locatePart[this.wledService.locatePart]
    _locateInWLED -->|calls| this_wledService_locatePart
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `_printLabel` (🔒 Private) {#_printLabel}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[print-label|print-label]]#printLabel

**Call Graph:**

```mermaid
flowchart LR
    _printLabel[_printLabel]:::current
    this_logger_log[this.logger.log]
    _printLabel -->|calls| this_logger_log
    this_printService_printLabel[this.printService.printLabel]
    _printLabel -->|calls| this_printService_printLabel
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getStockStatus` (🌐 Public) {#getStockStatus}

**Returns:** `'none' | 'low' | 'good'`

**Called By:**

- From [[part-view|part-view]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getStockStatus[getStockStatus]:::current
    render[render]
    render -->|calls| getStockStatus
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getStockColor` (🌐 Public) {#getStockColor}

**Parameters:**

- `status`: `'none' | 'low' | 'good'`

**Returns:** `string`

**Called By:**

- From [[part-view|part-view]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getStockColor[getStockColor]:::current
    render[render]
    render -->|calls| getStockColor
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    part-view[part-view.ts]:::current
    types[types.ts]
    part-view -->|imports| types
    wled_service[wled-service.ts]
    part-view -->|imports| wled_service
    print_label[print-label.ts]
    part-view -->|imports| print_label
    adjust_stock[adjust-stock.ts]
    part-view -->|imports| adjust_stock
    logger[logger.ts]
    part-view -->|imports| logger
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| part-view
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

