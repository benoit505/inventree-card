import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface GridLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    partIds: number[];
    cardInstanceId?: string;
}
declare const GridLayout: React.FC<GridLayoutProps>;
export default GridLayout;
