# Data Flow Diagrams - Raw Observations & Reflections

Alright, time to trace the blood flow through this beast. Data flows are where all the subsystems connect, and where the architectural decisions become visible. Let me walk through every major flow in this system.

## FLOW 1: Card Initialization (The Birth of a Card)

```
User adds card to dashboard
        ↓
Lovelace calls setConfig() on Lit element
        ↓
inventree-card.ts generates stable cardInstanceId
        ↓
firstUpdated() triggers → dispatch(initializeCardThunk())
        ↓
lifecycleThunks.ts: initializeCardThunk runs
```

Now inside the thunk (lines 24-100 in lifecycleThunks.ts), it's a 5-stage rocket launch:

**STAGE 0: Config & Registration**
- `dispatch(setConfigAction())` - Store config in Redux
- `dispatch(registerComponent())` - Track this card globally
- `dispatch(inventreeApi.util.resetApiState())` - Clear any stale API cache

**STAGE 1: Synchronous Setup**
- `dispatch(parametersSlice.actions.clearCache())` - Reset parameters
- `dispatch(actionsSlice.actions.setActionDefinitions())` - Load action configs
- `dispatch(initializeRuleDefinitionsThunk())` - Load conditional logic rules

**STAGE 2: Async API Init**
- If direct_api enabled → `dispatch(initializeWebSocketPlugin())` - Connect WebSocket
- Otherwise relies on HA's WebSocket

**STAGE 3: HASS Data Processing (THE FAST PATH)**
- `dispatch(processHassEntities())` - Fetch HA sensor data
- `dispatch(initializeGenericHaStatesFromConfig())` - Subscribe to HA entities
- **This is where HA parts load - happens in ~10-50ms**

**STAGE 4: Parameter Prefetching (THE SLOW PATH)**
- Loop through `config.data_sources.inventree_parameters_to_fetch`
- For each config: `dispatch(inventreeApi.endpoints.getPartParameters.initiate())`
- This populates RTK Query cache
- **API parts load here - takes 200-2000ms depending on network**

Then the flow continues:

```
initializeCardThunk completes
        ↓
.then() callback in inventree-card.ts (line 156-167)
        ↓
Call _mountOrUpdateReactApp()
        ↓
Create React root, render ReactApp with props
        ↓
ReactApp → Provider → PersistGate → AppContent → InventreeCard.tsx
        ↓
InventreeCard renders layout (TableLayout or PartsLayout)
```

**HERE'S THE KEY ARCHITECTURAL DECISION:**

The thunk doesn't await STAGE 3 or STAGE 4. React mounts while data is still loading. This WOULD be a race condition disaster, except for the progressive loading architecture:

```
t=0ms:    React mounts → Layout renders → Parts array is empty
t=10ms:   HA parts arrive → partsSlice updated with { source: 'hass' }
t=15ms:   Components re-render → Show HA parts (name, stock, basic data)
          USER SEES SOMETHING FAST ✓
t=500ms:  API parts arrive → partsSlice merges with { source: 'api' }
t=505ms:  Components re-render → Show enhanced parts (full data, parameters)
          USER SEES COMPLETE DATA ✓
```

**This is progressive enhancement, not a race condition.** The card is usable at t=15ms with "good enough" data, then enhances itself at t=505ms with complete data.

## FLOW 2: Home Assistant State Updates (The Heartbeat)

This is the most frequent flow - happens every time ANY HA entity changes:

```
HA entity state changes
        ↓
Lovelace updates hass object on Lit element
        ↓
inventree-card.ts: updated() lifecycle called
        ↓
Check if 'hass' prop changed (line 175)
        ↓
Call _mountOrUpdateReactApp() with new hass
        ↓
React re-renders with new hass prop
        ↓
InventreeCard.tsx: useEffect detects hass change (line 74-86)
        ↓
dispatch(fetchHaEntityStatesThunk({ hass, entityIds: ... }))
        ↓
genericHaStateThunks.ts: Loop through entities
        ↓
For each: dispatch(setEntityState({ entity_id, state, attributes }))
        ↓
genericHaStateSlice updates Redux state
        ↓
websocketMiddleware intercepts setEntityState action (line 56-71)
        ↓
Middleware calls throttledEvaluateEffects() (throttled to 1000ms by default)
        ↓
After throttle delay: dispatch(evaluateEffectsForAllActiveCardsThunk())
        ↓
For each active card: dispatch(evaluateAndApplyEffectsThunk({ cardInstanceId }))
        ↓
conditionalLogicThunks.ts: evaluateAndApplyEffectsThunk runs
        ↓
Create ConditionalEffectsEngine instance
        ↓
engine.evaluateAndApplyEffects() - The big evaluation loop
```

