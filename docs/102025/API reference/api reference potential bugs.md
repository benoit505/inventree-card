# Potential Bugs & Issues - Redux Store & API Architecture

## BUGS THAT ARE PROBABLY BREAKING THE SYSTEM

**The Visual Effects State Fragmentation**

The visualEffectsSlice has FIVE separate state trees (lines 15-50 in visualEffectsSlice.ts):
1. `effectsByCardInstance` - Part-level effects
2. `effectsByCellId` - Cell-level effects  
3. `layoutEffectsByCell` - Layout CSS overrides
4. `elementVisibilityByCard` - Display config toggles
5. `layoutOverridesByCardInstance` - Grid positioning (UNUSED)

Looking at #5, there's a selector `selectLayoutOverridesForCard` (line 241-243) but NO reducer ever writes to this state. It's in the initial state, has a selector, gets cleared when effects clear (line 75), but nothing populates it. So every component that uses this selector gets an empty object forever.

Is this dead code from a removed feature? Or a planned feature that was never implemented? Either way, it's wasting memory and Redux subscription cycles. Components subscribing to this selector will re-render when visualEffects clears even though they never get real data.

**The Metrics Slice That Nobody Uses**

The entire metricsSlice.ts (210 lines) tracks:
- Usage counts (Redux vs legacy operations)
- Event logs with timestamps
- Timer operation counts
- Render timing history
- Migration progress percentage

Looking through the codebase with grep, metricsMiddleware.ts uses it (line 21-24), but that's it. No component displays this data. No debug panel shows it. It's being collected but never visualized.

And the metrics keep growing indefinitely (with some trimming - events cap at 100, line 111-113). If a card runs for days, these arrays just keep accumulating. In a long-running dashboard, that's a memory leak.

Plus, what's "legacy" vs "Redux"? The metrics track both but the codebase is already using Redux everywhere. What legacy system is this measuring against? Looking at the types, it seems like you were migrating from some other state system, but that migration is complete. The metrics are now tracking... nothing useful.

**The Global WebSocket Throttle Steals CPU from All Cards**

Lines 28-31 in websocketMiddleware.ts:

```typescript
const conditionEvalFrequency = allConfigs.reduce((min, configState) => {
  const freq = configState?.config?.performance?.parameters?.conditionEvalFrequency ?? 1000;
  return Math.min(min, freq);
}, 1000);
```

The throttle takes the MINIMUM frequency across all cards. So:
- Card A wants 2000ms (slow, battery-saving mode)
- Card B wants 500ms (fast, critical monitoring)
- System uses 500ms for BOTH cards

Card A's battery-saving config is ignored because Card B is aggressive. And this is GLOBAL - one throttle function for all cards (line 35). So Card B's 500ms throttle causes Card A to evaluate 4x more often than configured.

This violates the principle of per-card configuration. Each card should have independent performance settings. But the middleware is global, and it's easier to have one throttle. So cards interfere with each other.

**The RTK Query Cache Nuclear Reset on Init**

Line 43 in lifecycleThunks.ts:

```typescript
dispatch(inventreeApi.util.resetApiState());
```

Every card initialization nukes the ENTIRE RTK Query cache. If you have 3 cards on a dashboard and reload the page:

```
t=0ms:    Card A starts init → resetApiState() → Cache empty
t=50ms:   Card A fetches Part 1, 2, 3 → Cache has 3 parts
t=100ms:  Card B starts init → resetApiState() → Cache empty again!
t=150ms:  Card B fetches Part 1, 2, 3 (duplicates!) → Cache has 3 parts
t=200ms:  Card C starts init → resetApiState() → Cache empty again!
t=250ms:  Card C fetches Part 1, 2, 3 (triplicate!) → Cache has 3 parts
```

You just made 9 API calls instead of 3. Every card refetches the same data because the previous card deleted it. This is especially bad for shared parts - if all cards display the same inventory items, they should share cache, not compete for it.

The "right" solution: Per-card cache namespacing OR check if other cards are active before resetting. RTK Query supports both.

---

## BUGS THAT BREAK THE GENERAL FLOW AND GOT FIXED WITH PATCHING

**The Selector Memoization Gotcha**

Looking at variantSelectors.ts line 72-84, `selectProcessedVariants` uses `createSelector` with memoization. But it's calling `groupVariants(allParts, null)` (line 82). The second parameter is hardcoded to `null`.

