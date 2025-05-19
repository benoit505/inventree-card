# Redux Migration: Layout Component Integration

## Overview

This document details the implementation of the first Redux-connected layout component: `BaseLayoutAdapter`. This component serves as a bridge between the existing layout component architecture and the new Redux state management system.

## Implementation Approach

After evaluating different approaches, we chose a **composition pattern** rather than inheritance. This decision was made for several key reasons:

1. **TypeScript Limitations**: TypeScript has inherent limitations with complex class inheritance that were causing compiler errors, especially with private methods.
2. **Cleaner Separation**: Composition provides a clearer separation between the legacy state system and the new Redux architecture.
3. **Progressive Migration**: The adapter pattern allows for a gradual migration with feature flags controlling when Redux is used.

## BaseLayoutAdapter Implementation

The `BaseLayoutAdapter` component uses the following techniques:

### 1. Delegation Pattern

Rather than extending `BaseLayout`, the adapter creates an instance of it and delegates operations:

```typescript
@customElement('base-layout-adapter')
export class BaseLayoutAdapter extends LitElement {
  // The internal BaseLayout instance we'll delegate to
  private _baseLayout?: BaseLayout;
  
  private _ensureLayoutInstance() {
    if (!this._baseLayout) {
      this._baseLayout = document.createElement('inventree-base-layout') as BaseLayout;
      // Add to shadow DOM
      if (this.shadowRoot && !this.shadowRoot.contains(this._baseLayout)) {
        this.shadowRoot.appendChild(this._baseLayout);
      }
    }
  }
}
```

### 2. Property Forwarding

The adapter forwards properties to the internal `BaseLayout` instance:

```typescript
private _updateBaseLayoutProps() {
  if (!this._baseLayout) return;
  
  // Pass through standard properties
  if (this.hass) this._baseLayout.hass = this.hass;
  if (this.config) this._baseLayout.config = this.config;
  if (this.entity) this._baseLayout.entity = this.entity;
  
  // Decide which parts to pass based on Redux flag
  if (getFeatureFlag('useReduxForParts') && this._reduxParts.length > 0) {
    this._baseLayout.parts = this._reduxParts;
  } else if (this.parts) {
    this._baseLayout.parts = this.parts;
  }
}
```

### 3. Redux State Connection

The adapter connects to the Redux store when the feature flag is enabled:

```typescript
private _connectToReduxStore() {
  // Set up store subscription
  this._storeUnsubscribe = store.subscribe(() => {
    if (this.entity) {
      const state = store.getState();
      if (state.parts?.items) {
        const newParts = state.parts.items[this.entity] || [];
        
        // Only update if parts have changed
        if (JSON.stringify(newParts) !== JSON.stringify(this._reduxParts)) {
          this._reduxParts = newParts;
          this._updateBaseLayoutProps();
        }
      }
    }
  });
}
```

### 4. Feature Flag Control

The adapter uses feature flags to determine whether to use Redux or the legacy state system:

```typescript
// In index.ts
if (getFeatureFlag('useConnectedComponents')) {
  logger.log('Main', 'Registering Redux-connected components', { 
    category: 'initialization',
    subsystem: 'redux' 
  });
  customElements.define('base-layout-adapter', BaseLayoutAdapter);
}

// In the adapter
if (getFeatureFlag('useReduxForParts')) {
  this._connectToReduxStore();
}
```

### 5. Method Forwarding

The adapter forwards method calls to the BaseLayout instance while adding Redux capabilities:

```typescript
public updateParameterValue(partId: number, paramName: string, value: string, source: string = 'user') {
  if (getFeatureFlag('useReduxForParameters')) {
    // Dispatch to Redux
    store.dispatch({
      type: 'parameters/updateValue',
      payload: { partId, paramName, value, source }
    });
  }
  
  // Always forward to the base layout for compatibility
  if (this._baseLayout) {
    (this._baseLayout as any).updateParameterValue?.(partId, paramName, value, source);
  }
}
```

## Usage Metrics

The adapter integrates with our usage tracking system to monitor the progress of the migration:

```typescript
// In state-adapter.ts
static trackUsage(system: 'redux' | 'legacy', operation: string): void {
  const metrics = system === 'redux' ? usageMetrics.redux : usageMetrics.legacy;
  const count = metrics.get(operation) || 0;
  metrics.set(operation, count + 1);
}
```

This allows us to see how much the application is using Redux vs. the legacy singleton system.

## Debugging Support

The Redux Debug View component provides insights into the migration progress:

1. View feature flags and enable/disable them
2. Monitor Redux state in real-time
3. Track usage metrics to see percentage of Redux vs. legacy usage

## Next Steps

With the `BaseLayoutAdapter` component implemented, the next steps in our roadmap are:

1. Add Redux state connections to additional core components
2. Convert specific layout implementations (grid, list) to use Redux
3. Implement adapter patterns for other services (Parameter, Rendering)

## Considerations and Challenges

During implementation, we encountered and addressed several challenges:

1. **TypeScript Mixin Limitations**: TypeScript had difficulties with type checking in mixins, which led us to choose composition over inheritance.

2. **State Synchronization**: Keeping both state systems in sync during the transition requires careful tracking and event management.

3. **Performance Overhead**: The adapter pattern introduces some performance overhead, which we mitigated by:
   - Only updating when data actually changes
   - Using passive rendering when possible
   - Limiting object creation during updates

4. **Edge Cases**: Handling situations where one system has data the other doesn't yet has required careful fallback mechanisms.

## Conclusion

The `BaseLayoutAdapter` implementation marks a significant milestone in our Redux migration. It provides a clean, sustainable way to bridge the existing component system with Redux while maintaining backward compatibility. The feature flag system allows for gradual adoption, and the usage metrics provide visibility into the migration progress. 