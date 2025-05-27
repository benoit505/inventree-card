/**
 * Simple hook-like utilities for LitElement components.
 * Since LitElement doesn't have React's useEffect, we'll create a similar pattern.
 */
type Cleanup = () => void;
/**
 * Simulates React's useEffect for LitElement
 *
 * @param hostComponent The LitElement component (this)
 * @param effectId A unique ID for this effect within the component
 * @param effect The effect function to run
 * @param deps Optional dependency array
 */
export declare function useEffect(hostComponent: any, effectId: string, effect: () => Cleanup | void, deps?: any[]): void;
/**
 * Runs all cleanup functions for a component
 * Call this in disconnectedCallback
 *
 * @param hostComponent The LitElement component
 */
export declare function cleanupEffects(hostComponent: any): void;
export {};
