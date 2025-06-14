import React, { useState, useEffect, useMemo } from 'react';
import { EffectDefinition, ActionDefinition, DisplayConfigKey, AnimationPreset } from '../../types'; // Added AnimationPreset
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { Logger } from '../../utils/logger';
import { useSelector } from 'react-redux'; // Added useSelector
import { RootState } from '../../store'; // Added RootState
import { ANIMATION_PRESETS } from '../../core/constants'; // Import the presets

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
  const [targetDisplayKey, setTargetDisplayKey] = useState<DisplayConfigKey | undefined>(effect.targetDisplayKey);

  // NEW: State for animation preset
  const [animationPreset, setAnimationPreset] = useState<string>(effect.preset || 'none');

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
    setTargetDisplayKey(effect.targetDisplayKey); // Set targetDisplayKey from prop

    // NEW: Initialize animation preset state
    setAnimationPreset(effect.preset || 'none');

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
      updatedEffectPayload.targetDisplayKey = undefined; // Reset targetDisplayKey if not set_visibility
    }
    if (newType !== 'set_style') {
      updatedEffectPayload.styleProperty = undefined;
      updatedEffectPayload.styleValue = undefined;
    }
    if (newType !== 'trigger_custom_action') {
      updatedEffectPayload.customActionId = undefined;
    }
    if (newType !== 'animate_style') {
      updatedEffectPayload.animation = undefined;
      updatedEffectPayload.preset = undefined; // Clear preset if not animate_style
    }
    // Preserve existing targetPartPks
    updatedEffectPayload.targetPartPks = parseTargetPks(targetPartPksInput);
    onUpdate({ ...effect, ...updatedEffectPayload as EffectDefinition });
  };

  const handleIsVisibleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVisibility = e.target.checked;
    setIsVisible(newVisibility);
    onUpdate({ ...effect, type: 'set_visibility', isVisible: newVisibility, targetDisplayKey, targetPartPks: parseTargetPks(targetPartPksInput) });
  };

  const handleTargetDisplayKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value; // selectedValue is a string
    let finalKey: DisplayConfigKey | undefined;

    if (selectedValue === "") {
      finalKey = undefined;
    } else {
      finalKey = selectedValue as DisplayConfigKey; // Now, selectedValue is one of the valid DisplayConfigKey strings
    }

    setTargetDisplayKey(finalKey);
    // Ensure you pass the updated finalKey to onUpdate
    onUpdate({ ...effect, type: 'set_visibility', targetDisplayKey: finalKey, isVisible, targetPartPks: parseTargetPks(targetPartPksInput) });
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
    // It's better to update on blur or with a save button for free-text fields
    // to avoid excessive updates. For now, let's keep it on change for consistency
    // but this is a candidate for optimization.
    onUpdate({ ...effect, targetPartPks: parseTargetPks(newInput) });
  };
  
  const handleAnimationPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPreset = e.target.value;
    setAnimationPreset(newPreset);
    onUpdate({ 
      ...effect, 
      type: 'animate_style', 
      preset: newPreset, 
      // Clear the old raw 'animation' property to avoid conflicts
      animation: undefined, 
      targetPartPks: parseTargetPks(targetPartPksInput) 
    });
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

  const displayConfigKeyOptions: Array<{ value: DisplayConfigKey; label: string }> = [
    { value: 'show_header', label: 'Show Header' },
    { value: 'show_image', label: 'Show Image' },
    { value: 'show_name', label: 'Show Name' },
    { value: 'show_stock', label: 'Show Stock' },
    { value: 'show_description', label: 'Show Description' },
    { value: 'show_category', label: 'Show Category' },
    { value: 'show_ipn', label: 'Show IPN' },
    { value: 'show_location', label: 'Show Location' },
    { value: 'show_supplier', label: 'Show Supplier' },
    { value: 'show_manufacturer', label: 'Show Manufacturer' },
    { value: 'show_notes', label: 'Show Notes' },
    { value: 'show_buttons', label: 'Show Buttons Area' },
    { value: 'show_parameters', label: 'Show Parameters Section' },
    { value: 'show_stock_status_border', label: 'Show Stock Status Border' },
    { value: 'show_stock_status_colors', label: 'Show Stock Status Colors' },
    { value: 'show_related_parts', label: 'Show Related Parts' },
    { value: 'show_part_details_component', label: 'Show Part Details Component' },
    { value: 'show_stock_status_border_for_templates', label: 'Show Stock Border (Templates)' },
    { value: 'show_buttons_for_variants', label: 'Show Buttons (Variants)' },
    { value: 'show_part_details_component_for_variants', label: 'Show Part Details (Variants)' },
    { value: 'show_image_for_variants', label: 'Show Image (Variants)' },
    { value: 'show_stock_for_variants', label: 'Show Stock (Variants)' },
    { value: 'show_name_for_variants', label: 'Show Name (Variants)' },
  ];

  return (
    <div className="effect-editor-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label htmlFor={`effect-type-${effect.id}`} style={{ marginRight: '5px' }}>Effect Type:</label>
        <select id={`effect-type-${effect.id}`} value={effectType} onChange={handleTypeChange}>
          <option value="set_visibility">Set Visibility</option>
          <option value="set_style">Set Style</option>
          <option value="animate_style">Animate Style</option>
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
          <div style={{ marginTop: '5px' }}>
            <label htmlFor={`effect-target-display-key-${effect.id}`} style={{ marginRight: '5px' }}>Target Element:</label>
            <select
              id={`effect-target-display-key-${effect.id}`}
              value={targetDisplayKey || ''}
              onChange={handleTargetDisplayKeyChange}
            >
              <option value="">Default (Whole Item)</option>
              {displayConfigKeyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.8em', color: 'gray', margin: '2px 0 0 0' }}>
              Select a specific card element to show/hide. Default targets the whole item.
            </p>
          </div>
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

      {effectType === 'animate_style' && (
        <div>
          <label htmlFor={`effect-animation-preset-${effect.id}`} style={{ marginRight: '5px' }}>Animation Preset:</label>
          <select id={`effect-animation-preset-${effect.id}`} value={animationPreset} onChange={handleAnimationPresetChange}>
            <option value="none">None</option>
            {Object.keys(ANIMATION_PRESETS).map(presetKey => (
              <option key={presetKey} value={presetKey}>
                {ANIMATION_PRESETS[presetKey as keyof typeof ANIMATION_PRESETS].name}
              </option>
            ))}
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