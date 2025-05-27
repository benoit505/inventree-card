import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';

// Define the detail structure for the value_changed event
interface ValueChangedEventDetail {
  value: string;
}

// Define the props for the wrapper component
interface HaEntityPickerWrapperProps {
  hass?: HomeAssistant;
  value?: string;
  label?: string;
  includeDomains?: string[];
  disabled?: boolean;
  allowCustomEntity?: boolean;
  onValueChanged: (value: string) => void;
}

// Create a promise that resolves when 'ha-entity-picker' is defined.
// This is created once per module load.
const entityPickerDefinedPromise = customElements.whenDefined('ha-entity-picker');
const POLLING_INTERVAL = 100; // ms
const MAX_POLLS = 50; // Max 5 seconds of polling (50 * 100ms)

const HaEntityPickerWrapper: React.FC<HaEntityPickerWrapperProps> = ({
  hass,
  value,
  label,
  includeDomains,
  disabled,
  allowCustomEntity,
  onValueChanged,
}) => {
  const pickerRef = useRef<any>(null);
  const [isElementDefinedAndReady, setIsElementDefinedAndReady] = useState(false); // Renamed for clarity

  console.log(`[HaEntityPickerWrapper] (${label}) Rendering. Has HASS: ${!!hass}, ElementReady: ${isElementDefinedAndReady}, PickerRef: ${!!pickerRef.current}`);

  // Effect to set isElementDefinedAndReady to true once the custom element is defined AND ready (requestUpdate is available).
  useEffect(() => {
    let isMounted = true;
    let pollCount = 0;
    let pollIntervalId: NodeJS.Timeout | null = null;
    let currentStage: 'defining' | 'readying' = 'defining'; // To track polling stage

    const attemptFinalSetup = (currentPickerInstance: any) => {
      if (!isMounted) return;
      console.log(`[HaEntityPickerWrapper] (${label}) Element fully ready. Setting isElementDefinedAndReady to true.`);
      setIsElementDefinedAndReady(true);
    };

    const checkPickerReady = () => { // This is for the 'readying' stage
      if (!isMounted) {
        if (pollIntervalId) clearInterval(pollIntervalId);
        return;
      }
      if (pickerRef.current && typeof pickerRef.current.requestUpdate === 'function') {
        console.log(`[HaEntityPickerWrapper] (${label}) Polling (Readying): requestUpdate IS available on pickerRef.current.`);
        if (pollIntervalId) clearInterval(pollIntervalId);
        attemptFinalSetup(pickerRef.current);
      } else {
        pollCount++;
        if (pollCount > MAX_POLLS) {
          if (pollIntervalId) clearInterval(pollIntervalId);
          console.warn(`[HaEntityPickerWrapper] (${label}) Polling (Readying): Max polls reached. requestUpdate still not available. PickerRef:`, pickerRef.current);
        } else {
          console.log(`[HaEntityPickerWrapper] (${label}) Polling (Readying): requestUpdate still NOT available (Poll ${pollCount}/${MAX_POLLS}).`);
        }
      }
    };

    const checkPickerDefined = () => { // This is for the 'defining' stage
      if (!isMounted) {
        if (pollIntervalId) clearInterval(pollIntervalId);
        return;
      }
      if (customElements.get('ha-entity-picker')) {
        console.log(`[HaEntityPickerWrapper] (${label}) Polling (Defining): <ha-entity-picker> IS DEFINED.`);
        if (pollIntervalId) clearInterval(pollIntervalId);
        
        // Transition to readying stage
        currentStage = 'readying';
        pollCount = 0; // Reset poll count for the new stage

        // Now check for requestUpdate, start polling if not immediately available
        if (pickerRef.current && typeof pickerRef.current.requestUpdate === 'function') {
          console.log(`[HaEntityPickerWrapper] (${label}) requestUpdate immediately available after element defined.`);
          attemptFinalSetup(pickerRef.current);
        } else {
          console.log(`[HaEntityPickerWrapper] (${label}) requestUpdate NOT immediately available after element defined. Starting poll for readiness. PickerRef:`, pickerRef.current);
          pollIntervalId = setInterval(checkPickerReady, POLLING_INTERVAL);
        }
      } else {
        pollCount++;
        if (pollCount > MAX_POLLS) {
          if (pollIntervalId) clearInterval(pollIntervalId);
          console.warn(`[HaEntityPickerWrapper] (${label}) Polling (Defining): Max polls reached. <ha-entity-picker> still not defined.`);
        } else {
          console.log(`[HaEntityPickerWrapper] (${label}) Polling (Defining): <ha-entity-picker> still NOT defined (Poll ${pollCount}/${MAX_POLLS}).`);
        }
      }
    };

    console.log(`[HaEntityPickerWrapper] (${label}) Element definition and readiness check effect started. Initial stage: ${currentStage}`);
    // Start polling for definition
    pollIntervalId = setInterval(checkPickerDefined, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      if (pollIntervalId) clearInterval(pollIntervalId);
      console.log(`[HaEntityPickerWrapper] (${label}) Element definition and readiness check effect cleanup. Stage was: ${currentStage}`);
    };
  }, [label]); // Runs once per component instance (label is stable)

  // Effect for Picker Initialization (depends on hass, pickerRef.current, and isElementDefinedAndReady)
  useEffect(() => {
    const initPicker = () => { // No longer async, assumes element is ready
      console.log(`[HaEntityPickerWrapper] (${label}) initPicker called. Has HASS: ${!!hass}, PickerRef: ${!!pickerRef.current}`);
      
      // isElementDefinedAndReady already ensures pickerRef.current and its methods are good
      const currentPicker = pickerRef.current;
      if (!currentPicker) { // Should not happen if isElementDefinedAndReady is true
          console.error(`[HaEntityPickerWrapper] (${label}) CRITICAL: initPicker called but currentPicker is null, despite isElementDefinedAndReady being true.`);
          return undefined;
      }

      const handleValueChanged = (event: CustomEvent<ValueChangedEventDetail>) => {
        console.log(`[HaEntityPickerWrapper] (${label}) value-changed event. Value: ${event.detail?.value}`);
        if (event.detail && event.detail.value !== undefined) {
          onValueChanged(event.detail.value);
        }
      };

      console.log(`[HaEntityPickerWrapper] (${label}) Adding value-changed event listener.`);
      currentPicker.addEventListener('value-changed', handleValueChanged as EventListener);

      console.log(`[HaEntityPickerWrapper] (${label}) Explicitly setting hass on picker in initPicker.`);
      currentPicker.hass = hass; // hass is guaranteed to be present here

      // requestUpdate should be available now due to isElementDefinedAndReady guard
      console.log(`[HaEntityPickerWrapper] (${label}) Calling requestUpdate() on picker in initPicker.`);
      currentPicker.requestUpdate();
      
      setTimeout(() => {
        if (pickerRef.current) {
          console.log(`[HaEntityPickerWrapper] (${label}) Dimensions (after requestUpdate in initPicker). height: ${pickerRef.current.offsetHeight}, width: ${pickerRef.current.offsetWidth}`);
        }
      }, 100);

      console.log(`[HaEntityPickerWrapper] (${label}) initPicker completed.`);

      return () => {
        if (currentPicker) {
          console.log(`[HaEntityPickerWrapper] (${label}) Removing value-changed event listener (from initPicker cleanup).`);
          currentPicker.removeEventListener('value-changed', handleValueChanged as EventListener);
        }
      };
    };

    let cleanupFunction: (() => void) | undefined;

    if (hass && pickerRef.current && isElementDefinedAndReady) {
      console.log(`[HaEntityPickerWrapper] (${label}) Calling initPicker (HASS, pickerRef, and element READY).`);
      cleanupFunction = initPicker(); // initPicker is now synchronous and returns the cleanup
    } else {
      console.warn(`[HaEntityPickerWrapper] (${label}) Skipping initPicker call. Has HASS: ${!!hass}, PickerRef: ${!!pickerRef.current}, ElementReady: ${isElementDefinedAndReady}`);
    }

    return () => {
      if (typeof cleanupFunction === 'function') {
        console.log(`[HaEntityPickerWrapper] (${label}) Executing cleanup from initPicker.`);
        cleanupFunction();
      }
    };
  }, [hass, label, isElementDefinedAndReady, onValueChanged]);

  // Effect for handling other prop changes (value, includeDomains, etc.)
  useEffect(() => {
    const applyPropsToPicker = () => { // No longer async
      if (!pickerRef.current || !hass || !isElementDefinedAndReady) {
        console.warn(`[HaEntityPickerWrapper] (${label}) Prop-update: Skipping applyProps. PickerRef: ${!!pickerRef.current}, Has HASS: ${!!hass}, ElementReady: ${isElementDefinedAndReady}`);
        return;
      }
      
      const currentPicker = pickerRef.current;
      if (!currentPicker) { // Should not happen
          console.error(`[HaEntityPickerWrapper] (${label}) CRITICAL: applyPropsToPicker called but currentPicker is null, despite isElementDefinedAndReady being true.`);
          return;
      }

      console.log(`[HaEntityPickerWrapper] (${label}) Prop-update useEffect: Applying props. Value: ${value}`);
      currentPicker.value = value;
      currentPicker.includeDomains = includeDomains;
      currentPicker.disabled = disabled;
      currentPicker.allowCustomEntity = allowCustomEntity;
      // currentPicker.hass = hass; // Already set in initPicker or by its re-run

      console.log(`[HaEntityPickerWrapper] (${label}) Prop-update useEffect: Calling requestUpdate().`);
      currentPicker.requestUpdate(); // Assumes requestUpdate is available
    };

    applyPropsToPicker();
    
  }, [value, includeDomains, disabled, allowCustomEntity, label, hass, isElementDefinedAndReady, onValueChanged]);

  if (!hass) {
    console.log(`[HaEntityPickerWrapper] (${label}) HASS not available at render. Rendering null.`);
    return null; 
  }

  // Render the picker. Properties will be applied by useEffects once element is defined and hass is available.
  return (
    <ha-entity-picker
      ref={pickerRef}
      style={{ display: 'block' }}
      label={label} // Static, set at render
      // Other props (value, hass, includeDomains etc.) are set by useEffects
    />
  );
};

export default HaEntityPickerWrapper;
