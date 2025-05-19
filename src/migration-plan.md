# Migration Plan: Eliminating InventTreeState and Fully Transitioning to Redux

## Overview

This document outlines our plan to completely replace the legacy `InventTreeState` singleton with Redux for state management in the InvenTree Card project. We will transition from a dual-system approach to a Redux-only approach.

## Current Status

- We have created adapter patterns that wrap both legacy components and state
- We use feature flags to conditionally enable Redux functionality
- Many components and services still directly reference `InventTreeState` for data
- The codebase is trying to maintain backward compatibility, causing complexity and bugs

## Migration Goals

1. **Complete elimination of `InventTreeState` singleton**
2. **Full transition to Redux for all state management**
3. **Simplified component architecture without dual implementation**
4. **Improved performance and reliability**

## Implementation Strategy

### Phase 1: Identify and Catalog All InventTreeState References ✅

1. ✅ Create an inventory of all files importing and using `InventTreeState`
2. ✅ Document all functionality provided by `InventTreeState` that must be migrated
3. ✅ Map each function/method to its Redux equivalent

### Phase 2: Create or Complete Redux State Slices

1. Ensure the following Redux slices are complete and functional:
   - `partsSlice.ts` - Part data storage and operations
   - `parametersSlice.ts` - Parameter storage and operations 
   - `uiSlice.ts` - UI state management
   - `timerSlice.ts` - Timer management
   - `renderingSlice.ts` - Rendering state

2. Implement selectors for all common data access patterns:
   - `getParts(entityId)`
   - `getPartById(partId)`
   - `getParameterValue(partId, paramName)`
   - `getFilteredParts(entityId, conditions)`

### Phase 3: Complete Component Adapters ✅

1. Ensure all component adapters are working correctly with Redux:
   - ✅ `BaseLayoutAdapter` - Updated to use Redux exclusively
   - ✅ `GridLayoutAdapter` - Updated to use Redux exclusively
   - ✅ `ListLayoutAdapter` - Updated to use Redux exclusively
   - ✅ `PartsLayoutAdapter` - Updated to use Redux exclusively
   - ✅ `VariantLayoutAdapter` - Updated to use Redux exclusively
   - ✅ `PartViewAdapter` - Updated to use Redux exclusively

2. ✅ Update adapter implementations to eliminate any calls to `InventTreeState`

### Phase 4: Service Adapters (In Progress)

1. Complete service adapters to redirect all functionality to Redux:
   - ✅ `ParameterServiceAdapter` - Updated to use Redux exclusively
   - `RenderingServiceAdapter`
   - `CardControllerAdapter`
   - `TimerAdapter`

2. Update service adapters to eliminate any calls to `InventTreeState`

### Phase 5: Remove Dual Implementation (Started)

1. ✅ Remove feature flag conditionals from adapters (Done for all layout adapters)
2. Update component registration to only use Redux-connected versions
3. ✅ Simplify adapter logic to only use Redux (Done for all layout adapters)
4. Remove legacy code paths

### Phase 6: Clean Up

1. Delete the `inventree-state.ts` file
2. Remove references and imports to `InventTreeState` throughout the codebase
3. Update documentation to reflect the new architecture

## Implementation Plan by File

### Critical Files to Update

1. `src/components/common/base-layout.ts` ✅
   - ✅ Replace `InventTreeState` usage with `StateAdapter` or direct Redux selectors
   - ✅ Update `_loadData()` method to use Redux store
   - ✅ Update `getParts()` method to use Redux
   - ✅ Update caching mechanism to use Redux

2. `src/inventree-card.ts` ✅
   - ✅ Remove `_state` instance variable
   - ✅ Update event handlers to dispatch Redux actions
   - ✅ Replace state methods with Redux

3. `src/services/*.ts`
   - Update all services to use Redux for state
   - Service adapters should serve as interfaces to Redux

4. `src/adapters/*.ts`
   - ✅ Complete all adapter implementations for layout components
   - ✅ Remove conditional feature flag checks from all layout adapters

## Progress Update

So far, we have:

1. ✅ Created a comprehensive migration plan
2. ✅ Converted `BaseLayoutAdapter` to use Redux exclusively
3. ✅ Converted `ParameterServiceAdapter` to use Redux exclusively
4. ✅ Converted `GridLayoutAdapter` to use Redux exclusively
5. ✅ Converted `ListLayoutAdapter` to use Redux exclusively
6. ✅ Converted `PartsLayoutAdapter` to use Redux exclusively
7. ✅ Converted `VariantLayoutAdapter` to use Redux exclusively
8. ✅ Converted `PartViewAdapter` to use Redux exclusively
9. ✅ Removed dual implementation from all layout adapters
10. ✅ Added proper usage tracking for metrics
11. ✅ Updated `BaseLayout` component to use Redux directly
12. ✅ Updated main `inventree-card.ts` component to use Redux exclusively

Next steps:
1. ✅ Completed all component adapters
2. ✅ Update `BaseLayout` to use Redux directly
3. ✅ Update `inventree-card.ts` main component
4. Complete the migration for remaining service adapters

## Breaking Changes

The following breaking changes are expected:

1. Components directly accessing `InventTreeState` will need to be updated
2. Custom functionality that extends `InventTreeState` will need to be reimplemented
3. Events that relied on `InventTreeState` will need to be rewritten

## Timeline

1. Phase 1 (Identification): ✅ Completed
2. Phase 2 (Redux Slices): 2-3 days
3. Phase 3 (Component Adapters): ✅ Completed
4. Phase 4 (Service Adapters): 2-3 days (In progress)
5. Phase 5 (Remove Dual Implementation): 1-2 days (Started)
6. Phase 6 (Clean Up): 1 day

Total estimated time: 9-13 days

## Testing Strategy

1. Unit tests for each Redux slice
2. Integration tests for adapter components
3. End-to-end tests for core workflows
4. Performance benchmarking before and after

## Rollback Plan

If issues arise, we will:

1. Revert to the adapter-based dual implementation
2. Address specific issues
3. Retry the migration with fixes

## Conclusion

This plan provides a systematic approach to transitioning from `InventTreeState` to Redux while maintaining functionality. By removing the dual implementation, we will simplify the codebase and eliminate many potential bugs and inconsistencies. 