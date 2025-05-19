# Redux Migration: Adapter Patterns

## Overview

This document outlines the adapter patterns that will facilitate a gradual migration from singleton-based architecture to Redux. These patterns allow both systems to operate in parallel during the transition period, enabling incremental adoption without disrupting existing functionality.

## Adapter Pattern Principles

1. **Transparency**: Components should not need to know which system they're using
2. **Performance**: Adapters should add minimal overhead
3. **Type Safety**: Maintain TypeScript type checking throughout
4. **Feature Flagging**: Allow switching between implementations at runtime
5. **Usage Tracking**: Monitor which system is being used to track migration progress

## Key Adapter Types

### 1. State Access Adapters

These adapters bridge the gap between direct singleton access and Redux store access.

#### BaseStateAdapter

```typescript
// src/adapters/state-adapter.ts
import { getFeatureFlags } from '../store/feature-flags';
import { select, dispatch } from '../store/provider';
import { InventTreeState } from '../core/inventree-state';
import { 
  selectPartsByEntity, 
  selectFilteredPartsByEntity,
  selectPartById
} from '../store/slices/partsSlice';
import { trackReduxUsage, trackLegacyUsage } from '../store/metrics';

export class StateAdapter {
  /**
   * Get parts for an entity, using either Redux or legacy system
   */
  static getParts(entityId: string, filtered: boolean = true): InventreeItem[] {
    // Check feature flag
    if (getFeatureFlags().useReduxForParts) {
      // Track usage
      trackReduxUsage('getParts');
      
      // Use Redux
      if (filtered) {
        return select(state => selectFilteredPartsByEntity(state, entityId));
      } else {
        return select(state => selectPartsByEntity(state, entityId));
      }
    } else {
      // Track usage
      trackLegacyUsage('getParts');
      
      // Use legacy singleton
      return InventTreeState.getInstance().getNewestData(entityId);
    }
  }
  
  /**
   * Get a single part by ID
   */
  static getPartById(partId: number): InventreeItem | undefined {
    // Check feature flag
    if (getFeatureFlags().useReduxForParts) {
      // Track usage
      trackReduxUsage('getParts');
      
      // Use Redux
      return select(state => selectPartById(state, partId));
    } else {
      // Track usage
      trackLegacyUsage('getParts');
      
      // Use legacy singleton
      return InventTreeState.getInstance()._findPartById(partId) || undefined;
    }
  }
  
  /**
   * Update a parameter value
   */
  static updateParameter(partId: number, paramName: string, value: string, source: string = 'ui'): void {
    // Check feature flag
    if (getFeatureFlags().useReduxForParameters) {
      // Track usage
      trackReduxUsage('updateParameter');
      
      // Use Redux
      dispatch({
        type: 'parameters/updateValue',
        payload: { partId, paramName, value, source }
      });
      
      // Also update the part itself
      dispatch({
        type: 'parts/updateParameter',
        payload: { partId, paramName, value }
      });
    } else {
      // Track usage
      trackLegacyUsage('updateParameter');
      
      // Use legacy singleton
      InventTreeState.getInstance().updateParameter(partId, paramName, value);
    }
  }
  
  /**
   * Get data source priority
   */
  static getDataSourcePriority(): 'websocket' | 'api' | 'hass' {
    // Check feature flag
    if (getFeatureFlags().useReduxForParts) {
      return select(state => state.parts.metadata.sourcePriority);
    } else {
      return InventTreeState.getInstance()._prioritySource;
    }
  }
  
  /**
   * Set data source priority
   */
  static setDataSourcePriority(priority: 'websocket' | 'api' | 'hass'): void {
    // Check feature flag
    if (getFeatureFlags().useReduxForParts) {
      dispatch({
        type: 'parts/setSourcePriority',
        payload: priority
      });
    }
    
    // Always set in legacy system during transition
    InventTreeState.getInstance().setPriorityDataSource(priority);
  }
}
```

### 2. Service Adapters

These adapters provide unified interfaces for services regardless of the underlying implementation.

#### RenderingServiceAdapter

