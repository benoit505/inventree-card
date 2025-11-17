# Meta API Reference - The Redux Architecture Philosophy

## The Store Analogy

You work in a physical store. Let me tell you what Redux looks like when you map it to that reality:

**The Store Building** = Redux Store
The literal brick and mortar. It holds everything. Walk in the front door, and you're in a space that has inventory (parts), customer tracking (components), price tags (visual effects), promotional displays (conditional logic), and cash registers (actions). Every department has its own section, but they all share the same roof.

**Inventory Management System** = partsSlice
This is your actual product database. Some items arrive fast from local suppliers (HA sensors - the truck pulls up in 10ms). Some items take longer to ship (InvenTree API - 500ms from the warehouse). The split isn't a bug, it's intentional supply chain management. You don't wait for the slow shipment to open the store - you stock what you have NOW, then add the detailed items when they arrive. That's progressive loading.

The `source` field? That's the sticker on the box telling you where it came from. You handle local-sourced produce differently than imported electronics. Same principle.

**Price Tags & Signs** = visualEffectsSlice
These are the computed results. Based on stock levels (conditional logic evaluation), you put "LOW STOCK" signs on items, highlight sale items in red, add flashing lights to featured products. The tags don't exist until someone (ConditionalEffectsEngine) walks through the store, checks inventory against rules, and prints them out. That's why effects are cleared and recomputed - you're replacing old signs with fresh ones.

**Customer Tracking** = componentSlice  
This is how you know which checkout lanes are open. When a customer (card instance) enters, you register them. When they leave, you mark them inactive. When you need to announce something over the PA system ("evaluateEffectsForAllActiveCardsThunk"), you only speak to the checkout lanes that have customers. You don't shout into empty aisles.

**Store Policies Manual** = configSlice
The big binder behind the manager's desk. It tells you opening hours (polling intervals), which suppliers to use (data sources), what promotions are running (conditional logic rules), and what buttons to show on the cash register (action definitions). Redux-persist saves this manual to localStorage so when the store reopens tomorrow, you don't have to reconfigure everything.

**Cash Registers** = actionsSlice
Each button on the register is an ActionDefinition. Press "Add Stock" and the system calls an API, updates inventory, maybe triggers a receipt (post-evaluation logic). The runtime states? Those are the little LED lights that say "Processing..." but currently nobody's looking at them. Dead infrastructure - the buttons work, the lights just aren't visible to anyone.

**Store Layout** = Multiple layout components
You can arrange products in grid shelves (GridLayout), flowing aisles (ListLayout), or detail stations (DetailLayout). The layout components are the physical arrangement, but what they DISPLAY is driven by inventory (partsSlice) and how it's DECORATED is driven by price tags (visualEffects).

**Announcement System** = Middleware
When inventory changes (parts updated via WebSocket), the announcement system (websocketMiddleware) intercepts the event and says "ATTENTION: Price check on aisle 5" (evaluateEffectsForAllActiveCardsThunk). It throttles announcements so you're not spamming every second. The metricsMiddleware is the security camera system - it watches everything but doesn't interfere.

**Supplier APIs** = RTK Query (inventreeApi)
These are your actual suppliers. You call them (fetch request), they send products (JSON), and the products auto-stock to your shelves (extraReducers dispatch to partsSlice). The cache is your loading dock - items sit there until they're officially stocked. Tags are your inventory tracking stickers - when you invalidate tags, you're saying "this shipment is stale, order fresh stock."

**Emergency Coordinator** = Thunks
When something big needs to happen (initializeCardThunk, evaluateAndApplyEffectsThunk), you don't just press one button - you call the manager (thunk) who orchestrates multiple departments. They dispatch to partsSlice, configSlice, visualEffectsSlice in sequence. They're async because some tasks take time (fetching from suppliers), and you can't freeze the store while waiting.

---

## The Patterns That Emerge

### Multi-Instance Architecture (Multiple Stores in a Shopping Mall)

You're not running ONE store. You're running a MALL with multiple instances of the same store. Each card instance is a separate storefront. They share:
- **Supplier connections** (inventreeApi cache is global)
- **Announcement system** (middleware is global)
- **Security cameras** (metricsMiddleware is global)

