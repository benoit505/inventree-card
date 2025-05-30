import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';

import ListItem from './ListItem';

interface ListLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[];
}

const ListLayout: React.FC<ListLayoutProps> = ({ hass, config, parts }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  const globalParameterActions = useMemo(() => config?.parameters?.actions || [], [config?.parameters?.actions]);

  const parametersDisplayEnabledInList = useMemo(() => {
    const displayConfig = config?.display ?? {};
    const parametersConfig = config?.parameters ?? {};
    return displayConfig.show_parameters === undefined 
           ? (parametersConfig.show_section ?? false) 
           : (displayConfig.show_parameters ?? false);
  }, [config?.display, config?.parameters]);

  const filteredAndSortedParts = useMemo(() => {
    logger.log('ListLayout React', 'useMemo[filteredAndSortedParts] - Recalculating.', { numParts: parts?.length });
    if (!parts) return [];

    let processedParts = [...parts];
    processedParts.sort((a, b) => a.pk - b.pk); 
    logger.log('ListLayout React', `Parts after basic sorting: ${processedParts.length}`);
    return processedParts;
  }, [parts, logger]);

  const handleLocatePart = useCallback((partId: number) => {
    logger.log('ListLayout React', `Locating part: ${partId}`);
    if (hass) {
      dispatch(locatePartById({ partId, hass }));
    }
  }, [dispatch, logger, hass]);

  if (!config) {
    return <div className="list-container loading-container"><div className="loading">Loading config...</div></div>;
  }
  if (!parts || parts.length === 0) {
    return <div className="list-container no-parts"><p>No parts to display.</p></div>;
  }

  if (filteredAndSortedParts.length === 0 && parts.length > 0) { 
      logger.log('ListLayout React Render', 'Initial parts provided, but filteredAndSortedParts is empty (this should not happen if only sorting).');
  } else if (filteredAndSortedParts.length === 0) {
      logger.log('ListLayout React Render', 'No parts to display after sorting (or initial empty). ');
      return <div className="list-container no-parts"><p>No parts to display.</p></div>;
  }

  logger.log('ListLayout React Render', `Rendering with ${filteredAndSortedParts.length} parts.`);

  return (
    <div className="list-container" style={{ padding: '8px' }}>
      {filteredAndSortedParts.map(part => {
        if (!part || typeof part.pk !== 'number') return null;
        return (
          <ListItem
            key={part.pk}
            part={part}
            config={config}
            hass={hass}
            parametersDisplayEnabled={parametersDisplayEnabledInList}
            onLocate={handleLocatePart}
            parameterActions={globalParameterActions}
          />
        );
      })}
    </div>
  );
};

export default ListLayout; 