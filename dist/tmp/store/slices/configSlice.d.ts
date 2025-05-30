import { RootState } from '../index';
import { InventreeCardConfig, PerformanceConfig, DirectApiConfig, DataSourceConfig, DisplayConfig, InventreeParameterFetchConfig, ConditionRuleDefinition, ConditionalLogicItem } from '../../types';
export interface ConfigState extends InventreeCardConfig {
    _configLastUpdated?: number;
}
export declare const setConfigAction: import("@reduxjs/toolkit").ActionCreatorWithPayload<InventreeCardConfig, "config/setConfigAction">;
export declare const selectFullConfig: (state: RootState) => ConfigState;
export declare const selectPresentationConfig: (state: RootState) => InventreeCardConfig["presentation"];
export declare const selectApiConfigFromCardConfig: (state: RootState) => DirectApiConfig | undefined;
export declare const selectInteractionsConfig: (state: RootState) => InventreeCardConfig["interactions"];
export declare const selectConditionalLogicRules: (state: RootState) => ConditionRuleDefinition[];
export declare const selectConditionalDefinedLogics: (state: RootState) => ConditionalLogicItem[];
export declare const selectInventreeParametersToFetch: (state: RootState) => InventreeParameterFetchConfig[];
export declare const selectDisplaySetting: <K extends keyof DisplayConfig>(state: RootState, key: K) => DisplayConfig[K] | undefined;
export declare const selectLayoutOptions: (state: RootState) => any;
export declare const selectCardStyling: (state: RootState) => any;
export declare const selectPerformanceSettings: (state: RootState) => PerformanceConfig | undefined;
export declare const selectDebugSettings: (state: RootState) => InventreeCardConfig["system"]["debug"];
export declare const selectAllDataSources: (state: RootState) => DataSourceConfig | undefined;
export declare const selectPrimaryEntityId: (state: RootState) => string | undefined | null;
export declare const selectDirectApiEnabled: (state: RootState) => boolean;
export declare const selectConfig: (state: RootState) => InventreeCardConfig;
declare const _default: import("redux").Reducer<ConfigState>;
export default _default;
