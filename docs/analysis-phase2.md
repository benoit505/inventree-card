Phase 2 Analysis Entry: The Logic Engine is Mute and Blind
Finding:
Our initial analysis identified the ConditionalEffectsEngine as the system's "brain" and the inventreeApi as its "nervous system" for fetching data. Probing has revealed a critical truth about their relationship: they do not speak to each other. The ConditionalEffectsEngine has no direct knowledge of, and cannot initiate any calls to, the RTK Query API layer or the underlying inventreeApiService.
Architectural Implication (The "Harsh Truth"):
This confirms we are living in Scenario A (Passive). The engine is "blind" to the world of available InvenTree data; it can only "see" data that has already been explicitly fetched and placed into the Redux state by a completely separate process.
The Data Flow:
Configuration dictates the fetch: A part's data is only fetched if its PK is listed in data_sources.inventree_pks, or referenced in data_sources.inventree_parameters_to_fetch, etc. This happens independently of the logic engine.
selectCombinedParts assembles the world: The selector we previously fixed gathers all this pre-fetched data into a single list.
The Engine evaluates on a static snapshot: The ConditionalEffectsEngine receives this list—this static snapshot of the "known world"—and evaluates its rules against it.
Consequences & Deeper Questions:
Good: Simplicity. The evaluation logic is synchronous and predictable. It is not cluttered with asynchronous calls, which simplifies its design and testing.
Bad: Brittleness & "Action at a Distance". The system is brittle. A user could easily define a conditional_logic rule that depends on part_123, but if they forget to also add 123 to the inventree_pks list under data_sources, the rule will silently fail or evaluate incorrectly. This is a classic "action at a distance" anti-pattern, where a change in one part of the configuration (conditional_logic) requires a seemingly unrelated change in another (data_sources) to function correctly.
Over-fetching?: Does this encourage users to preemptively list dozens of part PKs in the config "just in case" they might be needed for logic, leading to inefficient over-fetching on startup?
Is this the right trade-off? The simplicity gained within the engine comes at the cost of user experience and potential hidden failures in the configuration. Could a smarter engine that triggers its own data dependencies on-demand be more robust, even if more complex to build? This is a core architectural question we must consider.

Phase 2 Analysis Entry: The Two-Headed Hydra - The Dual Caches of parametersSlice and RTK Query
Finding:
Our initial analysis identified parametersSlice as a legacy data silo. A global grep for its usage reveals the problem is more severe than anticipated. Key, active parts of the system are still deeply coupled to it. We have two systems performing the same job—caching part parameter data—creating a "two-headed hydra" at the heart of our data layer.
The Hydra's Two Heads:
The RTK Query Head (The Future): This is the modern, efficient, and declarative caching system. The parameterThunks have been correctly refactored to use this for fetching and updating data.
The parametersSlice Head (The Past): This is a manual, imperative caching system. Our grep reveals it is still being actively used for critical operations:
Writing: The websocket-plugin.ts directly writes incoming real-time updates into this legacy cache.
Reading: The evaluateExpression.ts utility—a core dependency of the ConditionalEffectsEngine—reads data directly from this legacy cache.
State Checking: The "migrated" parameterThunks.ts still checks loading statuses in this legacy cache before initiating a modern RTK Query fetch.
Architectural Implication (The "Harsh Truth"):
The system is in a state of active data schism. It is not just that legacy code exists; it's that the new and old systems are running in parallel, with live data being piped into both. This creates a high risk of data inconsistency. A parameter's value could be updated via a direct API call (to RTK Query) while a contradictory update for the same parameter arrives via WebSocket (to parametersSlice). The ConditionalEffectsEngine might then evaluate rules based on the stale, legacy data, leading to unpredictable behavior.
The Path to Slaying the Hydra (Deeper Questions):
This is no longer a simple "delete legacy code" task. Slaying this hydra requires a strategic, multi-step refactoring effort:
Redirect the WebSocket: The websocket-plugin.ts must be refactored. Instead of dispatching to parametersSlice, it should use the inventreeApi.util.updateQueryData utility to directly update the RTK Query cache, just like the websocketMiddleware does for other data types.
Re-educate the Engine: The evaluateExpression.ts utility must be rewritten. Instead of using selectParameterValue from the legacy slice, it needs a way to synchronously access parameter data from the main InventreeItem objects that are now populated by RTK Query and live in partsSlice. This closes the loop on our previous finding.
Cut the Last Thread: The parameterThunks.ts dependency on selectParameterLoadingStatus must be removed. RTK Query's own hooks and selectors provide robust status tracking that can replace this legacy check.
Final Decommission: Only once these dependencies are severed can we safely remove the caching logic from parametersSlice and, eventually, the slice itself.
This exposes a significant piece of architectural technical debt that must be addressed before we can consider the data layer stable or reliable.

