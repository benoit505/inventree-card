---
aliases: [cache.ts]
tags: [service, services]
---

# cache.ts

**Path:** `services/cache.ts`  
**Line Count:** 134  
**Functions:** 8  

## Overview

This service is part of the `services` directory.

## Public Interface

- `getInstance`
- `set`
- `get`
- `has`
- `delete`
- `prune`
- `clear`
- `getStats`

## Service Interface

```mermaid
classDiagram
    class cache {
        +CacheService getInstance()
        +void set(key: string, value: any, ttlMs: number)
        +T | undefined get(key: string)
        +boolean has(key: string)
        +void delete(key: string)
        +void prune()
        +void clear()
        +{ size: number, expired: number } getStats()
    }
```

## Detailed Documentation

For full implementation details, see the [cache.ts](../files/cache.md) file documentation.

