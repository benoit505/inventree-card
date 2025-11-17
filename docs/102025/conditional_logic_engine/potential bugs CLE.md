# Potential Bugs & Issues - Conditional Logic System

## BUGS THAT ARE PROBABLY BREAKING THE SYSTEM

**The Auto-Fetch Returns Undefined Problem**

Lines 110-119 in `evaluateExpression.ts` - when a rule references data that's not in cache (like `part_123_stock` for a part that hasn't been loaded), the system dispatches a fetch request and then returns `undefined`. The rule then evaluates against undefined. Looking at line 214-221, if `actualValue` is undefined, most operators just return false. So your rule `part_123_stock < 10` will evaluate to FALSE even though you haven't loaded the data yet. The next evaluation cycle (after the fetch completes) might get it right, but that first pass is lying to you. The effect won't apply until the second cycle, which could be seconds later depending on polling interval.

Actually wait, does this cause an infinite loop? Rule evaluates false → no effect applied → polling triggers re-evaluation → data is now loaded → rule evaluates true → effect applied. That WORKS but only because you have re-evaluation triggers. If you didn't have the polling fallback or WebSocket updates, the rule would just stay false forever. So it's not technically broken but it's fragile as hell.

**Race Condition Between Clear and Apply**

Lines 186-187 in `ConditionalEffectsEngine.ts` - you clear ALL effects at the start of evaluation. Then you do all the rule evaluation (which could involve async auto-fetching), then apply effects at line 268. But what if a HA state changes DURING evaluation? Like:

1. Start evaluation, clear all effects
2. Begin evaluating rules (takes 50ms because you have 100 parts)
3. HA state changes at 25ms into evaluation
4. That triggers ANOTHER evaluation (via WebSocket middleware probably)
5. Now you have two evaluations running concurrently

The second one will clear effects while the first one is still computing. Then the first one finishes and applies stale effects. Then the second one finishes and applies fresh effects. You'll see the right result eventually but there could be a flicker where effects from the first evaluation briefly appear. And if evaluations keep getting triggered faster than they can complete, you might thrash.

Is there any debouncing? Looking at `InventreeCard.tsx` lines 54-71, the polling interval defaults to 30 seconds so that's not the issue. But WebSocket updates could fire rapidly. Do you debounce those anywhere? I don't see it in `websocketMiddleware.ts` (would need to check that file but going off what I can see).

**Performance Death by 1000 Evaluations**

Lines 232-266 in `ConditionalEffectsEngine.ts` - the nested loops. For each part, for each logic item, for each logic pair, evaluate rules. If you have:
- 100 parts loaded
- 10 conditional logic items
- Each with 2 logic pairs
- Each pair has 5 rules

That's 100 × 10 × 2 × 5 = 10,000 individual rule evaluations. EVERY TIME the thunk runs. And the thunk runs on every HA state change (if WebSocket connected) or every 30 seconds (if polling).

The memoization on line 277 with `memoize-one` caches exactly ONE previous call. So unless you're evaluating the exact same rule with the exact same value twice in a row, you get no cache hits. That's basically useless for this use case.

Now, in practice, if your actual values haven't changed, the visual effects you calculate will be the same as last time. Redux will do shallow equality checks and components won't re-render. So the VISIBLE impact might be small. But you're still burning CPU cycles to calculate the same thing over and over.

With 10 parts and 2 logic items? No problem. With 200 parts and 20 logic items? Your card is going to stutter on every state update.

---

## BUGS THAT BREAK THE GENERAL FLOW AND GOT FIXED WITH PATCHING

**The Dual Evaluation Engines**

`ConditionalEffectsEngine.ts` has the main evaluation logic using `evaluateExpression` from utils. But then `ActionEngine.ts` lines 129-186 has its own evaluation logic that's "simplified, synchronous". It only handles HA entity states, not part data. It's checking if a button should be enabled based on an expression.

Why not use the main evaluator? Probably because:
1. ActionEngine is a singleton, ConditionalEffectsEngine gets Redux passed in
2. Circular dependency issues?
3. You needed synchronous evaluation and the main one might have been async at some point?

The comment explicitly says "simplified, synchronous version of the logic in evaluateAndApplyEffectsThunk" which means you KNOW it's duplicate code. That's technical debt. If you change the rule evaluation semantics (like adding a new operator), you have to remember to update BOTH places. And they don't even support the same features - ActionEngine can't evaluate part-specific rules.

**The Cell Effects Migration**

