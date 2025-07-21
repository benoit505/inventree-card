import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
interface TableLayoutProps {
    hass: HomeAssistant;
    parts: InventreeItem[];
    config: InventreeCardConfig;
    cardInstanceId: string;
}
declare const TableLayout: React.FC<TableLayoutProps>;
export default TableLayout;
