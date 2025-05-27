import React, { useRef, useEffect, useCallback } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { Logger } from '../../utils/logger'; // Assuming Logger is in utils

const logger = Logger.getInstance();

// Define the structure of the event detail for value-changed
interface ValueChangedEventDetail {
  value: string;
}

// Define the props for the wrapper component
interface HaIconPickerWrapperProps {
  hass?: HomeAssistant; // Optional HomeAssistant object
  label?: string;
  value?: string; // The current icon value
  placeholder?: string;
  disabled?: boolean;
  onValueChanged: (value: string) => void; // Callback function for when the value changes
}

const HaIconPickerWrapper: React.FC<HaIconPickerWrapperProps> = ({
  hass,
  label,
  value,
  placeholder,
  disabled,
  onValueChanged,
}) => {
  const pickerRef = useRef<any>(null); // Use any for LitElement, or define a more specific type if available

  // Set properties on the Lit element when props change
  useEffect(() => {
    if (pickerRef.current) {
      const element = pickerRef.current;
      if (hass !== undefined) element.hass = hass;
      if (label !== undefined) element.label = label;
      if (value !== undefined) element.value = value;
      if (placeholder !== undefined) element.placeholder = placeholder;
      if (disabled !== undefined) element.disabled = disabled;
      // logger.log('Editor:HaIconPickerWrapper', 'Properties updated on Lit element', { hass: !!hass, label, value, placeholder, disabled });
    }
  }, [hass, label, value, placeholder, disabled]);

  // Event listener setup
  useEffect(() => {
    const currentElement = pickerRef.current;
    if (currentElement) {
      const eventListener = (event: CustomEvent<ValueChangedEventDetail>) => {
        logger.log('Editor:HaIconPickerWrapper', 'value-changed event received from ha-icon-picker', { detail: event.detail });
        if (event.detail && typeof event.detail.value === 'string') {
          onValueChanged(event.detail.value);
        }
      };

      currentElement.addEventListener('value-changed', eventListener as EventListener);
      logger.log('Editor:HaIconPickerWrapper', 'Added event listener for value-changed');

      return () => {
        currentElement.removeEventListener('value-changed', eventListener as EventListener);
        logger.log('Editor:HaIconPickerWrapper', 'Removed event listener for value-changed');
      };
    }
  }, [onValueChanged]); // Re-attach if onValueChanged changes

  return (
    <ha-icon-picker
      ref={pickerRef}
      // Props are set via useEffect to correctly interact with the Lit element
    ></ha-icon-picker>
  );
};

export default HaIconPickerWrapper; 