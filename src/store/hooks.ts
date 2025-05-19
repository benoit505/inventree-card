import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// This gives better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Selector hooks for specific state slices
 */

// Parts selectors
export const useParts = (entityId: string): any[] => 
  useAppSelector(state => state.parts.entities[entityId] || []);

export const usePartsLoading = (): boolean => 
  useAppSelector(state => state.parts.loading);

// Parameters selectors
export const useParameters = (): any => 
  useAppSelector(state => state.parameters.parameters);

export const useConditions = (): any[] => 
  useAppSelector(state => state.parameters.conditions || []);

export const useActions = (): any[] => 
  useAppSelector(state => state.parameters.actions || []);

// UI state selectors
export const useDebugMode = (): boolean => 
  useAppSelector(state => state.ui.debugMode);

export const useLayoutType = (): string => 
  useAppSelector(state => state.ui.layoutType);

export const useSelectedEntityId = (): string | null => 
  useAppSelector(state => state.ui.selectedEntityId);

// Selectors for common data access patterns
export const useActiveView = () => {
  return useAppSelector(state => state.ui.activeView);
};

export const useDebugPanel = () => {
  return useAppSelector(state => state.ui.debug);
}; 