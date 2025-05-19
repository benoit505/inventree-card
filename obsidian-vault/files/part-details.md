---
aliases: [part-details.ts]
tags: [file, components, part]
---

# part-details.ts

**Path:** `components/part/part-details.ts`  
**Line Count:** 96  
**Functions:** 1  

## Overview

This file is part of the `components/part` directory.

## Imports

- lit: LitElement, html, css
- lit/decorators.js: customElement, property
- [[types|types]]: InventreeItem, InventreeCardConfig

## Exports

- `InvenTreePartDetails`

## Functions

### Class: InvenTreePartDetails

### `render` (🌐 Public) {#render}

**Returns:** `void`

**Calls:**

- `this.partData.parameters.map`

**Call Graph:**

```mermaid
flowchart LR
    render[render]:::current
    this_partData_parameters_map[this.partData.parameters.map]
    render -->|calls| this_partData_parameters_map
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    part-details[part-details.ts]:::current
    types[types.ts]
    part-details -->|imports| types
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| part-details
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

