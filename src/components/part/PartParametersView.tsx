import * as React from 'react';
import { InventreeCardConfig, ParameterDetail } from '../../types';
import { useGetPartParametersQuery } from '../../store/apis/inventreeApi';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

ConditionalLoggerEngine.getInstance().registerCategory('PartParametersView', { enabled: false, level: 'info' });

interface PartParametersViewProps {
  partId: number;
  config?: InventreeCardConfig; // For future use, e.g., styling, display options
  parametersDisplayEnabled: boolean;
  cardInstanceId: string;
}

const PartParametersView: React.FC<PartParametersViewProps> = ({ partId, config, parametersDisplayEnabled, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('PartParametersView', cardInstanceId);
  }, [cardInstanceId]);

  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError,
    error,
    isFetching,
  } = useGetPartParametersQuery({ partId, cardInstanceId }, { 
    skip: !parametersDisplayEnabled, 
    // refetchOnMountOrArgChange: true, // Consider if always needed
  });

  if (!parametersDisplayEnabled) {
    return null;
  }

  if (isLoadingParameters || isFetching) {
    return <p style={{ fontSize: '0.8em', fontStyle: 'italic' }}>Loading parameters...</p>;
  }

  if (isError) {
    let errorMessage = 'Error loading parameters.';
    if (error && typeof error === 'object') {
      if ('status' in error) { // FetchBaseQueryError
        const fetchError = error as FetchBaseQueryError;
        if (fetchError.data && typeof fetchError.data === 'object' && (fetchError.data as any).message) {
          errorMessage = (fetchError.data as any).message;
        } else if (typeof fetchError.data === 'string' && fetchError.data.trim() !== '') {
          errorMessage = fetchError.data;
        } else if (fetchError.status) {
          errorMessage = `Error ${fetchError.status}`;
        }
      } else { // SerializedError
        errorMessage = (error as SerializedError).message || errorMessage;
      }
    }
    logger.warn('PartParametersView', `Error fetching parameters for part ${partId}: ${errorMessage}`, { errorData: error });
    return <p style={{ fontSize: '0.8em', color: 'red' }}>{errorMessage}</p>;
  }

  if (!parametersData || parametersData.length === 0) {
    return <p style={{ fontSize: '0.8em', fontStyle: 'italic' }}>No parameters defined for this part.</p>;
  }

  return (
    <div className="part-parameters-view" style={{ fontSize: '0.8em', textAlign: 'left', marginTop: '8px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {parametersData.map((parameter: ParameterDetail) => (
          <li key={parameter.pk}>
            <strong>{parameter.template_detail?.name || 'Unnamed Parameter'}:</strong> {parameter.data}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PartParametersView; 