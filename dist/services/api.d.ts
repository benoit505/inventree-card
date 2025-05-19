import { InventreeItem } from "../core/types";
export declare class InvenTreeDirectAPI {
    private apiUrl;
    private apiKey;
    private useHttps;
    private fallbackEnabled;
    private lastApiCall;
    private readonly MIN_API_CALL_INTERVAL;
    private apiCallCount;
    private fallbackCount;
    private _debugInterval;
    private apiTotalTime;
    private apiCallSuccesses;
    private apiCallFailures;
    private logger;
    private parameterService;
    private _sentNotifications;
    constructor(apiUrl: string, apiKey: string);
    setParameterService(service: any): void;
    /**
     * Improved parameter retrieval method with proper rate limiting
     */
    getParameterValue(partId: number, paramName: string, fallbackData?: any): Promise<string | null>;
    private getFallbackParameterValue;
    setFallbackEnabled(enabled: boolean): void;
    testConnection(quiet?: boolean): Promise<boolean>;
    getApiStats(): {
        apiCalls: number;
        fallbackCalls: number;
    };
    getApiUrl(): string;
    testBasicAuth(username: string, password: string): Promise<boolean>;
    getPartParameters(partId: number): Promise<any[]>;
    testBasicAuthWithEndpoint(username: string, password: string, endpoint: string): Promise<any>;
    testConnectionExactFormat(quiet?: boolean): Promise<boolean>;
    testParameterAPI(quiet?: boolean): Promise<boolean>;
    destroy(): void;
    logApiStats(): void;
    updateParameterDirectly(partId: number, parameterId: number, value: string): Promise<boolean>;
    getPerformanceStats(): {
        apiCalls: number;
        successes: number;
        failures: number;
        fallbackCalls: number;
        avgCallTime: number;
    };
    private _parameterValues;
    private getLastKnownParameterValue;
    private updateLastKnownParameterValue;
    /**
     * Notify system about parameter change
     */
    private notifyParameterChanged;
    /**
     * Check if fallback mode is enabled
     * @returns True if fallback mode is enabled
     */
    isFallbackEnabled(): boolean;
    /**
     * Reset rate limiting for testing purposes
     */
    resetRateLimiting(): void;
    /**
     * Update a parameter value for a part
     * @param partId The part ID
     * @param paramName The parameter name
     * @param value The new value
     * @returns Promise resolving to true if successful, false otherwise
     */
    updateParameter(partId: number, paramName: string, value: string): Promise<boolean>;
    /**
     * Fetch parameter data for a specific part
     * This allows fetching either a single parameter or all parameters for a part
     * @param partId Part ID to fetch parameters for
     * @param parameterName Optional parameter name to filter by
     * @returns Promise resolving to void - parameter data is processed internally and synced to state
     */
    fetchParameterData(partId: number, parameterName?: string): Promise<void>;
    /**
     * Check if API is connected
     * @returns True if API is available and connected
     */
    isApiConnected(): boolean;
    /**
     * Search for parts using the InvenTree API
     * @param query The search term
     * @returns Promise resolving to an array of parts matching the query
     */
    searchParts(query: string): Promise<InventreeItem[]>;
    private fetchDataInternal;
}