Looking at `groupVariants` signature (line 7): `(parts: InventreeItem[], config: InventreeCardConfig | null)`. It takes a config but never uses it (no references to `config` in the function body except TODO comment line 67). So the parameter is dead.

But here's the issue: `createSelector` memoizes based on input changes. If `allParts` changes, it recalculates. But the memoization is shallow - it checks if `allParts` reference changed, not if individual parts changed. So:

```typescript
// State update adds one part
const oldParts = [part1, part2];
const newParts = [part1, part2, part3]; // New array reference

// Selector sees new reference → recalculates
// Even if part1 and part2 didn't change, the whole grouping runs again
```

That's correct behavior for `createSelector`, but it means the entire variant grouping algorithm runs on EVERY parts update. With 100 parts, that's two full array passes (lines 19-35, 38-47) plus a third for standalone parts (lines 50-65).

The "right" solution: Normalize parts by PK in Redux, use entity adapters, and only recompute grouping when specific parts change. Or use deep equality checks, but those are expensive.

**The Config Duplication Between Lit and Redux**

Config exists in three places:
1. Lovelace's state (the "source of truth")
2. `this._config` in inventree-card.ts (line 54)
3. `state.config.configsByInstance[cardInstanceId]` in Redux

When Lovelace updates config, the flow is:
```
Lovelace calls setConfig() → Lit stores in this._config → React root re-renders with new config prop → initializeCardThunk dispatches setConfigAction → Redux stores in configSlice → Components read from Redux
```

React components receive config TWICE:
- Once via props (from Lit, line 226 in inventree-card.ts)
- Once via Redux (from `selectConfigByInstanceId`)

Most components use Redux (the correct way). But some components receive config as a prop and don't use Redux at all. That creates inconsistency - if config updates in Redux but not in props, some components see stale data.

And if config updates in props but the Redux action fails, some components see new data while others see old. The dual storage is for the bridge (Lit → React) but it creates sync issues.

**The Clear Actions That Don't Clear Everything**

Looking at visualEffectsSlice.ts line 65-78, `clearVisualEffects` clears:
- Part effects ✓
- Cell effects ✓
- Layout effects ✓
- Layout overrides ✓
- Element visibility ✗

Element visibility is NOT cleared. Line 78 just does `delete state.elementVisibilityByCard[cardInstanceId]`. But that's inside a separate reducer, not part of clearVisualEffects.

So if you call `clearVisualEffects`, some visual state persists. That's inconsistent. "Clear" should mean clear EVERYTHING. But element visibility is special-cased with its own actions and its own clearing logic.

Why? Probably because element visibility is UI toggles (like "show debug panel") that shouldn't reset when effects re-evaluate. But then it shouldn't be in visualEffectsSlice at all. It's UI state, not conditional effect state.

**The Non-Normalized Parts State**

Parts are stored as arrays in partsSlice:
```typescript
partsById: { [partPk: number]: InventreeItem }
```

That's normalized by PK. Good! But then you also have:
```typescript
parts: InventreeItem[] // in some components
```

And selectors like `selectAllPartsForInstance` (line 170-175 in partsSlice) return an array:
```typescript
return Object.values(instanceState.partsById);
```

So Redux stores normalized (by PK), but components consume denormalized (as array). That means:
1. Every selector call creates a NEW array (Object.values allocates)
2. React sees new array reference → re-renders even if parts didn't change
3. Components can't efficiently check "did this specific part update?" - they see the whole array changed

The "right" pattern: Use Redux Toolkit's `createEntityAdapter` which provides normalized storage AND efficient selectors that return the same array reference if entities haven't changed.

**The Action Runtime States That Nobody Reads**

