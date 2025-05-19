---
aliases: [Codebase Documentation]
tags: [index, overview]
---

# Codebase Documentation

Welcome to the codebase documentation. This Obsidian vault contains comprehensive documentation of the codebase structure, functions, and dependencies.

## Overview

- **Total Files:** 50
- **Total Functions:** 479
- **Total Function Calls:** 2108

## Navigation

- [Files](files/index.md) - Documentation for all source files
- [Services](services/index.md) - Service layer documentation
- [Components](components/index.md) - UI components and layouts
- [Pipelines](pipelines/index.md) - Data and control flow pipelines

## Directory Structure

```mermaid
flowchart TD
    components[components/]
    core[core/]
    editors[editors/]
    .[./]
    services[services/]
    styles[styles/]
    utils[utils/]
    components_common[common/]
    components --> components_common
    components_detail[detail/]
    components --> components_detail
    components_grid[grid/]
    components --> components_grid
    components_list[list/]
    components --> components_list
    components_part[part/]
    components --> components_part
    components_parts[parts/]
    components --> components_parts
    components_variant[variant/]
    components --> components_variant
    styles_components[components/]
    styles --> styles_components
    styles_layouts[layouts/]
    styles --> styles_layouts
```

## Project Statistics

### Files by Directory

```mermaid
pie
    "services" : 15
    "components/part" : 6
    "styles" : 5
    "styles/layouts" : 5
    "core" : 4
    "styles/components" : 3
    "components/common" : 2
    "." : 2
```

### Top 10 Files by Function Count

```mermaid
bar
    title Top 10 Files by Function Count
    x-axis [Files]
    y-axis [Function Count]
    "parameter-service.ts" : 45
    "editor.ts" : 39
    "inventree-card.ts" : 38
    "inventree-state.ts" : 34
    "variant-layout.ts" : 32
    "grid-layout.ts" : 27
    "rendering-service.ts" : 26
    "logger.ts" : 25
    "api.ts" : 24
    "websocket.ts" : 20
```

