import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface PartViewProps {
    partId?: number;
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
}
declare const PartView: React.FC<PartViewProps>;
export default PartView;
