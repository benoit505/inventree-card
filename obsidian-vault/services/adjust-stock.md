---
aliases: [adjust-stock.ts]
tags: [service, services]
---

# adjust-stock.ts

**Path:** `services/adjust-stock.ts`  
**Line Count:** 45  
**Functions:** 2  

## Overview

This service is part of the `services` directory.

## Public Interface

- `adjustStock`
- `getEntityId`

## Service Interface

```mermaid
classDiagram
    class adjust-stock {
        +Promise<void> adjustStock(part: InvenTreePart, amount: number)
        +string | null getEntityId(part: InvenTreePart)
    }
```

## Service Usage

- **[[adjust-stock|adjust-stock]]** uses:
  - `getEntityId`

## Detailed Documentation

For full implementation details, see the [adjust-stock.ts](../files/adjust-stock.md) file documentation.

