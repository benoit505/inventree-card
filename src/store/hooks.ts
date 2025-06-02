import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { ActionDefinition } from '../types';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// This gives better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Selector hooks for specific state slices
 */

// Parts selectors
export const useParts = (entityId: string): any[] => 
  useAppSelector(state => state.parts.partsByEntity[entityId] || []);

export const usePartsLoading = (): boolean => 
  useAppSelector(state => state.parts.loading);

// Parameters selectors
export const useParameters = (): any => 
  useAppSelector(state => state.parameters.parameterValues);

export const useConditions = (): any[] => 
  useAppSelector(state => state.conditionalLogic.rawRuleDefinitions || []);

export const useActions = (): ActionDefinition[] => 
  useAppSelector(state => Object.values(state.actions.actionDefinitions) || []);

// UI state selectors
export const useDebugMode = (): boolean => 
  useAppSelector(state => state.ui.debug.showDebugPanel);

export const useLayoutType = (): string => 
  useAppSelector(state => state.ui.activeView);

export const useSelectedEntityId = (): number | null | undefined => 
  useAppSelector(state => state.ui.selectedPartId);

// Selectors for common data access patterns
export const useActiveView = () => {
  return useAppSelector(state => state.ui.activeView);
};

export const useDebugPanel = () => {
  return useAppSelector(state => state.ui.debug);
}; 