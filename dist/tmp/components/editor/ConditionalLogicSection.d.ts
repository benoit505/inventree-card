import React from 'react';
import 'react-querybuilder/dist/query-builder.css';
import { DataSourceConfig, DirectApiConfig, ParameterDetail, ConditionalLogicConfig } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
interface ConditionalLogicSectionProps {
    conditionalLogicConfig?: ConditionalLogicConfig;
    onConfigChanged: (newConfig: ConditionalLogicConfig) => void;
    configuredDataSources?: DataSourceConfig;
    hass?: HomeAssistant;
    directApiConfig?: DirectApiConfig;
    allParameterValues?: Record<number, Record<string, ParameterDetail>>;
}
declare const ConditionalLogicSection: React.FC<ConditionalLogicSectionProps>;
export default ConditionalLogicSection;
