import { DisplayConfig, DisplayConfigKey } from '../types';
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
export declare const useElementDisplayStatus: (cardInstanceId: string | undefined, displayKey: DisplayConfigKey, displayConfig: Partial<DisplayConfig> | undefined) => boolean;
