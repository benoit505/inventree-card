import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterAction, VisualModifiers, ParameterCondition } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { selectParametersLoadingStatus } from '../../store/slices/parametersSlice';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

// Import GridItem
import GridItem from './GridItem';

interface GridLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[];
}

const getGridItemContainerStyle = (modifiers?: VisualModifiers, config?: InventreeCardConfig): React.CSSProperties => {
  const styles: React.CSSProperties = {
    border: '1px solid #eee', // Default border
    padding: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    height: config?.item_height ? `${config.item_height}px` : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  if (modifiers?.highlight) styles.backgroundColor = modifiers.highlight;
  if (modifiers?.border) styles.border = `2px solid ${modifiers.border}`;
  return styles;
};

const getGridItemTextStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

const GridLayout: React.FC<GridLayoutProps> = ({ hass, config, parts }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  useEffect(() => {
    logger.log('GridLayout', 'Parts prop reference changed.', { partsLength: parts.length, firstPartPk: parts[0]?.pk });
  }, [parts]);

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigGlobal = useSelector(selectParameterConfig);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.loadingStatus || {});
  const allParameterValuesGlobal = useSelector((state: RootState) => state.parameters.parameterValues || {});
  // Moved selector: parameterActionsForPart is not dependent on individual part in the loop
  const parameterActions = useSelector((state: RootState) => state.parameters.config?.actions || []);

  const [requiredPartIds, setRequiredPartIds] = useState<Set<number>>(new Set());
  const [isLoadingParameters, setIsLoadingParameters] = useState<boolean>(false);

  const getReferencedPartIdsFromConditions = useCallback((conditions?: ParameterCondition[]): number[] => {
    if (!conditions) return [];
    const ids = new Set<number>();
    const conditionRegex = /^part:(\d+):/;
    conditions.forEach(condition => {
        if (typeof condition.parameter === 'string') {
            const match = condition.parameter.match(conditionRegex);
            if (match && match[1]) {
                const id = parseInt(match[1], 10);
                if (!isNaN(id)) ids.add(id);
            }
        }
    });
    return Array.from(ids);
  }, []);

  useEffect(() => {
    const currentPartPks = parts.map(p => p.pk);
    const referencedIds = getReferencedPartIdsFromConditions(parameterConfigGlobal?.conditions);
    const newIds = new Set([...currentPartPks, ...referencedIds]);
    if (requiredPartIds.size !== newIds.size || ![...requiredPartIds].every(id => newIds.has(id))) {
      setRequiredPartIds(newIds);
    }
  }, [parts, parameterConfigGlobal?.conditions, getReferencedPartIdsFromConditions, requiredPartIds.size]);

  useEffect(() => {
    if (!config?.parameters?.enabled || requiredPartIds.size === 0) {
      if (isLoadingParameters) setIsLoadingParameters(false);
      return;
    }
    let loading = false;
    for (const id of requiredPartIds) {
      if (allLoadingStatuses[id] === 'loading') {
        loading = true;
        break;
      }
    }
    if (isLoadingParameters !== loading) setIsLoadingParameters(loading);
  }, [requiredPartIds, allLoadingStatuses, config?.parameters?.enabled, isLoadingParameters]);

  useEffect(() => {
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) {
      logger.log('GridLayout', 'FetchParameters Effect: Skipped (Direct API disabled or no required part IDs)', { directApiEnabled: config?.direct_api?.enabled, requiredPartIdsSize: requiredPartIds.size });
      return;
    }

    const idsToFetch: number[] = [];
    const reasonsForFetching: Record<number, string> = {};

    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      reasonsForFetching[id] = status; // Log current status for all required IDs
      if (status === 'idle' || status === 'failed') {
        idsToFetch.push(id);
      }
    });

    logger.log('GridLayout', 'FetchParameters Effect: Evaluation', {
      requiredPartIds: Array.from(requiredPartIds),
      allStatuses: reasonsForFetching,
      idsBeingFetchedThisCycle: idsToFetch,
      directApiEnabled: config?.direct_api?.enabled
    });

    if (idsToFetch.length > 0) {
      logger.log('GridLayout', `FetchParameters Effect: Dispatching fetchParametersForReferencedParts for IDs: ${idsToFetch.join(', ')}`);
      dispatch(fetchParametersForReferencedParts(idsToFetch));
    } else {
      logger.log('GridLayout', 'FetchParameters Effect: No IDs to fetch in this cycle.');
    }
  }, [dispatch, config?.direct_api?.enabled, requiredPartIds]);

  const filteredAndSortedParts = useMemo(() => {
    if (!parts) return [];
    let processedParts = parts;
    if (config?.parameters?.enabled && config.parameters.conditions) {
      processedParts = parts.filter(part =>
        part && checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal)
      );
    }
    // Placeholder for sorting logic (e.g., by priority modifier)
    processedParts.sort((a, b) => a.pk - b.pk);
    return processedParts;
  }, [parts, config?.parameters, allLoadingStatuses, allParameterValuesGlobal]);

  const handleLocateGridItem = useCallback((partId: number) => {
    dispatch(locatePartById(partId));
  }, [dispatch]);

  const handleParameterActionClick = useCallback((currentPartId: number, action: ParameterAction) => {
    dispatch(updateParameterValue({ partId: currentPartId, parameterName: action.parameter, value: action.value }));
  }, [dispatch]);

  if (!config) return <div className="grid-layout loading"><p>Loading config...</p></div>;
  if (!parts || parts.length === 0) return <div className="grid-layout no-parts"><p>No parts to display.</p></div>;
  if (isLoadingParameters && config.parameters?.enabled) return <div className="grid-layout loading"><p>Loading parameters...</p></div>;
  if (filteredAndSortedParts.length === 0) return <div className="grid-layout no-parts"><p>All parts filtered out.</p></div>;

  const displayConfig = config.display || {};
  const columns = config.columns || 3;
  const gridSpacing = config.grid_spacing || 8;
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gridSpacing}px`,
    padding: '8px',
  };

  return (
    <div className="grid-layout" style={gridStyles}>
      {filteredAndSortedParts.map(part => {
        if (!part) return null;
        const partId = part.pk;
        const isCurrentlyLocating = locatingPartId === partId;

        return (
          <GridItem
            key={partId}
            part={part}
            config={config!}
            hass={hass}
            isCurrentlyLocating={isCurrentlyLocating}
            parameterActions={parameterActions}
            handleLocateGridItem={handleLocateGridItem}
            handleParameterActionClick={handleParameterActionClick}
          />
        );
      })}
    </div>
  );
};

export default GridLayout; 