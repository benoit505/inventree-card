import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface ListLayoutProps {
    parts: InventreeItem[];
    config: InventreeCardConfig;
    hass: HomeAssistant;
    cardInstanceId: string;
}
declare const ListLayout: React.FC<ListLayoutProps>;
export default ListLayout;
