# Main Card Redux Integration

## Overview
The integration of Redux into the main `InventreeCard` component marks a significant milestone in the Redux migration project. As the top-level component that orchestrates all other components, integrating Redux at this level allows for better control over the application state and provides a foundation for data flow throughout the component tree.

## Implementation Approach
Instead of using the adapter pattern, we've chosen to directly modify the `InventreeCard` class to extend `ReduxLitElement` rather than `LitElement`. This approach offers several advantages:

1. Direct integration at the top level provides a clean entry point for Redux state management
2. The main card can dispatch initial actions to populate the Redux store
3. The card component can use feature flags to control which components (Redux or legacy) to render
4. Configuration changes can be efficiently propagated through Redux

## Key Changes

### Redux State Integration
- The `InventreeCard` class now extends `ReduxLitElement` to gain Redux connectivity
- Card configuration is stored in Redux using the `configSlice`
- Redux connectivity is established conditionally based on the `useReduxForCard` feature flag

### Feature Flag Control
- Added a new feature flag `useReduxForCard` to enable/disable Redux integration for the main card
- This flag is included in the migration phase control system
- When enabled, the card connects to the Redux store and dispatches configuration updates

### State Synchronization
- The card maintains backward compatibility by conditionally using Redux
- Configuration changes are dispatched to the Redux store when enabled
- State is synchronized between the legacy state system and Redux during the transition period

## Registration Process
The main card is a custom element registered as `inventree-card`. Unlike the adapter components, we don't create a separate element but instead modify the existing component to use Redux.

## Usage Tracking
The integration includes logging to track when the Redux-connected card is being used. This helps monitor the migration progress and identify any issues during the transition.

## Benefits
1. **Centralized State Management**: Configuration and state are managed centrally in Redux
2. **Controlled Migration**: The feature flag system enables gradual rollout and testing
3. **Improved Data Flow**: The top-down approach establishes a clear path for data flow
4. **Simplified Testing**: Redux state is more predictable and easier to test
5. **Foundation for Further Integration**: Sets the stage for remaining component migrations

## Testing Considerations
When testing the Redux-integrated main card, verify:
- Card configuration is properly stored in Redux
- Feature flags correctly control Redux connectivity
- Layout components receive configuration from Redux when appropriate
- State synchronization works correctly during transition
- Card renders correctly with both Redux and legacy components

## Next Steps
With the main card integrated with Redux, the focus shifts to:
1. Implementing the remaining layout adapters (ListLayout, PartsLayout)
2. Integrating Redux with core components for parts and parameters display
3. Enhancing the Redux store with additional actions and selectors

## Conclusion
The integration of Redux into the main `InventreeCard` component represents a significant milestone in the migration project. This change establishes a solid foundation for the remaining component integrations and sets up a clear path towards a fully Redux-based state management system. 