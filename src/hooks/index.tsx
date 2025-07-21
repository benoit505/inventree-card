import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import React from 'react';
import { inventreeApi } from '../store/apis/inventreeApi';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

interface DataPrefetcherProps {
  pk: number;
  cardInstanceId: string;
}

const DataPrefetcher: React.FC<DataPrefetcherProps> = ({ pk, cardInstanceId }) => {
  // This query will now only run if both pk and cardInstanceId are valid.
  inventreeApi.useGetPartQuery({ pk, cardInstanceId }, {
    skip: !pk || !cardInstanceId,
  });
  return null;
};

// Custom hook to prefetch a single part is now merged into DataPrefetcher

// Main hook to be used in the component
export const usePrefetchApiParts = (pks: number[], cardInstanceId: string) => {
  console.log('%c[usePrefetchApiParts] Hook called', 'color: #9B59B6; font-weight: bold;', { pks, cardInstanceId });
  return React.useMemo(() => {
    if (!pks || pks.length === 0 || !cardInstanceId) {
      return [];
    }

    // Ensure we don't have duplicate PKs to avoid creating duplicate components/hooks
    const uniquePks = [...new Set(pks)];
    
    return uniquePks.map(pk => 
      React.createElement(DataPrefetcher, { key: `prefetcher-${pk}`, pk, cardInstanceId })
    );
  }, [pks, cardInstanceId]);
};

/**
 * Selector hooks for specific state slices
 */

// Parts selectors
// export const useParts = (entityId: string): any[] => 
//   useAppSelector(state => state.parts.partsByEntity[entityId] || []);

// export const usePartsLoading = (): boolean => 
//   useAppSelector(state => state.parts.loading);

// Parameters selectors
// export const useParameters = (): any => 
//   useAppSelector(state => state.parameters.parameterValues);

// export const useConditions = (): any[] => 
//   useAppSelector(state => state.conditionalLogic.definedLogicItems || []);

// export const useActions = (): ActionDefinition[] => 
//   useAppSelector(state => Object.values(state.actions.actionDefinitions) || []);

// UI state selectors
// export const useDebugMode = (): boolean => 
//   useAppSelector(state => state.ui.debug.showDebugPanel);

// export const useLayoutType = (): string => 
//   useAppSelector(state => state.ui.activeView);

// export const useSelectedEntityId = (): number | null | undefined => 
//   useAppSelector(state => state.ui.selectedPartId);

// Selectors for common data access patterns
// export const useActiveView = () => {
//   return useAppSelector(state => state.ui.activeView);
// };

// export const useDebugPanel = () => {
//   return useAppSelector(state => state.ui.debug);
// }; 