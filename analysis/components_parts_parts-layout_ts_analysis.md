# File Analysis: components/parts/parts-layout.ts

## Overview

- **Line Count:** 308
- **Function Count:** 13
- **Imports:** 9 modules
  - From `lit`: html
  - From `lit/decorators.js`: customElement, property, state
  - From `custom-card-helpers`: HomeAssistant
  - From `../../core/types`: InventreeCardConfig, InventreeItem, FilterConfig
  - From `../../styles/layouts/parts-layout`: partsStyles
  - From `../../core/inventree-state`: InventTreeState
  - From `../../services/parameter-service`: ParameterService, VisualModifiers
  - From `../../utils/logger`: Logger
  - From `../common/base-layout`: BaseLayout
- **Exports:** 0 items

## Functions Defined (13)

| Line | Function | Type | Privacy | Parameters | Return Type | Length |
|------|----------|------|---------|------------|-------------|--------|
| 22 | `updated` | method | public | changedProps: Map<string, unknown> | void | 380 |
| 35 | `loadPartsFromEntities` | method | public | none | void | 1031 |
| 65 | `_updateVisualModifiers` | method | private | none | void | 1135 |
| 96 | `applyFilters` | method | public | none | void | 932 |
| 127 | `matchesFilter` | method | public | part: InventreeItem, filter: FilterConfig | boolean | 749 |
| 147 | `matchesParameterFilter` | method | public | part: InventreeItem, filter: FilterConfig | boolean | 909 |
| 172 | `_compareFilterValues` | method | private | value: any, filterValue: string, operator: string | boolean | 788 |
| 193 | `_getContainerStyle` | method | private | partId: number | void | 494 |
| 212 | `_getTextStyle` | method | private | partId: number | void | 256 |
| 221 | `_handleImageError` | method | private | e: Event | void | 162 |
| 226 | `render` | method | public | none | void | 522 |
| 244 | `_renderGridView` | method | private | none | void | 1482 |
| 276 | `_renderListView` | method | private | none | void | 1448 |

## Outgoing Calls (31 unique functions)

### From `updated`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `updated` | 1 | 22 |
| `has` | 3 | 25, 25, 30 |
| `_updateVisualModifiers` | 1 | 25 |
| `applyFilters` | 1 | 26 |
| `loadPartsFromEntities` | 1 | 30 |

### From `loadPartsFromEntities`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `getInstance` | 1 | 41 |
| `getNewestData` | 1 | 46 |
| `registerEntityOfInterest` | 1 | 47 |
| `log` | 1 | 50 |
| `applyFilters` | 1 | 56 |
| `_updateVisualModifiers` | 1 | 59 |

### From `_updateVisualModifiers`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `forEach` | 1 | 70 |
| `set` | 2 | 73, 84 |
| `processConditions` | 1 | 76 |
| `getInstance` | 1 | 84 |
| `getActionButtons` | 1 | 86 |

### From `applyFilters`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `filter` | 1 | 109 |
| `matchesFilter` | 1 | 116 |

### From `matchesFilter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `includes` | 1 | 133 |
| `matchesParameterFilter` | 1 | 134 |
| `_compareFilterValues` | 1 | 144 |

### From `matchesParameterFilter`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `split` | 1 | 152 |
| `getParameterValueFromPart` | 1 | 161 |
| `_compareFilterValues` | 1 | 169 |

### From `_compareFilterValues`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `toLowerCase` | 2 | 174, 175 |
| `String` | 1 | 174 |
| `parseFloat` | 4 | 183, 183, 185, 185 |
| `includes` | 1 | 187 |

### From `_getContainerStyle`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 194 |
| `push` | 2 | 201, 205 |
| `join` | 1 | 209 |

### From `_getTextStyle`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `get` | 1 | 213 |

### From `render`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `_renderListView` | 1 | 237 |
| `_renderGridView` | 1 | 239 |

### From `_renderGridView`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 247 |
| `_getContainerStyle` | 1 | 248 |
| `_getTextStyle` | 1 | 250 |

### From `_renderListView`

| Called Function | Call Count | Line Numbers |
|----------------|------------|-------------|
| `map` | 1 | 279 |
| `_getContainerStyle` | 1 | 280 |
| `_getTextStyle` | 1 | 292 |


## Incoming Calls (56 calls from other files)

### To `updated`

| Caller | File | Line |
|--------|------|------|
| `updated` | components/common/base-layout.ts | 641 |
| `updated` | components/detail/detail-layout.ts | 34 |
| `updated` | components/grid/grid-layout.ts | 649 |
| `updated` | components/list/list-layout.ts | 20 |
| `updated` | components/part/part-buttons.ts | 45 |
| `updated` | components/part/part-container.ts | 140 |
| `updated` | components/part/part-view.ts | 26 |
| `updated` | components/variant/variant-layout.ts | 408 |
| `updated` | inventree-card.ts | 332 |

