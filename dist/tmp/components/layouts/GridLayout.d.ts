import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface GridLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    parts: InventreeItem[];
    cardInstanceId?: string;
    item?: InventreeItem;
}
declare const GridLayout: React.FC<GridLayoutProps>;
export default GridLayout;
