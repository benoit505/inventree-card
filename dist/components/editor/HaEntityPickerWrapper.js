import { jsx as _jsx } from "react/jsx-runtime";
import React, { useRef, useEffect, useImperativeHandle } from 'react';
// ForwardRef allows parent components to get a ref to the underlying ha-entity-picker if needed,
// though we might not use it immediately.
const HaEntityPickerWrapper = React.forwardRef(({ hass, value, label, includeDomains, disabled, allowCustomEntity, onValueChanged }, ref) => {
    const pickerRef = useRef(null); // Ref for the ha-entity-picker element
    // Use useEffect to interact with the Lit component after it's rendered
    useEffect(() => {
        const { current: pickerNode } = pickerRef;
        if (pickerNode) {
            console.log('[HaEntityPickerWrapper] useEffect running. HASS object:', hass); // Use console.log
            // Set complex properties like the hass object
            // For Lit elements, properties are typically set directly on the element instance
            if (hass) {
                pickerNode.hass = hass;
            }
            if (label !== undefined) {
                pickerNode.label = label;
            }
            if (includeDomains !== undefined) {
                pickerNode.includeDomains = includeDomains;
            }
            if (disabled !== undefined) {
                pickerNode.disabled = disabled;
            }
            if (allowCustomEntity !== undefined) {
                pickerNode.allowCustomEntity = allowCustomEntity;
            }
            // Note: 'value' is set directly via JSX attribute below for primitives
            // Event listener for value changes
            const handleValueChanged = (event) => {
                if (event.detail && typeof event.detail.value === 'string') {
                    onValueChanged(event.detail.value);
                }
            };
            pickerNode.addEventListener('value-changed', handleValueChanged);
            // Cleanup: remove event listener when component unmounts or dependencies change
            return () => {
                pickerNode.removeEventListener('value-changed', handleValueChanged);
            };
        }
    }, [hass, label, includeDomains, disabled, allowCustomEntity, onValueChanged]); // Dependencies for the effect
    // Update the value if it changes from props
    useEffect(() => {
        if (pickerRef.current && value !== undefined && pickerRef.current.value !== value) {
            pickerRef.current.value = value;
        }
    }, [value]);
    // Forward the external ref to the internal pickerRef if needed by parent.
    // This allows a parent to call methods on the ha-entity-picker if necessary.
    useImperativeHandle(ref, () => pickerRef.current, []);
    // Convert includeDomains array to a comma-separated string for the attribute
    const includeDomainsString = includeDomains ? includeDomains.join(',') : undefined;
    // Render the Lit component as JSX
    // Primitive props like 'value' (if string/boolean/number) can be passed directly.
    // For object props like 'hass', we set them in useEffect.
    return (_jsx("ha-entity-picker", { ref: pickerRef, value: value, label: label, "include-domains": includeDomainsString, 
        // For boolean attributes, set them if true, or they will be absent if undefined/false
        disabled: disabled || undefined, "allow-custom-entity": allowCustomEntity || undefined }));
});
HaEntityPickerWrapper.displayName = 'HaEntityPickerWrapper';
export default HaEntityPickerWrapper;
//# sourceMappingURL=HaEntityPickerWrapper.js.map