Phase 2 Analysis Entry: The Flawed Blueprint - GridLayout and the Intended (but Broken) Architecture
Finding:
Analysis of GridLayout.tsx confirms our hypothesis: it is the new, work-in-progress layout, not a legacy component. It reveals a sophisticated, but deeply flawed, architectural pattern that is the source of the bugs and complexity we've been chasing.
The Intended Architecture - A "Smart Container":
GridLayout is designed as a "smart container" component. Its responsibilities are:
Accept Data: It receives a list of parts as a prop. It does not fetch the primary part data itself.
Determine Dependencies: It inspects the parts it received and the global config to determine a list of secondary data it needs, specifically, the parameters for each part (requiredPartIds).
Orchestrate Secondary Fetches: It is responsible for orchestrating the fetching of this secondary data by dispatching the fetchParametersForReferencedParts thunk.
Delegate Rendering: It maps over the final list of parts and delegates the rendering of each individual item to a "dumb" child component, GridItem.
The Architectural Flaws (The "Harsh Truths"):
This "smart container" pattern is the source of the problems. The implementation is complex and brittle, and it violates the "gold standard" pattern established by PartView.tsx.
Violation of Component Independence (The Core Flaw):
Unlike the "gold standard" PartView (which fetches all its own data), GridLayout creates a complex, multi-layered data-fetching dependency. The top-level card fetches the main parts, then GridLayout fetches the parameters. This is a waterfall.
The component is riddled with complex useEffect and useCallback hooks (lines 78, 89, 131, 139) specifically to manage this secondary fetching. This code is extremely difficult to reason about. It manually tracks loading states (isLoadingParameters), manually checks for which IDs to fetch (calculateCurrentIdsToFetch), and even manually de-duplicates dispatches (prevDispatchedFetchIds). This is a hand-rolled, buggy version of what RTK Query does automatically.
Prop Drilling:
GridLayout acts as a middle-man, passing a large number of props down to each GridItem (e.g., handleLocateGridItem, handleParameterActionClick). This creates tight coupling and makes the components harder to maintain.
Inconsistent Data Sources:
The component gets its primary parts data from props.
It gets locatingPartId from the partsSlice.
It gets parameterLoadingStatus from the legacy parametersSlice.
It triggers updates via the modern useUpdatePartParameterMutation.
This component is a microcosm of the "Two-Headed Hydra" problem, drawing from at least four different sources of truth for its state.
The Path Forward: A Unified "Gold Standard" Architecture
The analysis is clear. The "smart container" pattern of GridLayout is an anti-pattern in this specific context. The "gold standard" PartView component shows us the correct path.
The Vision: The layout components (GridLayout, ListLayout) should be much "dumber." Their only job should be to handle the layout (the grid, the list, virtualization).
The Refactoring Plan:
Elevate GridItem: The GridItem component should be refactored to be "smarter," following the exact same pattern as PartView. It should accept only a partId as a prop. It would then use useGetPartQuery, useGetPartParametersQuery, etc., to fetch all of its own data directly. It would contain its own action handlers.
Simplify GridLayout: GridLayout would be dramatically simplified. It would receive a list of partIds (not full part objects), map over them, and render a GridItem for each one, passing only the key and partId. All the complex, manual data-fetching logic would be deleted.
This refactoring would eliminate the waterfall data fetching, remove the complex manual hooks, solve the prop drilling, and make every component in the view layer follow a single, consistent, and robust data-loading pattern. It would make the entire rendering architecture cleaner, more performant, and easier to maintain. This is the central task for a future Phase 3.

