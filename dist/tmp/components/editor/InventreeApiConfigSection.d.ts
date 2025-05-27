import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { DirectApiConfig } from '../../types';
interface InventreeApiConfigSectionProps {
    hass?: HomeAssistant;
    directApiConfig?: DirectApiConfig;
    onDirectApiConfigChanged: (newApiConfig: DirectApiConfig) => void;
}
declare const InventreeApiConfigSection: React.FC<InventreeApiConfigSectionProps>;
export default InventreeApiConfigSection;
