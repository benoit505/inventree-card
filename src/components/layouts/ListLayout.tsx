import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterAction, VisualModifiers, ParameterCondition } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice'; // Removed adjustPartStock for now
import { selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { selectParametersLoadingStatus } from '../../store/slices/parametersSlice';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';

import ListItem from './ListItem'; // Import the new ListItem component

interface ListLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[]; // ListLayout always expects an array of parts
}

const getListItemContainerStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers) return {};
  const styles: React.CSSProperties = {};
  if (modifiers.highlight) styles.backgroundColor = modifiers.highlight;
  if (modifiers.border) styles.border = `2px solid ${modifiers.border}`;
  // Add a base style for list items
  styles.padding = '8px';
  styles.marginBottom = '4px';
  styles.cursor = 'pointer';
  return styles;
};

const getListItemTextStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

const ListLayout: React.FC<ListLayoutProps> = ({ hass, config, parts }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  // --- Redux State Selections ---
  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigGlobal = useSelector(selectParameterConfig);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  // Global parameter actions, if any (passed to ListItem)
  const globalParameterActions = useSelector((state: RootState) => state.parameters.config?.actions || []);

  // --- Internal State ---
  const [requiredPartIds, setRequiredPartIds] = useState<Set<number>>(new Set());
  const [isLoadingParameters, setIsLoadingParameters] = useState<boolean>(false);

  // --- Helper to extract referenced part IDs from conditions ---
  const getReferencedPartIdsFromConditions = useCallback((conditions?: ParameterCondition[]): number[] => {
    if (!conditions) return [];
    const ids = new Set<number>();
    const conditionRegex = /^part:(\d+):/;
    conditions.forEach(condition => {
        if (typeof condition.parameter === 'string') {
            const match = condition.parameter.match(conditionRegex);
            if (match && match[1]) {
                const id = parseInt(match[1], 10);
                if (!isNaN(id)) {
                    ids.add(id);
                }
            }
        }
    });
    return Array.from(ids);
  }, []);

  // --- Effects ---
  // Calculate requiredParameterPartIds
  useEffect(() => {
    logger.log('ListLayout React', 'useEffect[parts, parameterConfigGlobal.conditions] - Recalculating required IDs.', { numParts: parts.length, conditions: parameterConfigGlobal?.conditions?.length });
    const currentPartPks = parts.map(p => p.pk);
    const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal?.conditions);
    const newIds = new Set([...currentPartPks, ...referencedIds]);

    if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
        logger.log('ListLayout React', `Setting new requiredParameterPartIds. Old: [${Array.from(requiredPartIds).join(', ')}], New: [${Array.from(newIds).join(', ')}]`);
        setRequiredPartIds(newIds);
    } else {
        logger.log('ListLayout React', 'No change to requiredParameterPartIds.');
    }
  }, [parts, parameterConfigGlobal?.conditions, getReferencedPartIdsFromConditions, logger, requiredPartIds.size]); // Added requiredPartIds.size to dependencies to ensure stable comparison logic

  // Calculate isLoadingParameters
  useEffect(() => {
    logger.log('ListLayout React', 'useEffect[requiredPartIds, allLoadingStatuses] - Recalculating isLoadingParameters.', { requiredNum: requiredPartIds.size });
    if (!config?.parameters?.enabled || requiredPartIds.size === 0) {
        if (isLoadingParameters) setIsLoadingParameters(false); // Ensure it's false if params disabled or no req IDs
        return;
    }
    let loading = false;
    for (const id of requiredPartIds) {
      if (allLoadingStatuses[id] === 'loading') {
        loading = true;
        break;
      }
    }
    if (isLoadingParameters !== loading) {
        logger.log('ListLayout React', `Setting isLoadingParameters to ${loading}.`);
        setIsLoadingParameters(loading);
    }
  }, [requiredPartIds, allLoadingStatuses, config?.parameters?.enabled, logger, isLoadingParameters]);

  // Fetch parameters
  // Step 1: Memoize the calculation of idsToFetch
  const calculateCurrentIdsToFetch = useCallback(() => {
    logger.log('ListLayout React', 'calculateCurrentIdsToFetch - Recalculating.', { directApiEnabled: config?.direct_api?.enabled, requiredNum: requiredPartIds.size });
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) {
      logger.log('ListLayout React', 'FetchParameters useMemo (calc): Skipped (Direct API disabled or no required part IDs)');
      return [];
    }

    const newIdsToFetch: number[] = [];
    const reasonsForFetching: Record<number, string> = {}; // Keep for logging detailed evaluation

    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      reasonsForFetching[id] = status; // Log current status for all required IDs
      if (status === 'idle' || status === 'failed') {
        newIdsToFetch.push(id);
      }
    });
    
    newIdsToFetch.sort((a,b) => a-b); // Sort for stable string comparison

    logger.log('ListLayout React', 'FetchParameters useMemo (calc): Evaluation Complete', {
      requiredPartIds: Array.from(requiredPartIds),
      allStatuses: reasonsForFetching,
      memoizedIdsToFetch: newIdsToFetch,
      directApiEnabled: config?.direct_api?.enabled
    });
    return newIdsToFetch;
  }, [config?.direct_api?.enabled, requiredPartIds, allLoadingStatuses, logger]);

  const idsToFetch = useMemo(() => calculateCurrentIdsToFetch(), [calculateCurrentIdsToFetch]);
  
  const prevDispatchedIdsStringRef = useRef<string>(''); // Initialize useRef

  // Step 2: useEffect now depends on the memoized 'idsToFetch'
  useEffect(() => {
    const idsStringToDispatch = idsToFetch.join(',');
    const prevString = prevDispatchedIdsStringRef.current;

    logger.log('ListLayout React', 'useEffect[fetchParameters] - Evaluation Start.', {
        currentIdsString: idsStringToDispatch,
        previousIdsString: prevString,
        numToFetch: idsToFetch.length
    });

    if (idsStringToDispatch === prevString && idsToFetch.length > 0) {
        logger.log('ListLayout React', 'useEffect[fetchParameters] - Skip dispatch: IDs to fetch are the same as previously dispatched (and not empty).');
        return;
    }

    if (idsToFetch.length === 0 && (prevString === '' || prevString.length === 0)) {
        logger.log('ListLayout React', 'useEffect[fetchParameters] - Skip dispatch: No IDs to fetch and no change from empty/initial state.');
        prevDispatchedIdsStringRef.current = idsStringToDispatch; // Still update ref if it was truly empty to empty
        return;
    }

    if (idsToFetch.length > 0) {
      logger.log('ListLayout React', `Dispatching fetchParametersForReferencedParts for IDs: [${idsToFetch.join(', ')}] (Prev: [${prevString}])`);
      dispatch(fetchParametersForReferencedParts(idsToFetch));
    } else {
        logger.log('ListLayout React', `No parameter IDs to fetch in this cycle (idsToFetch is empty). Previously dispatched: [${prevString}]`);
        // If idsToFetch is empty, but prevString was not, it means we previously fetched and now don't need to.
        // No dispatch is needed.
    }
    prevDispatchedIdsStringRef.current = idsStringToDispatch; // Update ref AFTER dispatching or deciding not to.

  }, [dispatch, idsToFetch, logger]); // Only idsToFetch, dispatch, and logger are direct dependencies

  // --- Filtering and Sorting ---
  const filteredAndSortedParts = useMemo(() => {
    logger.log('ListLayout React', 'useMemo[filteredAndSortedParts] - Recalculating.', { numParts: parts.length });
    if (!parts) return [];

    let processedParts = parts;

    // Visibility filtering is now primarily handled within ListItem based on its own conditionalEffect.isVisible.
    // However, ListLayout might still want to filter out parts that are fundamentally not displayable 
    // or for which essential data (like part.pk) is missing, before even attempting to render ListItems.
    // For now, we assume `parts` prop contains valid items and defer visibility to ListItem.

    // Sorting: If sorting needs to happen based on conditional effects (e.g., priority),
    // ListLayout would need to fetch all ConditionalPartEffects for all its parts here.
    // For simplicity, we will keep basic PK sort. ListItem itself handles its priority class.
    processedParts.sort((a, b) => {
        return a.pk - b.pk; // Basic stable sort
    });
    logger.log('ListLayout React', `Parts after basic sorting: ${processedParts.length}`);
    return processedParts;
  }, [parts, logger]); // Removed dependencies related to parameters/visibility as it's now in ListItem

  // --- Event Handlers (to be passed to ListItem) ---
  const handleLocatePart = useCallback((partId: number) => {
    logger.log('ListLayout React', `Locating part: ${partId}`);
    dispatch(locatePartById(partId));
  }, [dispatch, logger]);
  
  const handleExecuteParameterAction = useCallback((partId: number, action: ParameterAction) => {
    logger.log('ListLayout React', `Handling parameter action click: "${action.label}" for part ${partId}`, { action });
    dispatch(updateParameterValue({ partId: partId, paramName: action.parameter, value: action.value }));
  }, [dispatch, logger]);

  // --- Render Logic ---
  if (!config) {
    return <div className="list-container loading-container"><div className="loading">Loading config...</div></div>;
  }
  if (!parts || parts.length === 0) {
    return <div className="list-container no-parts"><p>No parts to display.</p></div>;
  }
  if (isLoadingParameters && config.parameters?.enabled) {
    logger.log('ListLayout React Render', 'Showing Loading Parameters state.');
    return <div className="list-container loading-container"><div className="loading">Loading parameters...</div></div>;
  }

  if (filteredAndSortedParts.length === 0) {
    logger.log('ListLayout React Render', 'No parts to display after filtering.');
    return <div className="list-container no-parts"><p>All parts filtered out or parameters still loading for relevant items.</p></div>;
  }

  const displayConfig = config.display || {};

  logger.log('ListLayout React Render', `Rendering with ${filteredAndSortedParts.length} parts.`);

  return (
    <div className="list-container" style={{ padding: '8px' }}>
      {filteredAndSortedParts.map(part => {
        if (!part || typeof part.pk !== 'number') return null; // Basic guard
        // ListItem will handle its own visibility and conditional styling
        return (
          <ListItem
            key={part.pk}
            part={part}
            config={config}
            hass={hass}
            onLocate={handleLocatePart}
            onParameterAction={handleExecuteParameterAction}
            parameterActions={globalParameterActions} // Pass down global actions
          />
        );
      })}
    </div>
  );
};

export default ListLayout; 