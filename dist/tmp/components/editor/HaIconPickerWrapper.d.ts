import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface HaIconPickerWrapperProps {
    hass?: HomeAssistant;
    label?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    onValueChanged: (value: string) => void;
}
declare const HaIconPickerWrapper: React.FC<HaIconPickerWrapperProps>;
export default HaIconPickerWrapper;
