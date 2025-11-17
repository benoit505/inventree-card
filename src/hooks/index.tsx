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
  const queryResult = inventreeApi.useGetPartQuery({ pk, cardInstanceId }, {
    skip: !pk || !cardInstanceId,
  });
  
  console.log('%c[DataPrefetcher] Query result for PK:', 'color: #E67E22; font-weight: bold;', {
    pk,
    cardInstanceId,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    isSuccess: queryResult.isSuccess,
    error: queryResult.error,
    hasData: !!queryResult.data,
    data: queryResult.data
  });
  
  return null;
};

// Custom hook to prefetch a single part is now merged into DataPrefetcher

// Main hook to be used in the component
export const usePrefetchApiParts = (pks: number[], cardInstanceId: string) => {
  console.log('%c[usePrefetchApiParts] Hook called', 'color: #9B59B6; font-weight: bold;', { pks, cardInstanceId, pksLength: pks?.length });
  
  // Create a stable string key from the PKs array for proper dependency comparison
  const pksKey = React.useMemo(() => {
    if (!pks || pks.length === 0) return '';
    return [...new Set(pks)].sort((a, b) => a - b).join(',');
  }, [pks]);
  
  return React.useMemo(() => {
    console.log('%c[usePrefetchApiParts] useMemo running', 'color: #9B59B6; font-weight: bold;', { pksKey, cardInstanceId });
    
    if (!pksKey || !cardInstanceId) {
      console.log('%c[usePrefetchApiParts] Skipping - no pks or cardInstanceId', 'color: #E74C3C; font-weight: bold;', { pksKey, cardInstanceId });
      return [];
    }

    // Parse PKs from the key
    const uniquePks = pksKey.split(',').map(pk => parseInt(pk, 10));
    
    console.log('%c[usePrefetchApiParts] Creating prefetchers for PKs:', 'color: #27AE60; font-weight: bold;', uniquePks);
    
    return uniquePks.map(pk => 
      React.createElement(DataPrefetcher, { key: `prefetcher-${pk}`, pk, cardInstanceId })
    );
  }, [pksKey, cardInstanceId]);
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