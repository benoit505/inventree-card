import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig } from '../../types';
interface PartsLayoutProps {
    parts: InventreeItem[];
    hass: HomeAssistant;
    config: InventreeCardConfig;
    cardInstanceId: string;
}
declare const PartsLayout: React.FC<PartsLayoutProps>;
export default PartsLayout;
