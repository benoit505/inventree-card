import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Added useSelector
import { HomeAssistant } from 'custom-card-helpers';
import { Provider } from 'react-redux';
import { 
    InventreeCardConfig, 
    InventreeItem, 
    ParameterCondition, // This is still used for the legacy path
    ConditionRuleDefinition, 
    RuleGroupType, 
    RuleType, 
    ParameterOperator, 
    ParameterActionType,
    ConditionalLogicItem
} from './types';
import { Logger } from './utils/logger';
// import { apiInitializationError } from './store/slices/apiSlice'; // Removed unused import
import { 
  initializeDirectApi, 
  initializeWebSocketPlugin,
  processHassEntities,
  initializeGenericHaStatesFromConfig
} from './store/thunks/systemThunks';
// REMOVED: Old parameterThunk imports for conditions
// import { 
//     initializeConditionDefinitions, // OLD
//     fetchConfiguredParameters,      // Still needed from parameterThunks
//     evaluateAndApplyConditions    // No longer called here
// } from './store/thunks/parameterThunks';

// Import NEW thunk for rule definitions
import { initializeRuleDefinitionsThunk } from './store/thunks/conditionalLogicThunks';
// Import needed thunks from parameterThunks (data fetching only)
import { fetchConfiguredParameters } from './store/thunks/parameterThunks';
// Import NEW thunk for evaluating and applying effects
import { evaluateAndApplyEffectsThunk } from './store/thunks/conditionalLogicThunks';
// Import setConfigAction from configSlice
import { setConfigAction } from './store/slices/configSlice';
// Import clearCache from parametersSlice
import { clearCache } from './store/slices/parametersSlice';

// Import debounce from lodash-es
import debounce from 'lodash-es/debounce';

import { fetchPartsByPks } from './store/thunks/partThunks';
import { RootState, AppDispatch } from './store'; // Import AppDispatch
import { 
  selectPartsForEntities, 
  addParts,
  selectPartsByPks // ADD import for the new selector
} from './store/slices/partsSlice'; // Selector for parts AND IMPORT addParts

// Import placeholder layouts
import DetailLayout from './components/layouts/DetailLayout';
import GridLayout from './components/layouts/GridLayout';
import ListLayout from './components/layouts/ListLayout';
import PartsLayout from './components/layouts/PartsLayout';
import VariantLayout from './components/layouts/VariantLayout';

interface InventreeCardProps {
  hass?: HomeAssistant;
  config?: InventreeCardConfig;
}

const logger = Logger.getInstance();

// Temporary Transformer: RuleGroupType to ParameterCondition[]
// This is a simplified transformation. A more robust solution would handle nested groups
// and properly map actions/effects which are not part of RuleGroupType.
const transformRuleGroupToParameterConditions = (ruleGroup?: RuleGroupType): ConditionRuleDefinition[] => {
  if (!ruleGroup || !ruleGroup.rules || ruleGroup.rules.length === 0) {
    return [];
  }

  const conditions: ConditionRuleDefinition[] = [];

  // Currently, this will only process top-level rules and ignore group combinators (and/or for the whole group).
  // A full transformation would require more complex logic to flatten or represent groups.
  ruleGroup.rules.forEach((ruleOrGroup: RuleType | RuleGroupType) => {
    // Check if it's a RuleType (actual rule) and not another RuleGroupType (nested group)
    if ('field' in ruleOrGroup) { // This is a RuleType
      const rule = ruleOrGroup as RuleType;
      // Constructing ConditionRuleDefinition (ensure all required fields are present)
      conditions.push({
        // name: rule.id, // Optional: use rule.id as a name if available/meaningful from query builder
        parameter: rule.field, 
        operator: rule.operator as ParameterOperator, // Cast, assuming operators align
        value: rule.value, // Value can be string | number | boolean from RuleType
        action: 'highlight' as ParameterActionType, // Default/placeholder action
        action_value: 'yellow', // Default/placeholder action value
        // targetPartIds: undefined, // Placeholder, needs to be sourced if rules apply to specific parts
      });
    }
    // TODO: Handle nested RuleGroupType if needed, or decide to keep conditions flat
  });

  logger.log('InventreeCard.tsx', 'Transformed RuleGroup to ConditionRuleDefinition[] (simplified)', { count: conditions.length, originalRules: ruleGroup });
  return conditions;
};

