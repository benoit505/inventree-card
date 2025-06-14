import * as React from 'react';
import { InventreeCardConfig, ParameterDetail } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface PartDetailsProps {
  config?: InventreeCardConfig;
  visualEffect?: VisualEffect;
  
  description?: string | null;
  categoryName?: string | null;
  ipn?: string | null;
  locationName?: string | null;
  supplierName?: string | null;
  manufacturerName?: string | null;
  notes?: string | null;

  parametersData?: ParameterDetail[] | null;
  isLoadingParameters?: boolean;
  isParametersError?: boolean;
  parametersError?: SerializedError | FetchBaseQueryError | null;

  showDescription?: boolean;
  showCategory?: boolean;
  showIpn?: boolean;
  showLocation?: boolean;
  showSupplier?: boolean;
  showManufacturer?: boolean;
  showNotes?: boolean;
  showParameters?: boolean;
}

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
  detailItem: {
    marginBottom: '0.25rem',
    fontSize: '0.9em',
  },
});

const PartDetails: React.FC<PartDetailsProps> = ({
  visualEffect,
  
  description,
  categoryName,
  ipn,
  locationName,
  supplierName,
  manufacturerName,
  notes,
  parametersData,
  isLoadingParameters,
  isParametersError,
  parametersError,
  showDescription,
  showCategory,
  showIpn,
  showLocation,
  showSupplier,
  showManufacturer,
  showNotes,
  showParameters
}) => {
  const styles = stylesFactory(visualEffect);

  if (description === undefined && !isLoadingParameters) { 
    return null; 
  }

  const hasVisibleContent = 
    (showDescription && description) ||
    (showCategory && categoryName) ||
    (showIpn && ipn) ||
    (showLocation && locationName) ||
    (showSupplier && supplierName) ||
    (showManufacturer && manufacturerName) ||
    (showNotes && notes) ||
    (showParameters && (parametersData || isLoadingParameters || isParametersError));

  if (!hasVisibleContent) {
    return null;
  }

  return (
    <div style={styles.partDetails}>
      {/* Description */}
      {showDescription && description && (
        <div style={styles.partDescription}>{description}</div>
      )}
      
      {/* Category */}
      {showCategory && categoryName && (
        <div style={styles.detailItem}><strong>Category:</strong> {categoryName}</div>
      )}

      {/* IPN */}
      {showIpn && ipn && (
        <div style={styles.detailItem}><strong>IPN:</strong> {ipn}</div>
      )}

      {/* Location */}
      {showLocation && locationName && (
        <div style={styles.detailItem}><strong>Location:</strong> {locationName}</div>
      )}

      {/* Supplier */}
      {showSupplier && supplierName && (
        <div style={styles.detailItem}><strong>Supplier:</strong> {supplierName}</div>
      )}

      {/* Manufacturer */}
      {showManufacturer && manufacturerName && (
        <div style={styles.detailItem}><strong>Manufacturer:</strong> {manufacturerName}</div>
      )}

      {/* Notes */}
      {showNotes && notes && (
        <div style={styles.detailItem}><strong>Notes:</strong> {notes}</div>
      )}
      
      {/* Parameters Display Logic */}
      {showParameters && (
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