import { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { ActionDefinition } from '../types';
export declare const useAppDispatch: () => AppDispatch;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
/**
 * Selector hooks for specific state slices
 */
export declare const useParts: (entityId: string) => any[];
export declare const usePartsLoading: () => boolean;
export declare const useParameters: () => any;
export declare const useConditions: () => any[];
export declare const useActions: () => ActionDefinition[];
export declare const useDebugMode: () => boolean;
export declare const useLayoutType: () => string;
export declare const useSelectedEntityId: () => number | null | undefined;
export declare const useActiveView: () => string;
export declare const useDebugPanel: () => {
    showDebugPanel: boolean;
    activeTab: string;
};