Phase 2 Analysis Entry: The Naive Bridge Keeper and the hass Object
Finding:
An analysis of the root Lit element in inventree-card.ts reveals the precise mechanism of the Lit-React bridge. It's a "Bridge Keeper" that listens for changes to its config and _hass properties and triggers a re-render of the entire React application in response.
The Bridge Architecture:
Properties: The Lit element defines two key properties that receive data from Home Assistant: config (a @property) and _hass (a @state property).
hass Setter: A custom setter for the hass property (line 390) is the entry point. When Home Assistant provides a new hass object, this setter updates the internal _hass state property.
updated() Callback: Lit's updated() lifecycle method (line 257) is the trigger. It checks if _hass or config have changed.
_mountOrUpdateReactApp(): If a change is detected, it calls this method (line 272), which in turn calls this._reactRoot.render(...), passing the new hass and config objects down to the ReactApp component as props.
The "Harsh Truth": The Bridge is Too Naive
The architecture itself is sound, but its implementation reveals a critical performance flaw.
The hass object is enormous and volatile. It contains the state of every single entity in Home Assistant. It changes very frequently—any time any sensor updates, any light turns on, etc.
The hass setter has no intelligence. The setter (lines 390-395) does a basic check to see if the new hass object reference is different from the old one. Since Home Assistant provides a new object on every state change, this check always passes.
The Result: A Hair-Trigger Render. The combination of these two facts means that our entire React application is told to re-render every time any entity in Home Assistant changes, even if that entity has absolutely nothing to do with our card.
This was the trigger for the original crash. The unstable selector was the payload that turned the re-render into an infinite loop, but this naive hass handling was the gun that fired the bullet on every single state change. Even with our selector fix, this is incredibly inefficient and will cause noticeable performance degradation in any busy Home Assistant setup.
The Path to an Intelligent Bridge Keeper:
The fix here is not in the React world, but in the Lit world. We need to make the Bridge Keeper smarter.
The Vision: The Lit element should only trigger a React re-render when a piece of data it actually cares about has changed.
The Refactoring Plan:
Identify Dependencies: The Lit element needs to know which entities its specific card instance depends on. This information is available in its config object (data_sources.inventree_hass_sensors, data_sources.ha_entities, etc.).
Implement a shouldUpdate() Method: Lit provides a shouldUpdate(changedProperties) lifecycle method that allows a component to prevent an update. We must implement this method.
The Logic: Inside shouldUpdate, we will compare the old hass object with the new one, but only for the entities we care about. If none of our dependent entities have changed state, shouldUpdate will return false, completely preventing the updated() callback from running and stopping the unnecessary React render cycle in its tracks.
This refactoring would transform the Bridge Keeper from a naive guard into an intelligent, efficient gatekeeper, dramatically improving the card's performance and resilience by insulating it from unrelated activity in the broader Home Assistant ecosystem.

