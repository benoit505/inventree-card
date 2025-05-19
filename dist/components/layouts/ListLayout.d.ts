import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface ListLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    parts: InventreeItem[];
}
declare const ListLayout: React.FC<ListLayoutProps>;
export default ListLayout;
