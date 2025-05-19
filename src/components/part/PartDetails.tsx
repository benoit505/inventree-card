import * as React from 'react';
import { useSelector } from 'react-redux';
import { InventreeItem, InventreeCardConfig, ParameterDetail } from '../../types';
import { RootState } from '../../store';
import { selectPartById } from '../../store/slices/partsSlice';
import { HomeAssistant } from 'custom-card-helpers';

interface PartDetailsProps {
  partId?: number;
  config?: InventreeCardConfig;
}

// Styles adapted from the Lit component
const styles = {
  partDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '4px',
    overflow: 'hidden',
  },
  partName: {
    fontWeight: 'bold' as 'bold',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  partDescription: {
    fontSize: '0.9em',
    opacity: 0.8,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as 'vertical',
  },
  partStock: {
    fontSize: '0.9em',
    fontWeight: '500' as '500',
  },
  partParameters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '4px',
    fontSize: '0.8em',
  },
  partParameter: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  paramName: {
    fontWeight: '500' as '500',
    marginRight: '4px',
  },
  paramValue: {},
};

const PartDetails: React.FC<PartDetailsProps> = ({ partId, config }) => {
  const partData = useSelector((state: RootState) => 
    partId ? selectPartById(state, partId) : undefined
  );

  if (!partData) {
    return null; // Or some placeholder if partId is provided but data not found
  }

  const display = config?.display || {};

  return (
    <div style={styles.partDetails}>
      {/* Name */}
      {display.show_name !== false && (
        <div style={styles.partName}>{partData.name}</div>
      )}
      
      {/* Description */}
      {display.show_description && partData.description && (
        <div style={styles.partDescription}>{partData.description}</div>
      )}
      
      {/* Stock */}
      {display.show_stock !== false && (
        <div style={styles.partStock}>
          Stock: {partData.in_stock}
          {partData.minimum_stock && partData.minimum_stock > 0 ? ` / Min: ${partData.minimum_stock}` : ''}
          {partData.units ? ` ${partData.units}` : ''}
        </div>
      )}
      
      {/* Parameters */}
      {display.show_parameters !== false && partData.parameters && partData.parameters.length > 0 && (
        <div style={styles.partParameters}>
          {partData.parameters.map((param: ParameterDetail) => (
            <div key={param.pk || param.template_detail?.name || Math.random()} style={styles.partParameter}>
              <span style={styles.paramName}>{param.template_detail?.name || 'Param'}:</span>
              <span style={styles.paramValue}>
                {param.data}
                {param.template_detail?.units ? ` ${param.template_detail.units}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartDetails; 