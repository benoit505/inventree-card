import * as React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction } from '../../types';
interface GridItemProps {
    part: InventreeItem;
    config: InventreeCardConfig;
    hass?: HomeAssistant;
    cardInstanceId?: string;
    isCurrentlyLocating: boolean;
    parameterActions: ParameterAction[];
    parametersDisplayEnabled: boolean;
    handleLocateGridItem: (partId: number) => void;
    handleParameterActionClick: (partId: number, action: ParameterAction, parameterPk?: number) => void;
}
declare const GridItem: React.FC<GridItemProps>;
export default GridItem;
