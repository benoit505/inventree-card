import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface ListItemProps {
    part: InventreeItem;
    config: InventreeCardConfig;
    hass: HomeAssistant;
    cardInstanceId?: string;
    onLocate: (partId: number) => void;
}
declare const ListItem: React.FC<ListItemProps>;
export default ListItem;
