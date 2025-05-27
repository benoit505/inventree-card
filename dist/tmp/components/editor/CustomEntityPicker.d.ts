import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface CustomEntityPickerProps {
    hass?: HomeAssistant;
    value?: string;
    label?: string;
    includeDomains?: string[];
    disabled?: boolean;
    onValueChanged: (value: string) => void;
    placeholder?: string;
}
declare const CustomEntityPicker: React.FC<CustomEntityPickerProps>;
export default CustomEntityPicker;
