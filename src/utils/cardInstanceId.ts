import { ConditionalLoggerEngine } from '../core/logging/ConditionalLoggerEngine';

const ID_CACHE = new Map<string, string>();
const CARD_INSTANCE_PREFIX = 'card-inst-';

// Register a category for this utility and get a logger instance.
// Since this isn't a component, we use a global logger without an instance ID.
ConditionalLoggerEngine.getInstance().registerCategory('CardIdUtil', { enabled: false, level: 'info' });
const logger = ConditionalLoggerEngine.getInstance().getLogger('CardIdUtil');

/**
 * A simple hashing function for a string.
 * @param str The string to hash.
 * @returns A 32-bit integer hash.
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Generates a truly stable ID for a card instance.
 * It prioritizes using the Lovelace-provided unique key for the card's position
 * on the dashboard (`view_layout.key`). This is the most stable identifier.
 * If this key is not present, it falls back to hashing the config.
 *
 * @param config The card's Lovelace configuration object.
 * @returns A stable, unique identifier for the card instance.
 */
export const generateStableCardInstanceId = (config: any): string => {
  logger.debug('generateStableCardInstanceId', 'Attempting to generate card instance ID.');

  // Priority 1: Use the Lovelace-provided stable key if it exists.
  if (config?.view_layout?.key) {
    const newId = `card-inst-${config.view_layout.key}`;
    logger.info('generateStableCardInstanceId', `Generated ID using Lovelace view_layout.key: ${newId}`);
    return newId;
  }

  // Priority 2: Fallback to hashing the config for other cases.
  logger.debug('generateStableCardInstanceId', 'Lovelace key not found, falling back to config hash.');
  
  // We stringify the config, but exclude properties that are highly dynamic
  // and not part of the card's fundamental identity on the dashboard.
  const configString = JSON.stringify(config, (key, value) => {
    if (key === 'layout' || key === 'layout_overrides' || key.startsWith('debug_')) {
        return undefined;
    }
    return value;
  });

  const hash = simpleHash(configString);
  const newId = `card-inst-fallback-${Math.abs(hash)}`;

  logger.info('generateStableCardInstanceId', `Generated ID using fallback hash: ${newId}`);
  logger.verbose('generateStableCardInstanceId', 'Stringified config for fallback hash:', { configString });

  return newId;
}; 