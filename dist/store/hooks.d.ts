import { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from './index';
export declare const useAppDispatch: () => any;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
/**
 * Selector hooks for specific state slices
 */
export declare const useParts: (entityId: string) => any[];
export declare const usePartsLoading: () => boolean;
export declare const useParameters: () => any;
export declare const useConditions: () => any[];
export declare const useActions: () => any[];
export declare const useDebugMode: () => boolean;
export declare const useLayoutType: () => string;
export declare const useSelectedEntityId: () => string | null;
export declare const useActiveView: () => any;
export declare const useDebugPanel: () => any;
