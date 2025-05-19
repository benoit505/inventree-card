# Redux Migration Documentation

## Timer Management in Redux

As part of the Phase 3 migration to Redux, we've implemented a centralized approach to timer management using the Redux store. This provides several benefits:

1. **Centralized Timer State**: All timers are tracked in the Redux store, making it easier to debug and monitor
2. **Reliable Cleanup**: Automatic cleanup when components are unmounted or destroyed
3. **Consistent API**: A unified API for setting and clearing timers across the application
4. **Feature Flag Control**: Ability to enable/disable Redux-based timer management via feature flags

### Implementation Details

The timer management system consists of the following components:

#### 1. TimerSlice

A Redux slice that maintains the state of all timers in the application, including:
- Active timers with their IDs, component owners, and metadata
- Component-to-timer mappings for efficient cleanup
- Statistics and monitoring capabilities

#### 2. TimerAdapter

An adapter class that provides a consistent interface compatible with the existing `TimerManager` while delegating to Redux actions:

```typescript
// Example usage:
const timers = new TimerAdapter('MyComponent');
const timerId = timers.setTimeout(() => { 
  console.log('Timer fired!'); 
}, 1000, 'debug-timer');

// Cleanup
timers.clearTimeout(timerId);
// or 
timers.clearAll(); // Clears all timers for this component
```

#### 3. Service Adapters

Adapter classes for core services like `RenderingService` and `CardController` that use the `TimerAdapter`:

- `RenderingServiceAdapter`: Adapts the rendering service to use Redux timers
- `CardControllerAdapter`: Adapts the card controller to use Redux timers

### Usage

To use the Redux timer management system:

1. Enable the feature flag in your card configuration:

```yaml
redux:
  enabled: true
  useReduxTimers: true
```

2. Import and use the adapters instead of direct service access:

```typescript
import { TimerAdapter, RenderingServiceAdapter, CardControllerAdapter } from './adapters';

// Get adapter instances
const timers = new TimerAdapter('MyComponent');
const renderingService = RenderingServiceAdapter.getInstance();
const cardController = CardControllerAdapter.getInstance();

// Use as normal
const timerId = timers.setTimeout(() => { ... }, 1000);
```

### Technical Notes

- The Redux middleware uses `@ts-ignore` for the `getDefaultMiddleware` parameter in store configuration due to typing issues with Redux Toolkit v2.7+.
- Timer IDs remain compatible with window.setTimeout/clearTimeout for backward compatibility.
- Adapter patterns allow for gradual migration without breaking changes.

### Project Structure

```
src
 ┣ 📂adapters                     # Adapter implementations for Redux migration
 ┃ ┣ 📜base-layout-adapter.ts     # Base adapter for layout components
 ┃ ┣ 📜card-controller-adapter.ts # Adapter for CardController
 ┃ ┣ 📜component-registry.ts      # Registry for adapted components
 ┃ ┣ 📜feature-flags.ts           # Feature flag management
 ┃ ┣ 📜grid-layout-adapter.ts     # Grid layout adapter
 ┃ ┣ 📜index.ts                   # Exports for adapters
 ┃ ┣ 📜list-layout-adapter.ts     # List layout adapter
 ┃ ┣ 📜part-view-adapter.ts       # Part view adapter
 ┃ ┣ 📜parts-layout-adapter.ts    # Parts layout adapter
 ┃ ┣ 📜redux-lit-mixin.ts         # Mixin for LitElement with Redux
 ┃ ┣ 📜rendering-service-adapter.ts # Adapter for RenderingService
 ┃ ┣ 📜state-adapter.ts           # Adapter for state management
 ┃ ┣ 📜timer-adapter.ts           # Timer management adapter
 ┃ ┗ 📜variant-layout-adapter.ts  # Variant layout adapter
 ┣ 📂store                        # Redux store
 ┃ ┣ 📂middleware                 # Redux middleware
 ┃ ┃ ┣ 📜logging-middleware.ts    # Logging middleware
 ┃ ┃ ┣ 📜services-middleware.ts   # Services middleware
 ┃ ┃ ┗ 📜timer-middleware.ts      # Timer management middleware
 ┃ ┣ 📂slices                     # Redux slices
 ┃ ┃ ┣ 📜componentSlice.ts        # Component state slice
 ┃ ┃ ┣ 📜configSlice.ts           # Configuration slice
 ┃ ┃ ┣ 📜featureFlagsSlice.ts     # Feature flags slice
 ┃ ┃ ┣ 📜parametersSlice.ts       # Parameters slice
 ┃ ┃ ┣ 📜partsSlice.ts            # Parts data slice
 ┃ ┃ ┣ 📜timerSlice.ts            # Timer management slice
 ┃ ┃ ┗ 📜uiSlice.ts               # UI state slice
 ┃ ┣ 📜hooks.ts                   # Redux hooks
 ┃ ┗ 📜index.ts                   # Store configuration
 ┣ 📂services                     # Original service implementations
 ┃ ┣ 📜card-controller.ts         # Main card controller
 ┃ ┣ 📜rendering-service.ts       # Rendering service
 ┃ ┗ 📜...                        # Other services
 ┣ 📂utils
 ┃ ┣ 📜safe-timer.ts              # Safe timer utilities
 ┃ ┗ 📜timer-manager.ts           # Original timer manager
 ┗ 📜inventree-card.ts            # Main card component
``` 