import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { ButtonConfig, InventreeItem, InventreeCardConfig, CustomButton } from '../../types';
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

// Define a union type for buttons derived from presets or custom config
type ProcessedButton = CustomButton; // For now, assume CustomButton covers all needed fields

const PartButtons: React.FC<PartButtonsProps> = ({ partItem, config, hass }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const getButtonColor = useCallback((type: string, isActive: boolean = false): string => {
    if (type === 'locate' && isActive) {
      return 'orange'; // var(--warning-color)
    }
    switch(type) {
      case 'increment': return 'green'; // var(--success-color)
      case 'decrement': return 'red';   // var(--error-color)
      case 'locate': return 'blue';    // var(--info-color)
      case 'print': return 'purple';  // var(--primary-color)
      default: return 'gray';      // var(--primary-color)
    }
  }, []);

  const getButtonTitle = useCallback((button: ProcessedButton): string => {
    switch (button.type) {
      case 'increment': return `Increase stock by ${button.value}`;
      case 'decrement': return `Decrease stock by ${button.value}`;
      case 'locate': return 'Locate part';
      case 'print': return 'Print label';
      case 'custom': return button.label || 'Custom action';
      default: return '';
    }
  }, []);

  const getDefaultLabel = useCallback((button: ProcessedButton): string => {
    switch(button.type) {
      case 'increment': return `+${button.value || 1}`;
      case 'decrement': return `-${button.value || 1}`;
      case 'locate': return 'Locate';
      case 'print': return 'Print';
      default: return '';
    }
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
    if (!config || !config.buttons) return [];
    const preset = config.buttons.preset || 'default';
    const customButtons = config.buttons.custom_buttons || [];
    let buttons: ProcessedButton[] = [];

    if (preset !== 'custom') {
      let value = 1;
      switch(preset) {
        case 'precise': value = 0.1; break;
        case 'bulk': value = 10; break;
        default: value = 1;
      }
      buttons.push({
        type: 'decrement',
        value: value,
        icon: 'mdi:minus',
        label: `- ${value}`,
      });
      buttons.push({
        type: 'increment',
        value: value,
        icon: 'mdi:plus',
        label: `+ ${value}`,
      });
    }

    if (config.services?.wled?.enabled && config.services?.wled?.entity_id && config.services?.wled?.parameter_name) {
      buttons.push({
        type: 'locate',
        icon: 'mdi:map-marker-radius',
        label: 'Locate',
      });
    }

    if (config.services?.print?.enabled && config.services?.print?.template_id) {
      buttons.push({
        type: 'print',
        icon: 'mdi:printer',
        label: 'Print',
      });
    }

    if (preset === 'custom' || preset === 'full') {
      buttons = [...buttons, ...customButtons];
    }

    logger.log('PartButtons React', `Processed buttons for preset '${preset}'`, buttons);
    return buttons;
  }, [config, logger]);

  const handleClick = useCallback(async (button: ProcessedButton) => {
    if (!partItem) return;
    logger.log('PartButtons React', `Button clicked: ${button.type}`, { button, partId: partItem.pk });
    switch (button.type) {
      case 'increment':
      case 'decrement':
        if (button.value !== undefined) {
          dispatch(adjustPartStock({ partId: partItem.pk, amount: button.value, hass }));
        }
        break;
      case 'locate':
        dispatch(locatePartById(partItem.pk));
        break;
      case 'print':
        logger.warn('PartButtons React', 'Print action not yet implemented.');
        break;
      case 'custom':
        if (!hass || !button.service) {
          logger.warn('PartButtons React', 'Custom button clicked, but HASS or service definition is missing.', { button });
          return;
        }
        try {
          await hass.callService(
            button.service.split('.')[0],
            button.service.split('.')[1],
            { ...button.service_data, part_id: partItem.pk }
          );
        } catch (e: any) {
          const errorMessage = e?.message || String(e);
          logger.error('PartButtons React', `Failed custom service call ${button.service}: ${errorMessage}`);
        }
        break;
    }
  }, [partItem, dispatch, hass, logger]);

  if (!partItem || !getProcessedButtons().length || !config?.display?.show_buttons) {
    return null;
  }
  
  // Basic styles - can be expanded or moved to CSS file
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center', // Or space-around, etc.
    padding: '4px 0',
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '4px 8px',
    margin: '0 2px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '30px', // Ensure icon buttons have some width
    textAlign: 'center',
  };

  return (
    <div style={buttonContainerStyle}>
      {getProcessedButtons().map(button => {
        const isActive = button.type === 'locate' && isLEDActiveForPart();
        const currentButtonColor = button.color || getButtonColor(button.type || 'default', isActive);
        return (
          <button
            key={button.type + (button.label || '') + (button.value || '')}
            style={{
              ...actionButtonStyle,
              color: isActive ? 'white' : 'inherit', // Text color for active button
              backgroundColor: isActive ? currentButtonColor : (button.color ? currentButtonColor : 'transparent'),
            }}
            onClick={() => handleClick(button)}
            title={getButtonTitle(button)}
            className={`action-button ${isActive ? 'active' : ''}`}
          >
            {button.icon ? (
              <MdiIcon path={button.icon} style={{ color: isActive ? 'white' : (button.color ? 'inherit' : currentButtonColor) }} />
            ) : (
              button.label || getDefaultLabel(button)
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PartButtons; 