/**
 * Data Availability Indicator - Shows which data is available for rules
 * 
 * This component analyzes conditional logic rules and shows:
 * - Which fields are available
 * - Which fields are missing
 * - Auto-fetch status
 */

import React, { useMemo } from 'react';
import { ConditionalLogicItem, RuleGroupType, RuleType } from '../../types';
import { useAppSelector } from '../../store';
import { selectCombinedParts } from '../../store/slices/partsSlice';
import { selectAllGenericHaStates } from '../../store/slices/genericHaStateSlice';
import { inventreeApi } from '../../store/apis/inventreeApi';

interface DataAvailabilityIndicatorProps {
  conditionalLogicItems: ConditionalLogicItem[];
  cardInstanceId: string;
}

interface DataRequirement {
  field: string;
  type: 'part_attribute' | 'part_parameter' | 'ha_entity' | 'specific_part';
  partPk?: number;
  available: boolean;
  source?: string;
}

const extractFieldsFromRuleGroup = (ruleGroup: RuleGroupType): string[] => {
  const fields: string[] = [];
  
  const traverse = (group: RuleGroupType) => {
    group.rules.forEach(rule => {
      if ('combinator' in rule) {
        traverse(rule as RuleGroupType);
      } else {
        const ruleType = rule as RuleType;
        if (ruleType.field) {
          fields.push(ruleType.field);
        }
      }
    });
  };
  
  traverse(ruleGroup);
  return [...new Set(fields)]; // Remove duplicates
};

const DataAvailabilityIndicator: React.FC<DataAvailabilityIndicatorProps> = ({ 
  conditionalLogicItems, 
  cardInstanceId 
}) => {
  const allParts = useAppSelector(state => selectCombinedParts(state, cardInstanceId));
  const haStates = useAppSelector(state => selectAllGenericHaStates(state));
  
  const dataRequirements = useMemo<DataRequirement[]>(() => {
    const requirements: DataRequirement[] = [];
    
    // Extract all fields from all rules
    const allFields = conditionalLogicItems.flatMap(item => 
      item.logicPairs.flatMap(pair => 
        extractFieldsFromRuleGroup(pair.conditionRules)
      )
    );
    
    // Analyze each field
    allFields.forEach(field => {
      // Skip if already analyzed
      if (requirements.some(req => req.field === field)) return;
      
      let requirement: DataRequirement = {
        field,
        type: 'part_attribute',
        available: false
      };
      
      // Analyze field pattern
      if (field.startsWith('part_') && !field.match(/^part_\d+_/)) {
        // Generic part attribute (e.g., 'part_in_stock')
        requirement.type = 'part_attribute';
        requirement.available = allParts.length > 0; // Available if we have any parts
        requirement.source = `${allParts.length} parts loaded`;
        
      } else if (field.match(/^part_(\d+)_(.+)$/)) {
        // Specific part attribute (e.g., 'part_123_in_stock')
        const match = field.match(/^part_(\d+)_(.+)$/);
        const partPk = parseInt(match![1], 10);
        const attribute = match![2];
        
        requirement.type = 'specific_part';
        requirement.partPk = partPk;
        
        // Check if this specific part is loaded
        const part = allParts.find(p => p.pk === partPk);
        requirement.available = part !== undefined && attribute in part;
        requirement.source = part ? `Part ${partPk} loaded` : `Part ${partPk} missing`;
        
      } else if (field.startsWith('param_')) {
        // Part parameter (e.g., 'param_color')
        const paramName = field.substring('param_'.length);
        requirement.type = 'part_parameter';
        
        // Check if any loaded part has this parameter
        const hasParam = allParts.some(part => 
          part.parameters?.some(p => p.template_detail?.name === paramName)
        );
        requirement.available = hasParam;
        requirement.source = hasParam ? `Parameter found in loaded parts` : `Parameter not found`;
        
      } else if (field.startsWith('ha_entity_')) {
        // HA entity (e.g., 'ha_entity_state_sensor.temperature')
        requirement.type = 'ha_entity';
        
        // Extract entity ID from field
        let entityId = '';
        if (field.startsWith('ha_entity_state_')) {
          entityId = field.substring('ha_entity_state_'.length);
        } else if (field.startsWith('ha_entity_attr_')) {
          const content = field.substring('ha_entity_attr_'.length);
          entityId = content.split(':::')[0];
        }
        
        requirement.available = entityId in haStates;
        requirement.source = requirement.available ? `HA entity loaded` : `HA entity missing`;
      }
      
      requirements.push(requirement);
    });
    
    return requirements;
  }, [conditionalLogicItems, allParts, haStates]);
  
  const availableCount = dataRequirements.filter(req => req.available).length;
  const totalCount = dataRequirements.length;
  const missingRequirements = dataRequirements.filter(req => !req.available);
  
  if (totalCount === 0) {
    return (
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#f9f9f9', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          ℹ️ No conditional rules defined yet
        </div>
      </div>
    );
  }
  
  const allAvailable = availableCount === totalCount;
  const someAvailable = availableCount > 0;
  
  return (
    <div style={{ 
      padding: '12px', 
      backgroundColor: allAvailable ? '#f0fff0' : someAvailable ? '#fff9e6' : '#ffe6e6', 
      border: `1px solid ${allAvailable ? '#4CAF50' : someAvailable ? '#ff9800' : '#f44336'}`, 
      borderRadius: '4px',
      marginBottom: '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: missingRequirements.length > 0 ? '8px' : '0',
        fontWeight: 'bold'
      }}>
        <span style={{ 
          marginRight: '8px',
          fontSize: '16px'
        }}>
          {allAvailable ? '✅' : someAvailable ? '⚠️' : '❌'}
        </span>
        <span>
          Data Availability: {availableCount}/{totalCount} fields ready
        </span>
      </div>
      
      {missingRequirements.length > 0 && (
        <div style={{ fontSize: '13px', color: '#666' }}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>Missing data:</div>
          {missingRequirements.map((req, idx) => (
            <div key={idx} style={{ marginLeft: '16px', marginBottom: '2px' }}>
              • <code style={{ backgroundColor: '#f5f5f5', padding: '1px 4px' }}>{req.field}</code>
              {req.partPk && (
                <span style={{ color: '#666', marginLeft: '4px' }}>
                  (Part {req.partPk} needs to be fetched)
                </span>
              )}
            </div>
          ))}
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: '#f0f8ff', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            🚀 <strong>Smart Auto-Fetch:</strong> Missing parts will be automatically fetched when rules are evaluated!
          </div>
        </div>
      )}
      
      {allAvailable && (
        <div style={{ fontSize: '13px', color: '#4CAF50' }}>
          All data is available! Your rules will evaluate correctly.
        </div>
      )}
    </div>
  );
};

export default DataAvailabilityIndicator;
