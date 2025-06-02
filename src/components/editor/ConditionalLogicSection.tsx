import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { QueryBuilder, Field, RuleGroupType as RQBRuleGroupType, formatQuery, ValueEditorProps, RuleProps, RuleGroupProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { 
    DataSourceConfig, 
    DirectApiConfig, 
    ParameterDetail, 
    ConditionalLogicConfig, // Imported from types.d.ts
    ConditionalLogicItem,   // Imported from types.d.ts
    EffectDefinition,       // Imported for future use
    RuleGroupType,         // Our internal, stricter RuleGroupType
    RuleType             // Our internal RuleType
} from '../../types';
import { Logger } from '../../utils/logger';
import { HomeAssistant } from 'custom-card-helpers';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import EffectsConfiguration from './EffectsConfiguration'; // ADDED IMPORT

const logger = Logger.getInstance();

interface ConditionalLogicSectionProps {
  conditionalLogicConfig?: ConditionalLogicConfig; // This is now { definedLogics: ConditionalLogicItem[] }
  onConfigChanged: (newConfig: ConditionalLogicConfig) => void;
  configuredDataSources?: DataSourceConfig;
  hass?: HomeAssistant;
  directApiConfig?: DirectApiConfig;
  allParameterValues?: Record<number, Record<string, ParameterDetail>>;
}

const getParameterInputType = (paramDetail?: ParameterDetail): 'text' | 'number' | 'boolean' => {
  if (!paramDetail || !paramDetail.template_detail) return 'text';
  if (paramDetail.template_detail.checkbox) return 'boolean';
  if (paramDetail.template_detail.units || typeof paramDetail.data_numeric === 'number') return 'number';
  return 'text';
};

const generateFieldsFromDataSources = (
  dataSources?: DataSourceConfig, 
  hass?: HomeAssistant,
  directApiConfig?: DirectApiConfig,
  allParameterValues?: Record<number, Record<string, ParameterDetail>>
): Field[] => {
  const fields: Field[] = [];
  if (!dataSources) return [
    { name: 'default_field', label: 'Default Field (No Data Sources)' }
  ];

  (dataSources.inventree_hass_sensors || []).forEach((entityId: string) => {
    const entity = hass?.states[entityId];
    const entityName = entity?.attributes.friendly_name || entityId;
    fields.push({ name: `inv_sensor_state_${entityId}`, label: `InvSensor: ${entityName} State` });
  });

  (dataSources.ha_entities || []).forEach((entityId: string) => {
    const entity = hass?.states[entityId];
    const entityName = entity?.attributes.friendly_name || entityId;
    fields.push({ name: `ha_entity_state_${entityId}`, label: `HA: ${entityName} State`});
    if (entity?.attributes.temperature) {
        fields.push({ name: `ha_entity_attr_${entityId}_temperature`, label: `HA: ${entityName} Temperature`, inputType: 'number'});
    }
  });

  (dataSources.inventree_pks || []).forEach((pk: number) => {
    if (isNaN(pk)) return;
    fields.push({ name: `part_${pk}_name`, label: `Part ${pk}: Name`, inputType: 'text' });
    fields.push({ name: `part_${pk}_IPN`, label: `Part ${pk}: IPN`, inputType: 'text' });
    fields.push({ name: `part_${pk}_description`, label: `Part ${pk}: Description`, inputType: 'text' });
    fields.push({ name: `part_${pk}_category_name`, label: `Part ${pk}: Category`, inputType: 'text' });
    fields.push({ name: `part_${pk}_stock`, label: `Part ${pk}: Stock`, inputType: 'number' });
    fields.push({ name: `part_${pk}_is_template`, label: `Part ${pk}: Is Template`, inputType: 'boolean' });
    fields.push({ name: `part_${pk}_assembly`, label: `Part ${pk}: Is Assembly`, inputType: 'boolean' });
    fields.push({ name: `part_${pk}_virtual`, label: `Part ${pk}: Is Virtual`, inputType: 'boolean' });
  });

  // Process NEW inventree_parameters_to_fetch
  if (dataSources.inventree_parameters_to_fetch) {
    dataSources.inventree_parameters_to_fetch.forEach(fetchConfig => {
      const targetIds = fetchConfig.targetPartIds;
      const paramNames = fetchConfig.parameterNames;

      if (targetIds === 'all_loaded') {
        // For 'all_loaded', we might not know specific PKs at editor time easily.
        // Option 1: Generate generic parameter fields if parameterNames is not '*'
        // Option 2: Or, require users to specify PKs if they want them in the dropdown for 'all_loaded'.
        // For now, let's handle specific parameter names if provided for 'all_loaded'.
        if (paramNames !== '*' && Array.isArray(paramNames)) {
          paramNames.forEach(paramName => {
            // We don't have a specific PK, so this field will apply to any part
            // that has this parameter when the condition is evaluated.
            // The inputType might be hard to determine without a specific part's parameter detail.
            fields.push({
              name: `inv_param_any_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`, // Ensure valid name
              label: `InvParam (Any Part): ${paramName}`,
              // inputType: 'text', // Default or try to infer later if possible
            });
          });
        }
      } else if (Array.isArray(targetIds)) {
        targetIds.forEach(pk => {
          if (typeof pk === 'number' && !isNaN(pk)) {
            if (paramNames === '*') {
              // If all parameters for a PK are fetched, we can't list them all without knowing them.
              // One option is to show a generic "Any Parameter for Part PK" or fetch known params for this PK.
              // For now, this case is complex for field generation.
              // We could list known parameters if 'allParameterValues' has entries for this pk.
              if (allParameterValues && allParameterValues[pk]) {
                Object.keys(allParameterValues[pk]).forEach(paramName => {
                  const paramDetail = allParameterValues[pk][paramName];
                  fields.push({
                    name: `inv_param_${pk}_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
                    label: `InvParam: ${paramName} (Part ${pk})`,
                    inputType: getParameterInputType(paramDetail)
                  });
                });
              }
            } else if (Array.isArray(paramNames)) {
              paramNames.forEach(paramName => {
                let inputType: 'text' | 'number' | 'boolean' = 'text';
                if (directApiConfig?.enabled && allParameterValues && allParameterValues[pk] && allParameterValues[pk][paramName]) {
                  inputType = getParameterInputType(allParameterValues[pk][paramName]);
                }
                fields.push({
                  name: `inv_param_${pk}_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
                  label: `InvParam: ${paramName} (Part ${pk})`,
                  inputType: inputType
                });
              });
            }
          }
        });
      }
    });
  }

  // Legacy inventree_parameters (OLD format)
  (dataSources.inventree_parameters || []).forEach((paramString: string) => {
    const parts = paramString.split(':');
    if (parts.length === 3 && parts[0] === 'part') {
      const pkStr = parts[1];
      const paramName = parts[2];
      const pk = parseInt(pkStr, 10);
      if (!isNaN(pk)) {
        let inputType: 'text' | 'number' | 'boolean' = 'text';
        if (directApiConfig?.enabled && allParameterValues && allParameterValues[pk] && allParameterValues[pk][paramName]) {
          inputType = getParameterInputType(allParameterValues[pk][paramName]);
        }
        fields.push({ 
          name: `inv_param_${pk}_${paramName}`,
          label: `InvParam: ${paramName} (Part ${pk})`,
          inputType: inputType
        });
      } else {
        fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`, label: `InvParam: ${paramString} (Invalid PK)` });
      }
    } else {
      fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`, label: `InvParam: ${paramString} (Malformed)` });
    }
  });
  
  if (fields.length === 0) {
    fields.push(
        { name: 'generic_part_name', label: 'Part Name (Any)' },
        { name: 'generic_stock_level', label: 'Stock Level (Any)', inputType: 'number' }
    );
  }
  logger.log("ConditionalLogicSection", "Generated fields for QueryBuilder", { count: fields.length });
  return fields;
};

// This is our internal RuleGroupType for initialization
const initialInternalRuleGroup: RuleGroupType = {
  id: uuidv4(),
  combinator: 'and',
  rules: [], 
  not: false,
};

// Function to transform RQBRuleGroupType to our internal RuleGroupType
const transformToInternalRuleGroup = (rqbGroup: RQBRuleGroupType): RuleGroupType => {
  return {
    id: rqbGroup.id || uuidv4(),
    combinator: (rqbGroup.combinator as 'and' | 'or') || 'and', // Ensure valid combinator
    rules: rqbGroup.rules.map(ruleOrGroup => {
      if ('combinator' in ruleOrGroup) {
        // It's a nested group, recurse
        return transformToInternalRuleGroup(ruleOrGroup as RQBRuleGroupType);
      }
      // It's a RuleType, ensure it matches our internal RuleType if necessary
      // For now, assume direct compatibility or that RuleType from RQB is compatible
      return ruleOrGroup as RuleType; 
    }),
    not: rqbGroup.not || false,
  };
};

const ConditionalLogicSection: React.FC<ConditionalLogicSectionProps> = ({
  conditionalLogicConfig,
  onConfigChanged,
  configuredDataSources,
  hass,
  directApiConfig,
  allParameterValues
}) => {
  const [definedLogics, setDefinedLogics] = useState<ConditionalLogicItem[]>(
    conditionalLogicConfig?.definedLogics || []
  );

  const dynamicFields = useMemo(() => 
    generateFieldsFromDataSources(configuredDataSources, hass, directApiConfig, allParameterValues), 
    [configuredDataSources, hass, directApiConfig, allParameterValues]
  );

  useEffect(() => {
    // Update state if the prop changes from editor (e.g. loaded config)
    setDefinedLogics(conditionalLogicConfig?.definedLogics || []);
  }, [conditionalLogicConfig?.definedLogics]);

  const handleAddLogicBlock = () => {
    const newLogicItem: ConditionalLogicItem = {
      id: uuidv4(),
      name: `New Logic Block ${definedLogics.length + 1}`,
      conditionRules: { ...initialInternalRuleGroup, id: uuidv4() }, 
      effects: [],
    };
    const newDefinedLogics = [...definedLogics, newLogicItem];
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Added new logic block', { newLogicItem });
  };

  const handleLogicItemNameChange = (id: string, newName: string) => {
    const newDefinedLogics = definedLogics.map(item => 
      item.id === id ? { ...item, name: newName } : item
    );
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleQueryChange = (logicItemId: string, queryFromBuilder: RQBRuleGroupType) => {
    const internalQuery = transformToInternalRuleGroup(queryFromBuilder);
    const newDefinedLogics = definedLogics.map(item => 
      item.id === logicItemId ? { ...item, conditionRules: internalQuery } : item
    );
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Query changed for logic block', { logicItemId, internalQuery });
  };

  const handleRemoveLogicBlock = (id: string) => {
    const newDefinedLogics = definedLogics.filter(item => item.id !== id);
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Removed logic block', { id });
  };

  // --- Effect Handlers ---
  const handleAddEffect = (logicBlockId: string) => {
    const newEffect: EffectDefinition = {
      id: uuidv4(),
      type: 'set_visibility', // Default type
      isVisible: true, // Default for visibility
      // Initialize other fields as needed based on default type
    };
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicBlockId) {
        return { ...item, effects: [...item.effects, newEffect] };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Added new effect to logic block', { logicBlockId, newEffect });
  };

  const handleUpdateEffect = (logicBlockId: string, updatedEffect: EffectDefinition) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicBlockId) {
        const updatedEffects = item.effects.map(eff => 
          eff.id === updatedEffect.id ? updatedEffect : eff
        );
        return { ...item, effects: updatedEffects };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Updated effect in logic block', { logicBlockId, updatedEffect });
  };

  const handleRemoveEffect = (logicBlockId: string, effectId: string) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicBlockId) {
        const filteredEffects = item.effects.filter(eff => eff.id !== effectId);
        return { ...item, effects: filteredEffects };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
    logger.log('ConditionalLogicSection', 'Removed effect from logic block', { logicBlockId, effectId });
  };

  return (
    <div className="conditional-logic-section">
      <h4>Conditional Logic Blocks</h4>
      <p style={{ fontSize: '0.9em', color: 'gray', marginBottom: '15px' }}>
        Define sets of conditions (logic blocks). Each block can have its own rules and associated effects.
      </p>
      <button onClick={handleAddLogicBlock} style={{ marginBottom: '15px' }}>
        + Add New Logic Block
      </button>

      {definedLogics.map((logicItem, index) => (
        <div key={logicItem.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={logicItem.name}
              onChange={(e) => handleLogicItemNameChange(logicItem.id, e.target.value)}
              placeholder="Logic Block Name"
              style={{ fontSize: '1.1em', fontWeight: 'bold', border: 'none', borderBottom: '1px solid #eee', padding: '5px' }}
            />
            <button onClick={() => handleRemoveLogicBlock(logicItem.id)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>
              Remove Block
            </button>
          </div>
          
          <h5>Conditions (IF...):</h5>
          <QueryBuilder
            fields={dynamicFields}
            query={logicItem.conditionRules as RQBRuleGroupType}
            onQueryChange={(query) => handleQueryChange(logicItem.id, query as RQBRuleGroupType)}
          />
          
          {/* Placeholder for Effects UI */}
          <div style={{marginTop: '10px'}}>
            <h5>Actions/Effects (THEN...):</h5>
            <p style={{fontSize: '0.8em', color: 'gray'}}>
              <em>UI for defining effects (e.g., show/hide, change style, call service) for this block will be here. Currently, {logicItem.effects.length} effects defined.</em>
            </p>
          </div>

          <EffectsConfiguration
            effects={logicItem.effects}
            logicBlockId={logicItem.id}
            onAddEffect={handleAddEffect}
            onUpdateEffect={handleUpdateEffect}
            onRemoveEffect={handleRemoveEffect}
          />

          <details style={{ marginTop: '10px' }}>
            <summary>Debug: Logic Item JSON</summary>
            <pre style={{ fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(logicItem, null, 2)}
            </pre>
          </details>
        </div>
      ))}
      {definedLogics.length === 0 && <p>No logic blocks defined yet.</p>}
    </div>
  );
};

export default ConditionalLogicSection; 