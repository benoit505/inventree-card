import React, { useMemo, useState } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useLazySearchPartsQuery } from '../../store/apis/inventreeApi';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

interface PartsLayoutProps {
  parts: InventreeItem[];
  hass: HomeAssistant;
  config: InventreeCardConfig;
  cardInstanceId: string;
}

ConditionalLoggerEngine.getInstance().registerCategory('PartsLayout', { enabled: false, level: 'info' });

const PartsLayout: React.FC<PartsLayoutProps> = ({ parts, hass, config, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('PartsLayout', cardInstanceId);
  }, [cardInstanceId]);

  logger.verbose('PartsLayout', 'Component rendering', { partCount: parts.length, cardInstanceId });
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, { data: searchResults, isFetching: isSearching }] = useLazySearchPartsQuery();
  const visualEffects = useSelector((state: RootState) => state.visualEffects.effectsByCardInstance[cardInstanceId] || {});

  const handleSearch = () => {
    logger.info('handleSearch', `Triggering search with term: "${searchTerm}"`);
    if (searchTerm) {
      triggerSearch({ searchText: searchTerm, cardInstanceId });
    }
  };
  
  const filteredAndSortedParts = useMemo(() => {
    logger.debug('useMemo[filteredAndSortedParts]', 'Recalculating parts list.', { initialCount: parts.length, hasSearchResults: !!searchResults });
    let processedParts = [...parts];

    if (searchResults) {
      const searchPks = new Set(searchResults.map(p => p.pk));
      processedParts = processedParts.filter(p => searchPks.has(p.pk));
      logger.debug('useMemo[filteredAndSortedParts]', `Filtered down to ${processedParts.length} parts based on search results.`);
    }

    processedParts = processedParts.filter(part => {
      const effect = visualEffects[part.pk];
      const isVisible = !effect || effect.isVisible !== false;
      if (!isVisible) {
        logger.debug('useMemo[filteredAndSortedParts]', `Filtering out partId ${part.pk} due to isVisible:false effect.`);
      }
      return isVisible;
    });

    processedParts.sort((a, b) => {
      const effectA = visualEffects[a.pk];
      const effectB = visualEffects[b.pk];
      const priorityA = effectA?.priority || 'medium';
      const priorityB = effectB?.priority || 'medium';

      if (priorityA === 'high' && priorityB !== 'high') return -1;
      if (priorityA !== 'high' && priorityB === 'high') return 1;

      const sortA = effectA?.sort || 'default';
      const sortB = effectB?.sort || 'default';

      if (sortA === 'top' && sortB !== 'top') return -1;
      if (sortA !== 'top' && sortB === 'top') return 1;
      if (sortA === 'bottom' && sortB !== 'bottom') return 1;
      if (sortA !== 'bottom' && sortB === 'bottom') return -1;
      
      return 0;
    });
    logger.debug('useMemo[filteredAndSortedParts]', `Final list has ${processedParts.length} parts after filtering and sorting.`);
    return processedParts;
  }, [parts, searchResults, visualEffects]);

  const renderPartItem = (part: InventreeItem) => {
    const effect = visualEffects[part.pk] || {};
    logger.verbose('renderPartItem', `Rendering item for partId: ${part.pk}`, { effect });
    return (
      <div key={part.pk} style={{ padding: '8px', border: '1px solid #ccc', margin: '4px', backgroundColor: effect.highlight, color: effect.textColor }}>
        <h4>{part.name}</h4>
        <p>Stock: {part.in_stock}</p>
      </div>
    );
  };

  return (
    <div>
      <h3>Parts</h3>
      <div>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Search parts..."
        />
        <button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div>
        {filteredAndSortedParts.map(renderPartItem)}
      </div>
    </div>
  );
};

export default PartsLayout; 