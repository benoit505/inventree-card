import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { ActionDefinition } from '../types';
import { inventreeApi } from './apis/inventreeApi';
import React, { useMemo } from 'react';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// This gives better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * A tiny, single-purpose component that calls the useGetPartQuery hook.
 * This is the correct way to call a hook for each item in a list.
 */
const DataPrefetcher: React.FC<{ partId: number; apiInitialized: boolean }> = React.memo(({ partId, apiInitialized }) => {
  inventreeApi.useGetPartQuery(partId, {
    skip: !apiInitialized,
  });
  return null; // This component does not render anything.
});

/**
 * A dedicated hook whose only job is to subscribe to the RTK Query endpoints
 * for all parts that are referenced in a card's config. This ensures the data
 * is fetched and cached by RTK Query.
 * @param pks - An array of Part Primary Keys to prefetch.
 * @param apiInitialized - A boolean flag that acts as a "start button".
 * @returns A memoized array of React elements to be rendered.
 */
export const usePrefetchApiParts = (pks: number[], apiInitialized: boolean): React.ReactElement[] => {
  // This log is helpful for debugging the prefetch mechanism.
  // Let's keep it but use the logger.
  logger.log('usePrefetchApiParts', `Hook running. apiInitialized: ${apiInitialized}, PKs to check:`, { pks, level: 'debug' });

  // Return a memoized array of components.
  // The outer useMemo depends on the stringified PKs array to prevent re-renders
  // if the array reference changes but the contents do not.
  const memoizedPrefetchers = useMemo(() => {
    return pks.map(pk => <DataPrefetcher key={`prefetch-${pk}`} partId={pk} apiInitialized={apiInitialized} />);
  }, [JSON.stringify(pks), apiInitialized]);

  return memoizedPrefetchers;
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