import React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
import { RootState } from '../../store';
import { useGetPartQuery } from '../../store/apis/inventreeApi';
import PartDetails from './PartDetails';
import PartThumbnail from './PartThumbnail';
import PartButtons from './PartButtons';
import PartParametersView from './PartParametersView';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

interface PartViewProps {
  partId: number;
  config: InventreeCardConfig;
  hass: HomeAssistant;
  cardInstanceId?: string;
}

const PartView: React.FC<PartViewProps> = ({ partId, config, hass, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('PartView', cardInstanceId);
  }, [cardInstanceId]);

  const { data: part, isLoading, isError } = useGetPartQuery({ pk: partId, cardInstanceId: cardInstanceId! }, { skip: !cardInstanceId });
  const visualEffects = useSelector((state: RootState) => (cardInstanceId && state.visualEffects.effectsByCardInstance[cardInstanceId]?.[partId]) || {});

  if (!cardInstanceId) {
    return <div>Error: Missing instance ID.</div>;
  }

  if (isLoading) return <div>Loading part...</div>;
  if (isError || !part) return <div style={{ color: 'red' }}>Error loading part {partId}</div>;

  const displayConfig = config.display || {};

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', backgroundColor: visualEffects.highlight }}>
      {displayConfig.show_name && <h2 style={{ color: visualEffects.textColor }}>{part.name}</h2>}
      
      {displayConfig.show_image && (
        <PartThumbnail 
          partData={part}
          config={config}
          layout="detail"
          visualModifiers={visualEffects}
          cardInstanceId={cardInstanceId}
        />
      )}
      
      <PartDetails 
        part={part}
        config={config}
      />

      <PartParametersView
        partId={part.pk}
        config={config}
        parametersDisplayEnabled={!!displayConfig.show_parameters}
        cardInstanceId={cardInstanceId}
      />
      
      {displayConfig.show_buttons && (
        <PartButtons 
          partItem={part}
          config={config}
          hass={hass}
          cardInstanceId={cardInstanceId}
        />
      )}
    </div>
  );
};

export default PartView; 