But each has its own:
- **Inventory** (partsByInstance[cardInstanceId])
- **Price tags** (effectsByCardInstance[cardInstanceId])  
- **Store policies** (configsByInstance[cardInstanceId])

Why? Because you might have two cards on the same dashboard - one showing "Electronics Department," one showing "Grocery Department." They're independent but share backend infrastructure.

The `getOrCreateInstanceState` helper in partsSlice? That's the mall management saying "if this storefront doesn't exist yet, build it." The `selectActiveCardInstanceIds` selector? That's the mall security asking "which stores are open right now?"

### Progressive Loading (The Fast Lane)

The HA parts vs API parts split isn't dual state - it's **fast lane vs complete data**.

Imagine you're stocking a store. Local suppliers deliver to the front door in 10 minutes (HA sensors). National suppliers ship to the warehouse and take 2 hours (InvenTree API). Do you:
1. Wait 2 hours for everything to arrive before opening?
2. Stock what's available NOW, then add details as they arrive?

You chose option 2. That's smart. The customer (user) sees SOMETHING immediately - basic name, stock count from HA sensors. Then as API data arrives, you enhance it - full descriptions, parameters, relationships. The `source` field tracks provenance so you know which items have full data vs placeholder data.

Unification failed because you tried to treat express delivery and slow freight the same way. They're fundamentally different supply chains. The split RESPECTS that difference.

### Computed State (Price Tags are Recomputed, Not Stored)

Visual effects are NOT persistent. They're computed on demand from:
- Inventory levels (parts)
- External conditions (HA entity states)  
- Rules (conditional logic)

Every evaluation, you clear all effects and recompute. Why? Because if you accumulate effects, stale effects stick around. It's like leaving old "SALE!" signs up after the sale ended. Better to rip everything down and put up fresh signs based on current conditions.

The downside? Expensive. If you have 100 products and 10 rules, that's 1000 evaluations. But React's shallow equality checks prevent unnecessary re-renders, so the VISIBLE impact is small even if CPU cycles are wasted.

Could you optimize with dependency tracking? Yes. Would it be worth the complexity? Probably not yet. You'd need to track "which effects depend on which data" and only recompute changed effects. That's a whole dependency graph system.

### Event-Driven Updates (The Announcement System)

When something changes (HA state update, WebSocket message, user action), middleware intercepts and announces it. The announcement system (websocketMiddleware) then says "everyone re-evaluate!" (throttled to prevent spam).

This is publish-subscribe. The middleware is the central message bus. Components don't directly listen to HA or WebSocket - they listen to Redux state. The middleware translates external events into Redux actions.

The throttling? That's rate limiting. If the store gets 50 announcements per second ("price update aisle 1, aisle 2, aisle 3..."), you throttle to one announcement per second. The downside is lag - you're always ~1 second behind real-time. The upside is you don't thrash the entire store with constant re-evaluations.

### The Singleton Pattern (Store Manager)

ActionEngine and ConditionalLoggerEngine are singletons. Why? Because they hold shared state (ActionEngine has the `isExecuting` set, ConditionalLoggerEngine has the logging config), and creating multiple instances would cause inconsistency.

In the store analogy, they're the store manager and security chief. There's ONE manager, not one per department. When any department needs to execute an action, they call THE manager. When any department needs to log something, they call THE security chief.

The downside? They're global mutable state outside Redux. If something goes wrong, debugging is harder because the state isn't in Redux DevTools. But the upside is they're accessible from anywhere without passing props through 10 components.

### The Bridge Pattern (Lit ↔ React ↔ Redux)

You have THREE state systems:
1. **Lovelace State** (outside your control - YAML configs, hass object)
2. **Lit Element State** (this._config, this.reactRoot)
3. **Redux State** (the whole store)

The bridge is inventree-card.ts. It receives updates from Lovelace (setConfig, updated), stores minimal state in Lit (just the essentials for re-mounting), and passes everything to React as props. React then puts it in Redux for components to consume.

Why not put everything directly in Redux? Because Lovelace doesn't know about Redux. The Lit element is the adapter pattern - it speaks Lovelace's language (web component lifecycle) and translates to React's language (props and hooks).

