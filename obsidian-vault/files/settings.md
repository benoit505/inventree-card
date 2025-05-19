---
aliases: [settings.ts]
tags: [file, core]
---

# settings.ts

**Path:** `core/settings.ts`  
**Line Count:** 199  
**Functions:** 2  

## Overview

This file is part of the `core` directory.

## Imports

- [[types|types]]: InventreeCardConfig

## Exports

- `SETTINGS_SCHEMA`
- `DEFAULT_CONFIG`
- `validateSetting`
- `getSettingGroup`

## Functions

### `validateSetting` (🌐 Public) {#validateSetting}

**Parameters:**

- `setting`: `string`

**Returns:** `boolean`

**Calls:**

- `Object.values(SETTINGS_SCHEMA).some`
- `Object.values`

**Call Graph:**

```mermaid
flowchart LR
    validateSetting[validateSetting]:::current
    Object_values_SETTINGS_SCHEMA__some[Object.values(SETTINGS_SCHEMA).some]
    validateSetting -->|calls| Object_values_SETTINGS_SCHEMA__some
    Object_values[Object.values]
    validateSetting -->|calls| Object_values
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

### `getSettingGroup` (🌐 Public) {#getSettingGroup}

**Parameters:**

- `setting`: `string`

**Returns:** `string | null`

**Calls:**

- `Object.entries`

**Call Graph:**

```mermaid
flowchart LR
    getSettingGroup[getSettingGroup]:::current
    Object_entries[Object.entries]
    getSettingGroup -->|calls| Object_entries
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

## Dependencies

```mermaid
flowchart TD
    settings[settings.ts]:::current
    types[types.ts]
    settings -->|imports| types
    inventree_card[inventree-card.ts]
    inventree_card -->|imports| settings
    thumbnail[thumbnail.ts]
    thumbnail -->|imports| settings
    classDef current fill:#f96,stroke:#333,stroke-width:2px;
```