Lines 74-100 in `ConditionalEffectsEngine.ts` handle cell-specific effects with immediate dispatch. Then lines 131-146 have the old way with a "DEPRECATED LOGIC" comment. So you have TWO code paths for applying cell styles:
1. New way: Effect has `targetCellId`, dispatches `setConditionalCellEffect`
2. Old way: Effect has `styleTarget` that's not 'Row', builds up cellStyles in the part's visual effect

The old way is kept "for backward compatibility for now". So configs in the wild are using the old structure and you can't remove it yet. But now you have to maintain both. And they interact - if a config has both old-style and new-style cell effects, what happens? The new-style ones dispatch immediately (line 99 `continue`), the old-style ones go into the batch. They're targeting different Redux slices probably (`visualEffects.parts[pk].cellStyles` vs `visualEffects.cells[cellId]`). So they'd stack? Or does one overwrite the other in the component?

Looking at `CellRenderer.tsx` lines 30-34:
```typescript
const partVisualEffects = useAppSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId, partPk)) || {};
const cellVisualEffects = useAppSelector((state: RootState) => selectVisualEffectsForCell(state, cardInstanceId, cell.id)) || {};
const visualEffects = { ...partVisualEffects, ...cellVisualEffects };
```

So it merges them with cell effects winning. That works, but it means old-style effects go through part visual effects, new-style through cell visual effects, then they merge. Convoluted but functional. It's a patch.

**The Broken Logger Fallback**

Throughout the code there are `console.log` statements with styling:
- Line 206 in `ConditionalEffectsEngine.ts`: `console.log('%c[EffectsEngine] Rule Evaluation:', 'color: #3498DB; font-weight: bold;'`
- Line 189 in `ActionEngine.ts`: `console.log('%c[ActionEngine] executeAction called...'`
- Line 237 in `ActionEngine.ts`: `console.log('%c[ActionEngine] handleOperation called...'`

These are clearly added because the logger system isn't working. The comment at the top of the architecture doc says "Currently broken (per user)". So you're patching by just using console directly. These logs are EVERYWHERE and they'll fire constantly in production. They're styled which is nice for development but it's not a real logging solution. You can't filter them by category, can't disable them without editing code, can't control log levels. It's a temporary workaround that's probably been temporary for a while.

**The Polling Fallback Invalidation Nuclear Option**

Lines 44-67 in `conditionalLogicThunks.ts` - when WebSocket isn't connected, you invalidate ALL 'Part' and 'PartParameters' tags. Then you loop through the entire RTK Query cache and force refetch anything that's fulfilled. That's... aggressive.

Why not just refetch the data that THIS card actually uses? The card knows which parts it loaded (from `selectAllPartsForInstance`). It could just refetch those. But instead it's nuking the entire cache for ALL cards. If you have multiple cards on a dashboard, they all share the RTK Query cache, so this affects everyone.

It works, but it's a sledgehammer when you needed a screwdriver. Probably patched this way because it was easier than tracking exactly which queries belong to which card instance.

---

## BUGS THAT ARE QUIRKY AND NOT BREAKING ANYTHING BUT "WHY"?

**The Triple Colon HA Attribute Separator**

Line 171 in `evaluateExpression.ts` - HA entity attributes are formatted as `ha_entity_attr_<entity_id>:::attribute`. Three colons. Not two, not one, THREE.

I get why you can't use a single dot - entity IDs already have dots (like `media_player.denon`). And you're probably using a colon because it's not a valid character in entity IDs. But why THREE colons instead of one? Is it to make it visually distinct? To avoid conflicts with some edge case? Or did you just think triple colon looks cool?

It works, but it's bizarre. Anyone reading a rule will see `ha_entity_attr_media_player.shield:::current_activity` and go "what the hell is :::?". It's not documented in any comments nearby.

**The Generic Rules Apply to Everything Default**

Line 117-120 in `ConditionalEffectsEngine.ts`:
```typescript
} else {
    // Case 3: A generic condition (no context part) with no specific targets.
    // Apply to all loaded parts.
    targetPksForThisEffect = allParts.map(p => p.pk);
}
```

So if you create a generic rule (like "if temperature > 25") and DON'T specify `targetPartPks`, the effect applies to EVERY part currently loaded. Want to make your entire inventory pulse because it's hot? You got it. Is that useful? Maybe for global alerts?

But it seems like a footgun. You create a simple rule, test it with 2 parts loaded, it looks great. Then you go to production with 200 parts loaded and suddenly your entire screen is flashing red. The default should probably be "apply to nothing" and make `targetPartPks` required for generic rules. Or at least log a warning like "Generic rule with no targets will apply to all X parts".

**The Very Specific Debug Log**

