import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { InventreeParameterFetchConfig } from '../../types';
interface InventreeParametersToFetchSectionProps {
    hass?: HomeAssistant;
    parameterFetchConfigs: InventreeParameterFetchConfig[];
    onFetchConfigsChanged: (newConfigs: InventreeParameterFetchConfig[]) => void;
}
declare const InventreeParametersToFetchSection: React.FC<InventreeParametersToFetchSectionProps>;
export default InventreeParametersToFetchSection;
