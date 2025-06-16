import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, LayoutConfig } from '../../types';
import 'react-lazy-load-image-component/src/effects/blur.css';
interface TableLayoutProps {
    hass: HomeAssistant;
    parts: InventreeItem[];
    layoutConfig: LayoutConfig;
    cardInstanceId: string;
}
declare const TableLayout: React.FC<TableLayoutProps>;
export default TableLayout;
