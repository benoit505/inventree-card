import * as React from 'react';
import { InventreeCardConfig, ParameterDetail, InventreeItem } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface PartDetailsProps {
  config?: InventreeCardConfig;
  visualEffect?: VisualEffect;
  
  name?: string;
  description?: string | null;
  inStock?: number;
  units?: string | null;
  minimumStock?: number | null;

  parametersData?: ParameterDetail[] | null;
  isLoadingParameters?: boolean;
  isParametersError?: boolean;
  parametersError?: SerializedError | FetchBaseQueryError | null;
}

// Styles adapted from the Lit component
const stylesFactory = (visualEffect?: VisualEffect) => ({
  partDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '4px',
    overflow: 'hidden',
    color: visualEffect?.textColor,
  },
  partName: {
    fontWeight: 'bold' as 'bold',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  partDescription: {
    fontSize: '0.9em',
    opacity: visualEffect?.opacity ?? 0.8,
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
});

const PartDetails: React.FC<PartDetailsProps> = ({
  config,
  visualEffect,
  name,
  description,
  inStock,
  units,
  minimumStock,
  parametersData,
  isLoadingParameters,
  isParametersError,
  parametersError
}) => {
  // Get dynamic styles based on visualEffect
  const styles = stylesFactory(visualEffect);

  if (name === undefined && !isLoadingParameters) { 
    return null; 
  }

  const display = config?.display || {};

  return (
    <div style={styles.partDetails}>
      {/* Name */}
      {display.show_name !== false && name !== undefined && (
        <div style={styles.partName}>{name}</div>
      )}
      
      {/* Description */}
      {display.show_description && description && (
        <div style={styles.partDescription}>{description}</div>
      )}
      
      {/* Stock */}
      {display.show_stock !== false && inStock !== undefined && (
        <div style={styles.partStock}>
          Stock: {inStock}
          {minimumStock && minimumStock > 0 ? ` / Min: ${minimumStock}` : ''}
          {units ? ` ${units}` : ''}
        </div>
      )}
      
      {/* Parameters Display Logic */}
      {display.show_parameters !== false && (
        <>
          {isLoadingParameters && <p>Loading parameters...</p>}
          {isParametersError && (
            <p style={{ color: 'red' }}>
              Error loading parameters: {
                (() => {
                  if (parametersError) {
                    if ('status' in parametersError) {
                      const fetchError = parametersError as FetchBaseQueryError;
                      if (typeof fetchError.data === 'string') return fetchError.data;
                      if (typeof fetchError.data === 'object' && fetchError.data && 'message' in fetchError.data) return (fetchError.data as any).message;
                      return fetchError.status?.toString() || 'API error';
                    } else {
                      return (parametersError as SerializedError).message || 'Unknown client error';
                    }
                  }
                  return 'Unknown error';
                })()
              }
            </p>
          )}
          {parametersData && parametersData.length > 0 && (
            <div style={styles.partParameters}>
              {parametersData.map((param: ParameterDetail) => (
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
          {parametersData && parametersData.length === 0 && !isLoadingParameters && !isParametersError && (
             <p style={{fontSize: '0.8em', opacity: 0.7}}>No parameters for this part.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PartDetails; 