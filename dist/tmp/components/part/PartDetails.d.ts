import * as React from 'react';
import { InventreeCardConfig, ParameterDetail } from '../../types';
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
declare const PartDetails: React.FC<PartDetailsProps>;
export default PartDetails;
