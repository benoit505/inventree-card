import React, { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ActionDefinition, ActionExecutionContext } from '../../types';
import { RootState } from '../../store';
import { Logger } from '../../utils/logger';
import { actionEngine } from '../../services/ActionEngine';

interface GlobalActionButtonsProps {
  config?: InventreeCardConfig;
  hass?: HomeAssistant;
  cardInstanceId?: string;
}

const GlobalActionButtons: React.FC<GlobalActionButtonsProps> = ({ config, hass, cardInstanceId }) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const genericHaStates = useSelector((state: RootState) => state.genericHaStates);

  // Button labels for global actions generally won't have part-specific templates.
  // If a global context (like a specific HA entity state) is needed, templating would access it via %%context.hassStates['entity.id'].state%%
  const processButtonLabelTemplate = useCallback((template: string): string => {
    // Basic global context can be added here if needed in future
    // For now, global buttons usually have static labels or labels based on hassStates.
    // The ActionEngine's processTemplate will handle hassStates.
    return template; 
  }, []);

  const getGlobalUiActionButtons = useCallback((): ActionDefinition[] => {
    if (!config || !config.actions || !Array.isArray(config.actions)) {
      logger.log('GlobalActionButtons', 'No actions defined in config.');
      return [];
    }
    
    const globalButtons = config.actions.filter(action => {
      if (action.trigger.type !== 'ui_button') return false;
      if (action.trigger.ui?.placement !== 'global_header') return false;
      // If targetPartPks is set (and not an empty array), this button is too specific for global placement.
      if (action.trigger.ui?.targetPartPks) {
        if (Array.isArray(action.trigger.ui.targetPartPks) && action.trigger.ui.targetPartPks.length > 0) {
          logger.log('GlobalActionButtons', `Filtering out global button '${action.name}' because targetPartPks is specified.`, { actionId: action.id });
          return false;
        }
        // Potentially handle non-empty string targetPartPks if they have a global meaning, for now, filter out if present and not an empty array.
        if (typeof action.trigger.ui.targetPartPks === 'string' && action.trigger.ui.targetPartPks.trim() !== '') {
            logger.log('GlobalActionButtons', `Filtering out global button '${action.name}' because string targetPartPks '${action.trigger.ui.targetPartPks}' is specified.`, { actionId: action.id });
            return false;
        }
      }
      return true;
    });
    logger.log('GlobalActionButtons', `Found ${globalButtons.length} UI Action Buttons for global_header`, { data: globalButtons });
    return globalButtons;
  }, [config, logger]);

  const handleClick = useCallback(async (action: ActionDefinition) => {
    if (!hass) {
      logger.warn('GlobalActionButtons', 'Button clicked, but HASS object is not available.');
      return;
    }

    logger.log('GlobalActionButtons', `Executing Global Action ID: ${action.id} (Name: ${action.name})`);

    const context: ActionExecutionContext & { hass?: HomeAssistant } = {
      hass: hass,
      hassStates: genericHaStates,
    };

    try {
      await actionEngine.executeAction(action.id, context);
      logger.log('GlobalActionButtons', `Global action ${action.name} dispatched to ActionEngine.`);
    } catch (e: any) {
      logger.error('GlobalActionButtons', `Error dispatching global action ${action.name}: ${e?.message || String(e)}`, { error: e });
    }
  }, [hass, logger, genericHaStates]);

  const displayedButtons = useMemo(() => getGlobalUiActionButtons(), [getGlobalUiActionButtons]);

  if (displayedButtons.length === 0 || !config?.display?.show_buttons) { // Assuming global buttons also respect this flag
    return null;
  }
  
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to start for header typically
    padding: '8px 0', // Add some vertical padding
    flexWrap: 'wrap',
    marginBottom: '16px', // Space below the global buttons
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
    <div style={buttonContainerStyle} className="global-action-buttons-container">
      {displayedButtons.map((action, index) => {
        // For global buttons, labelTemplate would typically be static or rely on hassStates.
        // The ActionEngine will handle %%context.hassStates.*%% templating if used in confirmation messages or future dynamic label processing within the engine.
        // For direct rendering, we use the template as is, or the action name.
        let buttonLabel = ''; // Default to empty string
        if (action.trigger.ui?.labelTemplate && action.trigger.ui.labelTemplate.trim() !== '') {
          buttonLabel = processButtonLabelTemplate(action.trigger.ui.labelTemplate);
        }
        
        const buttonIcon = action.trigger.ui?.icon;

        // If there's no icon and no label, skip rendering this button as it would be invisible/confusing.
        if (!buttonIcon && !buttonLabel) {
          logger.log('GlobalActionButtons', `Skipping rendering button for action '${action.name}' as it has no icon and no label.`, {actionId: action.id});
          return null;
        }

        // Determine if the button should be disabled
        const isDisabled = !!(action.isEnabledExpressionId && action.isEnabledExpressionId.trim() !== '');

        const currentButtonStyle = {
          ...actionButtonStyle,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
        };

        return (
          <button
            key={action.id || `global-action-${index}`}
            onClick={(e) => { 
              e.stopPropagation();
              if (!isDisabled) {
                handleClick(action); 
              }
            }}
            style={currentButtonStyle}
            title={isDisabled ? `${action.name} (Condition not met)` : action.name}
            disabled={isDisabled}
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

export default GlobalActionButtons; 