---
aliases: [part-buttons.ts]
tags: [component, components, part]
---

# part-buttons.ts

**Path:** `components/part/part-buttons.ts`  
**Line Count:** 351  
**Functions:** 9  

## Overview

This component is part of the `components/part` directory.

## Lifecycle Methods

- `updated`
- `connectedCallback`
- `render`

## Event Handlers

- `handleClick`

## Component Dependencies

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

## Detailed Documentation

For full implementation details, see the [part-buttons.ts](../files/part-buttons.md) file documentation.