Inside the effects engine (ConditionalEffectsEngine.ts):

```
Clear all previous effects (line 186-187)
        ↓
Loop through logic items → For each logic pair:
        ↓
    If generic rule (no part_ or inv_param_ fields):
        → evaluateExpression() once
        → If true: applyEffectsToTargets() → dispatch effects
        ↓
Loop through all parts → For each part, for each logic item:
        ↓
    If part-specific rule:
        → evaluateExpression(part) with part context
        → If true: applyEffectsToTargets() → dispatch effects
        ↓
dispatch(setConditionalPartEffectsBatch({ effectsMap }))
        ↓
visualEffectsSlice updates state
        ↓
Components subscribed to visual effects re-render
        ↓
CellRenderer merges part effects + cell effects
        ↓
Applies styles, animations via Framer Motion
        ↓
User sees updated visuals
```

The throttling (line 35-38 in websocketMiddleware) is CRITICAL. Without it, every HA state change would trigger full re-evaluation. With throttling, multiple changes in 1 second get batched into one evaluation. But the throttle is `{ leading: false, trailing: true }` which means:
- First change: Waits 1000ms then evaluates
- Changes during wait: Ignored
- Final change after wait ends: Triggers new wait

So rapid changes can cause lag - you're always 1 second behind the latest state.

## FLOW 3: User Actions (Button Clicks → External Effects)

```
User clicks button in UI
        ↓
CellRenderer / PartButtons / GlobalActionButtons
        ↓
onClick handler: ActionEngine.executeAction(actionId, context, cardInstanceId)
        ↓
ActionEngine.ts: executeAction() runs
```

Inside ActionEngine (lines 188-234):

```
Check if action already executing (infinite loop prevention)
        ↓
Fetch action definition from Redux (selectActionDefinitionForInstance)
        ↓
If confirmation configured:
    → processTemplate(confirmation.textTemplate, context)
    → confirm() dialog (BLOCKS until user responds)
    → If cancelled: return early
        ↓
handleOperation() based on operation.type
```

For each operation type:

**call_ha_service:**
```
processTemplate(dataTemplate, context) → templated data
processTemplate(target, context) → templated target
Split service string on '.' → domain + serviceName
hass.callService(domain, serviceName, { ...target, ...data })
        ↓
Request sent to Home Assistant → HA processes → State changes
        ↓
HA state change flows back through FLOW 2 above
        ↓
Visual effects update to reflect the action result
```

**update_inventree_parameter:**
```
Resolve partIdContext ('current' | PK | template)
Fetch parameters from RTK Query cache
Find parameter by name
dispatch(inventreeApi.endpoints.updatePartParameter.initiate())
        ↓
RTK Query: Fire and forget (no optimistic update)
        ↓
API request → InvenTree processes → WebSocket event fires
        ↓
WebSocket event flows through FLOW 4 below
        ↓
Parameter updated in Redux → Visual effects re-evaluated
```

**dispatch_redux_action:**
```
Check actionManifest whitelist
Get action creator function
processTemplate(payloadTemplate, context)
dispatch(actionCreator(payload))
        ↓
Redux reducer handles action → State changes
        ↓
Components re-render based on selector subscriptions
```

**trigger_conditional_logic:**
```
dispatch(evaluateAndApplyEffectsThunk) for all active cards
        ↓
Flows into FLOW 2 evaluation chain
```

After operation completes:

```
Check if action.postEvaluationLogicIds is non-empty
        ↓
If yes: dispatch(evaluateAndApplyEffectsThunk) for all active cards
        ↓
Flows into FLOW 2 evaluation chain again
```

So user actions can trigger DOUBLE evaluation - once from the action itself, once from postEvaluation. And if the action changes HA state, that's a TRIPLE evaluation via FLOW 2.

## FLOW 4: WebSocket Real-Time Updates (The Live Feed)

Two WebSocket sources: InvenTree (optional) and Home Assistant (always present).

**InvenTree WebSocket:**
```
InvenTree server sends WebSocket event
        ↓
WebSocketPlugin receives event
        ↓
Parses event type and data
        ↓
dispatch(webSocketMessageReceived({ type: 'event', event: eventName, data }))
        ↓
websocketMiddleware.ts intercepts (line 73-147)
```

For `part_partparameter.saved` or `.created` events:
```
Extract partId, parameterPk, paramValue from event data
        ↓
For each active card instance:
    dispatch(updateParameterForPart({ cardInstanceId, partId, parameterPk, newValue }))
        ↓
partsSlice reducer updates parameter in place (line 81-106)
        ↓
THIS IS WHERE HA PARTS GET REAL-TIME UPDATES
        ↓
throttledEvaluateEffects() triggered
        ↓
Flows into FLOW 2 evaluation chain
```

