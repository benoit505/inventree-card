import React from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';
interface ReactAppProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    cardInstanceId?: string;
}
export declare const ReactApp: React.FC<ReactAppProps>;
export {};
