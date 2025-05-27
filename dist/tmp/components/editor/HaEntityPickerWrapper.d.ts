import React from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
interface HaEntityPickerWrapperProps {
    hass?: HomeAssistant;
    value?: string;
    label?: string;
    includeDomains?: string[];
    disabled?: boolean;
    allowCustomEntity?: boolean;
    onValueChanged: (value: string) => void;
}
declare const HaEntityPickerWrapper: React.FC<HaEntityPickerWrapperProps>;
export default HaEntityPickerWrapper;
