import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface PartsLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    parts: InventreeItem[];
}
declare const PartsLayout: React.FC<PartsLayoutProps>;
export default PartsLayout;
