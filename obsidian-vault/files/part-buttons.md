---
aliases: [part-buttons.ts]
tags: [file, components, part]
---

# part-buttons.ts

**Path:** `components/part/part-buttons.ts`  
**Line Count:** 351  
**Functions:** 9  

## Overview

This file is part of the `components/part` directory.

## Imports

- lit: LitElement, html, css
- lit/decorators.js: customElement, property, state
- lit: PropertyValues
- custom-card-helpers: HomeAssistant
- [[types|types]]: ButtonConfig, InvenTreePart, InventreeCardConfig
- [[buttons|buttons]]: buttonStyles
- [[adjust-stock|adjust-stock]]: StockService
- [[wled-service|wled-service]]: WLEDService
- [[print-label|print-label]]: PrintService
- [[logger|logger]]: Logger

## Exports

- `InvenTreePartButtons`

## Functions

### Class: InvenTreePartButtons

### `updated` (🌐 Public) {#updated}

**Parameters:**

- `changedProperties`: `PropertyValues`

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#updated
- [[cache|cache]]#has
- [[logger|logger]]#log
- [[grid-layout|grid-layout]]#getButtonConfig

**Called By:**

- From [[base-layout|base-layout]]:
  - `updated`
- From [[detail-layout|detail-layout]]:
  - `updated`
- From [[grid-layout|grid-layout]]:
  - `updated`
- From [[list-layout|list-layout]]:
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
    changedProperties_has[changedProperties.has]
    updated -->|calls| changedProperties_has
    this_logger_log[this.logger.log]
    updated -->|calls| this_logger_log
    this_getButtonConfig[this.getButtonConfig]
    updated -->|calls| this_getButtonConfig
    updated[updated]
    updated -->|calls| updated
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `connectedCallback` (🌐 Public) {#connectedCallback}

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#connectedCallback
- [[grid-layout|grid-layout]]#getButtonConfig

**Called By:**

- From [[base-layout|base-layout]]:
  - `connectedCallback`
- From [[grid-layout|grid-layout]]:
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
    this_getButtonConfig[this.getButtonConfig]
    connectedCallback -->|calls| this_getButtonConfig
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| connectedCallback
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `handleClick` (🌐 Public) {#handleClick}

**Parameters:**

- `button`: `ButtonConfig`

**Returns:** `void`

**Calls:**

- `this.dispatchEvent`
- `clearTimeout`
- `setTimeout`
- [[adjust-stock|adjust-stock]]#adjustStock
- [[wled-service|wled-service]]#locatePart
- [[print-label|print-label]]#printLabel
- `this.hass.callService`
- `button.service.split`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    handleClick[handleClick]:::current
    this_dispatchEvent[this.dispatchEvent]
    handleClick -->|calls| this_dispatchEvent
    clearTimeout[clearTimeout]
    handleClick -->|calls| clearTimeout
    setTimeout[setTimeout]
    handleClick -->|calls| setTimeout
    this_stockService_adjustStock[this.stockService.adjustStock]
    handleClick -->|calls| this_stockService_adjustStock
    this_wledService_locatePart[this.wledService.locatePart]
    handleClick -->|calls| this_wledService_locatePart
    this_printService_printLabel[this.printService.printLabel]
    handleClick -->|calls| this_printService_printLabel
    this_hass_callService[this.hass.callService]
    handleClick -->|calls| this_hass_callService
    button_service_split[button.service.split]
    handleClick -->|calls| button_service_split
    render[render]
    render -->|calls| handleClick
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `isLEDActiveForPart` (🌐 Public) {#isLEDActiveForPart}

**Returns:** `boolean`

**Calls:**

- `part.parameters.find`
- `parseInt`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    isLEDActiveForPart[isLEDActiveForPart]:::current
    part_parameters_find[part.parameters.find]
    isLEDActiveForPart -->|calls| part_parameters_find
    parseInt[parseInt]
    isLEDActiveForPart -->|calls| parseInt
    render[render]
    render -->|calls| isLEDActiveForPart
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `render` (🌐 Public) {#render}

**Returns:** `void`

**Calls:**

- `this.processedButtons.map`
- [[part-buttons|part-buttons]]#isLEDActiveForPart
- [[part-buttons|part-buttons]]#getButtonColor
- [[part-buttons|part-buttons]]#handleClick
- [[part-buttons|part-buttons]]#getButtonTitle
- [[part-buttons|part-buttons]]#getDefaultLabel

**Call Graph:**

```mermaid
flowchart LR
    render[render]:::current
    this_processedButtons_map[this.processedButtons.map]
    render -->|calls| this_processedButtons_map
    this_isLEDActiveForPart[this.isLEDActiveForPart]
    render -->|calls| this_isLEDActiveForPart
    this_getButtonColor[this.getButtonColor]
    render -->|calls| this_getButtonColor
    this_handleClick[this.handleClick]
    render -->|calls| this_handleClick
    this_getButtonTitle[this.getButtonTitle]
    render -->|calls| this_getButtonTitle
    this_getDefaultLabel[this.getDefaultLabel]
    render -->|calls| this_getDefaultLabel
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getButtonColor` (🌐 Public) {#getButtonColor}

**Parameters:**

- `type`: `string`
- `isActive`: `boolean`

**Returns:** `string`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getButtonColor[getButtonColor]:::current
    render[render]
    render -->|calls| getButtonColor
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getButtonTitle` (🌐 Public) {#getButtonTitle}

**Parameters:**

- `button`: `ButtonConfig`

**Returns:** `string`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getButtonTitle[getButtonTitle]:::current
    render[render]
    render -->|calls| getButtonTitle
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getDefaultLabel` (🌐 Public) {#getDefaultLabel}

**Parameters:**

- `button`: `ButtonConfig`

**Returns:** `string`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    getDefaultLabel[getDefaultLabel]:::current
    render[render]
    render -->|calls| getDefaultLabel
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getButtonConfig` (🌐 Public) {#getButtonConfig}

**Returns:** `void`

**Calls:**

- `buttons.push`

**Called By:**

- From [[part-buttons|part-buttons]]:
  - `updated`
  - `connectedCallback`

**Call Graph:**

```mermaid
flowchart LR
    getButtonConfig[getButtonConfig]:::current
    buttons_push[buttons.push]
    getButtonConfig -->|calls| buttons_push
    updated[updated]
    updated -->|calls| getButtonConfig
    connectedCallback[connectedCallback]
    connectedCallback -->|calls| getButtonConfig
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    part-buttons[part-buttons.ts]:::current
    types[types.ts]
    part-buttons -->|imports| types
    buttons[buttons.ts]
    part-buttons -->|imports| buttons
    adjust_stock[adjust-stock.ts]
    part-buttons -->|imports| adjust_stock
    wled_service[wled-service.ts]
    part-buttons -->|imports| wled_service
    print_label[print-label.ts]
    part-buttons -->|imports| print_label
    logger[logger.ts]
    part-buttons -->|imports| logger
    index[index.ts]
    index -->|imports| part-buttons
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| part-buttons
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

