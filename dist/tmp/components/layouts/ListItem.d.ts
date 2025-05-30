import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction } from '../../types';
interface ListItemProps {
    part: InventreeItem;
    config: InventreeCardConfig;
    hass?: HomeAssistant;
    parametersDisplayEnabled: boolean;
    onLocate?: (partId: number) => void;
    parameterActions?: ParameterAction[];
}
declare const ListItem: React.FC<ListItemProps>;
export default ListItem;
