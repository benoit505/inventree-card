import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Logger } from '../../utils/logger'; // Assuming Logger is in utils
const logger = Logger.getInstance();
const HaIconPickerWrapper = ({ hass, label, value, placeholder, disabled, onValueChanged, }) => {
    const pickerRef = useRef(null); // Use any for LitElement, or define a more specific type if available
    // Set properties on the Lit element when props change
    useEffect(() => {
        if (pickerRef.current) {
            const element = pickerRef.current;
            if (hass !== undefined)
                element.hass = hass;
            if (label !== undefined)
                element.label = label;
            if (value !== undefined)
                element.value = value;
            if (placeholder !== undefined)
                element.placeholder = placeholder;
            if (disabled !== undefined)
                element.disabled = disabled;
            // logger.log('Editor:HaIconPickerWrapper', 'Properties updated on Lit element', { hass: !!hass, label, value, placeholder, disabled });
        }
    }, [hass, label, value, placeholder, disabled]);
    // Event listener setup
    useEffect(() => {
        const currentElement = pickerRef.current;
        if (currentElement) {
            const eventListener = (event) => {
                logger.log('Editor:HaIconPickerWrapper', 'value-changed event received from ha-icon-picker', { detail: event.detail });
                if (event.detail && typeof event.detail.value === 'string') {
                    onValueChanged(event.detail.value);
                }
            };
            currentElement.addEventListener('value-changed', eventListener);
            logger.log('Editor:HaIconPickerWrapper', 'Added event listener for value-changed');
            return () => {
                currentElement.removeEventListener('value-changed', eventListener);
                logger.log('Editor:HaIconPickerWrapper', 'Removed event listener for value-changed');
            };
        }
    }, [onValueChanged]); // Re-attach if onValueChanged changes
    return (_jsx("ha-icon-picker", { ref: pickerRef }));
};
export default HaIconPickerWrapper;
//# sourceMappingURL=HaIconPickerWrapper.js.map