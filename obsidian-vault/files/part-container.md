---
aliases: [part-container.ts]
tags: [file, components, part]
---

# part-container.ts

**Path:** `components/part/part-container.ts`  
**Line Count:** 238  
**Functions:** 3  

## Overview

This file is part of the `components/part` directory.

## Imports

- lit: LitElement, html, css
- lit/decorators.js: customElement, property
- lit: PropertyValues
- custom-card-helpers: HomeAssistant
- [[types|types]]: InventreeCardConfig, ViewType, InventreeItem

## Exports

- `InvenTreePartContainer`

## Functions

### Class: InvenTreePartContainer

### `updated` (🌐 Public) {#updated}

**Parameters:**

- `changedProperties`: `PropertyValues`

**Returns:** `void`

**Calls:**

- [[base-layout|base-layout]]#updated
- [[cache|cache]]#has
- [[cache|cache]]#get
- `parseInt`
- [[base-layout|base-layout]]#requestUpdate

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
    changedProperties_get[changedProperties.get]
    updated -->|calls| changedProperties_get
    parseInt[parseInt]
    updated -->|calls| parseInt
    this_requestUpdate[this.requestUpdate]
    updated -->|calls| this_requestUpdate
    updated[updated]
    updated -->|calls| updated
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `render` (🌐 Public) {#render}

**Returns:** `void`

### `_handleImageError` (🔒 Private) {#_handleImageError}

**Parameters:**

- `e`: `Event`

**Returns:** `void`

## Dependencies

```mermaid
flowchart TD
    part-container[part-container.ts]:::current
    types[types.ts]
    part-container -->|imports| types
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| part-container
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