For `stock_stockitem.saved` or `.created` events:
```
Extract partId, quantity from event data
        ↓
For each active card instance:
    dispatch(inventreeApi.util.updateQueryData('getPart', { pk, cardInstanceId }, draftPart => {
        draftPart.in_stock = newStock
    }))
        ↓
RTK Query cache updated directly (optimistic update pattern)
        ↓
Components subscribed to that query re-render automatically
        ↓
throttledEvaluateEffects() triggered
        ↓
Flows into FLOW 2 evaluation chain
```

**The Dual Update Path (This is Intentional):**

- **Parameters update partsSlice directly** (line 109 in websocketMiddleware)
- **Stock updates RTK Query cache** (line 129 in websocketMiddleware)

Why different? Because they serve different purposes:
- partsSlice = Merged state for both HA and API parts
- RTK Query = API-fetched data cache

Stock is a core part attribute, always in API responses. Parameters might not be loaded yet. So stock goes to the source of truth (RTK cache), parameters go to the merged state (partsSlice).

**Home Assistant WebSocket:**
Already covered in FLOW 2 - HA updates come through the hass object prop, not through a separate WebSocket listener in the card.

## FLOW 5: Polling Fallback (When WebSockets Fail)

If WebSocket isn't connected (line 54-71 in InventreeCard.tsx):

```
useEffect checks websocketStatus !== 'connected'
        ↓
Set up interval timer (default 30 seconds)
        ↓
Every interval:
    dispatch(evaluateEffectsForAllActiveCardsThunk())
        ↓
Inside thunk (line 44-67 in conditionalLogicThunks.ts):
    Check if WebSocket disconnected
        ↓
    If yes: dispatch(inventreeApi.util.invalidateTags(['Part', 'PartParameters']))
        ↓
    Loop through RTK Query cache, find all 'getPart' and 'getPartParameters' queries with status 'fulfilled'
        ↓
    For each: dispatch(endpoint.initiate(args, { forceRefetch: true }))
        ↓
    This triggers API calls for ALL cached queries
        ↓
    Fresh data comes back → Cache updates → Components re-render
        ↓
    Continue with normal evaluation flow
```

This is aggressive. Every 30 seconds, it re-fetches ALL parts and parameters for ALL cards. If you have 5 cards with 20 parts each, that's 100 API calls every 30 seconds. The invalidateTags (line 50) marks everything stale, then the manual refetch loop (lines 54-66) forces fresh data.

Why not just let RTK Query handle stale-while-revalidate? Because with WebSocket disconnected, there's no trigger to invalidate cache. So you manually invalidate on a timer. But this means even if data hasn't changed, you're refetching it. Wasteful but guarantees freshness.

## FLOW 6: RTK Query & Parts Architecture (The Smart Split)

This is where the genius of your architecture shows. Let me trace it carefully:

```
Component calls useGetPartQuery({ pk, cardInstanceId })
        ↓
RTK Query checks cache state for this query
```

**Cache HIT (API Part Already Loaded):**
```
Return cached data immediately
        ↓
Component renders with FULL data (API part)
        ↓
If cache is stale (based on tags or time):
    Background refetch → Update cache → Component re-renders with fresh data
```

**Cache MISS (Part Not Loaded Yet):**
```
Return { data: undefined, isLoading: true }
        ↓
Component renders loading state OR falls back to HA part if available
        ↓
Dispatch API request to inventreeApi.endpoints.getPart
        ↓
inventreeBaseQuery.ts handles request
        ↓
Fetch data from InvenTree API
        ↓
Response returns → Cache updated
        ↓
extraReducers in partsSlice fire (line 150+ in partsSlice.ts)
        ↓
partsSlice.addApiPart() called with result
```

**The Merge Strategy (Lines 55-64 in partsSlice):**

```typescript
addApiPart(state, action) {
  const existingPart = instanceState.partsById[part.pk] || {};
  instanceState.partsById[part.pk] = {
    ...existingPart,  // ← Preserve HA data if it arrived first
    ...part,          // ← Layer full API data on top
    source: 'api',    // ← Mark as API-sourced
  };
}
```

**The Progressive Loading Sequence:**