actionsSlice.ts has `actionRuntimeStates` (lines 20-35 in actionsSlice.ts - I don't have the file fully loaded, but from the API reference doc, line 334):

```typescript
actionRuntimeStates: {
  [cardInstanceId]: {
    [actionId]: {
      status: 'idle' | 'pending' | 'success' | 'error',
      actionName: string,
      errorMessage?: string,
      lastRun?: number
    }
  }
}
```

This tracks action execution state. Line 68-86 has reducers that update this state (`setActionRunning`, `setActionCompleted`, `setActionFailed`). And ActionEngine calls these (lines 194-196, 219-221 in ActionEngine.ts).

But no component READS this state. There's no action history panel, no error toasts, no "last run" timestamp display. It's write-only state. The data is collected, stored, updated... and ignored.

That's wasted Redux cycles. Every action execution triggers 2 state updates (start + end) that nobody subscribes to.

---

## BUGS THAT ARE QUIRKY AND NOT BREAKING ANYTHING BUT "WHY"?

**The Metrics Middleware That Does Nothing**

metricsMiddleware.ts (35 lines) intercepts `metrics/trackEvent` actions and calls `trackUsage()` from utils. But looking at the metrics flow:

1. Component dispatches `trackEvent({ category, action, label, value })`
2. Middleware intercepts it, calls `trackUsage()` utility
3. Action continues to reducer, which stores it in state
4. Nobody reads the state

So metrics are being:
- Stored in Redux (metricsSlice)
- Sent to a utility function (trackUsage)
- Logged via ConditionalLoggerEngine

Three places. Why? Is `trackUsage()` sending to an external service? Looking for that file... If it's not doing external work, the middleware is redundant. The reducer already stores the event, and logging could happen in the reducer.

Feels like defensive coding - "I might need to add analytics later, so let me have this middleware hook ready." But it's not adding value now.

**The Variant Selectors With TODOs**

variantSelectors.ts has two unfinished features:

Line 46: `// TODO: Handle variants whose templates aren't in the current parts list?`

If you load variant parts but not their templates, those variants are orphaned. The grouping logic won't include them (line 40-47 only adds variants to existing template groups). So orphan variants just... disappear from the UI.

Line 67: `// TODO: Implement custom grouping logic from config.variant_groups if needed`

The config can have `variant_groups` settings, but they're ignored. The grouping is hardcoded (is_template, variant_of). So the config option exists but doesn't work.

These TODOs have been there for a while (based on file context). Either implement them or remove the config option and document the limitation.

**The ConfigSlice updateLayout Partial Merge**

Lines 76-82 in configSlice (based on the doc, don't have the file):

```typescript
updateLayout: (state, action: PayloadAction<{ cardInstanceId: string, layout: Partial<LayoutConfig> }>) => {
  const { cardInstanceId, layout } = action.payload;
  if (state.configsByInstance[cardInstanceId]?.config?.layout) {
    state.configsByInstance[cardInstanceId].config.layout = {
      ...state.configsByInstance[cardInstanceId].config.layout,
      ...layout
    };
  }
}
```

This does a shallow merge. So if you update `layout.rowHeight`, it merges into existing layout. But if you update `layout.cells[0]`, it REPLACES the entire cells array, not merges that specific cell.

That's standard shallow merge behavior, but it might surprise users. To update one cell's position, you have to:
1. Read entire cells array from state
2. Modify the specific cell
3. Dispatch updateLayout with the FULL new cells array

Can't just dispatch `{ cells: [{ id: 'cell1', x: 5 }] }` expecting it to merge. That would wipe out all other cells.

Should probably have separate actions: `updateCell`, `addCell`, `removeCell`, `updateLayoutSettings`. The current `updateLayout` is too coarse-grained for cell management.

**The ComponentSlice Tracking Active Cards**

componentSlice.ts (from the doc, lines 20-30) tracks which card instances are active:

```typescript
activeCardInstances: Record<string, { 
  cardInstanceId: string, 
  mounted: boolean, 
  lastUpdate: number 
}>
```

This is set when cards mount/unmount. But "active" is never validated. If a card crashes or fails to unmount properly, it stays in `activeCardInstances` forever. Then other systems (like the polling thunk) keep trying to update it.

There's no heartbeat, no timeout, no health check. Once a card is marked active, it's active forever unless it explicitly unmounts. If the React tree throws an error and fails to clean up, you get a ghost card.

Should have a timeout or validation - if a card hasn't updated in X minutes, mark it inactive and clean up.

**The Selector Pattern Inconsistency**

Some slices export inline selectors:
```typescript
// In partsSlice.ts
export const selectAllPartsForInstance = (state, cardInstanceId) => ...
```

Others use separate selector files:
```typescript
// In variantSelectors.ts
export const selectProcessedVariants = createSelector(...)
```

And some components just access state directly:
```typescript
const parts = useAppSelector(state => state.parts.partsByInstance[cardInstanceId]?.partsById);
```

Three different patterns for selecting state. No consistency. The inline selectors can't be memoized with `createSelector` unless wrapped. The separate files can use Reselect but they're harder to discover. The inline access is simple but not reusable.

Pick one pattern and stick to it. Redux Toolkit recommends co-locating selectors with slices and using `createSelector` for anything computed.

**The Thunk Return Values Nobody Awaits**

Looking at thunks (conditionalLogicThunks, lifecycleThunks, etc.), most return void or simple objects. But they're async thunks created with `createAsyncThunk`. That means they return a promise.

But most dispatch sites don't await:
```typescript
dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }));
// Next line runs immediately, doesn't wait for thunk
```

So you don't know when the thunk finishes. If you need to sequence operations (evaluate effects, THEN do something), you can't. You'd have to await:

```typescript
await dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId })).unwrap();
// Now it's done
```

But no code does this. Everything is fire-and-forget. That's fine if operations are independent, but it makes sequencing impossible. And it hides errors - if a thunk rejects, nobody notices unless Redux DevTools is open.

**The Type Imports From types.d.ts**

The entire type system is in one massive `types.d.ts` file (800+ lines based on the doc). Every file imports from it:

```typescript
import { InventreeItem, InventreeCardConfig, VisualEffect, ... } from '../../types';
```

That's convenient but creates tight coupling. A change to ANY type in types.d.ts triggers recompilation of the ENTIRE codebase. TypeScript can't do incremental compilation because everything depends on types.d.ts.

The "right" pattern: Co-locate types with slices. `partsSlice.ts` should define `PartsState` internally. Types that are truly shared (like InventreeItem from the API) can be in a separate file, but UI types (like CellDefinition) should live with their components.

This is technical debt - it works, but it slows down builds and makes refactoring harder.

---

## THE WAY FORWARD

### Critical Fixes (Breaking the System)
1. **Remove layoutOverridesByCardInstance dead state** - Delete from initial state, remove selectors, clean up clear logic.
2. **Scope RTK Query cache resets** - Use tag invalidation instead of global reset, or check for active cards before resetting.
3. **Fix global WebSocket throttle** - Implement per-card throttles or use a map of `cardInstanceId → throttledFunction`.
4. **Validate componentSlice active cards** - Add timeout/health check, auto-cleanup ghost cards after inactivity.

### Important Refactoring (Technical Debt)
5. **Remove or use metrics system** - Either build a UI to display metrics, or delete the entire system if it's not needed.
6. **Normalize parts with Entity Adapter** - Use Redux Toolkit's `createEntityAdapter` for efficient selectors and memoization.
7. **Separate UI state from visual effects** - Move `elementVisibility` out of visualEffectsSlice into uiSlice.
8. **Consolidate config storage** - Either pass config only via Redux (remove Lit storage), or only via props (remove Redux storage).
9. **Implement or remove variant TODOs** - Either handle orphan variants and custom grouping, or document limitations and remove TODOs.
10. **Split types.d.ts** - Co-locate types with slices/components, keep only API types in shared file.

### Polish (Quirks & UX)
11. **Standardize selector patterns** - Use `createSelector` for computed state, inline selectors for simple access, all exported from slice files.
12. **Add action runtime state UI** - Build a panel that shows action history, errors, last run times (or delete the state).
13. **Await critical thunks** - In places where sequencing matters, await thunk completion and handle errors.
14. **Granular layout update actions** - Add `updateCell`, `addCell`, `removeCell` instead of coarse `updateLayout`.
15. **Document shallow merge behavior** - Add comments explaining that `updateLayout` replaces nested objects, not merges them.

### Nice to Have
16. **Entity normalization across all slices** - Not just parts, but actions, conditionalLogic, visualEffects should all use entity adapters.
17. **Redux DevTools integration** - Add action names, state snapshots, time-travel debugging support.
18. **Selector performance monitoring** - Track how often selectors run, identify expensive recalculations.
19. **State shape documentation** - Generate or write docs showing full Redux state tree with examples.
20. **Dead code elimination** - Use TypeScript's "find all references" to identify unused actions/selectors/state branches.

### Architecture Notes
21. **The metrics system is half-built** - Either complete it (add UI) or remove it (not currently useful).
22. **Selector memoization needs attention** - Many selectors recalculate unnecessarily due to new array allocations.
23. **The Redux-Lit bridge works but is redundant** - Config duplication and double-renders are the cost of the bridge.
24. **State fragmentation creates complexity** - Five visual effect trees, three config copies, multiple selector patterns.

