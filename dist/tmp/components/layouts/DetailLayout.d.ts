import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../types';
interface DetailLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    selectedPartId?: number;
}
declare const DetailLayout: React.FC<DetailLayoutProps>;
export default DetailLayout;
