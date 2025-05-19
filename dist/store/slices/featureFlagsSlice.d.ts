import { RootState } from '../index';
/**
 * Feature flags to control the gradual migration from singleton state to Redux
 */
export interface FeatureFlags {
    useReduxForParts: boolean;
    useReduxForParameters: boolean;
    useReduxForRendering: boolean;
    useReduxForCard: boolean;
    useReduxForWebSocket: boolean;
    useReduxRenderingService: boolean;
    useReduxParameterService: boolean;
    useReduxTimers: boolean;
    useBaseLayoutAdapter: boolean;
    useConnectedComponents: boolean;
    trackReduxUsage: boolean;
    useReduxForSearching: boolean;
    showDebugView: boolean;
    logReduxEvents: boolean;
}
export declare const featureFlagsSlice: any;
export declare const setFeatureFlag: any, setAllFeatureFlags: any, enableFeature: any, disableFeature: any;
export declare const getFeatureFlags: (state: RootState) => FeatureFlags;
export declare const getFeatureFlag: (state: RootState, flag: keyof FeatureFlags) => boolean;
declare const _default: any;
export default _default;
