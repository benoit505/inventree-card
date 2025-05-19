# Main Card Redux Integration

## Overview

The integration of Redux into the main `inventree-card.ts` component represents a significant milestone in the Redux migration roadmap. As the top-level component that orchestrates the entire card's functionality, connecting the main card to Redux establishes a complete data flow path from the Redux store to the UI components.

## Implementation Approach

For the main card integration, we chose the direct integration approach by extending `ReduxLitElement` instead of using the adapter pattern. This decision was made because:

1. The card component is the entry point for the application and needs direct control over the Redux store
2. It's responsible for handling configuration changes and initializing other components
3. It needs to conditionally render different layout components based on feature flags

## Key Implementation Details

### Redux Connection

The main card component now:

1. Extends `ReduxLitElement` instead of `LitElement`
2. Connects to the Redux store in the `connectedCallback` lifecycle method
3. Maps Redux state to component properties using selectors
4. Conditionally dispatches actions based on feature flags

### Feature Flag Control

The integration is controlled by the new `useReduxForCard` feature flag, which is enabled in Phase 3 of the migration. This allows for:

1. Gradual adoption of Redux in the main component
2. Testing the Redux integration without affecting existing functionality
3. Easy rollback if issues are encountered

### State Management

The main card now maintains dual state management:
- Uses Redux store when feature flags are enabled
- Falls back to legacy state management when flags are disabled

This ensures backward compatibility while allowing for incremental migration.

## Code Examples

The key changes to the main card component include:

```typescript
// Changed from LitElement to ReduxLitElement
export class InventreeCard extends ReduxLitElement {
  // Redux state properties
  @property({ type: Object }) reduxState: RootState | null = null;
  @property({ type: Boolean }) connected: boolean = false;
  @property({ type: Object }) featureFlags: FeatureFlags = defaultFeatureFlags;
  
  // Connect to Redux store in connectedCallback
  connectedCallback() {
    super.connectedCallback();
    
    if (this.featureFlags.useReduxForCard) {
      this.connectToRedux();
      this.logReduxUsage('InventreeCard');
    }
  }
  
  // Conditionally use Redux-connected components
  protected render() {
    if (this.featureFlags.useConnectedComponents) {
      return html`
        <!-- Redux-connected components -->
      `;
    } else {
      return html`
        <!-- Legacy components -->
      `;
    }
  }
}
```

## Benefits

The integration of Redux into the main card component provides several benefits:

1. **Centralized State Management**: Configuration, UI state, and data are now managed through Redux
2. **Predictable Data Flow**: Clear, unidirectional data flow from the store to UI components
3. **Improved Debugging**: Redux DevTools can now track the entire application state
4. **Feature Flag Control**: Gradual rollout with easy rollback capability
5. **Simplified Testing**: Components can be tested in isolation with mocked Redux state

## Testing Considerations

When testing the main card Redux integration, verify:

1. The card correctly connects to Redux when feature flags are enabled
2. Configuration changes are correctly dispatched to the Redux store
3. UI updates properly when Redux state changes
4. Legacy behavior is maintained when feature flags are disabled
5. Error handling works as expected when Redux operations fail

## Next Steps

Following the main card integration, the next steps in the Redux migration include:

1. Implementing the List Layout Adapter
2. Implementing the Parts Layout Adapter
3. Adding Redux state connections to additional core components
4. Updating the testing infrastructure for connected components

## Conclusion

The integration of Redux into the main card component represents a significant step forward in the Redux migration process. With the main card now connected to Redux, we have established a complete data flow path from the Redux store to the UI, allowing for more predictable state management and improved debugging capabilities. 