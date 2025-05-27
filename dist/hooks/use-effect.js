/**
 * Simple hook-like utilities for LitElement components.
 * Since LitElement doesn't have React's useEffect, we'll create a similar pattern.
 */
// Storage for effects
const effectsMap = new WeakMap();
/**
 * Simulates React's useEffect for LitElement
 *
 * @param hostComponent The LitElement component (this)
 * @param effectId A unique ID for this effect within the component
 * @param effect The effect function to run
 * @param deps Optional dependency array
 */
export function useEffect(hostComponent, effectId, effect, deps) {
    // Get or create effects map for this component
    let componentEffects = effectsMap.get(hostComponent);
    if (!componentEffects) {
        componentEffects = new Map();
        effectsMap.set(hostComponent, componentEffects);
    }
    // Get existing effect data
    const existingEffect = componentEffects.get(effectId);
    // Check if dependencies have changed
    const depsChanged = !existingEffect || !deps || !existingEffect.deps ||
        deps.length !== existingEffect.deps.length ||
        deps.some((dep, i) => dep !== existingEffect.deps[i]);
    // If deps changed, run the effect
    if (depsChanged) {
        // Run cleanup if exists
        if (existingEffect === null || existingEffect === void 0 ? void 0 : existingEffect.cleanup) {
            existingEffect.cleanup();
        }
        // Run the effect
        const cleanup = effect();
        // Store effect data
        componentEffects.set(effectId, {
            deps,
            cleanup: typeof cleanup === 'function' ? cleanup : undefined,
            effect
        });
    }
}
/**
 * Runs all cleanup functions for a component
 * Call this in disconnectedCallback
 *
 * @param hostComponent The LitElement component
 */
export function cleanupEffects(hostComponent) {
    const componentEffects = effectsMap.get(hostComponent);
    if (componentEffects) {
        for (const [, effectData] of componentEffects) {
            if (effectData.cleanup) {
                effectData.cleanup();
            }
        }
        effectsMap.delete(hostComponent);
    }
}
//# sourceMappingURL=use-effect.js.map