```typescript
// src/adapters/rendering-service-adapter.ts
import { getFeatureFlags } from '../store/feature-flags';
import { select, dispatch, subscribe } from '../store/provider';
import { RenderingService, RenderTimingData } from '../services/rendering-service';
import { trackReduxUsage, trackLegacyUsage } from '../store/metrics';

export interface RenderingServiceInterface {
  forceRender(): void;
  registerRenderCallback(callback: () => void): () => void;
  trackRenderTiming(data: RenderTimingData): void;
  getRenderTimings(): RenderTimingData[];
}

export class ReduxRenderingService implements RenderingServiceInterface {
  forceRender(): void {
    trackReduxUsage('render');
    dispatch({ type: 'ui/forceRender' });
  }
  
  registerRenderCallback(callback: () => void): () => void {
    // Use store subscription
    return subscribe(() => {
      const state = select(s => s);
      // Only call back when render state changes
      if (state.ui.renderRequested) {
        callback();
      }
    });
  }
  
  trackRenderTiming(data: RenderTimingData): void {
    dispatch({
      type: 'ui/recordRenderTiming',
      payload: data
    });
  }
  
  getRenderTimings(): RenderTimingData[] {
    return select(state => state.ui.renderTiming.history);
  }
}

export class LegacyRenderingService implements RenderingServiceInterface {
  private service: RenderingService;
  
  constructor() {
    this.service = RenderingService.getInstance();
  }
  
  forceRender(): void {
    trackLegacyUsage('render');
    this.service.forceRender();
  }
  
  registerRenderCallback(callback: () => void): () => void {
    return this.service.registerRenderCallback(callback);
  }
  
  trackRenderTiming(data: RenderTimingData): void {
    this.service.trackRenderTiming(data);
  }
  
  getRenderTimings(): RenderTimingData[] {
    return this.service.getRenderTimings();
  }
}

// Factory function to get the appropriate implementation
export function getRenderingService(): RenderingServiceInterface {
  if (getFeatureFlags().useReduxForRendering) {
    return new ReduxRenderingService();
  } else {
    return new LegacyRenderingService();
  }
}
```

### 3. Component Adapters

These adapters integrate Redux with Web Components (LitElement).

#### ReduxLitMixin

```typescript
// src/adapters/redux-lit-mixin.ts
import { LitElement, PropertyValues } from 'lit';
import { subscribe } from '../store/provider';

/**
 * Mixin that adds Redux integration to LitElement components
 */
export const ReduxLitMixin = <T extends new (...args: any[]) => LitElement>(
  baseClass: T
) => {
  return class extends baseClass {
    // Store subscription
    _reduxUnsubscribe: (() => void) | null = null;
    
    // Track if component was connected
    _wasConnected = false;
    
    // List of selectors to watch
    _watchSelectors: Array<{
      selector: (state: any) => any,
      lastValue: any
    }> = [];
    
    /**
     * Set up Redux watch for a specific selector
     */
    watchSelector<R>(selector: (state: any) => R): R {
      // Get current value
      const currentValue = selector(this._getReduxState());
      
      // Add to watch list if not already there
      const existing = this._watchSelectors.find(w => w.selector === selector);
      if (!existing) {
        this._watchSelectors.push({
          selector,
          lastValue: currentValue
        });
      }
      
      return currentValue;
    }
    
    /**
     * Called when component is connected to the DOM
     */
    connectedCallback() {
      super.connectedCallback();
      this._wasConnected = true;
      this._connectToRedux();
    }
    
    /**
     * Called when component is disconnected from the DOM
     */
    disconnectedCallback() {
      super.disconnectedCallback();
      
      // Unsubscribe from Redux
      if (this._reduxUnsubscribe) {
        this._reduxUnsubscribe();
        this._reduxUnsubscribe = null;
      }
    }
    
    /**
     * Set up Redux connection
     */
    _connectToRedux() {
      if (this._reduxUnsubscribe) {
        return; // Already connected
      }
      
      // Subscribe to Redux store
      this._reduxUnsubscribe = subscribe(() => {
        this._handleReduxStateChange();
      });
      
      // Initial state check
      this._handleReduxStateChange();
    }
    
    /**
     * Handle Redux state changes
     */
    _handleReduxStateChange() {
      if (!this._wasConnected) {
        return; // Don't trigger updates if not connected
      }
      
      const state = this._getReduxState();
      let shouldUpdate = false;
      
      // Check each watched selector
      this._watchSelectors.forEach(watch => {
        const newValue = watch.selector(state);
        
        // Compare with last value
        if (!this._isEqual(newValue, watch.lastValue)) {
          // Update last value
          watch.lastValue = this._deepCopy(newValue);
          shouldUpdate = true;
        }
      });
      
      // Request update if needed
      if (shouldUpdate) {
        this.requestUpdate();
      }
    }
    
    /**
     * Get current Redux state
     */
    _getReduxState(): any {
      // This will be implemented by the provider
      return {};
    }
    
    /**
     * Deep equality check
     */
    _isEqual(a: any, b: any): boolean {
      if (a === b) return true;
      
      if (a === null || b === null) return false;
      
      if (typeof a !== 'object' || typeof b !== 'object') return false;
      
      // Simple deep comparison for objects and arrays
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        return this._isEqual(a[key], b[key]);
      });
    }
    
    /**
     * Create a deep copy of an object
     */
    _deepCopy<T>(obj: T): T {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      
      // Simple deep copy for objects and arrays
      if (Array.isArray(obj)) {
        return obj.map(item => this._deepCopy(item)) as unknown as T;
      }
      
      const result: any = {};
      Object.keys(obj).forEach(key => {
        result[key] = this._deepCopy((obj as any)[key]);
      });
      
      return result as T;
    }
  };
};
```

