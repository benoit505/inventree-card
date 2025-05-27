import { useDispatch, useSelector } from 'react-redux';
// Use throughout your app instead of plain `useDispatch` and `useSelector`
// This gives better TypeScript support
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
/**
 * Selector hooks for specific state slices
 */
// Parts selectors
export const useParts = (entityId) => useAppSelector(state => state.parts.entities[entityId] || []);
export const usePartsLoading = () => useAppSelector(state => state.parts.loading);
// Parameters selectors
export const useParameters = () => useAppSelector(state => state.parameters.parameters);
export const useConditions = () => useAppSelector(state => state.parameters.conditions || []);
export const useActions = () => useAppSelector(state => state.parameters.actions || []);
// UI state selectors
export const useDebugMode = () => useAppSelector(state => state.ui.debugMode);
export const useLayoutType = () => useAppSelector(state => state.ui.layoutType);
export const useSelectedEntityId = () => useAppSelector(state => state.ui.selectedEntityId);
// Selectors for common data access patterns
export const useActiveView = () => {
    return useAppSelector(state => state.ui.activeView);
};
export const useDebugPanel = () => {
    return useAppSelector(state => state.ui.debug);
};
//# sourceMappingURL=hooks.js.map