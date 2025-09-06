import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { RootState, store } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import { InventreeCardConfig, DirectApiConfig, ViewType, DisplayConfig, StyleConfig, InteractionsConfig, ConditionalLogicConfig, ParameterDetail, DataSourceConfig, RuleGroupType, LayoutConfig, ActionDefinition, InventreeParameterFetchConfig, ThumbnailOverride, LogQuery, InventreeItem } from '../../types';
import { inventreeApi } from '../../store/apis/inventreeApi';
import { selectCombinedParts } from '../../store/slices/partsSlice';

// Import sections
import InventreeHassSensorsSection from './InventreeHassSensorsSection';
import HaEntitiesSection from './HaEntitiesSection';
import InventreePkSection from './InventreePkSection';
import InventreeParametersToFetchSection from './InventreeParametersToFetchSection';
import InventreeApiConfigSection from './InventreeApiConfigSection';
import LayoutSelectionSection from './LayoutSelectionSection';
import ConfigurableActionsSection from './ConfigurableActionsSection';
import ConditionalLogicSection from './ConditionalLogicSection';
import LoggingSettingsSection from './LoggingSettingsSection';
import ThemeToggleSection from './ThemeToggleSection';

ConditionalLoggerEngine.getInstance().registerCategory('InventreeCardEditor', { enabled: true, level: 'info' });

const CARD_NAME = 'inventree-card';

export interface InventreeCardEditorProps {
  hass: HomeAssistant;
  lovelace?: LovelaceCardEditor;
  config?: InventreeCardConfig;
  cardInstanceId: string;
  onConfigChanged: (config: InventreeCardConfig) => void;
  dispatch: (action: any) => void;
}

// Default empty rule group for conditional logic initialization
const defaultRuleGroup: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [],
  not: false
};

