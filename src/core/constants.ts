import { AnimationPreset } from '../types';

export const CARD_VERSION = '2.0.0';
export const CARD_NAME = 'inventree-card';
export const CARD_TYPE = 'inventree-card';
export const EDITOR_NAME = 'inventree-card-editor';

// Default configuration for the card
// This is a legacy object and is now deprecated.
// The canonical source of truth for default configuration is `DEFAULT_CONFIG` in `src/core/settings.ts`.
// export const DEFAULT_CONFIG: Record<string, any> = { ... };

// Editor schema for configuration
// This is a legacy object and is now deprecated.
// The editor now dynamically builds its interface based on the configuration state.
// export const SCHEMA = [ ... ];

// Import settings schema directly if needed elsewhere
// export { SETTINGS_SCHEMA } from './settings';

export const ANIMATION_PRESETS: { [key: string]: AnimationPreset } = {
  shake: {
    name: 'Shake',
    animation: {
      animate: {
        x: [0, -5, 5, -5, 5, 0],
      },
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  },
  pulse: {
    name: 'Pulse',
    animation: {
      animate: {
        scale: [1, 1.05, 1],
      },
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  },
  highlight: {
    name: 'Highlight',
    animation: {
      animate: {
        // This is a placeholder; a real highlight would likely be
        // a style effect, but we include it for UI consistency.
        opacity: [1, 0.7, 1],
      },
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  },
};