import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InteractionsConfig, InventreeItem, InventreeCardConfig, CustomAction } from '../../types';
import { RootState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { adjustPartStock, locatePartById } from '../../store/slices/partsSlice';
import { Logger } from '../../utils/logger';

interface PartButtonsProps {
  partItem?: InventreeItem;
  config?: InventreeCardConfig;
  hass?: HomeAssistant;
}

// Placeholder for MDI Icons - in a real app, you'd use an icon library
const MdiIcon: React.FC<{ path: string; style?: React.CSSProperties }> = ({ path, style }) => (
  <span style={{ ...style, fontFamily: 'monospace' }}>(Icon: {path})</span>
);

// Updated ProcessedButton type alias
type ProcessedButton = CustomAction;

const PartButtons: React.FC<PartButtonsProps> = ({ partItem, config, hass }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const getButtonColor = useCallback((buttonType: CustomAction['type'] | 'increment' | 'decrement' | 'locate' | 'print', isActive: boolean = false): string => {
    if (buttonType === 'locate' && isActive) {
      return 'orange'; // var(--warning-color)
    }
    // This switch might need to be adapted based on how CustomAction types are handled
    // For now, keeping some existing logic for color determination
    switch(buttonType) {
      case 'increment': return 'green'; // var(--success-color)
      case 'decrement': return 'red';   // var(--error-color)
      case 'locate': return 'blue';    // var(--info-color)
      case 'print': return 'purple';  // var(--primary-color)
      // For 'ha-service', 'navigate', 'internal-function', we might need specific logic or rely on button.color
      default: return buttonType === 'ha-service' ? 'teal' : 'gray'; // Example for ha-service
    }
  }, []);

  const getButtonTitle = useCallback((button: ProcessedButton): string => {
    if (button.label) return button.label;

    // Fallback for internal functions if no explicit label
    if (button.type === 'internal-function') {
      switch (button.function_name) {
        case 'adjustStock':
          const amount = button.function_args?.amount;
          return amount && Number(amount) > 0 ? `Increase stock by ${amount}` : `Decrease stock by ${Math.abs(Number(amount))}`;
        case 'locatePart': return 'Locate part';
        case 'printLabel': return 'Print label';
        default: return button.function_name || 'Internal Action';
      }
    }
    return button.type; // Default to the action type if no label and not specific internal function
  }, []);

  const getDefaultLabel = useCallback((button: ProcessedButton): string => {
    if (button.label) return button.label;

    if (button.type === 'internal-function') {
      switch (button.function_name) {
        case 'adjustStock':
          const amount = button.function_args?.amount;
          return amount && Number(amount) > 0 ? `+${amount}` : `-${Math.abs(Number(amount))}`;
        case 'locatePart': return 'Locate';
        case 'printLabel': return 'Print';
        default: return button.icon ? '' : (button.function_name || 'Func');
      }
    }
    return button.icon ? '' : button.type;
  }, []);

  const isLEDActiveForPart = useCallback((): boolean => {
    if (!hass || !config || !config.services?.wled?.entity_id || !partItem) return false;
    const wledEntity = hass.states[config.services.wled.entity_id];
    if (!wledEntity || wledEntity.state !== 'on') return false;

    const positionParam = partItem.parameters?.find(
      p => p.template_detail?.name === config.services?.wled?.parameter_name
    )?.data;
    if (!positionParam) return false;

    const activeSegment = wledEntity.attributes?.seg?.[0];
    if (!activeSegment) return false;

    const partPosition = parseInt(positionParam, 10);
    return activeSegment.start + 1 === partPosition; // WLED is 0-indexed
  }, [hass, config, partItem]);

  const getProcessedButtons = useCallback((): ProcessedButton[] => {
    // Read from config.interactions.buttons
    if (!config || !config.interactions || !config.interactions.buttons) {
      logger.log('PartButtons React', 'No interactions or buttons defined in config.');
      return [];
    }
    
    // The buttons are already CustomActions, so direct pass-through
    const processed: ProcessedButton[] = config.interactions.buttons;
    logger.log('PartButtons React', `Processed ${processed.length} buttons from config.interactions.buttons`, processed);
    return processed;

  }, [config, logger]);

  const handleClick = useCallback(async (button: ProcessedButton) => {
    if (!partItem) {
      logger.warn('PartButtons React', 'Button clicked, but no partItem is selected.');
      return;
    }
    if (!hass && (button.type === 'ha-service' || (button.type === 'internal-function' && ['adjustStock', 'printLabel'].includes(button.function_name || '')))) {
      logger.warn('PartButtons React', 'Button clicked, but HASS object is not available for HASS-dependent action.');
      return;
    }

    logger.log('PartButtons React', `Button clicked: ${button.label} (Type: ${button.type}, Func: ${button.function_name})`, { buttonAction: button, partId: partItem.pk });

    // Confirmation dialog
    if (button.confirmation) {
      const confirmMessage = button.confirmation_text || `Are you sure you want to perform action: ${button.label || button.function_name || button.type}?`;
      if (!window.confirm(confirmMessage)) {
        logger.log('PartButtons React', 'Action cancelled by user.');
        return;
      }
    }

    switch (button.type) {
      case 'ha-service':
        if (!button.service || !hass) {
          logger.warn('PartButtons React', 'HA Service action: service definition or HASS missing.', { button });
          return;
        }
        try {
          const [domain, serviceName] = button.service.split('.');
          if (!domain || !serviceName) {
            logger.error('PartButtons React', `Invalid service format: ${button.service}. Expected 'domain.service_name'.`);
            return;
          }
          
          // Prepare service data, injecting part_id if not explicitly excluded or overridden
          let serviceData = { ...(button.service_data || {}) };
          if (!('part_id' in serviceData) && !('entity_id' in serviceData && button.target_entity_id)) { 
            // Avoid adding part_id if target_entity_id is already specified and service_data contains entity_id
            // This is a common pattern where service_data might target specific entities
            serviceData.part_id = partItem.pk; // Add partId by default
          }
          if (button.target_entity_id && !serviceData.entity_id) {
            serviceData.entity_id = button.target_entity_id;
          }


          logger.log('PartButtons React', `Calling HA service: ${domain}.${serviceName}`, { serviceData });
          await hass.callService(domain, serviceName, serviceData);
          logger.log('PartButtons React', `HA service call ${button.service} successful.`);

        } catch (e: any) {
          const errorMessage = e?.message || String(e);
          logger.error('PartButtons React', `Failed HA service call ${button.service}: ${errorMessage}`, { error: e });
          // Optionally, display an error to the user via HASS fire-event or UI notification
        }
        break;

      case 'navigate':
        if (button.navigation_path) {
          logger.log('PartButtons React', `Navigating to: ${button.navigation_path}`);
          window.history.pushState(null, '', button.navigation_path);
          // For Home Assistant, a more robust navigation might be:
          // fireEvent(window, 'hacom-navigate', { path: button.navigation_path });
        } else {
          logger.warn('PartButtons React', 'Navigate action clicked, but navigation_path is missing.', { button });
        }
        break;

      case 'internal-function':
        logger.log('PartButtons React', `Internal function: ${button.function_name}`, { args: button.function_args });
        switch (button.function_name) {
          case 'adjustStock':
            const amount = Number(button.function_args?.amount);
            if (!isNaN(amount) && partItem.pk && hass) {
              dispatch(adjustPartStock({ partId: partItem.pk, amount, hass }));
            } else {
              logger.warn('PartButtons React', 'Invalid args or HASS missing for adjustStock.', { args: button.function_args, partId: partItem.pk, hasHass: !!hass });
            }
            break;
          case 'locatePart':
            if (partItem.pk) {
              dispatch(locatePartById(partItem.pk));
            } else {
              logger.warn('PartButtons React', 'Missing partId for locatePart.', { partId: partItem.pk });
            }
            break;
          case 'printLabel':
            logger.warn('PartButtons React', 'Internal function "printLabel" triggered.');
            // Example: if (partItem.pk && config?.services?.print && hass) { dispatch(somePrintThunk(...)) }
            break;
          default:
            logger.warn('PartButtons React', `Unknown internal function name: ${button.function_name}`);
        }
        break;

      default:
        // This case should ideally not be reached if button.type is strictly one of the CustomAction types
        logger.warn('PartButtons React', `Unknown button action type: ${(button as any).type}`, { button });
        break;
    }
  }, [partItem, dispatch, hass, config, logger]); // Added config and logger

  if (!partItem || !getProcessedButtons().length || !config?.display?.show_buttons) {
    return null;
  }
  
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '4px 8px',
    margin: '0 2px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '30px', 
    textAlign: 'center',
  };

  return (
    <div style={buttonContainerStyle}>
      {getProcessedButtons().map((button, index) => {
        // Determine isActive based on more generic conditions if needed, or specific internal functions
        const isActive = button.type === 'internal-function' && button.function_name === 'locatePart' && isLEDActiveForPart();
        
        // Prioritize button.color from config, then fallback to dynamic color based on type
        let buttonVisualType: CustomAction['type'] | 'increment' | 'decrement' | 'locate' | 'print' = button.type;
        if (button.type === 'internal-function') {
          if (button.function_name === 'adjustStock') {
            buttonVisualType = Number(button.function_args?.amount) > 0 ? 'increment' : 'decrement';
          } else if (button.function_name === 'locatePart') {
            buttonVisualType = 'locate';
          } else if (button.function_name === 'printLabel') {
            buttonVisualType = 'print';
          }
        }
        const currentButtonColor = button.color || getButtonColor(buttonVisualType, isActive);

        // Use button.label directly. Fallback to icon or empty.
        const displayLabel = getDefaultLabel(button);
        const titleText = getButtonTitle(button);

        return (
          <button
            key={button.id || `action-button-${index}`} // Use button.id if available
            style={{
              ...actionButtonStyle,
              backgroundColor: isActive ? currentButtonColor : 'transparent', // Active button background
              color: isActive ? 'white' : currentButtonColor, // Text/icon color
              borderColor: currentButtonColor, // Border color matches text/icon
            }}
            title={titleText}
            onClick={() => handleClick(button)}
            disabled={!hass && (button.type === 'ha-service' || (button.type === 'internal-function' && ['adjustStock', 'printLabel'].includes(button.function_name || '')))} // Disable if HASS needed and not available
          >
            {button.icon && <MdiIcon path={button.icon} style={{ marginRight: displayLabel ? '4px' : '0' }} />}
            {displayLabel}
          </button>
        );
      })}
    </div>
  );
};

export default PartButtons; 