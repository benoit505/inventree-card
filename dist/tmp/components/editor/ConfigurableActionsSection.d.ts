import React from 'react';
import { ActionDefinition } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
interface ConfigurableActionsSectionProps {
    hass: HomeAssistant;
    actions?: ActionDefinition[];
    onActionsChanged: (newActions: ActionDefinition[]) => void;
}
declare const ConfigurableActionsSection: React.FC<ConfigurableActionsSectionProps>;
export default ConfigurableActionsSection;
