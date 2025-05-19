---
aliases: [part-variant.ts]
tags: [file, components, part]
---

# part-variant.ts

**Path:** `components/part/part-variant.ts`  
**Line Count:** 227  
**Functions:** 6  

## Overview

This file is part of the `components/part` directory.

## Imports

- lit: LitElement, html
- lit/decorators.js: customElement, property
- custom-card-helpers: HomeAssistant
- [[types|types]]: InventreeCardConfig, ProcessedVariant, InventreeItem
- [[variants|variants]]: variantStyles
- [[logger|logger]]: Logger
- [[variant-handler|variant-handler]]: VariantHandler

## Exports

- `InvenTreePartVariant`

## Functions

### Class: InvenTreePartVariant

### `updated` (🌐 Public) {#updated}

**Parameters:**

- `changedProperties`: `Map<string, any>`

**Returns:** `void`

**Calls:**

- [[cache|cache]]#has
- [[logger|logger]]#log
- [[part-variant|part-variant]]#logVariantDetails

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
    changedProperties_has[changedProperties.has]
    updated -->|calls| changedProperties_has
    this_logger_log[this.logger.log]
    updated -->|calls| this_logger_log
    this_logVariantDetails[this.logVariantDetails]
    updated -->|calls| this_logVariantDetails
    updated[updated]
    updated -->|calls| updated
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `logVariantDetails` (🌐 Public) {#logVariantDetails}

**Returns:** `void`

**Calls:**

- [[logger|logger]]#log
- [[variant-handler|variant-handler]]#isVariant
- [[logger|logger]]#error
- `this.variant.variants.forEach`

**Called By:**

- From [[part-variant|part-variant]]:
  - `updated`

**Call Graph:**

```mermaid
flowchart LR
    logVariantDetails[logVariantDetails]:::current
    this_logger_log[this.logger.log]
    logVariantDetails -->|calls| this_logger_log
    VariantHandler_isVariant[VariantHandler.isVariant]
    logVariantDetails -->|calls| VariantHandler_isVariant
    this_logger_error[this.logger.error]
    logVariantDetails -->|calls| this_logger_error
    this_variant_variants_forEach[this.variant.variants.forEach]
    logVariantDetails -->|calls| this_variant_variants_forEach
    updated[updated]
    updated -->|calls| logVariantDetails
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `render` (🌐 Public) {#render}

**Returns:** `void`

**Calls:**

- [[variant-handler|variant-handler]]#isVariant
- [[logger|logger]]#error
- [[logger|logger]]#log
- `this.setAttribute`
- [[part-variant|part-variant]]#renderListView
- [[part-variant|part-variant]]#renderTreeView
- [[part-variant|part-variant]]#renderGridView

**Call Graph:**

```mermaid
flowchart LR
    render[render]:::current
    VariantHandler_isVariant[VariantHandler.isVariant]
    render -->|calls| VariantHandler_isVariant
    this_logger_error[this.logger.error]
    render -->|calls| this_logger_error
    this_logger_log[this.logger.log]
    render -->|calls| this_logger_log
    this_setAttribute[this.setAttribute]
    render -->|calls| this_setAttribute
    this_renderListView[this.renderListView]
    render -->|calls| this_renderListView
    this_renderTreeView[this.renderTreeView]
    render -->|calls| this_renderTreeView
    this_renderGridView[this.renderGridView]
    render -->|calls| this_renderGridView
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `renderGridView` (🌐 Public) {#renderGridView}

**Returns:** `void`

**Calls:**

- `this.variant.variants.map`

**Called By:**

- From [[part-variant|part-variant]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    renderGridView[renderGridView]:::current
    this_variant_variants_map[this.variant.variants.map]
    renderGridView -->|calls| this_variant_variants_map
    render[render]
    render -->|calls| renderGridView
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `renderListView` (🌐 Public) {#renderListView}

**Returns:** `void`

**Calls:**

- `this.variant.variants.map`

**Called By:**

- From [[part-variant|part-variant]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    renderListView[renderListView]:::current
    this_variant_variants_map[this.variant.variants.map]
    renderListView -->|calls| this_variant_variants_map
    render[render]
    render -->|calls| renderListView
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `renderTreeView` (🌐 Public) {#renderTreeView}

**Returns:** `void`

**Calls:**

- `this.variant.variants.map`

**Called By:**

- From [[part-variant|part-variant]]:
  - `render`

**Call Graph:**

```mermaid
flowchart LR
    renderTreeView[renderTreeView]:::current
    this_variant_variants_map[this.variant.variants.map]
    renderTreeView -->|calls| this_variant_variants_map
    render[render]
    render -->|calls| renderTreeView
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    part-variant[part-variant.ts]:::current
    types[types.ts]
    part-variant -->|imports| types
    variants[variants.ts]
    part-variant -->|imports| variants
    logger[logger.ts]
    part-variant -->|imports| logger
    variant_handler[variant-handler.ts]
    part-variant -->|imports| variant_handler
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| part-variant
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

