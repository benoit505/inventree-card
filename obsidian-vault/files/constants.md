---
aliases: [constants.ts]
tags: [file, core]
---

# constants.ts

**Path:** `core/constants.ts`  
**Line Count:** 7  
**Functions:** 0  

## Overview

This file is part of the `core` directory.

## Exports

- `CARD_VERSION`
- `CARD_NAME`
- `CARD_TYPE`
- `EDITOR_NAME`
- `SETTINGS_SCHEMA`

## Dependencies

```mermaid
flowchart TD
    constants[constants.ts]:::current
    editor[editor.ts]
    editor -->|imports| constants
    index[index.ts]
    index -->|imports| constants
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| constants
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

