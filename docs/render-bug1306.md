# Analysis of Render Loop - 13/06

## The Core Problem: A Flawed Unification Strategy

After extensive debugging, we've identified that the root cause of the persistent render loop is not a single faulty selector or `useEffect` dependency, but a fundamental architectural flaw in our data-fetching strategy.

Our previous approach attempted to **unify** all data sources (`HASS` sensors, direct `API` calls) into a single, combined state (`selectCombinedParts`) and then trigger all logic and rendering based on changes to that unified state.

This approach is flawed because it ignores a critical truth: **the data sources are independent, asynchronous races.**

## The "Separate Races" Analogy

1.  **The HASS Sensor Race:** This race is very fast. The data from `HASS` entities is already present in the `hass` object provided by Home Assistant. Processing it is a synchronous operation.

2.  **The RTK Query API Race:** This race is slow. It involves network requests to the InvenTree API. It has its own lifecycle, managed entirely by RTK Query, which includes `pending`, `fulfilled`, and `rejected` states.

Our "unification" strategy created a "T-shape too high up the ladder." We were effectively forcing the result of the fast race to wait for, or be re-evaluated alongside, the result of the slow race.

## The Consequence: The Inevitable Loop

When the `InventreeCard.tsx` component renders, this is what happens:

1.  The fast HASS data is processed immediately, updating the Redux store.
2.  This initial update causes our main `useEffect` hook (which observes the *unified* state) to run.
3.  The hook dispatches the `evaluateAndApplyEffectsThunk`.
4.  At this exact moment, the slow API race has not finished. The `getActualValue` function is called, but it cannot find the API-dependent data (e.g., Part 145), so it returns an incomplete/incorrect result.
5.  This incorrect evaluation still causes a state change in the `visualEffectsSlice`.
6.  The state change triggers a re-render of the component.
7.  The re-render causes the `useEffect` to run again, and the loop continues at the speed of the fastest possible render cycle, leading to a crash.

The core issue is that our primary `useEffect` hook is trying to fire based on an unstable, perpetually-changing combined state, rather than being triggered intelligently by the completion of the individual "races."

## The Path Forward

The solution is not to find the perfect set of dependencies for a single, unified effect. The solution is to **decouple our logic** and respect the independent nature of the data sources. Future architectural changes must be based on this principle.
