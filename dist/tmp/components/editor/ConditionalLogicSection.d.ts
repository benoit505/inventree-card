import React from 'react';
import 'react-querybuilder/dist/query-builder.css';
import { DataSourceConfig, DirectApiConfig, ParameterDetail, ConditionalLogicConfig, // Our internal RuleType
InventreeItem, CellDefinition } from '../../types';
import { HomeAssistant } from 'custom-card-helpers';
interface ConditionalLogicSectionProps {
    conditionalLogicConfig?: ConditionalLogicConfig;
    onConfigChanged: (newConfig: ConditionalLogicConfig) => void;
    configuredDataSources?: DataSourceConfig;
    hass?: HomeAssistant;
    directApiConfig?: DirectApiConfig;
    allParameterValues?: Record<string, Record<string, ParameterDetail>>;
    cardInstanceId?: string;
    parts: InventreeItem[];
    cells: CellDefinition[];
}
declare const ConditionalLogicSection: React.FC<ConditionalLogicSectionProps>;
export default ConditionalLogicSection;
