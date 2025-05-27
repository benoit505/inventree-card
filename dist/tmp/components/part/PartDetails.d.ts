import * as React from 'react';
import { InventreeCardConfig } from '../../types';
interface PartDetailsProps {
    partId?: number;
    config?: InventreeCardConfig;
}
declare const PartDetails: React.FC<PartDetailsProps>;
export default PartDetails;