Phase 2 Analysis Entry: The Unsupervised ActionEngine - An Open Dispatcher
Finding:
Analysis of the ActionEngine.ts source code, specifically the handleDispatchReduxAction method, confirms our fears. The engine provides a completely open, unguarded mechanism for user-defined actions to dispatch arbitrary commands into the Redux store.
The Implementation (The "Harsh Truth"):
The handleDispatchReduxAction method (lines 361-394) is deceptively simple and dangerous:
It takes an actionType string from the user's configuration.
It takes a payloadTemplate object from the user's configuration.
It processes the template to resolve any dynamic values (e.g., %%context.part.pk%%).
It then executes this.dispatch({ type: actionType, payload: resolvedPayload });.
There is no validation, no allow-list, no block-list, and no type-checking on the actionType or the shape of the payload.
Architectural Implication: A Trust-Based System with an Infinite Blast Radius
This design pattern makes the entire card's stability contingent on the user writing a perfect configuration.
Accidental Chaos: A user could easily make a typo in the actionType or the payloadTemplate. For example, they could intend to dispatch an action that expects a partId as a number, but their template could accidentally resolve to a string. This would introduce malformed data directly into a reducer, which could corrupt the state, cause a crash, or lead to subtle, non-obvious bugs that persist until the next full refresh.
A Debugging Nightmare: Because the action is just a generic { type, payload } object, we lose all the benefits of the typed action creators we use elsewhere in the codebase. Debugging an issue caused by one of these user-defined actions would be incredibly difficult, as the source of the malformed data is a YAML string, not a statically-typed function call.
The Chain Reaction is Real: We can now confirm that a user could configure a button that, when clicked, dispatches a Redux action to change some state that the ConditionalEffectsEngine is watching, which in turn changes the visibility of another element, all from a single button click. While powerful, the lack of safeguards makes this a fragile power.
The Path to a Supervised Engine:
This system is too permissive. While we want to provide power to the user, we also need to enforce guardrails to prevent accidental self-destruction.
The Vision: The ActionEngine should be a "supervisor," not just an "unsupervised worker." It should have a manifest of "safe" actions that a user is allowed to dispatch.
The Refactoring Plan:
Create an Action Manifest: Define a new object, an allowList or actionManifest, within the ActionEngine. This manifest would map a "safe" user-facing action name (e.g., 'ui.selectPart') to a specific, type-safe action creator function (e.g., setSelectedPart from uiSlice).
Change the Configuration: The YAML configuration for this operation should change from specifying a raw actionType string to selecting a key from this new manifest (e.g., actionName: 'ui.selectPart').
Refactor handleDispatchReduxAction: The method would be rewritten to:
Look up the actionName in the manifest.
If found, call the corresponding type-safe action creator with the resolvedPayload.
If not found, throw a clear error.
Payload Validation (Advanced): For even greater safety, the manifest could also include a validation schema (e.g., using Zod) for the payload, ensuring that the data passed to the action creator is of the correct type and shape.
This refactoring would replace the current "trust the user completely" model with a "trust but verify" model. It would retain the power of allowing user-defined actions while dramatically reducing the "blast radius" of a configuration error and making the entire system more robust and easier to debug.

