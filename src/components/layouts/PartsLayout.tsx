import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, VisualModifiers, ParameterCondition, FilterConfig } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger';

import { selectLocatingPartId, locatePartById } from '../../store/slices/partsSlice';
import { selectVisualModifiers, checkPartVisibility, selectParameterConfig } from '../../store/selectors/parameterSelectors';
import { selectParametersLoadingStatus } from '../../store/slices/parametersSlice';
import { updateParameterValue, fetchParametersForReferencedParts } from '../../store/thunks/parameterThunks';
import { selectSearchQuery, selectSearchResults, selectSearchLoading, setSearchQuery, clearSearch } from '../../store/slices/searchSlice';
import { performSearch } from '../../store/thunks/searchThunks';

import SearchBar from '../../components/search/SearchBar';
import PartThumbnail from '../part/PartThumbnail';
import PartButtons from '../part/PartButtons';

// Placeholder for SearchBar - in a real scenario, this would be a separate component
// interface SearchBarProps {
//   query: string;
//   onQueryChange: (newQuery: string) => void;
//   onSearch: () => void;
//   onClear: () => void;
//   loading?: boolean;
// }
// const SearchBarPlaceholder: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch, onClear, loading }) => (
//   <div style={{ display: 'flex', marginBottom: '10px', gap: '5px' }}>
//     <input 
//       type="text" 
//       value={query} 
//       onChange={(e) => onQueryChange(e.target.value)} 
//       placeholder="Search parts..."
//       style={{ flexGrow: 1, padding: '8px' }}
//     />
//     <button onClick={onSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
//     {query && <button onClick={onClear}>Clear</button>}
//   </div>
// );


interface PartsLayoutProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
  parts: InventreeItem[]; // Parts to display, pre-filtered by entity selection
}

