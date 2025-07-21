import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { HomeAssistant } from 'custom-card-helpers';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('HaEntityPickerWrapper');
ConditionalLoggerEngine.getInstance().registerCategory('HaEntityPickerWrapper', { enabled: false, level: 'info' });

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

  logger.debug('render', `(${label}) Rendering.`, { hasHass: !!hass, isElementReady: isElementDefinedAndReady, hasPickerRef: !!pickerRef.current });

  // Effect to set isElementDefinedAndReady to true once the custom element is defined AND ready (requestUpdate is available).
  useEffect(() => {
    let isMounted = true;
    let pollCount = 0;
    let pollIntervalId: NodeJS.Timeout | null = null;
    let currentStage: 'defining' | 'readying' = 'defining'; // To track polling stage

    const attemptFinalSetup = () => {
      if (!isMounted) return;
      logger.debug('useEffect[readinessPoll]', `(${label}) Element fully ready. Setting isElementDefinedAndReady to true.`);
      setIsElementDefinedAndReady(true);
    };

    const checkPickerReady = () => { // This is for the 'readying' stage
      if (!isMounted) {
        if (pollIntervalId) clearInterval(pollIntervalId);
        return;
      }
      if (pickerRef.current && typeof pickerRef.current.requestUpdate === 'function') {
        logger.debug('useEffect[readinessPoll]', `(${label}) Polling (Readying): requestUpdate IS available on pickerRef.current.`);
        if (pollIntervalId) clearInterval(pollIntervalId);
        attemptFinalSetup();
      } else {
        pollCount++;
        if (pollCount > MAX_POLLS) {
          if (pollIntervalId) clearInterval(pollIntervalId);
          logger.warn('useEffect[readinessPoll]', `(${label}) Polling (Readying): Max polls reached. requestUpdate still not available.`, { pickerRef: pickerRef.current });
        } else {
          logger.verbose('useEffect[readinessPoll]', `(${label}) Polling (Readying): requestUpdate still NOT available (Poll ${pollCount}/${MAX_POLLS}).`);
        }
      }
    };

    const checkPickerDefined = () => { // This is for the 'defining' stage
      if (!isMounted) {
        if (pollIntervalId) clearInterval(pollIntervalId);
        return;
      }
      if (customElements.get('ha-entity-picker')) {
        logger.debug('useEffect[readinessPoll]', `(${label}) Polling (Defining): <ha-entity-picker> IS DEFINED.`);
        if (pollIntervalId) clearInterval(pollIntervalId);
        
        // Transition to readying stage
        currentStage = 'readying';
        pollCount = 0; // Reset poll count for the new stage

        // Now check for requestUpdate, start polling if not immediately available
        if (pickerRef.current && typeof pickerRef.current.requestUpdate === 'function') {
          logger.debug('useEffect[readinessPoll]', `(${label}) requestUpdate immediately available after element defined.`);
          attemptFinalSetup();
        } else {
          logger.debug('useEffect[readinessPoll]', `(${label}) requestUpdate NOT immediately available after element defined. Starting poll for readiness.`, { pickerRef: pickerRef.current });
          pollIntervalId = setInterval(checkPickerReady, POLLING_INTERVAL);
        }
      } else {
        pollCount++;
        if (pollCount > MAX_POLLS) {
          if (pollIntervalId) clearInterval(pollIntervalId);
          logger.warn('useEffect[readinessPoll]', `(${label}) Polling (Defining): Max polls reached. <ha-entity-picker> still not defined.`);
        } else {
          logger.verbose('useEffect[readinessPoll]', `(${label}) Polling (Defining): <ha-entity-picker> still NOT defined (Poll ${pollCount}/${MAX_POLLS}).`);
        }
      }
    };

    logger.debug('useEffect[readinessPoll]', `(${label}) Element definition and readiness check effect started.`, { initialStage: currentStage });
    // Start polling for definition
    pollIntervalId = setInterval(checkPickerDefined, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      if (pollIntervalId) clearInterval(pollIntervalId);
      logger.debug('useEffect[readinessPoll]', `(${label}) Element definition and readiness check effect cleanup.`, { stage: currentStage });
    };
  }, [label]); // Runs once per component instance (label is stable)

  // Effect for Picker Initialization (depends on hass, pickerRef.current, and isElementDefinedAndReady)
  useEffect(() => {
    const initPicker = () => { // No longer async, assumes element is ready
      logger.debug('useEffect[initPicker]', `(${label}) initPicker called.`, { hasHass: !!hass, hasPickerRef: !!pickerRef.current });
      
      // isElementDefinedAndReady already ensures pickerRef.current and its methods are good
      const currentPicker = pickerRef.current;
      if (!currentPicker) { // Should not happen if isElementDefinedAndReady is true
          logger.error('useEffect[initPicker]', `(${label}) CRITICAL: initPicker called but currentPicker is null, despite isElementDefinedAndReady being true.`);
          return undefined;
      }

      const handleValueChanged = (event: CustomEvent<ValueChangedEventDetail>) => {
        logger.verbose('useEffect[initPicker].handleValueChanged', `(${label}) value-changed event.`, { value: event.detail?.value });
        if (event.detail && event.detail.value !== undefined) {
          onValueChanged(event.detail.value);
        }
      };

      logger.debug('useEffect[initPicker]', `(${label}) Adding value-changed event listener.`);
      currentPicker.addEventListener('value-changed', handleValueChanged as EventListener);

      logger.debug('useEffect[initPicker]', `(${label}) Explicitly setting hass on picker in initPicker.`);
      currentPicker.hass = hass; // hass is guaranteed to be present here

      // requestUpdate should be available now due to isElementDefinedAndReady guard
      logger.debug('useEffect[initPicker]', `(${label}) Calling requestUpdate() on picker in initPicker.`);
      currentPicker.requestUpdate();
      
      setTimeout(() => {
        if (pickerRef.current) {
          logger.verbose('useEffect[initPicker]', `(${label}) Dimensions (after requestUpdate in initPicker).`, { height: pickerRef.current.offsetHeight, width: pickerRef.current.offsetWidth });
        }
      }, 100);

      logger.debug('useEffect[initPicker]', `(${label}) initPicker completed.`);

      return () => {
        if (currentPicker) {
          logger.debug('useEffect[initPicker]', `(${label}) Removing value-changed event listener (from initPicker cleanup).`);
          currentPicker.removeEventListener('value-changed', handleValueChanged as EventListener);
        }
      };
    };

    let cleanupFunction: (() => void) | undefined;

    if (hass && pickerRef.current && isElementDefinedAndReady) {
      logger.debug('useEffect[initPicker]', `(${label}) Calling initPicker (HASS, pickerRef, and element READY).`);
      cleanupFunction = initPicker(); // initPicker is now synchronous and returns the cleanup
    } else {
      logger.warn('useEffect[initPicker]', `(${label}) Skipping initPicker call.`, { hasHass: !!hass, hasPickerRef: !!pickerRef.current, isElementReady: isElementDefinedAndReady });
    }

    return () => {
      if (typeof cleanupFunction === 'function') {
        logger.debug('useEffect[initPicker]', `(${label}) Executing cleanup from initPicker.`);
        cleanupFunction();
      }
    };
  }, [hass, label, isElementDefinedAndReady, onValueChanged]);

  // Effect for handling other prop changes (value, includeDomains, etc.)
  useEffect(() => {
    const applyPropsToPicker = () => { // No longer async
      if (!pickerRef.current || !hass || !isElementDefinedAndReady) {
        logger.warn('useEffect[propUpdates]', `(${label}) Prop-update: Skipping applyProps.`, { hasPickerRef: !!pickerRef.current, hasHass: !!hass, isElementReady: isElementDefinedAndReady });
        return;
      }
      
      const currentPicker = pickerRef.current;
      if (!currentPicker) { // Should not happen
          logger.error('useEffect[propUpdates]', `(${label}) CRITICAL: applyPropsToPicker called but currentPicker is null, despite isElementDefinedAndReady being true.`);
          return;
      }

      logger.debug('useEffect[propUpdates]', `(${label}) Prop-update useEffect: Applying props.`, { value });
      currentPicker.value = value;
      currentPicker.includeDomains = includeDomains;
      currentPicker.disabled = disabled;
      currentPicker.allowCustomEntity = allowCustomEntity;
      // currentPicker.hass = hass; // Already set in initPicker or by its re-run

      logger.debug('useEffect[propUpdates]', `(${label}) Prop-update useEffect: Calling requestUpdate().`);
      currentPicker.requestUpdate(); // Assumes requestUpdate is available
    };

    applyPropsToPicker();
    
  }, [value, includeDomains, disabled, allowCustomEntity, label, hass, isElementDefinedAndReady, onValueChanged]);

  if (!hass) {
    logger.debug('render', `(${label}) HASS not available at render. Rendering null.`);
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
