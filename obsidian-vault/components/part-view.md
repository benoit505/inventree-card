---
aliases: [part-view.ts]
tags: [component, components, part]
---

# part-view.ts

**Path:** `components/part/part-view.ts`  
**Line Count:** 272  
**Functions:** 7  

## Overview

This component is part of the `components/part` directory.

## Lifecycle Methods

- `updated`
- `render`

## Component Dependencies

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

## Detailed Documentation

For full implementation details, see the [part-view.ts](../files/part-view.md) file documentation.