// Reusable style functions (could be in a shared util)
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

  const locatingPartId = useSelector((state: RootState) => selectLocatingPartId(state));
  const parameterConfigGlobal = useSelector(selectParameterConfig);
  const allLoadingStatuses = useSelector((state: RootState) => state.parameters.loadingStatus || {});
  const allParameterValuesGlobal = useSelector((state: RootState) => state.parameters.parameterValues || {});
  
  const searchQuery = useSelector(selectSearchQuery);
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);

  const [requiredPartIds, setRequiredPartIds] = useState<Set<number>>(new Set());
  const [isLoadingParameters, setIsLoadingParameters] = useState<boolean>(false);

  const getReferencedPartIdsFromConditions = useCallback((conditions?: ParameterCondition[]): number[] => {
    if (!conditions) return [];
    const ids = new Set<number>();
    const conditionRegex = /^part:(\d+):/;
    conditions.forEach(condition => {
        if (typeof condition.parameter === 'string'){
            const match = condition.parameter.match(conditionRegex);
            if (match && match[1]) ids.add(parseInt(match[1], 10));
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
      if (allLoadingStatuses[id] === 'loading') { loading = true; break; }
    }
    if (isLoadingParameters !== loading) setIsLoadingParameters(loading);
  }, [requiredPartIds, allLoadingStatuses, config?.parameters?.enabled, isLoadingParameters]);

  useEffect(() => {
    if (!config?.direct_api?.enabled || requiredPartIds.size === 0) return;
    const idsToFetch: number[] = [];
    requiredPartIds.forEach(id => {
      const status = allLoadingStatuses[id] || 'idle';
      if (status === 'idle' || status === 'failed') idsToFetch.push(id);
    });
    if (idsToFetch.length > 0) dispatch(fetchParametersForReferencedParts(idsToFetch));
  }, [dispatch, config?.direct_api?.enabled, requiredPartIds, allLoadingStatuses]);

  const filteredAndSortedParts = useMemo(() => {
    let processedParts = parts;
    const searchResultPks = new Set(searchResults.map(r => r.pk));

    if (searchQuery.trim().length > 0) {
        if (searchLoading === 'succeeded' || searchResults.length > 0) {
            processedParts = parts.filter(part => searchResultPks.has(part.pk));
        } else if (searchLoading !== 'pending') { // Search attempted, but no results
            processedParts = [];
        }
        // If search is pending, we use all parts and let text filter below handle it, or wait for results
    }
    
    if (config?.parameters?.enabled && config.parameters.conditions) {
      processedParts = processedParts.filter(part =>
        part && checkPartVisibility(part.pk, config.parameters, allLoadingStatuses, allParameterValuesGlobal)
      );
    }

    // Text search filter (if query exists but results might not be specific enough or still loading)
    if (searchQuery.trim().length > 0 && (searchLoading === 'pending' || searchResults.length === 0)) {
        processedParts = processedParts.filter(part => part.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sorting Logic
    processedParts.sort((a, b) => {
        const modA = allParameterValuesGlobal[a.pk] ? selectVisualModifiers({parameters: {parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses}} as RootState, a.pk) : {} as VisualModifiers;
        const modB = allParameterValuesGlobal[b.pk] ? selectVisualModifiers({parameters: {parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses}} as RootState, b.pk) : {} as VisualModifiers;

        if (modA.sort === 'top' && modB.sort !== 'top') return -1;
        if (modA.sort !== 'top' && modB.sort === 'top') return 1;
        if (modA.sort === 'bottom' && modB.sort !== 'bottom') return 1;
        if (modA.sort !== 'bottom' && modB.sort === 'bottom') return -1;
        
        const prioA = modA.priority === 'high' ? 3 : modA.priority === 'medium' ? 2 : 1;
        const prioB = modB.priority === 'high' ? 3 : modB.priority === 'medium' ? 2 : 1;
        if (prioA !== prioB) return prioB - prioA; 
        
        return a.name.localeCompare(b.name);
    });

    return processedParts;
  }, [parts, config?.parameters, allLoadingStatuses, allParameterValuesGlobal, searchQuery, searchResults, searchLoading, parameterConfigGlobal]);

  const handleLocateItem = useCallback((partId: number) => { dispatch(locatePartById(partId)); }, [dispatch]);
  const handleParameterAction = useCallback((partId: number, action: ParameterAction) => { dispatch(updateParameterValue({ partId, parameterName: action.parameter, value: action.value })); }, [dispatch]);
  // const handleSearchQueryChange = useCallback((query: string) => { dispatch(setSearchQuery(query)); }, [dispatch]);
  // const handlePerformSearch = useCallback(() => { if(searchQuery.trim()) dispatch(performSearch(searchQuery)); }, [dispatch, searchQuery]);
  // const handleClearSearchCB = useCallback(() => { dispatch(clearSearch()); }, [dispatch]);

  if (!config) return <div className="parts-layout loading"><p>Loading config...</p></div>;
  if (!parts && searchLoading !== 'pending') return <div className="parts-layout no-parts"><p>No parts to display.</p></div>;
  if (isLoadingParameters && config.parameters?.enabled) return <div className="parts-layout loading"><p>Loading parameters...</p></div>;

  const displayConfig = config.display || {};
  const viewMode = config.parts_layout_mode || 'grid';
  const columns = config.columns || 3;
  const gridSpacing = config.grid_spacing || 8;
  // const thumbnailWidth = config.style?.image_size || (viewMode === 'grid' ? 80 : 40);

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gridSpacing}px`,
    padding: '8px',
  };
  const listStyles: React.CSSProperties = { padding: '8px' };

  let noPartsMessage = "No parts match the current filters or search.";
  if (searchQuery.trim().length > 0 && filteredAndSortedParts.length === 0 && searchLoading !== 'pending') {
    noPartsMessage = `No parts found matching "${searchQuery}".`;
  }

  const renderPartItem = (part: InventreeItem) => {
    if (!part) return null;
    const partId = part.pk;
    const visualModifiers = selectVisualModifiers({parameters: {parameterValues: allParameterValuesGlobal, config: parameterConfigGlobal, loadingStatus: allLoadingStatuses}} as RootState, partId);
    const parameterActionsForPart = parameterConfigGlobal?.actions || [];
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
        {/* Common structure for both list and grid items, layout adjusted by styles */}
        <div style={{ display: 'flex', alignItems: 'center', width:'100%', flexDirection: viewMode === 'grid' ? 'column' : 'row' }}>
            {displayConfig.show_image && (
            <div className={viewMode === 'grid' ? "part-thumbnail" : "list-item-image"} 
                 style={{ 
                     marginBottom: viewMode === 'grid' ? '8px' : '0', 
                     marginRight: viewMode === 'list' ? '8px' : '0',
                     display:'flex', justifyContent:'center', alignItems:'center' 
                 }}>
                <PartThumbnail partData={part} config={config} layout={viewMode as ('grid' | 'list')} />
                {/* Simplified Modifier Icons/Badges for now - these might need to be passed into PartThumbnail or handled with absolute positioning if they need to overlay */}
                {visualModifiers?.icon && <span style={{ fontSize: '0.7em' }}> (Icon: {visualModifiers.icon})</span>} 
            </div>
            )}
            <div className={viewMode === 'grid' ? "part-info" : "list-item-info"} style={{ ...itemTextStyle, flexGrow: 1, textAlign: viewMode === 'grid' ? 'center' : 'left' }}>
                {displayConfig.show_name && <div className="part-name" style={{ fontWeight: 'bold' }}>{part.name}</div>}
                {displayConfig.show_stock && <div className="part-stock">Stock: {part.in_stock} {part.units || ''}</div>}
                {/* Add other info if needed */}
            </div>
             {/* Action Buttons Footer */}
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
                                {action.icon ? <span>{/* ha-icon */}({action.icon})</span> : action.label}
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
      {/* <SearchBarPlaceholder 
        query={searchQuery} 
        onQueryChange={handleSearchQueryChange} 
        onSearch={handlePerformSearch} 
        onClear={handleClearSearchCB}
        loading={searchLoading === 'pending'}
      /> */}
      <SearchBar />

      {filteredAndSortedParts.length === 0 
        ? <div className="no-parts"><p>{noPartsMessage}</p></div>
        : (
          <div style={viewMode === 'grid' ? gridStyles : listStyles}>
            {filteredAndSortedParts.map(part => renderPartItem(part))}
          </div>
        )
      }
    </div>
  );
};

export default PartsLayout; 