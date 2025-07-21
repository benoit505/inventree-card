import React from 'react';
import { InventreeCardConfig, InventreeItem, VisualEffect } from '../../types';
interface PartDetailsProps {
    part: InventreeItem;
    config: InventreeCardConfig;
    visualEffect?: VisualEffect;
}
declare const PartDetails: React.FC<PartDetailsProps>;
export default PartDetails;
