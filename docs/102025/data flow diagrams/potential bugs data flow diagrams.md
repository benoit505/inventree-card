# Potential Bugs & Issues - Data Flow & Integration

## BUGS THAT ARE PROBABLY BREAKING THE SYSTEM

**The Race Condition in Card Initialization**

The `initializeCardThunk` (lifecycleThunks.ts lines 24-100) dispatches multiple async operations but doesn't await most of them. Looking at the stages:

- STAGE 1: `dispatch(actionsSlice.actions.setActionDefinitions())` - synchronous
- STAGE 2: `dispatch(initializeWebSocketPlugin())` - async, not awaited
- STAGE 3: `dispatch(processHassEntities())` - async, not awaited  
- STAGE 4: `forEach(pk => dispatch(inventreeApi.endpoints.getPartParameters.initiate()))` - async, not awaited

Then the thunk immediately resolves, triggering the `.then()` callback in inventree-card.ts (line 156) which mounts React. But STAGE 2-4 are still running! React renders before:
- WebSocket is connected
- HA entities are fetched
- Parameters are loaded

This WOULD be catastrophic except you've designed around it. The parts split (HA vs API) handles this gracefully:
- HA parts load fast (STAGE 3) → Components render with basic data ✓
- API parts load slow → Components enhance with full data ✓

But for components that REQUIRE API data (complex actions, parameter-based logic), they're trying to run before data arrives. Looking at ActionEngine line 306-309, if parameters aren't cached, parameter updates fail silently. That's a race condition between initialization and user interaction.

**The fix:** Either await critical data loads before mounting, OR add loading state checks in components that need full data.

**The Global API Cache Reset**

Line 43 in lifecycleThunks.ts:

```typescript
dispatch(inventreeApi.util.resetApiState());
```

This nukes the ENTIRE RTK Query cache for ALL endpoints. If you have multiple cards on a dashboard:
- Card A initializes, resets cache
- Card B was using cached data from a previous load
- Card B's cache is now empty, has to refetch everything
- Card B initializes, resets cache
- Card A's data is wiped

If cards initialize in quick succession (common on page load), they keep wiping each other's caches. Every card refetches the same data because previous cards deleted it.

This should be instance-scoped or at least check if other cards are active before nuking shared cache. RTK Query supports tag-based invalidation - use that instead of `resetApiState()`.

**The First Evaluation Always Fails with Auto-Fetch**

Lines 110-119 in evaluateExpression.ts auto-fetch missing data but return `undefined` for the current evaluation. So:

```markdown:/home/benoit/projects/inventree-card/docs/102025/data flow diagrams/potential bugs data flow diagrams.md
<code_block_to_apply_changes_from>
Rule: part_145_stock < 10
First eval: part 145 not cached → auto-fetch → return undefined → undefined < 10 → false
Second eval: part 145 cached → return 50 → 50 < 10 → false (correct)
```

But what if stock IS actually < 10? First eval says "not low stock" (false). Second eval says "not low stock" (false, but correctly). User never sees the low stock effect UNTIL the next evaluation after data loads.

And if there's no automatic re-evaluation trigger (WebSocket down, polling disabled), the rule stays false forever even though data is now cached. You fetched the data but never used it.

**The fix:** Schedule immediate re-evaluation after auto-fetch completes, OR make evaluation async and await the fetch.

**The Stale API Response Overwrites Fresh HA Data**

This is the REAL race condition. Your parts split is intentional and smart, but there's still a timing issue:

```
t=0ms:    Card loads → API fetch starts for Part 123
t=10ms:   HA sensor updates → Part 123 { in_stock: 10, name: "Rice", source: 'hass' }
t=50ms:   User sees stock: 10 ✓
t=500ms:  API response arrives → Part 123 { in_stock: 8, ..., source: 'api' }
          (API data captured at t=-500ms, BEFORE the HA update)
t=501ms:  partsSlice.addApiPart() merges → in_stock: 8 (from API)
          User now sees stock: 8 ✗ (Went backwards!)
```

Looking at your merge logic (lines 55-64 in partsSlice):

```typescript
instanceState.partsById[part.pk] = {
  ...existingPart,  // Has: in_stock: 10 (from HA)
  ...part,          // Has: in_stock: 8 (from API)
  source: 'api',
};
// Result: in_stock: 8 (API overwrites HA)
```

The shallow merge with last-write-wins doesn't account for data timestamps. API data is complete but potentially stale. HA data is partial but real-time.

**Possible fix:** Field-level priorities or timestamps:

```typescript
addApiPart(state, action) {
  const existingPart = instanceState.partsById[part.pk];
  
  // If HA data exists and is recent, preserve real-time fields
  if (existingPart?.source === 'hass' && 
      existingPart._lastUpdate && 
      (Date.now() - existingPart._lastUpdate) < 5000) {
    // API provides complete data, but preserve HA's real-time stock
    instanceState.partsById[part.pk] = {
      ...part,                          // Full API data
      in_stock: existingPart.in_stock,  // But keep HA's real-time value
      source: 'hybrid',                 // Mark as mixed-source
      _lastUpdate: Date.now(),
    };
  } else {
    // Normal merge - API data is fresh
    instanceState.partsById[part.pk] = {
      ...existingPart,
      ...part,
      source: 'api',
      _lastUpdate: Date.now(),
    };
  }
}
```

But honestly, if you're not seeing this in practice, maybe the timing works out naturally.

---

## BUGS THAT BREAK THE GENERAL FLOW AND GOT FIXED WITH PATCHING

**The Progressive Loading Architecture (Not a Bug, But Misunderstood)**

I initially called the parts split a "Dual State Sync Failure" but that's WRONG. Your architecture is actually smart:

**HA Parts:**
- Purpose: Fast initial render with "good enough" data
- Load time: ~10-50ms
- Data: Limited (name, stock, basic fields from sensors)
- Source of truth: Home Assistant state
- Philosophy: "Show something immediately, even if incomplete"

**API Parts:**
- Purpose: Full-featured data for complex operations
- Load time: 200-2000ms
- Data: Complete (parameters, relationships, all fields)
- Source of truth: InvenTree REST API
- Philosophy: "Progressive enhancement - add details as they arrive"

This ISN'T dual state causing sync issues. It's **intentional graceful degradation** with **progressive enhancement**. The `source` field isn't for debugging - it's for **capability detection**:

```typescript
if (part.source === 'hass') {
  // Render simple view - limited data available
  // Don't try to access parameters or complex fields
}

if (part.source === 'api' || part.source === 'hybrid') {
  // Full-featured rendering - all data available
  // Can use conditional logic on parameters
}
```

Your unification attempts failed because you were trying to treat fundamentally different data types the same way. The split lets components adapt to available data. That's elegant.

**The Throttled Evaluation Creates 1-Second Lag**

Line 35-38 in websocketMiddleware.ts:

```typescript
throttledEvaluateEffects = throttle(() => {
  storeAPI.dispatch(evaluateEffectsForAllActiveCardsThunk()); 
}, conditionEvalFrequency, { leading: false, trailing: true });
```

`{ leading: false, trailing: true }` means:
- Event happens → Wait N ms → Evaluate
- More events during wait → Ignored
- Wait ends → If more events happened, wait again

So you're ALWAYS at least 1 second behind real-time (with default 1000ms frequency). If HA state changes rapidly:
```
t=0ms: light.turn_on → Start 1000ms timer
t=500ms: light.brightness_set → Ignored (within throttle window)
t=1000ms: Timer fires → Evaluate (sees light on, old brightness)
t=1001ms: temperature changes → Start new 1000ms timer
t=2001ms: Timer fires → Evaluate (sees correct brightness, new temp)
```

You never see the brightness change effect because it was throttled away. The evaluation at t=1000ms didn't include it.

This is patched with throttling to prevent evaluation storms, but it causes lag. The "right" solution would be debouncing (wait for events to stop) or batching (collect events, then evaluate once). Current throttling just drops events.

**The Polling Fallback Refetches Everything**

Lines 44-67 in conditionalLogicThunks.ts. When WebSocket is down:

```typescript
dispatch(inventreeApi.util.invalidateTags(['Part', 'PartParameters']));

for (const key in queries) {
  const query = queries[key];
  if (query && (query.endpointName === 'getPart' || query.endpointName === 'getPartParameters') && query.status === 'fulfilled') {
    // Force refetch ALL fulfilled queries
    dispatch(endpoint.initiate(query.originalArgs, { forceRefetch: true }));
  }
}
```

This loops through EVERY fulfilled query in the cache and force-refetches. If you have:
- 3 cards on dashboard
- Each card has 50 parts
- Each part has parameters

That's 150 `getPart` calls + 150 `getPartParameters` calls = 300 API requests every 30 seconds (default polling interval).

And this happens for ALL cards even if only ONE card actually needs the data. The polling is global but data needs are per-card.

This is patched to guarantee data freshness when WebSocket fails, but it's a sledgehammer. The "right" solution would be per-card polling or selective invalidation based on what's actively displayed.

**The Post-Evaluation Nuclear Re-Evaluation**

Lines 226-233 in ActionEngine.ts:

```typescript
if (actionDef.postEvaluationLogicIds && actionDef.postEvaluationLogicIds.length > 0) {
  logger.debug('executeAction', `Triggering post-evaluation logic for action '${actionId}'.`);
  const activeInstances = selectActiveCardInstanceIds(store.getState());
  activeInstances.forEach(id => {
    store.dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId: id }));
  });
}
```

The action has a `postEvaluationLogicIds` array that SHOULD specify which logic items to re-evaluate. But the code just checks if the array is non-empty and then re-evaluates EVERYTHING for ALL cards.

So if you click "Add Stock to Part 123" and specify `postEvaluationLogicIds: ['stock-level-check']`, the system ignores that and re-evaluates:
- All logic items
- For all parts  
- For all active cards

That's hundreds or thousands of rule evaluations when you only needed to check one. This is patched to ensure effects update after actions, but it's wildly inefficient.

**The Double-Render from hass Prop Updates**

When HA state changes, FLOW 2 has these steps:

```
Lovelace updates hass prop → updated() calls _mountOrUpdateReactApp()
        ↓
React re-renders with new hass → useEffect detects hass change
        ↓
dispatch(fetchHaEntityStatesThunk()) → Updates Redux
        ↓
websocketMiddleware intercepts → throttledEvaluateEffects()
        ↓
evaluateAndApplyEffectsThunk() → Updates visualEffects
        ↓
Components re-render with new effects
```

Count the renders:
1. _mountOrUpdateReactApp() forces React root re-render
2. Redux state update causes subscribed components to re-render
3. Visual effects update causes another re-render

That's 3 renders for one HA state change. And step 1 is IMMEDIATE (no throttling), but step 3 is throttled (1 second delay). So you get:
- t=0ms: Render with new hass object (effects are old)
- t=1000ms: Render with new effects

The UI updates twice. First render shows stale visual effects. Second render shows correct effects. That's why you see flickers or delayed reactions.

This is patched because there's no clean way to sync Lit prop updates with Redux updates. They're different systems. The "right" solution would be to NOT re-render React on every hass update, only when specific entities change.

---

## BUGS THAT ARE QUIRKY AND NOT BREAKING ANYTHING BUT "WHY"?

**The Unnecessary ReactRoot Recreation Check**

Line 236-239 in inventree-card.ts:

```typescript
if (!this.reactRoot) {
  this.reactRoot = createRoot(mountPoint);
  this.logger.info('_mountOrUpdateReactApp', 'New React root created.');
}
this.reactRoot.render(React.createElement(ReactApp, props));
```

React root is created once and reused. But `updated()` calls `_mountOrUpdateReactApp()` on EVERY hass change (line 175-180). So you're calling `root.render()` dozens of times per second when HA is active.

React 18's `root.render()` is designed for this (concurrent rendering), but it's still unnecessary work. The hass object could be passed via Context or props without forcing root-level renders.

This doesn't break anything (React handles it fine), but it's inefficient. Every hass update renders the ENTIRE React tree from root, even if only one component needs the new hass data.

**The Config in Two Places**

Config is stored in:
1. Lit element: `this._config`
2. Redux: `state.config.configsByInstance[cardInstanceId]`

The Lit element gets config from Lovelace via `setConfig()` (line 78 in inventree-card.ts). It then passes config to React as a prop (line 226). React also reads config from Redux (various components use `selectConfigByInstanceId`).

So config exists in three places:
1. Lovelace's state (outside your control)
2. Lit element state
3. Redux state

If Lovelace updates config, Lit's `setConfig()` is called, which dispatches to Redux (via initializeCardThunk → setConfigAction). But React also receives new config via props. So React sees the config update TWICE:
- Once via props (from Lit)
- Once via Redux (from the dispatch)

Both trigger re-renders. That's two renders for one config change. Not broken, just redundant.

**The WebSocket Event Type Parsing**

Lines 79-82 in websocketMiddleware.ts:

```typescript
if (typeof message === 'object' && message !== null && 
    message.type === 'event' && 
    typeof message.event === 'string' && 
    typeof message.data === 'object' && message.data !== null) {
```

This is careful type checking. But then line 84-85:

```typescript
const eventName = message.event;
const eventData = message.data;
```

No further validation on eventName or eventData structure. If InvenTree sends malformed event data, the parsing on lines 90-95 could fail:

```typescript
const paramData = eventData as EnhancedParameterEventData;
const partId = paramData.part_pk;
```

If `eventData` doesn't have `part_pk`, `partId` is undefined. Then line 95:

```typescript
if (partId !== undefined && parameterInstancePk !== undefined && paramValue !== undefined) {
```

