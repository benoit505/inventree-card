import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers, ParameterDetail } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';
import { useElementDisplayStatus } from '../../hooks/useElementDisplayStatus';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';

import ListItem from './ListItem';

// ADD: Import TanStack Virtual
import { useVirtualizer } from '@tanstack/react-virtual';

interface ListLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[];
  cardInstanceId?: string;
}

const ListLayout: React.FC<ListLayoutProps> = ({ hass, config, parts, cardInstanceId }) => {
  const logger = React.useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<AppDispatch>();

  // ADD: Ref for the parent scroll container
  const parentRef = React.useRef<HTMLDivElement>(null);

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.parameterLoadingStatus || {});

  const globalParameterActions = useMemo(() => config?.parameters?.actions || [], [config?.parameters?.actions]);

  const parametersDisplayEnabledInList = useElementDisplayStatus(cardInstanceId, 'show_parameters', config?.display);

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

  // VIRTUALIZATION SETUP
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedParts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70, // Estimate list item height, adjust as needed
    overscan: 5,
  });
  
  // STYLES FOR VIRTUALIZATION
  const scrollContainerStyles: React.CSSProperties = {
    height: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative',
    padding: '8px',
  };

  const virtualContainerStyles: React.CSSProperties = {
    height: `${rowVirtualizer.getTotalSize()}px`,
    width: '100%',
    position: 'relative',
  };

  return (
    <div ref={parentRef} className="list-container" style={scrollContainerStyles}>
      <div style={virtualContainerStyles}>
        {rowVirtualizer.getVirtualItems().map(virtualItem => {
          const part = filteredAndSortedParts[virtualItem.index];
          if (!part || typeof part.pk !== 'number') return null;
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <ListItem
                part={part}
                config={config}
                hass={hass}
                parametersDisplayEnabled={parametersDisplayEnabledInList}
                onLocate={handleLocatePart}
                parameterActions={globalParameterActions}
                cardInstanceId={cardInstanceId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListLayout; 