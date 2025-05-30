import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers, ParameterCondition, FilterConfig, ParameterDetail, EffectDefinition } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';

import PartParametersView from '../part/PartParametersView';
import { useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';

import { useLazySearchPartsQuery } from '../../store/apis/inventreeApi';

import SearchBar from '../../components/search/SearchBar';
import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';

interface PartsLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[]; 
}

const getItemContainerStyle = (modifiers?: VisualModifiers, layoutMode?: 'grid' | 'list', config?: InventreeCardConfig): React.CSSProperties => {
    const styles: React.CSSProperties = {
        border: '1px solid #ddd',
        padding: '8px',
        cursor: 'pointer',
        marginBottom: layoutMode === 'list' ? '4px' : '0',
        display: 'flex',
        flexDirection: layoutMode === 'list' ? 'row' : 'column',
        alignItems: layoutMode === 'list' ? 'center' : 'stretch',
        textAlign: layoutMode === 'grid' ? 'center' : 'left',
    };
    if (layoutMode === 'grid') {
        styles.height = config?.item_height ? `${config.item_height}px` : 'auto';
        styles.justifyContent = 'space-between';
    }
    if (modifiers?.highlight) styles.backgroundColor = modifiers.highlight;
    if (modifiers?.border) styles.border = `2px solid ${modifiers.border}`;
    return styles;
};

const getItemTextStyle = (modifiers?: VisualModifiers): React.CSSProperties => {
  if (!modifiers || !modifiers.textColor) return {};
  return { color: modifiers.textColor };
};

