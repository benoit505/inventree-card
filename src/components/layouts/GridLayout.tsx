import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterDetail, ParameterAction, VisualModifiers, ParameterCondition, ConditionRuleDefinition, CustomAction } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
import { useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

// Import GridItem
import GridItem from './GridItem';

interface GridLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[];
  cardInstanceId?: string;
  item?: InventreeItem;
}

const GridLayout: React.FC<GridLayoutProps> = ({ hass, config, parts, cardInstanceId, item }) => {
  const logger = Logger.getInstance();
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const [updatePartParameterMutation, { isLoading: isUpdatingParameter, error: updateParameterError }] = useUpdatePartParameterMutation();

  const parametersDisplayEnabled = useMemo(() => {
    const displayConfig = config?.display ?? {};
    const parametersConfig = config?.parameters ?? {};
    return displayConfig.show_parameters === undefined ? (parametersConfig.show_section ?? false) : (displayConfig.show_parameters ?? false);
  }, [config?.display, config?.parameters]);

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  const parameterActions = useMemo(() => {
    const actions: ParameterAction[] = [];
    if (config?.interactions?.buttons && Array.isArray(config.interactions.buttons)) {
      config.interactions.buttons.forEach((btn: CustomAction) => {
        if (btn.type === 'internal-function' && btn.function_name === 'update_parameter') {
          actions.push({
            id: btn.id || btn.label,
            label: btn.label,
            icon: btn.icon,
            parameter: btn.function_args?.parameterName as string || 'unknown_param',
            value: btn.function_args?.value as string || '',
          });
        }
      });
    }
    return actions;
  }, [config?.interactions?.buttons]);

  const [requiredPartIds, setRequiredPartIds] = useState<Set<number>>(new Set());
  const [isLoadingParameters, setIsLoadingParameters] = useState<boolean>(false);

  React.useEffect(() => {
    if (parametersDisplayEnabled && parts && parts.length > 0) {
      const newRequiredIds = new Set(parts.map(p => p.pk).filter(pk => typeof pk === 'number' && !isNaN(pk)));
      setRequiredPartIds(newRequiredIds);
    } else if (!parametersDisplayEnabled) {
      setRequiredPartIds(new Set());
    }
  }, [parts, parametersDisplayEnabled]);

  React.useEffect(() => {
    if (!parametersDisplayEnabled || requiredPartIds.size === 0) {
      if (isLoadingParameters) {
        setIsLoadingParameters(false);
      }
      return;
    }

    let currentlyLoading = false;
    for (const partId of requiredPartIds) {
      const status = allLoadingStatuses[partId] ?? 'idle';
      if (status === 'loading') {
        currentlyLoading = true;
        break;
      }
    }

    if (isLoadingParameters !== currentlyLoading) {
      setIsLoadingParameters(currentlyLoading);
    }
  }, [requiredPartIds, allLoadingStatuses, parametersDisplayEnabled, isLoadingParameters]);

  const calculateCurrentIdsToFetch = useCallback(() => {
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) {
      return [];
    }

    const newIdsToFetch: number[] = [];
    const reasonsForFetching: Record<number, string> = {};

    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      reasonsForFetching[id] = status;
      if (status === 'idle' || status === 'failed') {
        newIdsToFetch.push(id);
      }
    });

    newIdsToFetch.sort((a, b) => a - b);

    return newIdsToFetch;
  }, [config?.direct_api?.enabled, requiredPartIds, allLoadingStatuses]);

  const currentIdsToFetch = useMemo(calculateCurrentIdsToFetch, [calculateCurrentIdsToFetch]);

  const [prevDispatchedFetchIds, setPrevDispatchedFetchIds] = React.useState<string>('');

  React.useEffect(() => {
    const idsToDispatchString = currentIdsToFetch.sort((a,b)=>a-b).join(',');

    if (currentIdsToFetch.length > 0 && idsToDispatchString !== prevDispatchedFetchIds) {
      dispatch(fetchParametersForReferencedParts(currentIdsToFetch));
      setPrevDispatchedFetchIds(idsToDispatchString);
    } else if (currentIdsToFetch.length === 0) {
    }
  }, [currentIdsToFetch, dispatch, prevDispatchedFetchIds]);

  const filteredAndSortedParts = useMemo(() => {
    if (!parts) return [];
    let processedParts = [...parts];
    processedParts.sort((a, b) => a.pk - b.pk);
    return processedParts;
  }, [parts]);

  const handleLocateGridItem = useCallback((partId: number) => {
    if (hass) {
      dispatch(locatePartById({ partId, hass }));
    }
  }, [dispatch, hass]);

  const handleParameterActionClick = useCallback(async (currentPartId: number, action: ParameterAction, parameterPk?: number) => {
    logger.log('GridLayout', 'handleParameterActionClick (RTK)', { partId: currentPartId, action, parameterPk, level:'debug' });
    
    if (parameterPk === undefined) {
        logger.error('GridLayout', `Parameter PK not provided for action '${action.parameter}' on part ${currentPartId}. Cannot update.`);
        return;
    }

    try {
      await updatePartParameterMutation({ partId: currentPartId, parameterPk: parameterPk, value: action.value }).unwrap();
      logger.log('GridLayout', `Successfully updated parameter ${action.parameter} (PK: ${parameterPk}) for part ${currentPartId} via RTK Mutation.`);
    } catch (err) {
      logger.error('GridLayout', `Failed to update parameter ${action.parameter} (PK: ${parameterPk}) for part ${currentPartId} via RTK Mutation:`, { error: err });
    }
  }, [dispatch, logger, updatePartParameterMutation]);

  if (!config) {
    return <div className="grid-layout loading"><p>Loading config...</p></div>;
  }
  if (!parts || parts.length === 0) {
    return <div className="grid-layout no-parts"><p>No parts to display.</p></div>;
  }
  
  if (filteredAndSortedParts.length === 0 && parts.length > 0) {
    logger.log('GridLayout', 'All parts were filtered out by conditional logic or other filters.', { originalCount: parts.length, level: 'debug' });
    return <div className="grid-layout no-parts"><p>All parts filtered out.</p></div>;
  }
  if (filteredAndSortedParts.length === 0) {
     logger.log('GridLayout', 'No parts to display (filtered or initial empty). ', {level: 'debug'});
     return <div className="grid-layout no-parts"><p>No parts to display.</p></div>;
  }

  const displayConfig = config.display || {};
  const layoutOptions = config.layout_options || {};
  const columns = layoutOptions.columns || 3;
  const gridSpacing = layoutOptions.grid_spacing || 8;
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gridSpacing}px`,
    padding: '8px',
  };

  return (
    <div className="grid-layout" style={gridStyles}>
      {filteredAndSortedParts.map(part => {
        if (!part || part.pk === undefined) {
            logger.warn('GridLayout', 'Skipping render for invalid part object:', {partData: part, level: 'debug'});
            return null;
        }
        const partId = part.pk;
        const isCurrentlyLocating = locatingPartId === partId;

        return (
          <GridItem
            key={partId}
            part={part}
            config={config!}
            hass={hass}
            cardInstanceId={cardInstanceId}
            isCurrentlyLocating={isCurrentlyLocating}
            parameterActions={parameterActions} 
            parametersDisplayEnabled={parametersDisplayEnabled}
            handleLocateGridItem={handleLocateGridItem}
            handleParameterActionClick={handleParameterActionClick}
          />
        );
      })}
    </div>
  );
};

export default GridLayout; 