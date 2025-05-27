import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ProcessedVariant } from '../../types';
interface PartVariantProps {
    variant?: ProcessedVariant;
    config?: InventreeCardConfig;
    hass?: HomeAssistant;
}
declare const PartVariant: React.FC<PartVariantProps>;
export default PartVariant;
