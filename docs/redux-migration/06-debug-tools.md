# Redux Migration: Debug Tools

## Overview

This document describes the debug tools and utilities developed to facilitate and monitor the Redux migration process. These tools help visualize state, track usage patterns, and enable gradual feature rollout through feature flags.

## Feature Flags

The migration uses a feature flag system to gradually enable Redux functionality while maintaining backward compatibility. The feature flags control which parts of the system use Redux vs. legacy singletons.

```typescript
// Key feature flags
export interface FeatureFlags {
  // Core state management
  useReduxForParts: boolean;        // Use Redux for parts state
  useReduxForParameters: boolean;   // Use Redux for parameter state
  useReduxForRendering: boolean;    // Use Redux for rendering pipeline
  
  // Service adapters
  useReduxForWebSocket: boolean;    // Use Redux for WebSocket data
  useReduxRenderingService: boolean; // Use Redux-based rendering service
  useReduxParameterService: boolean; // Use Redux-based parameter service
  
  // UI components
  useBaseLayoutAdapter: boolean;    // Use BaseLayout adapter component
  useConnectedComponents: boolean;  // Use Redux-connected components
}
```

Feature flags can be enabled individually or in phases:

```typescript
// Enable individual flags
enableFeature('useReduxForParts');
disableFeature('useReduxForRendering');

// Enable a migration phase
enableMigrationPhase('foundation'); // Basic Redux foundation
enableMigrationPhase('state');      // State management
enableMigrationPhase('rendering');  // Rendering pipeline
enableMigrationPhase('components'); // Component integration
enableMigrationPhase('all');        // All features
```

## Debug Component

A dedicated debug component `redux-debug-view` provides a visual interface for monitoring and controlling the migration:

### Feature Flag Control Panel

The feature flag panel shows all available flags and their current state. It allows enabling/disabling flags individually or by phase.

Key capabilities:
- Toggle individual feature flags
- Enable migration phases
- View overall migration progress

### Redux State Explorer

The Redux state explorer shows the current contents of the Redux store, organized by slice. It allows exploring the state structure and comparing it with the legacy state.

Key capabilities:
- Explore Redux store state
- View individual slices
- Track state changes

### Usage Metrics

The usage metrics panel shows how frequently different parts of the code are accessing Redux vs. legacy singletons. This helps track migration progress and identify frequently used functionality.

Key capabilities:
- View Redux vs. legacy usage counts
- Identify heavily used API methods
- Track migration progress

## Integration into Debug View

The Redux debug tools are integrated into the main debug view of the card. To access them:

1. Enable debug mode in the card configuration
2. Navigate to the "Debug" view
3. Select the "Redux" tab

## Adapter Usage Tracking

All adapters include usage tracking to monitor which implementation (Redux or legacy) is being used. This data helps:

1. Track migration progress
2. Identify performance bottlenecks
3. Ensure backward compatibility
4. Detect issues during the transition

Example of the usage tracking in action:

```typescript
static trackUsage(system: 'redux' | 'legacy', operation: string): void {
  const metrics = system === 'redux' ? usageMetrics.redux : usageMetrics.legacy;
  const count = metrics.get(operation) || 0;
  metrics.set(operation, count + 1);
  
  // Log every 10th usage for each operation
  if (count % 10 === 0) {
    this.logger.log('StateAdapter', 
      `Usage metrics - ${operation}: ${system} used ${count + 1} times`, 
      { category: 'migration', subsystem: 'adapter' });
  }
}
```

## Console Logging

Enhanced console logging provides visibility into the migration process. Each adapter logs key operations with standardized categories to make debugging easier.

Example log categories:
- `migration`: Overall migration process
- `redux`: Redux state and operations
- `adapter`: Adapter behavior
- `components`: Component integration

## Migration Progress Visualization

The migration progress is visualized on the debug panel, showing:

1. Overall progress percentage
2. Feature flags enabled/disabled
3. Usage metrics for each system
4. Timeline of key migration milestones

## Performance Comparison

The debug tools include performance comparison metrics to evaluate the impact of the migration on rendering speed, memory usage, and overall responsiveness.

## Future Enhancements

Planned enhancements for the debug tools:

1. **Time-travel debugging** - Record and replay state changes
2. **Visual diff** - Show differences between Redux and legacy state
3. **Performance profiling** - Detailed timing measurements
4. **Migration assistant** - Automated recommendations for next steps

## Using the Debug Tools

To effectively use the debug tools during migration:

1. Start with minimal feature flags enabled
2. Monitor usage metrics to understand patterns
3. Enable additional features incrementally
4. Use the Redux state explorer to verify state integrity
5. Track performance metrics to ensure the migration improves rather than degrades performance 