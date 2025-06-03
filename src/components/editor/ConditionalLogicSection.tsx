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
    RuleEffectPair,         // <<<< ADDED IMPORT
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

// NEW: Helper to create a new RuleEffectPair
const getNewRuleEffectPair = (): RuleEffectPair => ({
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
  const [definedLogics, setDefinedLogics] = useState<ConditionalLogicItem[]>([]);

  const dynamicFields = useMemo(() => 
    generateFieldsFromDataSources(configuredDataSources, hass, directApiConfig, allParameterValues), 
    [configuredDataSources, hass, directApiConfig, allParameterValues]
  );

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
      })) : [getNewRuleEffectPair()],
    }));
    setDefinedLogics(sanitizedLogics);
  }, [conditionalLogicConfig?.definedLogics]);

  const handleAddLogicBlock = () => {
    const newLogicItem: ConditionalLogicItem = {
      id: uuidv4(),
      name: `New Logic Block ${definedLogics.length + 1}`,
      logicPairs: [getNewRuleEffectPair()],
    };
    const newDefinedLogics = [...definedLogics, newLogicItem];
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleLogicItemNameChange = (logicItemId: string, newName: string) => {
    const newDefinedLogics = definedLogics.map(item => 
      item.id === logicItemId ? { ...item, name: newName } : item
    );
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRemoveLogicBlock = (logicItemId: string) => {
    const newDefinedLogics = definedLogics.filter(item => item.id !== logicItemId);
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleAddRuleEffectPair = (logicItemId: string) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return { ...item, logicPairs: [...item.logicPairs, getNewRuleEffectPair()] };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRuleEffectPairNameChange = (logicItemId: string, pairId: string, newName: string) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => pair.id === pairId ? { ...pair, name: newName } : pair)
        };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };
  
  const handleRuleEffectPairQueryChange = (logicItemId: string, pairId: string, queryFromBuilder: RQBRuleGroupType) => {
    const internalRuleGroup = transformToInternalRuleGroup(queryFromBuilder);
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => pair.id === pairId ? { ...pair, conditionRules: internalRuleGroup } : pair)
        };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRuleEffectPairAddEffect = (logicItemId: string, pairId: string) => {
    const newEffect: EffectDefinition = { id: uuidv4(), type: 'set_style', styleProperty: 'highlight', styleValue: 'yellow' };
    const newDefinedLogics = definedLogics.map(item => {
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
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRuleEffectPairUpdateEffect = (logicItemId: string, pairId: string, updatedEffect: EffectDefinition) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => {
            if (pair.id === pairId) {
              return { ...pair, effects: pair.effects.map(eff => eff.id === updatedEffect.id ? updatedEffect : eff) };
            }
            return pair;
          })
        };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRuleEffectPairRemoveEffect = (logicItemId: string, pairId: string, effectId: string) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return {
          ...item,
          logicPairs: item.logicPairs.map(pair => {
            if (pair.id === pairId) {
              return { ...pair, effects: pair.effects.filter(eff => eff.id !== effectId) };
            }
            return pair;
          })
        };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const handleRemoveRuleEffectPair = (logicItemId: string, pairId: string) => {
    const newDefinedLogics = definedLogics.map(item => {
      if (item.id === logicItemId) {
        return { ...item, logicPairs: item.logicPairs.filter(pair => pair.id !== pairId) };
      }
      return item;
    });
    setDefinedLogics(newDefinedLogics);
    onConfigChanged({ definedLogics: newDefinedLogics });
  };

  const commonStyles = {
    container: { marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' },
    header: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    input: { width: 'calc(100% - 120px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
    removeButton: { backgroundColor: '#f44336', color: 'white' },
    addButton: { backgroundColor: '#4CAF50', color: 'white', marginTop: '10px', display: 'block', width: '100%' },
    subSection: { marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' },
    subHeader: { marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9em' },
    pairContainer: { marginLeft: '15px', borderLeft: '3px solid #4CAF50', paddingLeft: '15px', marginTop:'10px', marginBottom:'10px' },
  };

  return (
    <div>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Conditional Logic</h3>
      {definedLogics.map((logicItem, itemIndex) => (
        <div key={logicItem.id} style={commonStyles.container}>
          <div style={commonStyles.header}>
            <input
              type="text"
              value={logicItem.name}
              onChange={(e) => handleLogicItemNameChange(logicItem.id, e.target.value)}
              placeholder={`Logic Block ${itemIndex + 1} Name`}
              style={commonStyles.input}
            />
            <button onClick={() => handleRemoveLogicBlock(logicItem.id)} style={{...commonStyles.button, ...commonStyles.removeButton}}>Remove Block</button>
          </div>
          
          {logicItem.logicPairs.map((pair, pairIndex) => (
            <div key={pair.id} style={commonStyles.pairContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={pair.name}
                  onChange={(e) => handleRuleEffectPairNameChange(logicItem.id, pair.id, e.target.value)}
                  placeholder={`Rule-Effect Pair ${pairIndex + 1} Name (Optional)`}
                  style={{ ...commonStyles.input, width: 'calc(100% - 130px)', fontSize: '0.9em' }}
                />
                <button onClick={() => handleRemoveRuleEffectPair(logicItem.id, pair.id)} style={{ ...commonStyles.button, ...commonStyles.removeButton, fontSize: '0.8em', padding: '6px 10px' }}>Remove Pair</button>
              </div>
              
              <div style={commonStyles.subHeader}>IF (Conditions for this Pair):</div>
              <QueryBuilder
                fields={dynamicFields}
                query={pair.conditionRules as RQBRuleGroupType}
                onQueryChange={(q) => handleRuleEffectPairQueryChange(logicItem.id, pair.id, q)}
              />
              
              <div style={{ ...commonStyles.subHeader, marginTop: '15px' }}>THEN (Effects for this Pair):</div>
              <EffectsConfiguration
                effects={pair.effects}
                logicBlockId={pair.id}
                onAddEffect={() => handleRuleEffectPairAddEffect(logicItem.id, pair.id)}
                onUpdateEffect={(effectToUpdate: EffectDefinition) => 
                  handleRuleEffectPairUpdateEffect(logicItem.id, pair.id, effectToUpdate)
                }
                onRemoveEffect={(effectId: string) => 
                  handleRuleEffectPairRemoveEffect(logicItem.id, pair.id, effectId)
                }
              />
            </div>
          ))}
          <button onClick={() => handleAddRuleEffectPair(logicItem.id)} style={{...commonStyles.button, backgroundColor: '#2196F3', color: 'white', marginTop: '15px' }}>Add Rule-Effect Pair to Block</button>
        </div>
      ))}
      <button onClick={handleAddLogicBlock} style={commonStyles.addButton}>Add New Conditional Logic Block</button>
    </div>
  );
};

export default ConditionalLogicSection; 