export type ViewType = 'grid' | 'list' | 'detail' | 'settings' | 'debug';
export interface UiState {
    activeView: string;
    selectedPartId: number | null;
    debug: {
        showDebugPanel: boolean;
        activeTab: string;
    };
    loading: boolean;
}
export declare const setActiveView: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/setActiveView">, setSelectedPart: import("@reduxjs/toolkit").ActionCreatorWithPayload<number | null, "ui/setSelectedPart">, toggleDebugPanel: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ui/toggleDebugPanel">, setDebugTab: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "ui/setDebugTab">, setLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "ui/setLoading">;
declare const _default: import("redux").Reducer<UiState>;
export default _default;
