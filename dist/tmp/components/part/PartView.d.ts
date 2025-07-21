import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface PartViewProps {
    partId: number;
    config: InventreeCardConfig;
    hass: HomeAssistant;
    cardInstanceId?: string;
}
declare const PartView: React.FC<PartViewProps>;
export default PartView;
