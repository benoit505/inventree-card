import { setFeatureFlag, resetFeatureFlags, FeatureFlags } from '../../src/adapters/feature-flags';

/**
 * Set up feature flags for testing
 */
export function setupTestFeatureFlags(flags: Partial<FeatureFlags> = {}) {
  resetFeatureFlags();
  
  Object.entries(flags).forEach(([flag, value]) => {
    setFeatureFlag(flag as keyof FeatureFlags, !!value);
  });
}

/**
 * Clean up after feature flag tests
 */
export function cleanupFeatureFlags() {
  resetFeatureFlags();
} 