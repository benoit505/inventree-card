import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeItem, InventreeCardConfig, ActionDefinition, ActionExecutionContext } from '../../types';
import { RootState } from '../../store';
import { Logger } from '../../utils/logger';
import { actionEngine } from '../../services/ActionEngine';

interface PartButtonsProps {
  partItem?: InventreeItem;
  config?: InventreeCardConfig;
  hass?: HomeAssistant;
}

const PartButtons: React.FC<PartButtonsProps> = ({ partItem, config, hass }) => {
  const logger = useMemo(() => Logger.getInstance(), []);

  const processButtonLabelTemplate = useCallback((template: string, item?: InventreeItem): string => {
    if (!item) return template;
    return template
      .replace(/%%part\.pk%%/g, String(item.pk))
      .replace(/%%part\.name%%/g, item.name || '');
  }, []);

  const getUiActionButtons = useCallback((): ActionDefinition[] => {
    if (!config || !config.actions || !Array.isArray(config.actions)) {
      logger.log('PartButtons React', 'No actions defined in config.');
      return [];
    }
    
    const uiButtons = config.actions.filter(action => 
      action.trigger.type === 'ui_button' && 
      (action.trigger.ui?.placement === 'part_footer' || !action.trigger.ui?.placement)
    );
    logger.log('PartButtons React', `Found ${uiButtons.length} UI Action Buttons for part_footer`, { data: uiButtons });
    return uiButtons;
  }, [config, logger]);

  const handleClick = useCallback(async (action: ActionDefinition) => {
    if (!partItem) {
      logger.warn('PartButtons React', 'Button clicked, but no partItem is selected.');
      return;
    }
    if (!hass) {
      logger.warn('PartButtons React', 'Button clicked, but HASS object is not available.');
      return;
    }

    logger.log('PartButtons React', `Executing Action ID: ${action.id} (Name: ${action.name}) for part ${partItem.pk}`);

    const context: ActionExecutionContext & { hass?: HomeAssistant } = {
      part: partItem,
      hass: hass,
    };

    try {
      await actionEngine.executeAction(action.id, context);
      logger.log('PartButtons React', `Action ${action.name} dispatched to ActionEngine.`);
    } catch (e: any) {
      logger.error('PartButtons React', `Error dispatching action ${action.name} to ActionEngine: ${e?.message || String(e)}`, { error: e });
    }
  }, [partItem, hass, logger]);

  const displayedButtons = useMemo(() => getUiActionButtons(), [getUiActionButtons]);

  if (!partItem || displayedButtons.length === 0 || !config?.display?.show_buttons) {
    return null;
  }
  
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
    flexWrap: 'wrap',
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '6px 10px',
    margin: '2px',
    border: '1px solid var(--divider-color, #ccc)',
    borderRadius: 'var(--ha-card-border-radius, 4px)',
    cursor: 'pointer',
    minWidth: '30px', 
    textAlign: 'center',
    fontSize: '0.9em',
    backgroundColor: 'var(--primary-background-color)',
    color: 'var(--primary-text-color)',
  };

  return (
    <div style={buttonContainerStyle}>
      {displayedButtons.map((action, index) => {
        let buttonLabel = ''; // Default to empty string
        if (action.trigger.ui?.labelTemplate && action.trigger.ui.labelTemplate.trim() !== '') {
          buttonLabel = processButtonLabelTemplate(action.trigger.ui.labelTemplate, partItem);
        }
        
        const buttonIcon = action.trigger.ui?.icon;

        // Determine if the button should be disabled
        const isDisabled = !!(action.isEnabledExpressionId && action.isEnabledExpressionId.trim() !== '');

        const currentButtonStyle = {
          ...actionButtonStyle,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
        };

        return (
          <button
            key={action.id || `action-${index}`}
            onClick={(e) => { 
              e.stopPropagation();
              if (!isDisabled) { // Only handle click if not disabled
                handleClick(action); 
              }
            }}
            style={currentButtonStyle} // Use the potentially modified style
            title={isDisabled ? `${action.name} (Condition not met)` : action.name}
            disabled={isDisabled} // Add disabled attribute
          >
            {buttonIcon && (
              <ha-icon icon={buttonIcon} style={{ marginRight: buttonLabel ? '4px' : '0' }}></ha-icon>
            )}
            {buttonLabel}
          </button>
        );
      })}
    </div>
  );
};

export default PartButtons; 