const InventreeCard = ({ hass, config }: InventreeCardProps): JSX.Element | null => {
  // TEMPORARY CONSOLE LOG
  // console.log('InventreeCard.tsx (React) received config prop:', JSON.parse(JSON.stringify(config || {})));
  // ADD TEMP LOG
  // console.log('[TEMP LOG - InventreeCard.tsx:101]', 'InventreeCard component render/re-render. HASS available:', !!hass, 'Config available:', !!config);

  const dispatch = useDispatch<any>();

  // Performance settings from config
  const renderPerformanceConfig = config?.performance?.rendering;
  const debounceTime = renderPerformanceConfig?.debounceTime ?? 50;
  const idleRenderInterval = renderPerformanceConfig?.idleRenderInterval ?? 5000;
  // maxRenderFrequency is not directly used in this step, but noted for future consideration

  const entityIdsFromConfig = useMemo(() => {
    if (!config) return [];
    const ids = config.entity ? [config.entity] : [];
    if (Array.isArray(config.selected_entities)) {
      ids.push(...config.selected_entities);
    }
    // If data_sources exist and have inventree_hass_sensors, merge them too for part selection
    if (config.data_sources?.inventree_hass_sensors) {
      ids.push(...config.data_sources.inventree_hass_sensors);
    }
    return [...new Set(ids.filter(id => typeof id === 'string' && id !== ''))]; // Ensure only valid strings
  }, [config?.entity, config?.selected_entities, config?.data_sources?.inventree_hass_sensors]);

  const partsFromEntities = useSelector((state: RootState) => selectPartsForEntities(state, entityIdsFromConfig));
  
  // Get direct PKs from config
  const directPartPksFromConfig = useMemo(() => {
    if (!config?.data_sources?.inventree_pks) return [];
    return config.data_sources.inventree_pks.filter((pk: number) => typeof pk === 'number' && !isNaN(pk));
  }, [config?.data_sources?.inventree_pks]);

  const partsFromPks = useSelector((state: RootState) => selectPartsByPks(state, directPartPksFromConfig));

  // Combine and deduplicate parts
  const parts = useMemo(() => {
    const combinedParts = [...partsFromEntities, ...partsFromPks];
    const uniquePartsMap = new Map<number, InventreeItem>();
    combinedParts.forEach(part => {
      if (part && typeof part.pk === 'number') { // Ensure part and part.pk are valid
        if (!uniquePartsMap.has(part.pk)) {
          uniquePartsMap.set(part.pk, part);
        }
      }
    });
    return Array.from(uniquePartsMap.values());
  }, [partsFromEntities, partsFromPks]);
  
  const selectedItem = useSelector((state: RootState) => {
    if (!config || !parts || parts.length === 0) return undefined;
    if (config.view_type === 'detail' || config.view_type === 'variants') {
        if (config.part_id) {
            return parts.find(p => p.pk === config.part_id) || parts[0];
        }
        return parts[0];
    }
    return undefined;
  });

  useEffect(() => {
    if (config) {
      logger.log('InventreeCard.tsx', 'Config updated or available.', { config });
      logger.setDebugConfig(config);
    }
  }, [config]);

  // Debounced version of the initialization logic
  const debouncedInitializationEffect = useCallback(debounce(async (currentHass: HomeAssistant | undefined, currentConfig: InventreeCardConfig | undefined, currentDispatch: AppDispatch) => {
    // ADD TEMP LOG
    // console.log('[TEMP LOG - InventreeCard.tsx:172]', 'debouncedInitializationEffect triggered. HASS available:', !!currentHass, 'Config available:', !!currentConfig);
    if (currentHass && currentConfig) {
      // console.log('[TEMP LOG - InventreeCard.tsx:174]', 'debouncedInitializationEffect: Inside if (currentHass && currentConfig). currentConfig:', JSON.parse(JSON.stringify(currentConfig)));
      logger.log('InventreeCard.tsx', 'Debounced Effect: HASS and Config are available. Initializing.', { hass: !!currentHass, config: !!currentConfig });

      // Clear parameter cache first to ensure fresh loading states
      logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching clearCache() from parametersSlice.');
      // ADD TEMP LOG
      // console.log('[TEMP LOG - InventreeCard.tsx:181]', 'debouncedInitializationEffect: Dispatching clearCache()');
      currentDispatch(clearCache());
      // ADD TEMP LOG
      // console.log('[TEMP LOG - InventreeCard.tsx:184]', 'debouncedInitializationEffect: clearCache() dispatched.');

      // ***** ADD THIS DISPATCH FIRST *****
      logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching setConfigAction with currentConfig.');
      // ADD TEMP LOG
      // console.log('[TEMP LOG - InventreeCard.tsx:189]', 'debouncedInitializationEffect: Dispatching setConfigAction with currentConfig:', JSON.parse(JSON.stringify(currentConfig)));
      currentDispatch(setConfigAction(currentConfig));
      // ADD TEMP LOG
      // console.log('[TEMP LOG - InventreeCard.tsx:192]', 'debouncedInitializationEffect: setConfigAction dispatched.');

      if (currentConfig.direct_api?.enabled) {
        if (!currentConfig.direct_api.url || !currentConfig.direct_api.api_key) {
          logger.warn('InventreeCard.tsx', '⚠️ Debounced Effect: Direct API URL or API Key missing, skipping initialization.');
        } else {
          logger.log('InventreeCard.tsx', '🚀 Debounced Effect: Dispatching initializeDirectApi thunk');
          currentDispatch(initializeDirectApi({ directApiConfig: currentConfig.direct_api, logger }));
        }

        if (currentConfig.direct_api.method !== 'hass') {
          if (currentConfig.direct_api.url || currentConfig.direct_api.websocket_url) {
            logger.log('InventreeCard.tsx', '🔌 Debounced Effect: Dispatching initializeWebSocketPlugin thunk');
            currentDispatch(initializeWebSocketPlugin({
              directApiConfig: currentConfig.direct_api,
              cardDebugWebSocket: currentConfig.debug_websocket,
              logger
            }));
          } else {
            logger.warn('InventreeCard.tsx', '⚠️ Debounced Effect: Cannot initialize WebSocket, base URL for WS derivation is missing when method is not HASS.');
          }
        }
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Direct API not enabled, skipping API/WebSocket initialization.');
      }

      // Consolidate all sensor entity IDs for processing
      const allSensorEntityIds: string[] = [];
      if (currentConfig.entity) {
        allSensorEntityIds.push(currentConfig.entity);
      }
      if (Array.isArray(currentConfig.selected_entities)) {
        allSensorEntityIds.push(...currentConfig.selected_entities);
      }
      if (Array.isArray(currentConfig.data_sources?.inventree_hass_sensors)) {
        allSensorEntityIds.push(...currentConfig.data_sources.inventree_hass_sensors);
      }
      // Remove duplicates and ensure they are valid strings
      const uniqueSensorEntityIds = [...new Set(allSensorEntityIds.filter(id => typeof id === 'string' && id !== ''))];

      if (uniqueSensorEntityIds.length > 0) {
        logger.log('InventreeCard.tsx', `Dispatching processHassEntities for sensors: ${uniqueSensorEntityIds.join(', ')}`);
        currentDispatch(processHassEntities({ hass: currentHass, entityIds: uniqueSensorEntityIds, logger }));
      } else {
        logger.log('InventreeCard.tsx', 'No InvenTree HASS sensor entities to process.');
      }
      
      // Initialize generic HA entity states
      if (currentConfig.data_sources?.ha_entities && currentConfig.data_sources.ha_entities.length > 0) {
        logger.log('InventreeCard.tsx', `Dispatching initializeGenericHaStatesFromConfig for entities: ${currentConfig.data_sources.ha_entities.join(', ')}`);
        currentDispatch(initializeGenericHaStatesFromConfig({ hass: currentHass, logger }));
      } else {
        logger.log('InventreeCard.tsx', 'No generic HA entities configured in data_sources.ha_entities to process.');
      }

      // Process direct Part PKs
      const directPartPks = currentConfig.data_sources?.inventree_pks;
      if (Array.isArray(directPartPks) && directPartPks.length > 0) {
        const validPks = directPartPks.filter(pk => typeof pk === 'number' && !isNaN(pk));
        if (validPks.length > 0) {
          logger.log('InventreeCard.tsx', `Dispatching fetchPartsByPks for PKs: ${validPks.join(', ')}`);
          currentDispatch(fetchPartsByPks(validPks))
            .then((resultAction: any) => {
              if (fetchPartsByPks.fulfilled.match(resultAction)) {
                const fetchedItems = resultAction.payload as InventreeItem[];
                if (fetchedItems.length > 0) {
                  logger.log('InventreeCard.tsx', `fetchPartsByPks fulfilled. Dispatching addParts for ${fetchedItems.length} items.`);
                  currentDispatch(addParts(fetchedItems)); // Dispatch addParts with the result
                } else {
                  logger.log('InventreeCard.tsx', 'fetchPartsByPks fulfilled, but no items were returned/fetched.');
                }
              } else if (fetchPartsByPks.rejected.match(resultAction)) {
                logger.error('InventreeCard.tsx', 'fetchPartsByPks was rejected:', resultAction.payload || resultAction.error.message);
              }
            })
            .catch((error: any) => {
              logger.error('InventreeCard.tsx', 'Error dispatching/handling fetchPartsByPks:', error);
            });
        } else if (directPartPks.length > 0) {
          logger.warn('InventreeCard.tsx', 'Direct Part PKs configured, but none were valid numbers.', { configuredPks: directPartPks });
        }
      } else {
        logger.log('InventreeCard.tsx', 'No direct Part PKs to process.');
      }

      // Conditional Logic Initialization
      let logicItemsToInitialize: ConditionalLogicItem[] = [];
      if (currentConfig.conditional_logic && currentConfig.conditional_logic.definedLogics && currentConfig.conditional_logic.definedLogics.length > 0) {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Using conditional_logic.definedLogics (ConditionalLogicItem[]).');
        logicItemsToInitialize = currentConfig.conditional_logic.definedLogics;
      } else if (currentConfig.conditional_logic && currentConfig.conditional_logic.rules && currentConfig.conditional_logic.rules.length > 0) {
        // This section is for backward compatibility or if 'rules' (ConditionRuleDefinition[]) is still populated by some means.
        // It needs to be transformed into ConditionalLogicItem[] if we want to use the new thunk.
        // For now, let's log a warning and potentially skip, or attempt a basic transformation.
        logger.warn('InventreeCard.tsx', 'Debounced Effect: Found legacy conditional_logic.rules. These should be migrated to definedLogics (ConditionalLogicItem[]).');
        // Basic transformation (assuming each ConditionRuleDefinition becomes a ConditionalLogicItem with a single rule and effect):
        // This is a very simplified transformation and might not be what users expect if they manually crafted rules.
        // Better to encourage migration to the new editor structure.
        logicItemsToInitialize = (currentConfig.conditional_logic.rules as ConditionRuleDefinition[]).map((ruleDef, index) => ({
            id: `legacy-item-${index}`,
            name: ruleDef.name || `Legacy Item ${index}`,
            conditionRules: { // Create a RuleGroupType with a single rule
                id: `legacy-group-${index}`,
                combinator: 'and',
                rules: [{
                    id: `legacy-rule-${index}`,
                    field: ruleDef.parameter,
                    operator: ruleDef.operator,
                    value: ruleDef.value
                }]
            },
            effects: [ // Create a single EffectDefinition based on old action/action_value
                {
                    id: `legacy-effect-${index}`,
                    type: 'set_style', // This is a guess, map old actions to new types
                    styleProperty: ruleDef.action, // e.g., 'highlight', 'textColor'
                    styleValue: ruleDef.action_value,
                    // isVisible might be derived from action='filter' and action_value='show'/'hide'
                }
            ]
        }));
        if (logicItemsToInitialize.length > 0) {
            logger.log('InventreeCard.tsx', `Transformed ${currentConfig.conditional_logic.rules.length} legacy rules into ${logicItemsToInitialize.length} ConditionalLogicItems for initialization.`);
        }
      } else if (currentConfig.parameters?.conditions && currentConfig.parameters.conditions.length > 0) {
        // Similar legacy handling for parameters.conditions
        logger.warn('InventreeCard.tsx', 'Debounced Effect: Falling back to very legacy parameters.conditions. These should be migrated.');
        logicItemsToInitialize = (currentConfig.parameters.conditions as ConditionRuleDefinition[]).map((ruleDef, index) => ({
            id: `legacy-param-item-${index}`,
            name: ruleDef.name || `Legacy Param Item ${index}`,
            conditionRules: {
                id: `legacy-param-group-${index}`,
                combinator: 'and',
                rules: [{
                    id: `legacy-param-rule-${index}`,
                    field: ruleDef.parameter,
                    operator: ruleDef.operator,
                    value: ruleDef.value
                }]
            },
            effects: [{
                id: `legacy-param-effect-${index}`,
                type: 'set_style', 
                styleProperty: ruleDef.action,
                styleValue: ruleDef.action_value
            }]
        }));
        if (logicItemsToInitialize.length > 0) {
            logger.log('InventreeCard.tsx', `Transformed ${currentConfig.parameters.conditions.length} very legacy parameter conditions into ${logicItemsToInitialize.length} ConditionalLogicItems.`);
        }
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: No conditions/logic items found in new or legacy config for initialization.');
      }

      // Dispatch initializeRuleDefinitionsThunk with ConditionalLogicItem[]
      if (currentConfig.direct_api?.enabled && (currentConfig.parameters?.enabled || currentConfig.conditional_logic)) {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching initializeRuleDefinitionsThunk...', { numLogicItems: logicItemsToInitialize.length });
        currentDispatch(initializeRuleDefinitionsThunk(logicItemsToInitialize));
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Skipping rule definitions initialization (Direct API or Parameters/ConditionalLogic disabled).');
        currentDispatch(initializeRuleDefinitionsThunk([])); // Clear any old state in conditionalLogicSlice
      }

      // Dispatch fetchConfiguredParameters (if API enabled)
      if (currentConfig.direct_api?.enabled) {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching fetchConfiguredParameters...', {
          level: 'info',
          inventreeParametersToFetch: currentConfig.data_sources?.inventreeParametersToFetch || []
        });
        currentDispatch(fetchConfiguredParameters());
      } else {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Skipping fetchConfiguredParameters (Direct API disabled).');
      }

      // After all data fetching and rule initialization, evaluate conditions and apply effects
      if (currentConfig.direct_api?.enabled && (currentConfig.parameters?.enabled || currentConfig.conditional_logic)) {
        logger.log('InventreeCard.tsx', 'Debounced Effect: Dispatching evaluateAndApplyEffectsThunk after initial setup.');
        currentDispatch(evaluateAndApplyEffectsThunk());
      }

    }
  }, debounceTime), [debounceTime, logger]); // logger is stable, debounceTime might change if config reloads

  useEffect(() => {
    // ADD TEMP LOG
    // console.log('[TEMP LOG - InventreeCard.tsx:330]', 'useEffect for debouncedInitializationEffect triggered. HASS available:', !!hass, 'Config available:', !!config);
    debouncedInitializationEffect(hass, config, dispatch);
  }, [hass, config, dispatch, debouncedInitializationEffect]);

  // Idle Render Interval effect
  useEffect(() => {
    if (idleRenderInterval <= 0) return; // Do nothing if interval is zero or negative

    logger.log('InventreeCard.tsx', `Setting up idle render interval: ${idleRenderInterval}ms`);
    const intervalId = setInterval(() => {
      // What to do on idle? 
      // Option 1: Log
      logger.log('InventreeCard.tsx', 'Idle render interval fired.', { interval: idleRenderInterval });
      // Option 2: Dispatch a generic refresh/poll action (if one exists)
      // dispatch({ type: 'system/idlePoll' });
      // Option 3: Force a re-render (use with extreme caution, generally not recommended)
      // setForceUpdate(u => u + 1); // Requires a state: const [forceUpdate, setForceUpdate] = useState(0);
    }, idleRenderInterval);

    return () => {
      logger.log('InventreeCard.tsx', 'Clearing idle render interval.');
      clearInterval(intervalId);
    };
  }, [idleRenderInterval, logger]); // Re-run if interval or logger changes

  // --- Parameter Fetching for Referenced Parameters (e.g., in conditions) ---
  /*
  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;

    const referencedPartIds = new Set<number>();
    config.parameters.conditions.forEach(condition => {
      if (condition.entityId) { 
        // Logic to resolve entityId to partId(s) would go here
      }
    });

    // Fetching is now handled by initializeConditionsAndParameters
    // if (referencedPartIds.size > 0) {
    //   const idsToFetch = Array.from(referencedPartIds);
    //   logger.log('InventreeCard React', 'Dispatching fetchParametersForReferencedParts', { ids: idsToFetch });
    //   dispatch(fetchParametersForReferencedParts(idsToFetch)); 
    // }
  }, [config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);
  */

  // --- Parameter Condition & Action Effects (ALL COMMENTED OUT as related thunks don't exist) ---
  /*
  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;
    logger.log('InventreeCard React', 'Dispatching fetchParametersIfNeeded for conditions');
    dispatch(fetchParametersIfNeeded({ partIds: parts.map(p => p.pk) }));
  }, [parts, config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);

  useEffect(() => {
    if (!config?.parameters?.conditions || !config.parameters.enabled) return;
    parts.forEach(part => {
      config.parameters?.conditions?.forEach(condition => {
        logger.log('InventreeCard React', 'Dispatching applyParameterCondition', { partId: part.pk, condition });
        dispatch(applyParameterCondition({ partId: part.pk, condition }));
      });
    });
  }, [parts, config?.parameters?.conditions, config?.parameters?.enabled, dispatch, logger]);

  useEffect(() => {
    if (!config?.parameters?.enabled) return;
    logger.log('InventreeCard React', 'Dispatching updateParameterFilterVisibility');
    dispatch(updateParameterFilterVisibility());
  }, [parameterLoadingStatus, parameterConditions, config?.parameters?.enabled, dispatch, logger]);

  const handleParameterAction = (partId: number, action: ParameterAction) => {
    logger.log('InventreeCard React', 'Dispatching executeParameterAction', { partId, action });
    dispatch(executeParameterAction({ partId, action }));
  };
  */

  if (!config) {
    // ADD TEMP LOG
    // console.log('[TEMP LOG - InventreeCard.tsx:417]', 'Render: No config, returning "Loading configuration..."');
    return React.createElement('div', null, 'Loading configuration...');
  }
  
  // ADD TEMP LOG
  // console.log('[TEMP LOG - InventreeCard.tsx:422]', 'Render: Config available. view_type:', config.view_type, 'Number of parts:', parts.length, 'Selected Item PK:', selectedItem?.pk);
  
  const renderLayout = () => {
    // Prepare common props
    let commonLayoutProps: any = { hass, config };

    switch (config.view_type) {
      case 'detail':
        // DetailLayout specifically needs selectedPartId
        return React.createElement(DetailLayout, { ...commonLayoutProps, selectedPartId: selectedItem?.pk });
      case 'grid':
        // GridLayout expects all parts and potentially a selected item for a detail panel (if any)
        return React.createElement(GridLayout, { ...commonLayoutProps, parts, item: selectedItem });
      case 'list':
        // ListLayout expects all parts and potentially a selected item
        return React.createElement(ListLayout, { ...commonLayoutProps, parts, item: selectedItem });
      case 'parts':
        // PartsLayout expects all parts
        return React.createElement(PartsLayout, { ...commonLayoutProps, parts });
      case 'variants':
        // VariantLayout expects the specific template part (selectedItem) and all parts for context if needed
        return React.createElement(VariantLayout, { ...commonLayoutProps, item: selectedItem, parts });
      default:
        logger.warn('InventreeCard.tsx', `Unknown view_type: ${config.view_type}. Defaulting to Detail view or placeholder.`);
        return React.createElement('div', null, `Unknown view_type: ${config.view_type}. Please configure a valid view.`);
    }
  };

  return (
    <div style={{ padding: '16px', border: '2px solid navy' }}>
      <h1 style={{ marginTop: 0, marginBottom: '8px' }}>InvenTree Card (React)</h1>
      <p style={{ fontSize: '12px', color: '#555', marginTop:0, marginBottom: '16px' }}>
        Config Entity: {config.entity || 'N/A'} | View: {config.view_type || 'N/A'} | Parts in Store for Config: {parts.length} | Selected Item PK: {selectedItem?.pk || 'N/A'}
      </p>
      {renderLayout()}
    </div>
  );
};

export default InventreeCard; 