Lines 36-42 in `conditionalLogicThunks.ts`:
```typescript
const partForDebug = selectPartById(state, cardInstanceId, 145);
const paramForDebug = partForDebug?.parameters?.find((p: ParameterDetail) => p.pk === 134);
console.log('%c[EffectsThunk] State Check:', 'color: #F39C12; font-weight: bold;', {
  cardInstanceId,
  partExists: !!partForDebug,
  parameterValue: paramForDebug?.data
});
```

Part 145, parameter 134. That's your actual production data you're debugging. Did you have a bug where this specific part wasn't updating? Is this still happening? This log will fire on EVERY evaluation for EVERY card instance, but it only checks for part 145. If that part isn't loaded, you're just logging undefined constantly.

This is the kind of debug log you add at 2am when something's broken, then forget to remove. It's not hurting anything but it's definitely quirky.

**The Effect Priority Based on Array Order**

When multiple rules match and apply conflicting effects (like "if stock < 10, highlight red" and "if stock < 5, highlight yellow" when stock is 3), which effect wins?

Looking at the code, effects are applied in the order they're defined in the `logicItems` array. Later effects overwrite earlier ones because you're just setting properties on the `effectsToApply` object (lines 122-175 in ConditionalEffectsEngine.ts). The last value set wins.

That's fine, it's deterministic based on config order. But it's not explicit anywhere. There's no priority field, no way to say "this rule is more important". Users have to understand that the order matters and arrange their rules accordingly. And if they're editing in the UI, they need drag-and-drop reordering or the order could get messed up when they edit.

Is this documented in the editor UI? Does it show "Rule Priority" or something? Or do users just discover through trial and error that their yellow highlight never shows because red is defined later?

**The Memoize-One on Rule Evaluation**

Line 277 in `evaluateExpression.ts`:
```typescript
const memoizedInternalEvaluateRule = memoizeOne(_internalEvaluateRule);
```

`memoize-one` caches exactly one previous call. The memoized function is called from inside a loop (line 288 in `evaluateRule`). So the cache is useful if you evaluate the same rule with the same value twice in a row. But your rules are structured as:
- For each part, for each logic item, for each pair, for each rule

Rules are evaluated in whatever order they appear in the config. Unless you have duplicate rules (which would be weird), you're never evaluating the same rule twice in a row. The cache hit rate is probably near zero.

Maybe the intent was to cache across MULTIPLE evaluations? Like, if nothing changed between thunk runs, all the rule results would be cached? But `memoize-one` doesn't do that - it only caches the last call, not across invocations.

You'd need a proper memoization library (like `lodash.memoize` with a resolver) or React's `useMemo` to get real benefits. This is cargo-culted optimization that's not actually optimizing anything.

**The Cell ID Templating**

Line 251 in `ConditionalEffectsEngine.ts`:
```typescript
const templatedCellId = effect.targetCellId.replace('%%part.pk%%', String(part.pk));
```

So cell IDs can have template variables in them. That's for part-specific rules that need to target different cells for each part. Makes sense - if you have a grid where each part has a cell for its thumbnail, name, stock, etc., the cell IDs might be like `part-123-thumbnail`, `part-123-stock`. The template would be `part-%%part.pk%%-thumbnail` and it gets resolved per part.

But this is only done for `set_layout` effects (line 250). What about the other cell-specific effects? Lines 74-100 handle `animate_style`, `set_style`, and `set_visibility` with `targetCellId`, but there's no templating there. So you can't use templated cell IDs for styling/animation, only for layout changes?

Inconsistent. Either all cell effects should support templating or none should. Or maybe it's intentional because layout effects are part-specific by definition? But then why allow `targetCellId` on other effect types if they can't be templated?

**The Not-Equal Operator Alias Confusion**

Line 238-239 in `evaluateExpression.ts`:
```typescript
case '!=':
case 'not_equals':
```

You support both `!=` and `not_equals` as operators. Same for equals (`=` and `equals`), less than (`<` and `less_than`), etc. Why? Is it for backward compatibility? User convenience? The react-querybuilder UI probably generates `equals` but users typing YAML might prefer `=`?

It's not a bug, just a "why have both?" question. More surface area to maintain. If you add a new behavior to `!=`, you have to remember it also affects `not_equals`. Aliases increase the chance of inconsistency creeping in.

---

Alright, that's my initial bug safari. Some of these are legit problems (the auto-fetch undefined, the nested loop performance), some are technical debt (dual evaluators, deprecated cell logic), and some are just... choices (triple colons, memoize-one). 

The core system is solid though. The architecture makes sense. It's just accumulated some cruft and has a few sharp edges. Nothing here is unfixable, but some of it would require careful refactoring.

What's the actual pain point you're experiencing? Are these causing real issues or just making the code harder to maintain?
