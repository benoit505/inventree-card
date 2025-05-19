# Redux Migration: Grid Layout Adapter Implementation

## Overview

This document details the implementation of the GridLayoutAdapter, the second Redux-connected component in our migration roadmap. This adapter follows the same composition pattern established with the BaseLayoutAdapter, applying it to the grid layout visualization.

## Implementation Approach

The GridLayoutAdapter follows the composition pattern defined in our adapter guidelines:

1. It **extends LitElement** rather than InvenTreeGridLayout
2. It **instantiates and delegates** to an internal InvenTreeGridLayout instance
3. It **conditionally connects** to the Redux store based on feature flags
4. It **forwards properties** to the internal grid layout
5. It **tracks usage metrics** for monitoring migration progress

## Key Components

### Component Creation and DOM Management

The adapter creates and maintains an instance of InvenTreeGridLayout:

```typescript
private _ensureLayoutInstance() {
  if (!this._gridLayout) {
    this._gridLayout = document.createElement('inventree-grid-layout') as InvenTreeGridLayout;
    
    // Add to shadow DOM after ensuring it's initialized
    if (this.shadowRoot && !this.shadowRoot.contains(this._gridLayout)) {
      this.shadowRoot.appendChild(this._gridLayout);
    }
  }
  
  // Update the grid layout with our properties
  this._updateLayoutProps();
}
```

### Redux Integration

The adapter subscribes to the Redux store when enabled by feature flags:

```typescript
private _connectToReduxStore() {
  // Set up store subscription
  this._storeUnsubscribe = store.subscribe(() => {
    if (this.config?.entity) {
      const state = store.getState();
      if (state.parts?.items) {
        const entityId = this.config.entity;
        const newParts = state.parts.items[entityId] || [];
        
        // Only update if parts have changed
        if (JSON.stringify(newParts) !== JSON.stringify(this._reduxParts)) {
          this._reduxParts = newParts;
          this._updateLayoutProps();
          
          this.logger.log('GridLayoutAdapter', `Updated parts from Redux store: ${newParts.length} items`, 
            { category: 'redux', subsystem: 'adapters' });
        }
      }
    }
  });
}
```

### Feature Flag Control

The adapter uses feature flags to determine its behavior:

```typescript
// In connectedCallback
if (getFeatureFlag('useReduxForParts')) {
  this._connectToReduxStore();
}

// In property updates
if (getFeatureFlag('useReduxForParts') && this._reduxParts.length > 0) {
  this._gridLayout.parts = this._reduxParts;
} else if (this.parts) {
  this._gridLayout.parts = this.parts;
}
```

### Method Forwarding

The adapter forwards public methods to the internal grid layout instance:

```typescript
public forceImmediateFilter(): void {
  if (this._gridLayout && typeof this._gridLayout.forceImmediateFilter === 'function') {
    this._gridLayout.forceImmediateFilter();
  }
}
```

## Registration Process

The adapter is registered conditionally in index.ts:

```typescript
if (getFeatureFlag('useConnectedComponents')) {
  logger.log('Main', 'Registering Redux-connected components', { 
    category: 'initialization',
    subsystem: 'redux' 
  });
  customElements.get('redux-debug-view') || customElements.define('redux-debug-view', ReduxDebugView);
  customElements.get('base-layout-adapter') || customElements.define('base-layout-adapter', BaseLayoutAdapter);
  customElements.get('grid-layout-adapter') || customElements.define('grid-layout-adapter', GridLayoutAdapter);
}
```

## Usage Tracking

The adapter records usage metrics to track migration progress:

```typescript
// Track usage
StateAdapter.trackUsage('redux', 'gridLayoutConnected');
```

## Benefits of the Adapter Pattern

1. **Zero Changes to Original Component**: The InvenTreeGridLayout remains unchanged, ensuring backward compatibility.
2. **Progressive Migration**: We can gradually shift functionality to Redux without breaking existing code.
3. **Clean Separation**: The adapter provides a clear boundary between old and new state management approaches.
4. **Minimal Overhead**: Performance impact is minimized by only updating when data changes.

## Testing Considerations

When testing the GridLayoutAdapter, it's important to verify:

1. Parts are correctly displayed when using Redux state
2. Parts are correctly displayed when using legacy state
3. Changes to parts in Redux are reflected in the UI
4. Feature flags properly control which state system is used

## Next Steps

Following our roadmap, the next components to implement are:

1. List Layout Adapter
2. Parts Layout Adapter

These will follow the same pattern established with BaseLayoutAdapter and GridLayoutAdapter.

## Conclusion

The GridLayoutAdapter represents continued progress in our Redux migration. By following the composition pattern, we're able to incrementally adopt Redux without disrupting existing functionality. The feature flag system allows for controlled rollout, and usage metrics provide visibility into the migration progress. 