The config duplication (Lit has it, Redux has it)? That's intentional redundancy. Lit needs it for re-mounting if React crashes. Redux needs it for components. They're two layers of the same data with different access patterns.

---

## What's Clean vs What's Messy

### Clean Patterns

**Instance Scoping**
Every slice that needs multi-card support uses `byInstance[cardInstanceId]` or `partsByInstance[cardInstanceId]`. Consistent pattern. Easy to add new instance-scoped state.

**Selector Composition**
Selectors in partsSlice use `createSelector` from Reselect for memoization. Clean composition - base selectors build complex selectors. `selectAllPartsForInstance` → `selectIsReadyForEvaluation` → components use the high-level one.

**RTK Query Integration**
The `onCacheEntryAdded` callbacks in inventreeApi that auto-dispatch to partsSlice? Beautiful. API fetches data, cache receives it, slice gets updated, components re-render. One-way flow, no circular dependencies.

**Middleware as Event Bus**
websocketMiddleware intercepts Redux actions (setEntityState, webSocketMessageReceived) and triggers side effects (evaluateEffectsForAllActiveCardsThunk). Clear separation - slices are pure reducers, middleware handles cross-cutting concerns.

### Messy Patterns

**Ghost State**
`layoutOverridesByCardInstance` in visualEffectsSlice. It's defined, it's in the initial state, but NOTHING writes to it or reads from it. Dead code. Why is it there? Probably planned feature that never shipped. Now it's just taking up space.

Same with `actionRuntimeStates` in actionsSlice. Stored but never displayed. Infrastructure for a feature (action history panel?) that doesn't exist yet.

**Dual Evaluation Engines**
ConditionalEffectsEngine uses `evaluateExpression` from utils. ActionEngine has its own simplified evaluator (lines 129-186 in ActionEngine.ts). They do similar things but have different capabilities. That's code duplication. If you add a new operator, you have to update BOTH or they diverge.

Why not consolidate? Probably because ActionEngine is a singleton and doesn't have Redux dispatch, while evaluateExpression expects dispatch for auto-fetching. Circular dependency issues or just historical reasons.

**Throttle Configuration Global State**
The throttle frequency in websocketMiddleware is calculated as the MINIMUM across all card instances. If Card A wants 1000ms, Card B wants 500ms, the system uses 500ms for EVERYONE. Card A's config is ignored.

Why? Because middleware is global, and having per-instance throttles would require tracking "which evaluation is for which card" and throttling independently. Easier to just take the minimum and apply globally. But it means card configs have unexpected interactions.

**Config in Three Places**
Config exists in:
1. Lovelace's internal state
2. Lit element: `this._config`
3. Redux: `state.config.configsByInstance[cardInstanceId]`

Changes flow: Lovelace → Lit (setConfig) → Redux (dispatch) → React (props) → Redux (selector). That's TWO paths to get config into React - via props AND via Redux. Both trigger updates. That's two renders for one config change.

Could be consolidated but it's the price of the bridge pattern. Lit needs a copy for lifecyc management, Redux needs a copy for components. It works, just redundant.

**WebSocket Updates Bypass React Lifecycle**
When a WebSocket event arrives, middleware directly updates partsSlice (line 109-116 in websocketMiddleware). That's fine, but then it immediately triggers global re-evaluation. Components don't know WHY they're re-rendering - they just see "state changed."

In React's mental model, updates should be explicit (user action, effect, prop change). But here, updates come from middleware as a side effect of external events. It's correct but harder to debug because the causality is hidden.

**The Global API Cache Reset**
`dispatch(inventreeApi.util.resetApiState())` in lifecycleThunks line 43. This nukes the ENTIRE RTK Query cache for ALL endpoints and ALL cards. If you have 3 cards on a dashboard and Card A initializes, Card B and C lose their cache. They have to refetch everything they already had.

Why? Probably because per-card cache scoping is hard, and reset is easy. It works but it's wasteful. Better solution: tag-based invalidation scoped to the card's data.

---

## Async Architecture (The Delivery Trucks)

### Thunks as Coordinators

Thunks are your delivery coordinators. When you need multiple departments to do something in sequence, you create a thunk.

