import * as React from 'react';
import { InventreeCardConfig } from '../../types';
interface PartParametersViewProps {
    partId: number;
    config?: InventreeCardConfig;
    parametersDisplayEnabled: boolean;
    cardInstanceId: string;
}
declare const PartParametersView: React.FC<PartParametersViewProps>;
export default PartParametersView;