### 4. Dual Implementation Components

Components that can work with both Redux and singleton state.

#### Example: BaseLayoutAdapter

```typescript
// src/adapters/base-layout-adapter.ts
import { BaseLayout } from '../components/common/base-layout';
import { StateAdapter } from './state-adapter';
import { getRenderingService } from './rendering-service-adapter';
import { getParameterService } from './parameter-service-adapter';
import { getFeatureFlags } from '../store/feature-flags';

/**
 * Extends BaseLayout with adapter methods
 */
export class BaseLayoutAdapter extends BaseLayout {
  /**
   * Override to use adapter for getting parts
   */
  protected getParts(): InventreeItem[] {
    if (!this.entity) {
      return [];
    }
    
    return StateAdapter.getParts(this.entity);
  }
  
  /**
   * Override to use adapter for filtering
   */
  protected async _applyParameterFiltering(parts: InventreeItem[]): Promise<InventreeItem[]> {
    if (getFeatureFlags().useReduxForFiltering) {
      // Use Redux-based filtering
      return await this._applyReduxFiltering(parts);
    } else {
      // Use original implementation
      return await super._applyParameterFiltering(parts);
    }
  }
  
  /**
   * Redux-based parameter filtering
   */
  private async _applyReduxFiltering(parts: InventreeItem[]): Promise<InventreeItem[]> {
    // Implementation will call Redux filtering logic
    // ...
    return parts;
  }
  
  /**
   * Override to use adapter for rendering service
   */
  public requestUpdate(): void {
    const renderingService = getRenderingService();
    
    // Use same pattern as original, but with adapter
    try {
      this._lastUpdateRequestTimestamp = Date.now();
      
      const startTime = performance.now();
      // Request update through adapter
      renderingService.forceRender();
      
      // Get filtered parts for rendering
      const filteredParts = this._filteredParts || [];
      const preparationTime = Math.round(performance.now() - startTime);
      
      // Track timing metrics using adapter
      this._reportRenderTiming(preparationTime, filteredParts.length);
      
      this.logger.log('BaseLayout', `Update requested with ${filteredParts.length} parts, preparation: ${preparationTime}ms`,
        { category: 'rendering', subsystem: 'updates' });
    } catch (error) {
      this.logger.error('BaseLayout', `Error requesting update: ${error}`,
        { category: 'rendering', subsystem: 'error' });
    }
  }
  
  /**
   * Report render timing through adapter
   */
  private _reportRenderTiming(preparationTime: number, partCount: number): void {
    const renderingService = getRenderingService();
    
    try {
      const now = Date.now();
      const timeSinceLastRender = this._lastRender ? now - this._lastRender : 0;
      this._lastRender = now;
      
      const requestToRenderTime = this._lastUpdateRequestTimestamp ? now - this._lastUpdateRequestTimestamp : 0;
      
      const data = {
        component: this.tagName.toLowerCase(),
        preparationTime,
        renderTime: timeSinceLastRender,
        filteredParts: partCount,
        totalParts: this.parts?.length || 0,
        timestamp: now
      };
      
      // Log timing metrics
      this.logger.log('BaseLayout', `Render timing: ${JSON.stringify(data)}`, 
        { category: 'performance', subsystem: 'rendering' });
      
      // Send timing data through adapter
      renderingService.trackRenderTiming(data);
      
      // Still dispatch event for legacy components
      this.dispatchEvent(new CustomEvent('render-timing', { 
        bubbles: true, 
        composed: true,
        detail: data
      }));
    } catch (error) {
      this.logger.error('BaseLayout', `Error reporting render timing: ${error}`, 
        { category: 'performance', subsystem: 'error' });
    }
  }
  
  /**
   * Override to use adapter for parameter service
   */
  private _safeGetParameterService(): any {
    return getParameterService();
  }
}
```