### To `_updateVisualModifiers`

| Caller | File | Line |
|--------|------|------|
| `updated` | components/common/base-layout.ts | 655 |
| `firstUpdated` | components/detail/detail-layout.ts | 30 |
| `updated` | components/detail/detail-layout.ts | 38 |
| `updated` | components/grid/grid-layout.ts | 690 |
| `updated` | components/grid/grid-layout.ts | 700 |
| `updated` | components/list/list-layout.ts | 24 |
| `_setupEntityListener` | components/variant/variant-layout.ts | 103 |
| `_setupIdleRenderTimer` | components/variant/variant-layout.ts | 192 |
| `_handleWebSocketMessage` | components/variant/variant-layout.ts | 261 |
| `_handleParameterChange` | components/variant/variant-layout.ts | 402 |
| `updated` | components/variant/variant-layout.ts | 412 |
| `updated` | components/variant/variant-layout.ts | 418 |
| `updated` | components/variant/variant-layout.ts | 423 |

### To `_getContainerStyle`

| Caller | File | Line |
|--------|------|------|
| `render` | components/detail/detail-layout.ts | 135 |
| `render` | components/grid/grid-layout.ts | 923 |
| `_renderPartWithSize` | components/list/list-layout.ts | 132 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 608 |
| `_renderTabsView` | components/variant/variant-layout.ts | 664 |
| `_renderListView` | components/variant/variant-layout.ts | 714 |
| `_renderTreeView` | components/variant/variant-layout.ts | 788 |
| `_renderGridView` | components/variant/variant-layout.ts | 855 |

### To `_getTextStyle`

| Caller | File | Line |
|--------|------|------|
| `render` | components/detail/detail-layout.ts | 139 |
| `render` | components/grid/grid-layout.ts | 941 |
| `render` | components/grid/grid-layout.ts | 945 |
| `render` | components/grid/grid-layout.ts | 951 |
| `render` | components/grid/grid-layout.ts | 957 |
| `render` | components/grid/grid-layout.ts | 967 |
| `render` | components/grid/grid-layout.ts | 968 |
| `_renderPartWithSize` | components/list/list-layout.ts | 150 |
| `_renderPartWithSize` | components/list/list-layout.ts | 154 |
| `_renderPartWithSize` | components/list/list-layout.ts | 160 |
| `_renderPartWithSize` | components/list/list-layout.ts | 166 |
| `_renderPartWithSize` | components/list/list-layout.ts | 176 |
| `_renderPartWithSize` | components/list/list-layout.ts | 177 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 612 |
| `_renderDropdownView` | components/variant/variant-layout.ts | 613 |
| `_renderTabsView` | components/variant/variant-layout.ts | 668 |
| `_renderTabsView` | components/variant/variant-layout.ts | 669 |
| `_renderListView` | components/variant/variant-layout.ts | 719 |
| `_renderListView` | components/variant/variant-layout.ts | 720 |
| `_renderTreeView` | components/variant/variant-layout.ts | 793 |
| `_renderTreeView` | components/variant/variant-layout.ts | 794 |
| `_renderGridView` | components/variant/variant-layout.ts | 860 |
| `_renderGridView` | components/variant/variant-layout.ts | 874 |
| `_renderGridView` | components/variant/variant-layout.ts | 879 |

### To `_renderListView`

| Caller | File | Line |
|--------|------|------|
| `_renderVariantGroups` | components/variant/variant-layout.ts | 572 |

### To `_renderGridView`

| Caller | File | Line |
|--------|------|------|
| `_renderVariantGroups` | components/variant/variant-layout.ts | 576 |


## File Dependencies

### Direct Dependencies (6)

- ../../core/types
- ../../styles/layouts/parts-layout
- ../../core/inventree-state
- ../../services/parameter-service
- ../../utils/logger
- ../common/base-layout

### Inverse Dependencies (0)

No files depend on this file.

## Function Complexity Analysis

| Rank | Function | Length | Call Count | Parameter Count |
|------|----------|--------|------------|----------------|
| 1 | `_renderGridView` | 1482 | 2 | 0 |
| 2 | `_renderListView` | 1448 | 2 | 0 |
| 3 | `_updateVisualModifiers` | 1135 | 15 | 0 |
| 4 | `loadPartsFromEntities` | 1031 | 1 | 0 |
| 5 | `applyFilters` | 932 | 2 | 0 |
| 6 | `matchesParameterFilter` | 909 | 1 | 2 |
| 7 | `_compareFilterValues` | 788 | 2 | 3 |
| 8 | `matchesFilter` | 749 | 1 | 2 |
| 9 | `render` | 522 | 0 | 0 |
| 10 | `_getContainerStyle` | 494 | 10 | 1 |
| 11 | `updated` | 380 | 10 | 1 |
| 12 | `_getTextStyle` | 256 | 26 | 1 |
| 13 | `_handleImageError` | 162 | 0 | 1 |