This checks for undefined, so bad data is safely ignored. But it's silent failure. If InvenTree changes event structure, your updates stop working with no error.

Better to validate against a schema and log warnings for unexpected structures.

**The Throttle Configuration Recalculation**

Line 50-53 in websocketMiddleware.ts:

```typescript
if (actionWithType.type === 'config/setConfigAction') {
  logger.info('middleware', 'Config changed, re-initializing throttled evaluator.');
  initializeThrottledEvaluator(storeAPI);
}
```

Every time ANY card's config changes, the throttle evaluator is recreated for ALL cards. Line 28-31 in initializeThrottledEvaluator:

```typescript
const allConfigs = Object.values(state.config.configsByInstance);
const conditionEvalFrequency = allConfigs.reduce((min, configState) => {
  const freq = configState?.config?.performance?.parameters?.conditionEvalFrequency ?? 1000;
  return Math.min(min, freq);
}, 1000);
```

It takes the MINIMUM frequency across all cards. So if you have:
- Card A: 1000ms throttle
- Card B: 500ms throttle (more frequent)
- Card C: 2000ms throttle (less frequent)

The system uses 500ms for ALL cards. Card C wanted 2-second throttling to save CPU, but it gets 500ms because Card B is more aggressive.

This is global state from per-card config. Why not have per-card throttles? Probably because the middleware is global and it's easier to have one throttle function. But it means card configs interact in unexpected ways.

**The Parts Source Field as Feature Flag**

The `source` field on parts (`'hass'`, `'api'`, `'hybrid'`) is actually being used as a capability detector, but it's not documented or validated anywhere. Components COULD check:

```typescript
if (part.source === 'hass') {
  // Limited data - don't show complex features
  return <SimplePartView part={part} />;
}
```

But looking through the codebase, I don't see this pattern used consistently. Most components just try to access fields and fail silently if they're undefined. The source field exists but isn't leveraged for adaptive rendering.

It's a smart architectural feature that's underutilized. Could be powerful if components actually adapted their UI based on data availability.

---

## THE WAY FORWARD

### Critical Fixes (Breaking the System)
1. **Await critical initialization stages** - Don't mount React until WebSocket is connected and HA entities are fetched.
2. **Scope API cache resets** - Use tag-based invalidation instead of `resetApiState()` nuclear option.
3. **Fix auto-fetch evaluation** - Schedule immediate re-evaluation after auto-fetch completes.
4. **Add field-level update strategy** - Prevent stale API data from overwriting fresh HA data (if you're seeing this in practice).

### Important Refactoring (Technical Debt)
5. **Replace throttling with debouncing** - Wait for events to stop firing before evaluating, don't drop events.
6. **Selective polling** - Only refetch data for visible/active cards, not everything in cache.
7. **Implement selective post-evaluation** - Actually use `postEvaluationLogicIds` array instead of re-evaluating everything.
8. **Reduce double-renders** - Pass config via Context, not both props AND Redux.
9. **Per-card throttle configuration** - Don't let Card B's aggressive throttle affect Card C's conservative one.
10. **Document the parts architecture** - Explain HA vs API parts, progressive loading, why unification failed.

### Polish (Quirks & UX)
11. **Validate WebSocket event schemas** - Log warnings for malformed data, don't silently ignore.
12. **Optimize React root renders** - Use Context for hass updates instead of root-level re-renders.
13. **Leverage source field for adaptive rendering** - Make components check `part.source` and render appropriately.
14. **Add visual loading states** - Show when data is being progressively loaded (HA data present, API data pending).
15. **Add evaluation metrics** - Track evaluation timing, identify slow rules, show performance stats.

### Nice to Have
16. **Smart cache invalidation** - Tag-based invalidation tied to what's actually being displayed.
17. **Retry logic for failed fetches** - Don't silently fail on network errors, retry with exponential backoff.
18. **Background sync indicator** - Show when WebSocket is down and polling is active.
19. **Field-level timestamps** - Track when each field was last updated for true eventual consistency.
20. **Evaluation result caching** - Don't re-evaluate rules if inputs haven't changed since last evaluation.

### Architecture Validation Points
21. **The parts split is GOOD** - It's not a bug, it's progressive loading + graceful degradation.
22. **The dual storage makes sense** - RTK Query for API data, partsSlice for merged state with HA.
23. **The merge strategy works** - Just needs timestamp awareness to prevent stale overwrites.
```

This version correctly characterizes your parts architecture as a smart design choice, not a bug! The key change is in the "BUGS THAT BREAK THE GENERAL FLOW" section where I clarify that the split is intentional and elegant.


