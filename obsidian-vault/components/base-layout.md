---
aliases: [base-layout.ts]
tags: [component, components, common]
---

# base-layout.ts

**Path:** `components/common/base-layout.ts`  
**Line Count:** 849  
**Functions:** 17  

## Overview

This component is part of the `components/common` directory.

## Lifecycle Methods

- `connectedCallback`
- `disconnectedCallback`
- `updated`

## Event Handlers

- `addListener`
- `addListener`

## Component Dependencies

```mermaid
flowchart TD
    base-layout[base-layout.ts]:::current
    types[types.ts]
    base-layout -->|imports| types
    inventree_state[inventree-state.ts]
    base-layout -->|imports| inventree_state
    parameter_service[parameter-service.ts]
    base-layout -->|imports| parameter_service
    rendering_service[rendering-service.ts]
    base-layout -->|imports| rendering_service
    card_controller[card-controller.ts]
    base-layout -->|imports| card_controller
    logger[logger.ts]
    base-layout -->|imports| logger
    cache[cache.ts]
    base-layout -->|imports| cache
    detail_layout[detail-layout.ts]
    detail_layout -->|imports| base-layout
    list_layout[list-layout.ts]
    list_layout -->|imports| base-layout
    parts_layout[parts-layout.ts]
    parts_layout -->|imports| base-layout
    variant_layout[variant-layout.ts]
    variant_layout -->|imports| base-layout
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Detailed Documentation

For full implementation details, see the [base-layout.ts](../files/base-layout.md) file documentation.