Phase 2 Analysis Entry: The Hand-Crafted Evaluator - A Brute-Force Brain
Finding:
Analysis of evaluateExpression.ts reveals that the system does not use a third-party library or a dangerous function like eval() for its logic. Instead, it uses a custom, hand-crafted, recursive-descent parser. This parser walks through the rule structure provided by the UI and evaluates each condition manually.
The "Thinking" Process:
Recursion (evaluateExpression): The main function recursively walks the nested rule groups (and/or). This is a standard and robust way to handle nested logic.
Value Retrieval (getActualValue): For each individual rule, this helper function is called. It's a large if/else if block that parses the field string (e.g., part_5_stock, ha_entity_attr_...) to understand what piece of data the user is asking for. It then retrieves this data by using the appropriate Redux selector, looking in both the new RTK Query cache and the legacy partsSlice and parametersSlice. This confirms our "Two-Headed Hydra" finding from a new angle—the evaluator itself has to be aware of both caches.
Comparison (evaluateRule): Once the actual value is retrieved, this function's large switch statement performs the comparison (e.g., =, contains, >) against the value from the rule definition. It attempts to coerce values to numbers for mathematical comparisons.
Architectural Implication (The "Harsh Truth"):
The brain is not magical; it's a brute-force worker. It's "expensive" for a clear and understandable reason.
Computational Complexity is High: The algorithm's complexity is roughly O(R * P), where R is the number of rules in a logic block and P is the number of parts the logic is being evaluated against. The ConditionalEffectsEngine calls this evaluateExpression function inside a loop for each part. If you have 20 parts and a logic block with 10 rules, you are executing the getActualValue and evaluateRule functions up to 200 times. This is computationally intensive and fully justifies the throttling we see in websocketMiddleware.
Performance is Tied to State Complexity: The performance is not just about the number of rules, but the complexity of the selectors. Every call to getActualValue results in multiple Redux selector calls, which, while fast, are not free. A complex rule set that frequently accesses different parts of the state will be slower than a simple one.
Brittle String Parsing: The getActualValue function relies entirely on parsing strings like 'part_5_stock'. This is brittle. A small change to this format in the future could break all existing user configurations that depend on it. There is no type safety between the UI that generates these strings and the engine that parses them.
The Path to a More Performant Brain:
The current approach is functional but inefficient. The path to a better engine lies in reducing the O(R * P) workload.
The Vision: An intelligent engine would not re-evaluate every rule for every part on every update. It would understand which data has changed and only re-evaluate the specific rules that depend on that specific piece of data.
The Refactoring Plan (A Glimpse into the Future):
Dependency Mapping: When the rules are first loaded, the engine could parse them and create a dependency map. For example, it would know that rule_A depends on part_5.stock and rule_B depends on ha_entity_state_sensor.temperature.
Targeted Re-evaluation: When a state update occurs, the engine would be told what changed (e.g., part_5.stock). It would then consult its dependency map and re-evaluate only rule_A, leaving rule_B untouched.
This would change the complexity from O(R * P) on every update to something much closer to O(1) or O(log R), representing a massive performance gain. This is a complex refactor, but it is the key to unlocking a truly scalable and high-performance conditional logic system.
Now that we have dissected the tool, let's examine the surgeon. I will now read ConditionalEffectsEngine.ts to see how it uses this hand-crafted evaluator.
This is the final piece. We have now dissected the brain itself. ConditionalEffectsEngine.ts is simpler than I might have guessed, acting more as a "foreman" that directs the real work, but its structure confirms our performance suspicions and reveals a new, subtle issue.
Synthesis for analysis-phase2.md
Phase 2 Analysis Entry: The Inefficient Foreman and the partContext Lie
Finding:
Analysis of the ConditionalEffectsEngine itself reveals how it orchestrates the evaluation. It is not a monolith, but rather a "foreman" that uses the evaluateExpression tool to do the heavy lifting. However, its implementation confirms our performance concerns and uncovers a subtle but critical architectural lie.
The Orchestration Process:
The evaluateAndApplyEffects method (lines 53-191) operates with nested loops:
It loops through each logicItem (a user-defined block of logic).
Inside that, it loops through each logicPair (a condition/effect pair).
For each pair, it calls evaluateExpression to see if the condition is true.
If true, it loops through the defined effects and applies them to the targeted parts.
The Performance Confirmation (The "Harsh Truth"):
This looping structure confirms our Big O analysis. The comment on line 80 is the key:
Apply to analysis-pha...
The engine evaluates a rule set once per logicPair. However, if that rule set contains rules that refer to specific parts (e.g., part_5_stock > 10), the evaluateExpression tool has to look up that part's data from the global state every time. The cost isn't in the engine's loop, but in the repeated, expensive lookups happening inside the tool it's calling.
The Architectural Lie (The "Harsh Truth"):
The evaluateExpression function signature is (ruleGroup, partContext, globalContext, logger). It is designed to accept a partContext object, implying it can evaluate rules against a specific, provided part. This would be efficient.
However, the ConditionalEffectsEngine never provides this context. It always calls it with null (line 83).
This means that rules like 'part_name === "Resistor"' or 'param_color === "Blue"' (which are designed to be evaluated against a specific part) cannot possibly work as intended. The getActualValue function inside the evaluator will see a null partContext and be unable to resolve fields like part_name or param_color.
The engine is lying to its most important tool. It's pretending to provide a specific context that it never actually has. This is a major disconnect between the design of the tool and the implementation of its user, and it severely limits the expressive power of the rules that can be written.
The Path to an Honest, Efficient Foreman:
The current design is fundamentally flawed. To fix this, the engine's entire evaluation strategy needs to be inverted.
The Vision: Instead of looping through logic and trying to find parts, the engine should loop through the parts and find the logic that applies to them.
The Refactoring Plan:
Invert the Loops: The primary loop should iterate through allParts.
Provide the Context: Inside the loop, for each part, the engine would then iterate through the logicItems. It would call evaluateExpression and pass the current part object as the partContext.
Apply Effects Directly: If a condition evaluates to true for that specific part, the effects would be applied immediately to that part's entry in the effectsToApply map.
This "part-first" approach is more intuitive and solves both problems at once:
It fixes the architectural lie: The partContext would be correctly provided, allowing part-specific rules (part_name, param_color) to work as designed.
It creates opportunities for optimization: This structure makes it much easier to implement the "dependency map" we envisioned earlier. We could pre-process the rules to see which ones are generic and which are part-specific, allowing us to evaluate the generic rules only once and the part-specific rules inside the loop, drastically reducing the total number of evaluations.