## Implementation Strategy

### Phased Adapter Introduction

1. **Phase 1: Create Core Adapters**
   - Implement state access adapters
   - Implement service interface adapters
   - Add minimal Redux components to support adapters

2. **Phase 2: Component Adaptation**
   - Add mixin for LitElement + Redux integration
   - Create adapter subclasses for key components
   - Implement usage tracking

3. **Phase 3: Feature Flag System**
   - Add feature flag management
   - Create UI for toggling features during development
   - Add performance benchmarking

4. **Phase 4: Progressive Adoption**
   - Start with simple read-only operations
   - Move to simple write operations
   - Finally tackle complex features like filtering

### Decision Tree for Adapter Implementation

```
For each service or component:
 ├── Is it part of the critical rendering path?
 │   ├── YES → Implement adapter with both paths
 │   └── NO → Can it be converted directly?
 │        ├── YES → Migrate directly to Redux
 │        └── NO → Implement adapter
 └── Does it have complex state management?
     ├── YES → Use full adapter pattern with interface
     └── NO → Use simple conditional logic
```

## Testing Adapter Implementation

```typescript
// Example test for state adapter
describe('StateAdapter', () => {
  it('should use Redux when feature flag is enabled', () => {
    // Set up
    const reduxParts = [{ pk: 1, name: 'Test Part' }];
    const mockSelect = jest.fn().mockReturnValue(reduxParts);
    jest.spyOn(storeProvider, 'select').mockImplementation(mockSelect);
    jest.spyOn(featureFlags, 'getFeatureFlags').mockReturnValue({
      useReduxForParts: true,
      useReduxForParameters: false,
      useReduxForRendering: false,
      useReduxForWebSocket: false,
      useReduxForFiltering: false
    });
    
    // Execute
    const result = StateAdapter.getParts('entity-1');
    
    // Assert
    expect(result).toBe(reduxParts);
    expect(mockSelect).toHaveBeenCalled();
    expect(metrics.trackReduxUsage).toHaveBeenCalledWith('getParts');
  });
  
  it('should use legacy singleton when feature flag is disabled', () => {
    // Set up
    const legacyParts = [{ pk: 2, name: 'Legacy Part' }];
    const mockGetNewestData = jest.fn().mockReturnValue(legacyParts);
    const mockInventTreeState = {
      getNewestData: mockGetNewestData
    };
    jest.spyOn(InventTreeState, 'getInstance').mockReturnValue(mockInventTreeState as any);
    jest.spyOn(featureFlags, 'getFeatureFlags').mockReturnValue({
      useReduxForParts: false,
      useReduxForParameters: false,
      useReduxForRendering: false,
      useReduxForWebSocket: false,
      useReduxForFiltering: false
    });
    
    // Execute
    const result = StateAdapter.getParts('entity-1');
    
    // Assert
    expect(result).toBe(legacyParts);
    expect(mockGetNewestData).toHaveBeenCalledWith('entity-1');
    expect(metrics.trackLegacyUsage).toHaveBeenCalledWith('getParts');
  });
});
```

## Performance Considerations

Adapters introduce a small overhead, which should be minimized:

1. **Memoization**: Cache expensive computations
2. **Conditional Logic**: Minimize if/else paths in hot code
3. **Feature Flag Caching**: Cache feature flag results during render cycles
4. **Selective Rendering**: Only update components when relevant state changes

Example:

```typescript
// Efficient feature flag access in components
import { getFeatureFlags } from '../store/feature-flags';

// Cache flags during render to avoid multiple lookups
const useReduxFeatures = () => {
  const flags = getFeatureFlags();
  return {
    useRedux: (feature: keyof typeof flags) => flags[feature],
    usesAnyRedux: Object.values(flags).some(Boolean)
  };
};
```

## Conclusion

These adapter patterns provide a robust bridge between the current singleton-based architecture and the target Redux architecture. By implementing these patterns, we enable:

1. **Gradual migration** without breaking existing functionality
2. **Feature-by-feature** switching between implementations
3. **Performance monitoring** to ensure the new system is as efficient as the old
4. **Clean separation** of concerns during the transition
5. **Type safety** throughout the migration process

The adapter layer will allow us to replace individual pieces of the system incrementally while maintaining a functioning application throughout the migration process. 