const InventreeCardEditor: React.FC<InventreeCardEditorProps> = ({ hass, lovelace, config: initialConfig, cardInstanceId, onConfigChanged, dispatch }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('InventreeCardEditor', cardInstanceId);
  }, [cardInstanceId]);
  
  const [activeTab, setActiveTab] = useState('data');
  const allParts = useSelector((state: RootState) => selectCombinedParts(state, cardInstanceId));
  
  const currentEditorConfig = useMemo<Partial<InventreeCardConfig>>(() => {
    // 🚀 UNIFIED SOURCE OF TRUTH: Always derive from the incoming prop
    const baseConfig = initialConfig || {};
    console.log('📋 EDITOR: Using config source:', baseConfig);
    
    // Create a deep copy to ensure we don't mutate the original
    const config = JSON.parse(JSON.stringify(baseConfig));
    
    // --- MIGRATION LOGIC ---
    // This handles migrating the old top-level 'columns' to the new 'layout.columns'.
    if ((config as any).columns && Array.isArray((config as any).columns)) {
      if (!config.layout) {
        config.layout = {};
      }
      // This check is flawed; we should just remove it. Aggressive cleanup below handles it.
    }
    
    // 🚀AGGRESSIVE CLEANUP: Remove ALL other known legacy and obsolete properties
    // This prevents ambiguous configs from being sent to Lovelace, which causes it to
    // destroy and recreate the card preview.
    delete (config as any).grid_options;
    delete (config as any).columns; // Always remove top-level columns
    
    if (config.layout) {
      delete (config.layout as any).legacy_columns;
      delete (config.layout as any).grid_spacing;
      delete (config.layout as any).item_height;
      delete (config.layout as any).part_overrides;
      delete (config.layout as any).columns; // Also remove from layout object
      
      // Scrub obsolete 'width' property from columns
      // This is now also obsolete since layout.columns itself is obsolete
      
      // Migrate legacy 'row_height' to 'rowHeight' and remove it
      if ((config.layout as any).row_height !== undefined) {
        config.layout.rowHeight = (config.layout as any).row_height;
        delete (config.layout as any).row_height;
      }
      // Remove the obsolete 'layouts' object
      if ((config.layout as any).layouts !== undefined) {
        delete (config.layout as any).layouts;
      }
    }

    // This deep-fills the config with defaults to prevent render errors
    config.data_sources = {
      inventree_hass_sensors: config.data_sources?.inventree_hass_sensors || [],
      ha_entities: config.data_sources?.ha_entities || [],
      inventree_pks: config.data_sources?.inventree_pks || [],
      inventree_parameters: config.data_sources?.inventree_parameters || [],
      inventree_parameters_to_fetch: config.data_sources?.inventree_parameters_to_fetch || [],
      inventree_pk_thumbnail_overrides: config.data_sources?.inventree_pk_thumbnail_overrides || [],
    };
    config.direct_api = config.direct_api || { enabled: false, url: '', api_key: '' };
    config.layout = config.layout || {};
    config.display = config.display || { show_header: true, show_image: true, show_name: true, show_stock: true };
    config.style = config.style || { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 };
    config.interactions = config.interactions || { buttons: [] };
    config.actions = config.actions || [];
    config.conditional_logic = config.conditional_logic || { definedLogics: [] };
    config.logging = config.logging || { queries: [] };
    return config;
  }, [initialConfig, logger]);

  // Fetch parts data when the editor is first loaded
  useEffect(() => {
    const partIdsToFetch = currentEditorConfig.data_sources?.inventree_pks || [];
    partIdsToFetch.forEach((pk: number) => {
      dispatch(inventreeApi.endpoints.getPart.initiate({ pk, cardInstanceId }));
    });
  }, [dispatch, cardInstanceId, currentEditorConfig.data_sources?.inventree_pks]);

  // Correctly get all parameter values from the store using RootState
  const allParameterValues = useSelector<RootState, Record<number, Record<string, ParameterDetail>>>(
    (state) => state.parameters.parameterValues 
  );

  const handleConfigChanged = useCallback((newConfig: Partial<InventreeCardConfig>) => {
    logger.debug('handleConfigChanged', 'Editor config changed.', { newConfig });
    console.log('🔄 EDITOR: Config changed, firing onConfigChanged:', newConfig);
    onConfigChanged(newConfig as InventreeCardConfig);
  }, [onConfigChanged, logger]);

  // Simplified handler
  const handleConfigPartChanged = useCallback((key: keyof InventreeCardConfig, value: any) => {
    handleConfigChanged({
      ...currentEditorConfig,
      [key]: value,
    });
  }, [currentEditorConfig, handleConfigChanged]);

  const handleDataSourcesChanged = useCallback((newDataSources: DataSourceConfig) => {
    handleConfigChanged({
      ...currentEditorConfig,
      data_sources: newDataSources,
    });
  }, [currentEditorConfig, handleConfigChanged]);

  const handleInventreeHassSensorsChanged = useCallback((newSensors: string[]) => {
    handleDataSourcesChanged({
      ...(currentEditorConfig.data_sources || {}),
      inventree_hass_sensors: newSensors,
    } as DataSourceConfig);
  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleHaEntitiesChanged = useCallback((newEntities: string[]) => {
    handleDataSourcesChanged({
      ...(currentEditorConfig.data_sources || {}),
      ha_entities: newEntities,
    } as DataSourceConfig);
  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleInventreePksChanged = useCallback((newPks: number[]) => {
    handleDataSourcesChanged({
      ...(currentEditorConfig.data_sources || {}),
      inventree_pks: newPks,
    } as DataSourceConfig);
  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleInventreePkThumbnailOverridesChanged = useCallback((newOverrides: ThumbnailOverride[]) => {
    handleDataSourcesChanged({
      ...(currentEditorConfig.data_sources || {}),
      inventree_pk_thumbnail_overrides: newOverrides,
    } as DataSourceConfig);
  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleInventreeParametersToFetchChanged = useCallback((newFetchConfigs: InventreeParameterFetchConfig[]) => {
    const updatedDataSources: DataSourceConfig = {
      ...(currentEditorConfig.data_sources || {}),
      inventree_parameters_to_fetch: newFetchConfigs,
    };
    handleDataSourcesChanged(updatedDataSources);
  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleDirectApiConfigChanged = useCallback((newApiConfig: DirectApiConfig) => {
    handleConfigPartChanged('direct_api', newApiConfig);
  }, [handleConfigPartChanged]);

  const handleLayoutConfigChanged = useCallback((newLayoutConfig: LayoutConfig) => {
    handleConfigPartChanged('layout', newLayoutConfig);
  }, [handleConfigPartChanged]);

  const handleDisplayConfigChanged = useCallback((newDisplayConfig: DisplayConfig) => {
    handleConfigPartChanged('display', newDisplayConfig);
  }, [handleConfigPartChanged]);

  const handleStyleConfigChanged = useCallback((newStyleConfig: StyleConfig) => {
    handleConfigPartChanged('style', newStyleConfig);
  }, [handleConfigPartChanged]);

  const handleInteractionsConfigChanged = useCallback((newInteractionsConfig: InteractionsConfig) => {
    handleConfigPartChanged('interactions', newInteractionsConfig);
  }, [handleConfigPartChanged]);

  const handleActionsChanged = useCallback((newActions: ActionDefinition[]) => {
    handleConfigPartChanged('actions', newActions);
  }, [handleConfigPartChanged]);

  const handleConditionalLogicConfigChanged = useCallback((newConditionalLogicConfig: ConditionalLogicConfig) => {
    handleConfigPartChanged('conditional_logic', newConditionalLogicConfig);
  }, [handleConfigPartChanged]);

  const handleQueriesChanged = useCallback((newQueries: LogQuery[]) => {
    handleConfigPartChanged('logging', { ...currentEditorConfig.logging, queries: newQueries });
  }, [handleConfigPartChanged, currentEditorConfig.logging]);

  if (!hass) {
    return <p>Loading Home Assistant...</p>;
  }

  return (
    <div className="inventree-card-editor">
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '16px' }}>
        <button style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'data' ? '#eee' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('data')}>Data Sources</button>
        <button style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'layout' ? '#eee' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('layout')}>Layout</button>
        <button style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'appearance' ? '#eee' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('appearance')}>Appearance</button>
        <button style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'actions' ? '#eee' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('actions')}>Actions & Logic</button>
        <button style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'debugging' ? '#eee' : 'transparent', cursor: 'pointer' }} onClick={() => setActiveTab('debugging')}>Debugging</button>
      </div>

      {activeTab === 'data' && (
        <>
          <InventreeApiConfigSection
            hass={hass}
            directApiConfig={currentEditorConfig.direct_api!}
            onDirectApiConfigChanged={handleDirectApiConfigChanged}
          />
          <InventreePkSection 
            selectedPks={currentEditorConfig.data_sources?.inventree_pks || []}
            thumbnailOverrides={currentEditorConfig.data_sources?.inventree_pk_thumbnail_overrides || []}
            onPksChanged={handleInventreePksChanged}
            onThumbnailOverridesChanged={handleInventreePkThumbnailOverridesChanged}
          />
          <InventreeHassSensorsSection
            selectedSensors={currentEditorConfig.data_sources?.inventree_hass_sensors || []}
            onSensorsChanged={handleInventreeHassSensorsChanged}
            hass={hass}
          />
          <HaEntitiesSection
            selectedEntities={currentEditorConfig.data_sources?.ha_entities || []}
            onEntitiesChanged={handleHaEntitiesChanged}
            hass={hass}
          />
          <InventreeParametersToFetchSection
            parameterFetchConfigs={currentEditorConfig.data_sources?.inventree_parameters_to_fetch || []}
            onFetchConfigsChanged={handleInventreeParametersToFetchChanged}
          />
        </>
      )}

      {activeTab === 'layout' && (
        <LayoutSelectionSection
          layoutConfig={currentEditorConfig.layout!}
          onLayoutConfigChanged={handleLayoutConfigChanged}
          actions={currentEditorConfig.actions || []}
          parts={allParts}
          cardInstanceId={cardInstanceId}
        />
      )}

      {activeTab === 'appearance' && (
        <>
          <ThemeToggleSection />
        </>
      )}

      {activeTab === 'actions' && (
        <>
          <ConfigurableActionsSection 
            hass={hass}
            actions={currentEditorConfig.actions || []}
            onActionsChanged={handleActionsChanged}
          />
          <ConditionalLogicSection
            conditionalLogicConfig={currentEditorConfig.conditional_logic!}
            onConfigChanged={handleConditionalLogicConfigChanged}
            configuredDataSources={currentEditorConfig.data_sources}
            hass={hass}
            directApiConfig={currentEditorConfig.direct_api}
            allParameterValues={allParameterValues}
            cardInstanceId={cardInstanceId}
            parts={allParts}
            cells={currentEditorConfig.layout?.cells || []}
          />
        </>
      )}

      {activeTab === 'debugging' && (
        <LoggingSettingsSection 
          cardInstanceId={cardInstanceId}
          queries={currentEditorConfig.logging?.queries || []}
          onQueriesChanged={handleQueriesChanged}
        />
      )}
    </div>
  );
};

export default InventreeCardEditor; 