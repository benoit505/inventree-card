import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DisplayConfig, DisplayConfigKey, ConditionalVisibility } from '../types';
import { selectElementVisibility } from '../store/slices/visualEffectsSlice';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

/**
 * Custom hook to determine if a standard display element should be visible.
 * It considers the static config (boolean or ConditionalVisibility.default)
 * and overrides it with dynamic state from visualEffectsSlice if a conditionId is set
 * and an effect has been evaluated for it.
 *
 * @param cardInstanceId The ID of the card instance.
 * @param displayKey The key of the display element (e.g., 'show_name').
 * @param displayConfig The display configuration object from the card config.
 * @returns boolean - True if the element should be visible, false otherwise.
 */
export const useElementDisplayStatus = (
  cardInstanceId: string | undefined,
  displayKey: DisplayConfigKey,
  displayConfig: Partial<DisplayConfig> | undefined
): boolean => {
  const staticSetting = displayConfig?.[displayKey];

  let defaultValue = false;
  let conditionId: string | undefined = undefined;

  if (typeof staticSetting === 'boolean') {
    defaultValue = staticSetting;
  } else if (typeof staticSetting === 'object' && staticSetting !== null && 'default' in staticSetting) {
    const conditionalSetting = staticSetting as ConditionalVisibility;
    defaultValue = conditionalSetting.default;
    conditionId = conditionalSetting.conditionId;
  } else if (staticSetting === undefined) {
    // If the displayKey itself is not in displayConfig, assume false or handle based on global defaults if any.
    // For now, defaulting to false if not specified at all.
    defaultValue = false;
  }

  const dynamicVisibility = useSelector((state: RootState) => {
    if (cardInstanceId && conditionId) {
      return selectElementVisibility(state, cardInstanceId, displayKey);
    }
    return undefined;
  });

  if (typeof dynamicVisibility === 'boolean') {
    // logger.log('useElementDisplayStatus', `Dynamic visibility for ${displayKey} (card: ${cardInstanceId}): ${dynamicVisibility}`);
    return dynamicVisibility;
  }

  // logger.log('useElementDisplayStatus', `Default visibility for ${displayKey} (card: ${cardInstanceId}): ${defaultValue}`);
  return defaultValue;
}; 