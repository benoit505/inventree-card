---
aliases: [thumbnail.ts]
tags: [file, services]
---

# thumbnail.ts

**Path:** `services/thumbnail.ts`  
**Line Count:** 33  
**Functions:** 1  

## Overview

This file is part of the `services` directory.

## Imports

- [[types|types]]: InventreeItem, InventreeCardConfig
- [[settings|settings]]: DEFAULT_CONFIG

## Exports

- `ThumbnailService`

## Functions

### Class: ThumbnailService

### `getThumbnailPath` (🌐 Public) {#getThumbnailPath}

**Parameters:**

- `item`: `InventreeItem`
- `config`: `InventreeCardConfig`

**Returns:** `string`

## Dependencies

```mermaid
flowchart TD
    thumbnail[thumbnail.ts]:::current
    types[types.ts]
    thumbnail -->|imports| types
    settings[settings.ts]
    thumbnail -->|imports| settings
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

