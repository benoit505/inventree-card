# InvenTree Card Debug View

This document explains how to use the Data Flow Debug view to diagnose filtering issues in your InvenTree Card.

## What is the Data Flow Debug View?

The Data Flow Debug view is a specialized component that visualizes the complete data flow and filtering pipeline in the InvenTree Card. It helps you understand:

- How data is flowing through your card
- Which data sources are active
- How filtering conditions are being evaluated
- What parameters are available
- Cache statistics and WebSocket status

## Using the Debug View

### 1. Add to your card configuration

The simplest way to use the debug view is to set it as your view type in the card configuration:

```yaml
type: custom:inventree-card
entity: sensor.inventree_parts
view_type: debug
title: InvenTree Debug View
```

Alternatively, you can set up a dedicated debug card:

```yaml
type: custom:inventree-card
entity: sensor.inventree_parts
view_type: custom
title: InvenTree Debug View
custom_view: 
  tag: inventree-data-flow-debug
  properties:
    entity: sensor.inventree_parts
```

### 2. Using the Debug Interface

The debug view provides several sections:

- **Filter Conditions**: Shows the configured show/hide conditions
- **Data Flow Diagram**: Visualizes how data flows through different sources
- **WebSocket Diagnostics**: Shows WebSocket connection status
- **Filter Trace**: Logs each step of the filtering process
- **Cache Statistics**: Shows what's in the various caches

You can toggle sections on/off using the buttons at the top of the view.

### 3. Troubleshooting Common Issues

#### No Filtering Applied

If filtering isn't working:

1. Check the "Filter Conditions" section to ensure your conditions are properly configured
2. Look at the "Filter Trace" to see if conditions are being evaluated as expected
3. Check the "Data Flow Diagram" to confirm your data source is active

#### WebSocket Issues

If WebSocket updates aren't working:

1. Check the "WebSocket Diagnostics" section to verify the connection is active
2. Confirm the WebSocket URL is correctly configured
3. Look for any connection errors in the browser console

#### Parameter Filtering Problems

If parameter-based filtering isn't working:

1. Check the filter trace for condition evaluation results
2. Verify that parameters are correctly named in your conditions
3. Check if direct part references (part:id:param) are resolving correctly

## Button Actions

- **Reload Data**: Forces a reload of all data
- **Clear Cache**: Clears all caches (parameter, condition, entity)

## Example: Debugging Cross-Reference Filtering

If you're using cross-reference filtering (where one part references another), you can use the debug view to understand how these references are resolved:

1. Check the "Filter Conditions" section for your cross-reference conditions
2. Look at the "Filter Trace" to see how the reference is being resolved
3. Use "Clear Cache" to ensure fresh parameter lookups

## Advanced Debug Tools

For developers, the debug view exposes detailed trace information. You can inspect the browser console for additional debug logs by enabling debugging in the card configuration:

```yaml
type: custom:inventree-card
entity: sensor.inventree_parts
view_type: debug
title: InvenTree Debug View
show_debug: true
debug_config:
  systems:
    layouts:
      enabled: true
    parameters:
      enabled: true
    filtering:
      enabled: true
```

This will show detailed debugging information in the browser console. 