const PartsLayout: React.FC<PartsLayoutProps> = ({ hass, config, parts }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const fullState = useSelector((state: RootState) => state);

  const [updatePartParameterMutation, { isLoading: isUpdatingParameter, error: updateParameterErrorFromMutation }] = useUpdatePartParameterMutation();

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigFromProps = useMemo(() => config?.parameters, [config]);
  
  const [triggerSearch, { 
    data: searchApiResults, 
    isLoading: isSearchApiLoading, 
    isFetching: isSearchApiFetching, 
    error: searchApiError,
    originalArgs: currentSearchQuery // To get the query string that triggered the current data/loading state
  }] = useLazySearchPartsQuery();

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    if (localSearchQuery.trim().length > 0) {
      triggerSearch(localSearchQuery.trim());
    }
  }, [localSearchQuery, triggerSearch]);

  const filteredAndSortedParts = useMemo(() => {
    let processedParts = [...parts];
    const currentQuery = currentSearchQuery || localSearchQuery;

    if (currentQuery && currentQuery.trim().length > 0) {
      if (searchApiResults && searchApiResults.length > 0) {
        const searchResultPks = new Set(searchApiResults.map(r => r.pk));
        processedParts = processedParts.filter(part => searchResultPks.has(part.pk));
      } else if (!isSearchApiLoading && !isSearchApiFetching) {
        processedParts = [];
      }
    }
    
    processedParts = processedParts.filter(part => {
      if (!part) return false;
      const effect = selectVisualEffectForPart(fullState, part.pk) as VisualModifiers | undefined;
      return effect?.isVisible !== false;
    });

    processedParts.sort((a, b) => {
        const effectA = (selectVisualEffectForPart(fullState, a.pk) as VisualModifiers | undefined) || {};
        const effectB = (selectVisualEffectForPart(fullState, b.pk) as VisualModifiers | undefined) || {};

        if (effectA.sort === 'top' && effectB.sort !== 'top') return -1;
        if (effectA.sort !== 'top' && effectB.sort === 'top') return 1;
        if (effectA.sort === 'bottom' && effectB.sort !== 'bottom') return 1;
        if (effectA.sort !== 'bottom' && effectB.sort === 'bottom') return -1;
        
        const prioA = effectA.priority === 'high' ? 3 : effectA.priority === 'medium' ? 2 : 1;
        const prioB = effectB.priority === 'high' ? 3 : effectB.priority === 'medium' ? 2 : 1;
        if (prioA !== prioB) return prioB - prioA; 
        
        return a.name.localeCompare(b.name);
    });

    return processedParts;
  }, [parts, currentSearchQuery, localSearchQuery, searchApiResults, isSearchApiLoading, isSearchApiFetching, fullState]);

  const handleLocateItem = useCallback((partId: number) => { 
    if (hass) {
      dispatch(locatePartById({ partId, hass })); 
    }
  }, [dispatch, hass]);
  
  const handleParameterAction = useCallback(async (partId: number, action: ParameterAction) => {
    logger.log('PartsLayout', `handleParameterAction for part ${partId}, action: ${action.label} (param: ${action.parameter}, value: ${action.value})`);
    
    const currentPart = parts.find(p => p.pk === partId);
    if (!currentPart) {
      logger.error('PartsLayout', `Cannot update parameter: Part ${partId} not found.`);
      return;
    }

    logger.warn('PartsLayout', "`handleParameterAction` might need redesign for RTK Query parameter updates if called directly from layout.");

  }, [dispatch, logger, parts, updatePartParameterMutation]);

  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchQuery(query);
  }, []);

  if (!config) {
    return <div className="parts-layout loading"><p>Loading config...</p></div>;
  }
  if (parts.length === 0 && (isSearchApiLoading || isSearchApiFetching)) {
    return <div className="parts-layout no-parts"><p>Searching...</p></div>;
  }
  if (parts.length === 0 && searchApiError) {
    return <div className="parts-layout no-parts"><p>Error searching: {JSON.stringify(searchApiError)}</p></div>;
  }

  const displayConfig = config.display || {};
  const viewMode = config.parts_layout_mode || 'grid';
  const columns = config.layout_options?.columns || 3;
  const gridSpacing = config.layout_options?.grid_spacing || 8;

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gridSpacing}px`,
    padding: '8px',
  };
  const listStyles: React.CSSProperties = { padding: '8px' };

  let noPartsMessage = "No parts match the current filters or search.";
  if (localSearchQuery.trim().length > 0 && filteredAndSortedParts.length === 0 && (isSearchApiLoading || isSearchApiFetching)) {
    noPartsMessage = `No parts found matching "${localSearchQuery}".`;
  }

  const renderPartItem = (part: InventreeItem): React.ReactElement | null => {
    if (!part) return null;
    const partId = part.pk;
    const visualModifiers = (selectVisualEffectForPart(fullState, partId) as VisualModifiers | undefined) || {};
    const parameterActionsForPart = parameterConfigFromProps?.actions || [];
    const isCurrentlyLocating = locatingPartId === partId;

    const itemContainerStyle = getItemContainerStyle(visualModifiers, viewMode, config);
    const itemTextStyle = getItemTextStyle(visualModifiers);

    const itemClasses = [
      viewMode === 'grid' ? 'part-container' : 'list-item',
      isCurrentlyLocating ? 'locating' : '',
      visualModifiers?.priority ? `priority-${visualModifiers.priority}` : ''
    ].filter(Boolean).join(' ');

    return (
      <div
        key={partId}
        className={itemClasses}
        style={itemContainerStyle}
        onClick={() => handleLocateItem(partId)}
      >
        <div style={{ display: 'flex', alignItems: 'center', width:'100%', flexDirection: viewMode === 'grid' ? 'column' : 'row' }}>
            {displayConfig.show_image && (
            <div className={viewMode === 'grid' ? "part-thumbnail" : "list-item-image"} 
                 style={{ 
                     marginBottom: viewMode === 'grid' ? '8px' : '0', 
                     marginRight: viewMode === 'list' ? '8px' : '0',
                     display:'flex', justifyContent:'center', alignItems:'center' 
                 }}>
                <PartThumbnail partData={part} config={config} layout={viewMode as ('grid' | 'list')} />
                {visualModifiers?.icon && <span style={{ fontSize: '0.7em' }}> (Icon: {visualModifiers.icon})</span>} 
            </div>
            )}
            <div className={viewMode === 'grid' ? "part-info" : "list-item-info"} style={{ ...itemTextStyle, flexGrow: 1, textAlign: viewMode === 'grid' ? 'center' : 'left' }}>
                {displayConfig.show_name && <div className="part-name" style={{ fontWeight: 'bold' }}>{part.name}</div>}
                {displayConfig.show_stock && <div className="part-stock">Stock: {part.in_stock} {part.units || ''}</div>}
                {displayConfig.show_parameters && (
                  <PartParametersView 
                    partId={part.pk} 
                    config={config} 
                    parametersDisplayEnabled={displayConfig.show_parameters} 
                  />
                )}
            </div>
            <div className="item-actions-footer" style={{ marginTop: viewMode === 'grid' ? 'auto' : '0', marginLeft: viewMode === 'list' ? 'auto' : '0', paddingTop: '4px' }}>
                {parameterActionsForPart.length > 0 && (
                    <div className="parameter-action-buttons" style={{ display:'flex', justifyContent: viewMode === 'grid' ? 'center' : 'flex-start', gap:'4px', marginBottom: '4px' }}>
                        {parameterActionsForPart.map((action: ParameterAction) => (
                            <button
                                key={`${partId}-${action.label}`}
                                className="param-action-button"
                                onClick={(e) => { e.stopPropagation(); handleParameterAction(partId, action); }}
                                title={action.label}
                                style={{ fontSize: '0.7em', padding: '2px 4px' }}
                            >
                                {action.icon ? <span>{action.icon}</span> : action.label}
                            </button>
                        ))}
                    </div>
                )}
                {displayConfig.show_buttons && hass && config && (
                    <PartButtons partItem={part} config={config} hass={hass} />
                )}
            </div>
        </div>
        {isCurrentlyLocating && <div className="locating-indicator">Locating...</div>}
      </div>
    );
  };

  return (
    <div className="parts-layout" style={{ padding: '8px' }}>
      <SearchBar onSearchChange={handleSearchChange} initialQuery={localSearchQuery} />
      {(isSearchApiLoading || isSearchApiFetching) && <p>Searching...</p>}
      {searchApiError && <p style={{color: 'red'}}>Error searching: {JSON.stringify(searchApiError)}</p>}
      {filteredAndSortedParts.length > 0 ? (
        <div style={viewMode === 'grid' ? gridStyles : listStyles}>
          {filteredAndSortedParts.map(part => renderPartItem(part))}
        </div>
      ) : (
        <p>{noPartsMessage}</p>
      )}
    </div>
  );
};

export default PartsLayout; 