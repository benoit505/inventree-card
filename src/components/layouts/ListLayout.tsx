import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterAction, VisualModifiers, ParameterCondition } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice'; // Removed adjustPartStock for now
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { selectParametersLoadingStatus, selectParametersForPart } from '../../store/slices/parametersSlice';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';

import PartThumbnail from '../part/PartThumbnail'; // Added import
import PartButtons from '../part/PartButtons'; // Added import

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
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.loadingStatus || {});
  const allParameterValuesGlobal = useSelector((state: RootState) => state.parameters.parameterValues || {});

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
  useEffect(() => {
    logger.log('ListLayout React', 'useEffect[fetchParameters] - Checking if parameters need fetching.', { directApiEnabled: config?.direct_api?.enabled, requiredNum: requiredPartIds.size });
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) {
      return;
    }

    const idsToFetch: number[] = [];
    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      if (status === 'idle' || status === 'failed') {
        idsToFetch.push(id);
      }
    });

    if (idsToFetch.length > 0) {
      logger.log('ListLayout React', `Dispatching fetchParametersForReferencedParts for IDs: [${idsToFetch.join(', ')}]`);
      dispatch(fetchParametersForReferencedParts(idsToFetch));
    } else {
        logger.log('ListLayout React', 'No parameter IDs to fetch.');
    }
  }, [dispatch, config?.direct_api?.enabled, requiredPartIds, allLoadingStatuses, logger]);

  // --- Filtering and Sorting ---
  const filteredAndSortedParts = useMemo(() => {
    logger.log('ListLayout React', 'useMemo[filteredAndSortedParts] - Recalculating.', { numParts: parts.length, conditions: config?.parameters?.conditions?.length });
    if (!parts) return [];

    let processedParts = parts;

    if (config?.parameters?.enabled && config.parameters.conditions) {
      processedParts = parts.filter(part => {
        if (!part) return false;
        return checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal);
      });
      logger.log('ListLayout React', `Parts after visibility filter: ${processedParts.length}`);
    }

    // Basic sorting by priority (example, can be enhanced)
    // This assumes visualModifiers are available per part, which they should be via useSelector in the map below
    // For a more robust sort, we might need to select all visual modifiers here.
    // For now, let's keep it simple and sort by part.pk as a stable sort.
    processedParts.sort((a, b) => {
        // Placeholder for future priority sorting
        return a.pk - b.pk; // Basic stable sort
    });
    logger.log('ListLayout React', `Parts after sorting: ${processedParts.length}`);
    return processedParts;
  }, [parts, config?.parameters, allLoadingStatuses, allParameterValuesGlobal, logger]);

  // --- Event Handlers ---
  const handleLocateListItem = useCallback((partId: number) => {
    logger.log('ListLayout React', `Locating part: ${partId}`);
    dispatch(locatePartById(partId));
  }, [dispatch, logger]);
  
  const handleParameterActionClick = useCallback((currentPartId: number, action: ParameterAction) => {
    logger.log('ListLayout React', `Handling parameter action click: "${action.label}" for part ${currentPartId}`, { action });
    dispatch(updateParameterValue({ partId: currentPartId, parameterName: action.parameter, value: action.value }));
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
        if (!part) return null; // Should not happen if filtered correctly
        const partId = part.pk;
        // Get modifiers for THIS part inside the map, as they are part-specific
        const visualModifiers = useSelector((state: RootState) => selectVisualModifiers(state, partId));
        const parameterActionsForPart = useSelector((state: RootState) => state.parameters.config?.actions || []); // Assuming actions are global for now
        
        const isCurrentlyLocating = locatingPartId === partId;

        const itemContainerStyle = getListItemContainerStyle(visualModifiers);
        const itemTextStyle = getListItemTextStyle(visualModifiers);
        
        // Simplified class logic for now
        const itemClasses = [
            'list-item',
            isCurrentlyLocating ? 'locating' : '',
            visualModifiers?.priority ? `priority-${visualModifiers.priority}` : ''
        ].filter(Boolean).join(' ');

        return (
          <div
            key={partId}
            className={itemClasses}
            style={itemContainerStyle}
            onClick={() => handleLocateListItem(partId)}
          >
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}> {/* Ensured flexGrow:1 */}
              {displayConfig.show_image && (
                <div className="list-item-image" style={{ marginRight: '8px' }}> {/* Removed explicit size */}
                  <PartThumbnail 
                    partData={part} 
                    config={config} 
                    layout="list" 
                    icon={visualModifiers?.icon} 
                    badge={visualModifiers?.badge} 
                  />
                </div>
              )}
              <div className="list-item-info" style={itemTextStyle}>
                {displayConfig.show_name !== false && <div className="name" style={{ fontWeight: 'bold' }}>{part.name}</div>}
                {displayConfig.show_stock !== false && (
                  <div className="stock">In Stock: {part.in_stock} {part.units || ''}</div>
                )}
                {/* Add other info like category, description if needed based on config.display */}
              </div>
            </div>
            {/* Container for all action buttons (parameters and standard) */}
            <div className="list-item-actions-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginLeft: 'auto' }}>
              {parameterActionsForPart.length > 0 && (
                  <div className="parameter-action-buttons" style={{ display:'flex', gap:'4px', marginBottom: '4px' }}>
                      {parameterActionsForPart.map((action: ParameterAction) => (
                          <button
                              key={`${partId}-${action.label}`}
                              className="param-action-button"
                              onClick={(e) => { e.stopPropagation(); handleParameterActionClick(partId, action); }}
                              title={action.label}
                              style={{ fontSize: '0.7em', padding: '2px 4px' }} // Smaller buttons for list view
                          >
                              {action.icon ? <span>{/* ha-icon */}({action.icon})</span> : action.label}
                          </button>
                      ))}
                  </div>
              )}
              {displayConfig.show_buttons && hass && config && (
                  <PartButtons partItem={part} config={config} hass={hass} />
              )}
            </div>
            {isCurrentlyLocating && <div className="locating-indicator">Locating...</div>}
          </div>
        );
      })}
    </div>
  );
};

export default ListLayout; 