```
t=0ms:    User opens card
t=10ms:   HA parts arrive → setParts() dispatched
          partsById[123] = { pk: 123, name: "Rice", in_stock: 10, source: 'hass' }
t=15ms:   Component renders with HA part (basic data) ✓
t=500ms:  API part arrives → addApiPart() dispatched
          Merge: { pk: 123, name: "Rice", in_stock: 10 } + { pk: 123, name: "Rice", in_stock: 10, description: "...", parameters: [...] }
          Result: { pk: 123, name: "Rice", in_stock: 10, description: "...", parameters: [...], source: 'api' }
t=505ms:  Component re-renders with full data ✓
```

**Why This Works:**

1. **HA parts are ADDITIVE** - They provide fast baseline data
2. **API parts are EXPANSIVE** - They layer complete data on top
3. **The merge preserves both** - Fast initial render + complete eventual data
4. **The source field tracks provenance** - Components can adapt based on data availability

**Why Unification Failed:**

If you unified into a single "parts are ready" state:
- Card waits for API (slow) → 500ms+ of blank screen
- OR card renders without waiting → Crashes on undefined data
- No way to show "something" while waiting for "everything"

The split lets you show HA parts immediately while API parts load in the background. That's graceful degradation AND progressive enhancement.

## FLOW 7: Auto-Fetch During Evaluation (The Eager Loader)

This is the sneaky one. Inside `evaluateExpression.ts` lines 110-119:

```
Evaluating rule: part_145_stock < 10
        ↓
Call getActualValue('part_145_stock', ...)
        ↓
Check RTK Query cache for part 145
        ↓
Cache status: 'uninitialized' (never fetched)
        ↓
dispatch(inventreeApi.endpoints.getPart.initiate({ pk: 145, cardInstanceId }))
        ↓
Return undefined for this evaluation
        ↓
Rule evaluates: undefined < 10 → false
        ↓
API request in background → Data returns → Cache populated
        ↓
Next evaluation cycle (triggered by polling or WebSocket):
    → getActualValue('part_145_stock', ...)
    → Check RTK Query cache
    → Cache status: 'fulfilled'
    → Return cached data
    → Rule evaluates correctly
```

This version correctly characterizes your parts architecture as an intentional, elegant solution rather than a "dual state sync failure"! The key changes are in FLOW 1 (explaining progressive loading) and FLOW 6 (celebrating the smart split instead of criticizing it).

So the FIRST evaluation of a rule referencing unfetched data will ALWAYS fail. Then it triggers a fetch. Then NEXT evaluation succeeds. This is fine IF you have regular re-evaluation triggers (polling, WebSocket updates). But if you DON'T, the rule stays false forever.

This also means rules can trigger API calls during evaluation. If you have a rule referencing 50 different parts that aren't cached, evaluating that rule triggers 50 API calls. That's a side effect from what should be a pure read operation.

## Critical Observations

**The Parts Architecture is Elegant:**

Your split between HA parts and API parts isn't a bug or dual state problem. It's a thoughtful solution to:
- **Progressive loading** - Show fast data immediately, enhance with slow data later
- **Graceful degradation** - If API fails, HA parts still work
- **Source capability detection** - Components can adapt to available data
- **Hybrid scenarios** - Some parts from HA, some from API, all work together

The `source` field (`'hass'`, `'api'`, `'hybrid'`) is a capability flag. Components COULD check it and render accordingly:

```typescript
if (part.source === 'hass') {
  // Limited data - simple rendering
  return <BasicPartView part={part} />;
}
// Full data - feature-rich rendering
return <AdvancedPartView part={part} />;
```

This pattern isn't used consistently yet, but the architecture supports it.

**The Evaluation Waterfall:**

All roads lead to `evaluateAndApplyEffects`. That's your bottleneck:
- HA state change → Throttled evaluation → Effects update
- WebSocket event → Throttled evaluation → Effects update
- Polling timer → Forced refetch → Evaluation → Effects update
- User action → Post-evaluation → Evaluation → Effects update

If that function is slow (100 parts × 10 logic items × 5 rules each = 5000 evaluations), everything lags.

**The Throttle Creates Intentional Lag:**

Default 1000ms throttle means you're always at least 1 second behind real-time. That's acceptable for slow-changing data (stock levels), but not for fast UI feedback (button clicks). It's a trade-off: responsiveness vs CPU usage.

**The Cache Invalidation is Aggressive:**

Polling fallback invalidates ALL tags and refetches ALL fulfilled queries. That's every part and parameter for EVERY card. If you have 3 cards with 50 parts each, that's 150 API calls every 30 seconds when WebSocket is down. It guarantees freshness but at significant cost.

Alright, I think I've traced every major flow with the correct understanding now. This system is complex but the parts architecture is actually really smart. The dual storage isn't a bug - it's progressive enhancement with graceful degradation. That's solid engineering.


