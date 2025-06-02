import React, { useState, useEffect, useMemo } from 'react';
import { EffectDefinition, ActionDefinition } from '../../types'; // Added ActionDefinition
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { Logger } from '../../utils/logger';
import { useSelector } from 'react-redux'; // Added useSelector
import { RootState } from '../../store'; // Added RootState

const logger = Logger.getInstance();

interface EffectEditorFormProps {
  effect: EffectDefinition;
  onUpdate: (updatedEffect: EffectDefinition) => void;
}

const EffectEditorForm: React.FC<EffectEditorFormProps> = ({
  effect,
  onUpdate,
}) => {
  const [effectType, setEffectType] = useState<EffectDefinition['type']>(effect.type);
  const [isVisible, setIsVisible] = useState<boolean | undefined>(effect.isVisible);
  const [styleProperty, setStyleProperty] = useState<string | undefined>(effect.styleProperty);
  const [styleValue, setStyleValue] = useState<string | undefined>(effect.styleValue);
  const [targetPartPksInput, setTargetPartPksInput] = useState<string>('');
  const [customActionId, setCustomActionId] = useState<string | undefined>(effect.customActionId); // Added state for customActionId

  // Fetch available actions from Redux store
  const allActionDefinitions = useSelector((state: RootState) => state.actions.actionDefinitions);
  const availableActions = useMemo(() => {
    return Object.values(allActionDefinitions || {}); // Handle case where it might be undefined initially
  }, [allActionDefinitions]);

  useEffect(() => {
    setEffectType(effect.type);
    setIsVisible(effect.isVisible);
    setStyleProperty(effect.styleProperty);
    setStyleValue(effect.styleValue);
    setCustomActionId(effect.customActionId); // Set customActionId from prop

    // Initialize targetPartPksInput from effect.targetPartPks
    if (typeof effect.targetPartPks === 'string') {
      setTargetPartPksInput(effect.targetPartPks);
    } else if (Array.isArray(effect.targetPartPks)) {
      setTargetPartPksInput(effect.targetPartPks.join(', '));
    } else {
      setTargetPartPksInput('');
    }
  }, [effect]);

  const parseTargetPks = (input: string): number[] | string | undefined => {
    const trimmedInput = input.trim();
    if (trimmedInput.toLowerCase() === 'all_loaded') {
      return 'all_loaded';
    }
    if (trimmedInput === '') {
      return undefined; // No specific targets
    }
    const pks = trimmedInput.split(',').map(pk => parseInt(pk.trim(), 10)).filter(pk => !isNaN(pk));
    return pks.length > 0 ? pks : undefined; // Return array if valid PKs, else undefined
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as EffectDefinition['type'];
    setEffectType(newType);
    // Reset fields specific to other types when type changes
    let updatedEffectPayload: Partial<EffectDefinition> = { type: newType };
    if (newType !== 'set_visibility') {
      updatedEffectPayload.isVisible = undefined;
    }
    if (newType !== 'set_style') {
      updatedEffectPayload.styleProperty = undefined;
      updatedEffectPayload.styleValue = undefined;
    }
    if (newType !== 'trigger_custom_action') {
      updatedEffectPayload.customActionId = undefined;
    }
    // Preserve existing targetPartPks
    updatedEffectPayload.targetPartPks = parseTargetPks(targetPartPksInput);
    onUpdate({ ...effect, ...updatedEffectPayload as EffectDefinition });
  };

  const handleIsVisibleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVisibility = e.target.checked;
    setIsVisible(newVisibility);
    onUpdate({ ...effect, type: 'set_visibility', isVisible: newVisibility, targetPartPks: parseTargetPks(targetPartPksInput) });
  };

  const handleStylePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProp = e.target.value;
    setStyleProperty(newProp);
    onUpdate({ ...effect, type: 'set_style', styleProperty: newProp, styleValue, targetPartPks: parseTargetPks(targetPartPksInput) });
  };

  const handleStyleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setStyleValue(newValue);
    onUpdate({ ...effect, type: 'set_style', styleProperty, styleValue: newValue, targetPartPks: parseTargetPks(targetPartPksInput) });
  };

  const handleCustomActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActionId = e.target.value;
    setCustomActionId(newActionId);
    onUpdate({ ...effect, type: 'trigger_custom_action', customActionId: newActionId, targetPartPks: parseTargetPks(targetPartPksInput) });
  };

  const handleTargetPartPksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setTargetPartPksInput(newInput);
    // Update the effect with the new targetPartPks
    // We need to decide if we update on every keystroke or on blur/submit for this field.
    // For consistency with other fields, let's update on change.
    onUpdate({ ...effect, targetPartPks: parseTargetPks(newInput) });
  };
  
  // Map EffectDefinition styleProperty to VisualEffect keys
  const stylePropertyOptions: { value: EffectDefinition['styleProperty'], label: string, mapsTo: keyof VisualEffect }[] = [
    { value: 'highlight', label: 'Highlight Color', mapsTo: 'highlight' },
    { value: 'textColor', label: 'Text Color', mapsTo: 'textColor' },
    { value: 'border', label: 'Border Style', mapsTo: 'border' },
    { value: 'icon', label: 'Icon (MDI)', mapsTo: 'icon' },
    { value: 'badge', label: 'Badge Text', mapsTo: 'badge' },
    { value: 'opacity', label: 'Opacity (0-1)', mapsTo: 'opacity' },
    { value: 'priority', label: 'Layout Priority', mapsTo: 'priority' },
    // Add more mappings as VisualEffect evolves, e.g., for customClasses if it becomes a direct string
  ];

  return (
    <div className="effect-editor-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label htmlFor={`effect-type-${effect.id}`} style={{ marginRight: '5px' }}>Effect Type:</label>
        <select id={`effect-type-${effect.id}`} value={effectType} onChange={handleTypeChange}>
          <option value="set_visibility">Set Visibility</option>
          <option value="set_style">Set Style</option>
          <option value="trigger_custom_action">Trigger Custom Action</option>
        </select>
      </div>

      {effectType === 'set_visibility' && (
        <div>
          <label htmlFor={`effect-visible-${effect.id}`} style={{ marginRight: '5px' }}>Is Visible:</label>
          <input 
            type="checkbox" 
            id={`effect-visible-${effect.id}`}
            checked={isVisible === true} 
            onChange={handleIsVisibleChange} 
          />
        </div>
      )}

      {effectType === 'set_style' && (
        <>
          <div>
            <label htmlFor={`effect-style-prop-${effect.id}`} style={{ marginRight: '5px' }}>Style Property:</label>
            <select 
              id={`effect-style-prop-${effect.id}`} 
              value={styleProperty || ''} 
              onChange={handleStylePropertyChange}
            >
              <option value="" disabled>Select property...</option>
              {stylePropertyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`effect-style-value-${effect.id}`} style={{ marginRight: '5px' }}>Value:</label>
            <input 
              type="text" 
              id={`effect-style-value-${effect.id}`}
              value={styleValue || ''} 
              onChange={handleStyleValueChange} 
              placeholder={styleProperty === 'highlight' || styleProperty === 'textColor' ? 'e.g., red, #FF0000, rgba(0,0,255,0.5)' : (styleProperty === 'border' ? 'e.g., 2px dashed green' : 'Enter value')}
            />
          </div>
        </>
      )}

      {effectType === 'trigger_custom_action' && (
        <div>
          <label htmlFor={`effect-action-id-${effect.id}`} style={{ marginRight: '5px' }}>Action to Trigger:</label>
          <select 
            id={`effect-action-id-${effect.id}`} 
            value={customActionId || ''} 
            onChange={handleCustomActionChange}
          >
            <option value="" disabled>Select an action...</option>
            {availableActions.map(actDef => (
              <option key={actDef.id} value={actDef.id}>
                {actDef.name} (ID: {actDef.id})
              </option>
            ))}
            {availableActions.length === 0 && <option value="" disabled>No actions defined</option>}
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`effect-target-pks-${effect.id}`} style={{ marginRight: '5px' }}>
            Target Part PKs (optional):
        </label>
        <input 
            type="text" 
            id={`effect-target-pks-${effect.id}`}
            value={targetPartPksInput}
            onChange={handleTargetPartPksChange}
            placeholder="e.g., 1, 2, 3 or all_loaded"
            style={{width: '200px'}}
        />
        <small style={{marginLeft: '5px', display: 'block', color: 'gray'}}>
            Leave blank to target parts based on rule context. 
            Enter comma-separated part PKs or 'all_loaded'.
        </small>
      </div>

    </div>
  );
};

export default EffectEditorForm; 