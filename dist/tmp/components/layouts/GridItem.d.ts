import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
interface GridItemProps {
    partId: number;
    hass?: HomeAssistant;
    cardInstanceId?: string;
}
declare const GridItem: React.FC<GridItemProps>;
export default GridItem;
