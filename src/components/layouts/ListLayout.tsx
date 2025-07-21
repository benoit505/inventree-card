/// <reference types="react-window" />
import React from 'react';
import { useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { InventreeCardConfig, InventreeItem, VisualEffect } from '../../types';
import { setLocatingPartId } from '../../store/slices/partsSlice';
import ListItem from './ListItem';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

ConditionalLoggerEngine.getInstance().registerCategory('ListLayout', { enabled: false, level: 'info' });

interface ListLayoutProps {
  parts: InventreeItem[];
  config: InventreeCardConfig;
  hass: HomeAssistant;
  cardInstanceId: string;
}

const ListLayout: React.FC<ListLayoutProps> = ({
  parts,
  config,
  hass,
  cardInstanceId,
}) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('ListLayout', cardInstanceId);
  }, [cardInstanceId]);

  logger.verbose('ListLayout', 'Component rendering', { partCount: parts.length, cardInstanceId });
  const dispatch = useAppDispatch();
  
  const handleLocatePart = (partId: number) => {
    logger.info('handleLocatePart', `Locating partId: ${partId}`);
    dispatch(setLocatingPartId({ partId, cardInstanceId }));
  };

  const conditionalEffects = useSelector((state: RootState) => state.visualEffects.effectsByCardInstance[cardInstanceId] || {});

  const visibleParts = parts.filter(part => {
    const effect = conditionalEffects[part.pk];
    const isVisible = !effect || effect.isVisible !== false;
    if (!isVisible) {
      logger.debug('ListLayout', `Filtering out partId ${part.pk} because it is not visible.`);
    }
    return isVisible;
  });
  logger.debug('ListLayout', `Render with ${visibleParts.length} visible parts out of ${parts.length} total.`);

  const rowHeight = config.layout_options?.item_height || 75;

  // Define the type for the itemData prop
  interface ItemData {
    parts: InventreeItem[];
    config: InventreeCardConfig;
    hass: HomeAssistant;
    cardInstanceId: string;
    conditionalEffects: Record<number, VisualEffect>;
    onLocate: (partId: number) => void;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <List<ItemData>
        height={500} 
        itemCount={visibleParts.length}
        itemSize={rowHeight}
        width="100%"
        itemData={{
          parts: visibleParts,
          config,
          hass,
          cardInstanceId,
          conditionalEffects,
          onLocate: handleLocatePart,
        }}
      >
        {({ data, index, style }: ListChildComponentProps<ItemData>) => {
          const part = data.parts[index];
          return (
            <div style={style}>
              <ListItem
                part={part}
                config={data.config}
                hass={data.hass}
                cardInstanceId={data.cardInstanceId}
                onLocate={data.onLocate}
              />
            </div>
          );
        }}
      </List>
    </div>
  );
};

export default ListLayout; 