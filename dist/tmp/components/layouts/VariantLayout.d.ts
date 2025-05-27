import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem } from '../../types';
interface VariantLayoutProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    parts: InventreeItem[];
}
declare const VariantLayout: React.FC<VariantLayoutProps>;
export default VariantLayout;
