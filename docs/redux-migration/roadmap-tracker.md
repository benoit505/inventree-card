# Redux Migration Roadmap Tracker

## Current Phase: Phase 6: Final Migration & Cleanup

## Overall Progress: ~5% (Starting Phase 6)

## Completed Phases:
- [x] Phase 1: Redux Foundation - 100% Complete
- [x] Phase 2: State Management - 100% Complete
- [x] Phase 3: Component Integration - 100% Complete
  - [x] Base Layout Adapter implementation
  - [x] Grid Layout Adapter implementation
  - [x] Main Card Redux integration
  - [x] Part View Adapter implementation
  - [x] List Layout Adapter implementation and refinement
  - [x] Fixed component registration to avoid conflicts
  - [x] Parts Layout Adapter implementation
  - [x] Update testing infrastructure for connected components
  - [x] Variant Layout Adapter implementation
  - [x] Timer management refactoring (centralizing in Redux)
  - [x] Updated legacy TimerManager to prevent global instance creation when Redux is enabled
- [x] Phase 4: Parameter Functionality Implementation - 100% Complete
  - [x] Integrate API/WebSocket fetching for live parameter data into `parametersSlice`.
    - [x] Refactored `partsSlice` & `parametersSlice` state for normalization and loading status.
    - [x] Implemented `fetchParametersForPart` & `fetchParametersForReferencedParts` thunks.
    - [x] Updated `inventree-card.ts` to dispatch fetch on HASS load.
    - [x] Updated `websocketMiddleware` to update `parametersSlice` correctly.
    - [x] Corrected API endpoint for parameter fetching in `api.ts`.
    - [x] Added missing reducers for `fetchParametersForReferencedParts` in `parametersSlice`.
  - [x] Refine `parameterSelectors.ts` to handle cross-entity lookups for conditions.
    - [x] Implemented `resolveParameterValue` helper in selectors.
    - [x] Updated `selectVisualModifiers` & `selectPartVisibility` to use the resolver.
  - [x] Implement condition evaluation logic in components using live parameter data.
    - [x] Adapted layouts (`grid`, `list`, `parts`, `detail`, `variant`) to check parameter status, dispatch fetches, and handle loading states.
    - [x] Fixed `detail-layout` component update cycle to correctly display fetched parameters.
    - [x] Refactored `ReduxLitElement` to simplify store subscription and update triggering.
  - [x] Ensure parameter action buttons dispatch thunks to update values via API.
  - [x] Verify WebSocket parameter updates are correctly integrated. (Middleware dispatches action, reducer sets status to succeeded).
- [x] Phase 5: Search Integration - 100% Complete
  - [x] Search State Management (`searchSlice.ts` created).
  - [x] Search Thunk Implementation (`searchThunks.ts`, `api.searchParts` created).
  - [x] Search UI Component (`search-bar.ts` created).
  - [x] Integrate Search Bar (`parts-layout.ts` updated).
  - [x] Result Display Logic (`parts-layout.ts` filters based on results).
- [ ] Phase 6: Final Migration & Cleanup - 5% Complete (Started)

## Upcoming Tasks (Phase 6):
1.  **Final Code Review & Cleanup:**
    *   [x] Resolve issues with parameter display in `detail-layout`.
    *   [x] Refactor `ReduxLitElement` subscription logic.
    *   [x] Refactor components (`part-list`, `redux-example`) to remove `connectToRedux`.
    *   [ ] Review all components, slices, thunks, middleware for consistency, style, and best practices.
    *   [ ] Remove any remaining dead code, console logs, commented-out logic, or TODOs related to the migration.
    *   [ ] Ensure proper error handling and logging throughout.
2.  **Dependency Check:**
    *   [ ] Verify `package.json` and remove any unused dependencies introduced during the migration.
3.  **Documentation Update:**
    *   [ ] Update README.md and any other relevant documentation to reflect the new Redux architecture.
    *   [ ] Finalize `roadmap-tracker.md`.
4.  **Build & Testing:**
    *   [~] Perform a final production build (`npm run build`) - *Build currently passes*. 
    *   [ ] Conduct thorough end-to-end testing in Home Assistant across different configurations and browsers.
    *   [ ] Address any remaining bugs or performance issues.
5.  **Release Preparation:**
    *   [ ] Prepare release notes summarizing the migration and new features.
    *   [ ] Consider version bumping according to SemVer.

## Notes:
- Feature flags allow for gradual rollout and testing of Redux components
- Composition pattern is being used consistently for adapter implementation
- Main card now integrated with Redux to coordinate data flow
- Adapters are conditionally registered based on feature flags
- Part View Adapter now supports Redux state integration, with backward compatibility
- Fixed custom element registration to avoid conflicts in the browser
- Adapter component registration now has better error handling
- Parts Layout Adapter implemented with support for selected entities feature
- Testing infrastructure now in place for Redux components with unit and integration tests
- Variant Layout Adapter implemented with test coverage
- Timer management has been centralized in Redux for better state tracking and cleanup
  - TimerAdapter now provides transparent fallback when Redux isn't available
  - Fixed component registration bugs and improved error handling
  - Added metrics tracking for timer usage to monitor migration progress
  - Enhanced TimerManager to conditionally disable global instance when Redux timers are enabled
  - Updated Editor component to use TimerAdapter instead of direct TimerManager usage
- InventreeCard.ts identified as a high-priority target for refactoring and cleanup due to its size and complexity
- **Phase 4 COMPLETE:** Parameter functionality is fully implemented. Components dynamically load and use live parameter data for conditions and actions. WebSocket updates are integrated.
- **Phase 5 COMPLETE:** Search bar implemented using Redux state, thunks, and API integration. `parts-layout` updated to filter based on search results.
- **Phase 6 Focus:** Final review, cleanup, documentation, testing, and release preparation.
- **Guiding Principles:** Ensure stability, maintainability, and performance of the final migrated codebase.
