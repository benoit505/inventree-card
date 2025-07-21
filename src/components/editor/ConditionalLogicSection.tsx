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
    LogicPair,              // <<<< CORRECTED IMPORT
    RuleGroupType,         // Our internal, stricter RuleGroupType
    RuleType             // Our internal RuleType
} from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { HomeAssistant } from 'custom-card-helpers';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import EffectsConfiguration from './EffectsConfiguration'; // ADDED IMPORT

ConditionalLoggerEngine.getInstance().registerCategory('ConditionalLogicSection', { enabled: false, level: 'info' });

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
  dataSources: DataSourceConfig | undefined,
  hass: HomeAssistant | undefined,
  directApiConfig: DirectApiConfig | undefined,
  allParameterValues: Record<number, Record<string, ParameterDetail>> | undefined,
  logger: any // Pass logger as an argument
): Field[] => {
  const fields: Field[] = [];
  if (!dataSources) return [
    { name: 'default_field', label: 'Default Field (No Data Sources)' }
  ];

  (dataSources.inventree_hass_sensors || []).forEach((entityId: string) => {
    const entity = hass?.states[entityId];
    if (!entity) return;

    const entityName = entity?.attributes.friendly_name || entityId;
    fields.push({ name: `inv_sensor_state_${entityId}`, label: `InvSensor: ${entityName} State` });

    // --- NEW LOGIC: Inspect the parts within the HASS sensor ---
    const parts = entity.attributes.items;
    if (Array.isArray(parts) && parts.length > 0) {
      // Use the first part as a representative sample to get the field keys
      const samplePart = parts[0];
      const partFields: Field[] = [];
      
      // Generate fields for all keys in the sample part object
      for (const key in samplePart) {
        if (Object.prototype.hasOwnProperty.call(samplePart, key)) {
          const value = samplePart[key];
          let inputType: 'text' | 'number' | 'boolean' = 'text';

          if (typeof value === 'number') {
            inputType = 'number';
          } else if (typeof value === 'boolean') {
            inputType = 'boolean';
          }
          
          // We only want to add fields for primitive types that can be used in rules.
          if (typeof value !== 'object' || value === null) {
            partFields.push({
              name: `part_${key}`, // Generic part field identifier
              label: `Part (from HASS): ${key}`,
              inputType: inputType,
            });
          }
        }
      }

      // Add the generated fields to the main list, ensuring no duplicates
      partFields.forEach(newField => {
        if (!fields.some(existingField => existingField.name === newField.name)) {
          fields.push(newField);
        }
      });
    }
  });

  (dataSources.ha_entities || []).forEach((entityId: string) => {
    const entity = hass?.states[entityId];
    if (entity) {
      const entityName = entity.attributes.friendly_name || entityId;
      const stateFieldIdentifier = `ha_entity_state_${entityId}`;
      fields.push({ 
        name: stateFieldIdentifier,
        label: `${entityName} - State`,
        value: stateFieldIdentifier
      });

      for (const attrName in entity.attributes) {
        if (Object.prototype.hasOwnProperty.call(entity.attributes, attrName)) {
          let inputType: 'text' | 'number' | 'boolean' = 'text';
          const attrValue = entity.attributes[attrName];
          if (typeof attrValue === 'number') {
            inputType = 'number';
          } else if (typeof attrValue === 'boolean') {
            inputType = 'boolean';
          }
          if (typeof attrValue !== 'object' && !Array.isArray(attrValue)) {
            const attrFieldIdentifier = `ha_entity_attr_${entityId}:::${attrName}`;
            const fieldLabel = `${entityName} - Attribute: ${attrName}`;
            fields.push({
              name: attrFieldIdentifier,
              label: fieldLabel,
              value: attrFieldIdentifier,
              inputType: inputType
            });
          }
        }
      }
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

  if (dataSources.inventree_parameters_to_fetch) {
    dataSources.inventree_parameters_to_fetch.forEach(fetchConfig => {
      const targetIds = fetchConfig.targetPartIds;
      const paramNames = fetchConfig.parameterNames;

      if (targetIds === 'all_loaded') {
        if (paramNames !== '*' && Array.isArray(paramNames)) {
          paramNames.forEach(paramName => {
            fields.push({
              name: `inv_param_any_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
              label: `InvParam (Any Part): ${paramName}`,
            });
          });
        }
      } else if (Array.isArray(targetIds)) {
        targetIds.forEach(pk => {
          if (typeof pk === 'number' && !isNaN(pk)) {
            if (paramNames === '*') {
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
          name: `inv_param_${pk}_${paramName.replace(/[^a-zA-Z0-9_]/g, '_')}`,
          label: `InvParam: ${paramName} (Part ${pk})`,
          inputType: inputType
        });
      } else {
        fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`,
                       label: `InvParam: ${paramString} (Invalid PK)` });
      }
    } else {
      fields.push({ name: `inv_param_raw_${paramString.replace(/[^a-zA-Z0-9_]/g, '_')}`,
                     label: `InvParam: ${paramString} (Malformed)` });
    }
  });
  
  if (fields.length === 0) {
    fields.push(
        { name: 'generic_part_name', label: 'Part Name (Any)' },
        { name: 'generic_stock_level', label: 'Stock Level (Any)', inputType: 'number' }
    );
  }
  logger.debug("generateFieldsFromDataSources", "Generated fields for QueryBuilder", { count: fields.length });
  return fields;
};

// This is our internal RuleGroupType for initialization
const initialInternalRuleGroup: RuleGroupType = {
  id: uuidv4(),
  combinator: 'and',
  rules: [], 
  not: false,
};

// NEW: Helper to create a new LogicPair
const getNewLogicPair = (): LogicPair => ({
  id: uuidv4(),
  name: '', // Or perhaps "New Rule Pair 1"
  conditionRules: { ...initialInternalRuleGroup, id: uuidv4() }, // Each pair gets its own rule group
  effects: [],
});

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
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('ConditionalLogicSection');
    // This logger is for the editor form itself, which is not instance-specific
  }, []);

  const [collapsedLogicItems, setCollapsedLogicItems] = useState<Record<string, boolean>>({});

  const { definedLogics = [] } = conditionalLogicConfig || {};

  const fields = useMemo(
    () => generateFieldsFromDataSources(configuredDataSources, hass, directApiConfig, allParameterValues, logger),
    [configuredDataSources, hass, directApiConfig, allParameterValues, logger]
  );

  // Memoize a stringified version of the logic config to use as a stable dependency
  const stringifiedLogicConfig = useMemo(() => JSON.stringify(conditionalLogicConfig?.definedLogics), [conditionalLogicConfig?.definedLogics]);

  useEffect(() => {
    const initialLogics = conditionalLogicConfig?.definedLogics || [];
    const sanitizedLogics = initialLogics.map(item => ({
      ...item,
      id: item.id || uuidv4(),
      logicPairs: Array.isArray(item.logicPairs) ? item.logicPairs.map(pair => ({
        ...pair,
        id: pair.id || uuidv4(),
        name: pair.name || '',
        conditionRules: pair.conditionRules || { ...initialInternalRuleGroup, id: uuidv4() },
        effects: Array.isArray(pair.effects) ? pair.effects.map(effect => ({...effect, id: effect.id || uuidv4()})) : []
      })) : [getNewLogicPair()],
    }));
    onConfigChanged({ definedLogics: sanitizedLogics });
  }, [stringifiedLogicConfig, onConfigChanged]);

  const handleAddLogicBlock = () => {
    const newLogicItem: ConditionalLogicItem = {
      id: uuidv4(),
      name: `New Logic Block ${definedLogics.length + 1}`,
      logicPairs: [getNewLogicPair()],
    };
    const updatedLogics = [...definedLogics, newLogicItem];
    onConfigChanged({ definedLogics: updatedLogics });
  };
  
  const toggleCollapse = (logicItemId: string) => {
    setCollapsedLogicItems(prev => ({ ...prev, [logicItemId]: !prev[logicItemId] }));
  };

  const handleLogicItemNameChange = (logicItemId: string, newName: string) => {
    const updatedLogics = definedLogics.map(item => item.id === logicItemId ? { ...item, name: newName } : item);
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleRemoveLogicBlock = (logicItemId: string) => {
    const updatedLogics = definedLogics.filter(item => item.id !== logicItemId);
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleAddLogicPair = (logicItemId: string) => {
    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return { ...item, logicPairs: [...item.logicPairs, getNewLogicPair()] };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleLogicPairNameChange = (logicItemId: string, pairId: string, newName: string) => {
    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair =>
            pair.id === pairId ? { ...pair, name: newName } : pair
          )
        };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleLogicPairQueryChange = (logicItemId: string, pairId: string, queryFromBuilder: RQBRuleGroupType) => {
    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair =>
            pair.id === pairId ? { ...pair, conditionRules: transformToInternalRuleGroup(queryFromBuilder) } : pair
          )
        };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleLogicPairAddEffect = (logicItemId: string, pairId: string) => {
    const newEffect: EffectDefinition = {
      id: uuidv4(),
      type: 'set_style',
      styleTarget: 'Row', // Default to 'Row'
      styleProperty: '',
      styleValue: '',
    };

    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => {
            if (pair.id === pairId) {
              return { ...pair, effects: [...pair.effects, newEffect] };
            }
            return pair;
          })
        };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleLogicPairUpdateEffect = (logicItemId: string, pairId: string, updatedEffect: EffectDefinition) => {
    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => {
            if (pair.id === pairId) {
              return {
                ...pair,
                effects: pair.effects.map(effect =>
                  effect.id === updatedEffect.id ? updatedEffect : effect
                )
              };
            }
            return pair;
          })
        };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleLogicPairRemoveEffect = (logicItemId: string, pairId: string, effectId: string) => {
    const updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => {
            if (pair.id === pairId) {
              return { ...pair, effects: pair.effects.filter(effect => effect.id !== effectId) };
            }
            return pair;
          })
        };
      }
      return item;
    });
    onConfigChanged({ definedLogics: updatedLogics });
  };

  const handleRemoveLogicPair = (logicItemId: string, pairId: string) => {
    let updatedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return { ...item, logicPairs: item.logicPairs.filter(pair => pair.id !== pairId) };
      }
      return item;
    });

    // Clean up any logic blocks that now have no pairs
    updatedLogics = updatedLogics.filter(item => item.logicPairs.length > 0);
    onConfigChanged({ definedLogics: updatedLogics });
  };

  return (
    <div className="sub-section-container" style={{ borderTop: '1px solid #ddd', marginTop: '16px', paddingTop: '16px' }}>
      <h4 className="sub-section-title">Conditional Logic</h4>
      <p style={{ fontSize: '0.9em', color: 'gray', marginTop: '-10px', marginBottom: '15px' }}>
        Define rules to dynamically change the card's appearance based on part data or Home Assistant states.
      </p>

      {definedLogics.map(logicItem => {
        const isCollapsed = collapsedLogicItems[logicItem.id];
        return (
          <div key={logicItem.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease-in-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 15px',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#f1f1f1',
              borderRadius: '8px 8px 0 0',
            }}>
              <input
                type="text"
                value={logicItem.name}
                onChange={(e) => handleLogicItemNameChange(logicItem.id, e.target.value)}
                placeholder="Logic Block Name"
                style={{ flexGrow: 1, border: 'none', background: 'none', fontWeight: 'bold', fontSize: '1.1em' }}
              />
              <div>
                <button onClick={() => toggleCollapse(logicItem.id)} style={styles.iconButton}>
                  {isCollapsed ? '▶' : '▼'}
                </button>
                <button onClick={() => handleRemoveLogicBlock(logicItem.id)} style={{...styles.iconButton, ...styles.dangerButton}}>
                  🗑️
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div style={{ padding: '15px' }}>
                {logicItem.logicPairs.map((pair, pairIndex) => (
                  <div key={pair.id} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: 'white',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                       <h5 style={{ margin: 0 }}>
                         Condition & Effects Pair {pairIndex + 1}
                       </h5>
                       {logicItem.logicPairs.length > 1 && (
                         <button onClick={() => handleRemoveLogicPair(logicItem.id, pair.id)} style={{...styles.iconButton, ...styles.dangerButton, fontSize: '0.9em'}}>
                           Remove Pair
                         </button>
                       )}
                    </div>
                    
                    <h6 style={{ marginTop: '10px', marginBottom: '5px', color: '#333' }}>IF... (Condition)</h6>
                    <div className="query-builder-container" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <QueryBuilder
                          fields={fields}
                          query={pair.conditionRules as RQBRuleGroupType}
                          onQueryChange={q => handleLogicPairQueryChange(logicItem.id, pair.id, q)}
                        />
                    </div>
                    
                    <h6 style={{ marginTop: '15px', marginBottom: '5px', color: '#333' }}>THEN... (Effects)</h6>
                    <EffectsConfiguration
                      effects={pair.effects}
                      logicBlockId={pair.id}
                      onAddEffect={() => handleLogicPairAddEffect(logicItem.id, pair.id)}
                      onUpdateEffect={(effect) => handleLogicPairUpdateEffect(logicItem.id, pair.id, effect)}
                      onRemoveEffect={(effectId) => handleLogicPairRemoveEffect(logicItem.id, pair.id, effectId)}
                    />
                  </div>
                ))}
                <button onClick={() => handleAddLogicPair(logicItem.id)} style={styles.primaryButton}>
                  + Add Condition/Effect Pair
                </button>
              </div>
            )}
          </div>
        )
      })}

      <button onClick={handleAddLogicBlock} style={{...styles.primaryButton, marginTop: '10px' }}>
        + Add New Logic Block
      </button>
    </div>
  );
};

const styles = {
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    fontSize: '1.2em',
    lineHeight: 1,
  },
  dangerButton: {
    color: '#d9534f',
  },
  primaryButton: {
    padding: '8px 12px',
    border: '1px solid #007bff',
    background: '#007bff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
  }
};

export default ConditionalLogicSection; 