Example: `initializeCardThunk`
1. Set config (synchronous - reducer)
2. Register component (synchronous - reducer)
3. Initialize WebSocket (async - dispatches another thunk)
4. Fetch HA entities (async - dispatches another thunk)
5. Fetch part parameters (async - dispatches RTK Query initiate)

The thunk dispatches all these and RETURNS IMMEDIATELY. It doesn't await. Why? Because awaiting would block React mounting, and you've designed for progressive loading. You want React to mount ASAP and show loading states, not wait for all data.

The downside? Race conditions. React mounts before WebSocket is connected, before parameters are loaded. Components trying to use that data see undefined. That's why you have "Are parts ready?" checks and loading spinners.

### RTK Query as Supplier API

RTK Query is brilliant for REST APIs. You define endpoints, it handles:
- Caching (don't refetch what you already have)
- Deduplication (two components request the same part? One request, shared result)
- Invalidation (when data changes, mark cache stale)
- Loading states (isLoading, isFetching)
- Optimistic updates (update UI before API confirms)

But you're not using it as designed. You're:
- Dispatching `.initiate()` imperatively (in thunks) instead of using hooks
- Manually populating partsSlice via extraReducers instead of reading from cache
- Globally resetting API state instead of selective invalidation

Why? Because you need custom merging logic (HA parts + API parts), and RTK Query's automatic caching doesn't handle that. So you use RTK Query as a fetching library, not a caching library. The cache is a staging area before data goes to partsSlice.

Is that wrong? No. It's using RTK Query for what you need (automatic request deduplication, loading states) while bypassing what you don't need (transparent caching). But it means you're maintaining TWO caches - RTK Query's internal cache AND partsSlice.

### The Throttle vs Debounce Problem

Throttling says "execute at most once every N ms." If events arrive faster, DROP them.
Debouncing says "execute N ms after events STOP arriving." If events arrive faster, DELAY the execution.

You're using throttle (websocketMiddleware line 35). That means:
- HA state changes rapidly (light on, brightness up, brightness up, brightness up)
- First change triggers evaluation
- Next 999ms of changes are IGNORED  
- After 1000ms, throttle releases, next change triggers evaluation

You're DROPPING intermediate states. If brightness went 0 → 50 → 100, you only see 0 and 100. The 50 is lost.

Debouncing would wait for changes to STOP, then evaluate with the final state. But debouncing has its own issues - if changes never stop, evaluation never happens.

Better solution: **Batching**. Collect all changes in a 100ms window, then evaluate ONCE with all changes applied. That way you don't drop data, and you don't spam evaluations.

###The Fetch-Then-Evaluate Pattern

The auto-fetch in evaluateExpression (lines 110-119) is clever but dangerous:
1. Rule references part 123
2. Part 123 not in cache
3. Dispatch fetch for part 123
4. Return undefined (rule evaluates false)
5. ... time passes ...
6. Fetch completes, part 123 now in cache
7. ... nothing happens, evaluation already finished ...

The fetch happens but you don't USE the result. You're relying on some OTHER trigger (WebSocket update, polling) to cause another evaluation where the data is now available.

That's eventual consistency. It WORKS if you have reliable re-evaluation triggers. It BREAKS if you remove polling or WebSocket dies and doesn't reconnect.

Better solution: Make evaluation async, await the fetch, return the correct value. But that makes the entire evaluation async, which means you can't use it synchronously in ActionEngine. Tradeoffs.

---

## The Meta Patterns

### State Machine Architecture

Your card is a state machine:

```
[INITIALIZING] → [LOADING_HA_FAST] → [LOADING_API_SLOW] → [READY] → [EVALUATING] → [READY]
        ↓              ↓                  ↓                             ↑
        └──────────────┴──────────────────┴─────────────────────────────┘
                      (Errors loop back to INITIALIZING)
```

This meta analysis ties EVERYTHING together - the store analogy, patterns from all subsystems, philosophical takes on architecture, and concrete "what's not done" observations. It's the crossroads document that references all the other docs while providing the 10,000-foot view.

Should I continue with the `api reference potential bugs.md` file, or do you want to explore/refine this meta document first? I'm really excited about where this is going!
