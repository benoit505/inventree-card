import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { RootState, store } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import { InventreeCardConfig, DirectApiConfig, ViewType, DisplayConfig, StyleConfig, InteractionsConfig, ConditionalLogicConfig, ParameterDetail, DataSourceConfig, RuleGroupType, LayoutConfig, ActionDefinition, InventreeParameterFetchConfig, ThumbnailOverride, LogQuery } from '../../types';

// Import sections
import InventreeHassSensorsSection from './InventreeHassSensorsSection';
import HaEntitiesSection from './HaEntitiesSection';
import InventreePkSection from './InventreePkSection';
import InventreeParametersToFetchSection from './InventreeParametersToFetchSection';
import InventreeApiConfigSection from './InventreeApiConfigSection';
import LayoutSelectionSection from './LayoutSelectionSection';
import ElementVisibilitySection from './ElementVisibilitySection';
import CardStylingSection from './CardStylingSection';
import ConfigurableActionsSection from './ConfigurableActionsSection';
import ConditionalLogicSection from './ConditionalLogicSection';
import LoggingSettingsSection from './LoggingSettingsSection';

ConditionalLoggerEngine.getInstance().registerCategory('InventreeCardEditor', { enabled: true, level: 'info' });

const CARD_NAME = 'inventree-card';

export interface InventreeCardEditorProps {
  hass: HomeAssistant;
  lovelace?: LovelaceCardEditor;
  config?: InventreeCardConfig;
  cardInstanceId: string;
  onConfigChanged: (config: InventreeCardConfig) => void;
}

// Default empty rule group for conditional logic initialization
const defaultRuleGroup: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [],
  not: false
};

const InventreeCardEditor: React.FC<InventreeCardEditorProps> = ({ hass, lovelace, config: initialConfig, cardInstanceId, onConfigChanged }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('InventreeCardEditor', cardInstanceId);
  }, [cardInstanceId]);
  
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('data');
  
  // Correctly get all parameter values from the store using RootState
  const allParameterValues = useSelector<RootState, Record<number, Record<string, ParameterDetail>>>(
    (state) => state.parameters.parameterValues 
  );

  const currentEditorConfig = useMemo<Partial<InventreeCardConfig>>(() => {
    // Lovelace freezes the config object. We must create a deep, mutable clone
    // to run migrations and allow for editing.
    const config = JSON.parse(JSON.stringify(initialConfig || {}));

    // --- MIGRATION LOGIC ---
    // This handles migrating the old top-level 'columns' to the new 'layout.columns'.
    if (config.columns && Array.isArray(config.columns)) {
      if (!config.layout) {
        config.layout = {};
      }
      if (!config.layout.columns || config.layout.columns.length === 0) {
        config.layout.columns = config.columns;
        logger.info('Migration', 'Migrated legacy `columns` to `layout.columns`');
      }
      // Delete the legacy property to prevent confusion
      delete config.columns;
    }

    if (config.layout) {
      // Scrub obsolete 'width' property from columns
      if (Array.isArray(config.layout.columns)) {
        config.layout.columns = config.layout.columns.map((c: any) => {
          if (c.width === undefined) {
            return c;
          }
          const { width, ...rest } = c;
          return rest;
        });
      }
      // Migrate legacy 'row_height' to 'rowHeight' and remove it
      if (config.layout.row_height !== undefined) {
        config.layout.rowHeight = config.layout.row_height;
        delete config.layout.row_height;
      }
      // Remove the obsolete 'layouts' object
      if (config.layout.layouts !== undefined) {
        delete config.layout.layouts;
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
    config.layout = config.layout || { viewType: 'detail' };
    config.display = config.display || { show_header: true, show_image: true, show_name: true, show_stock: true };
    config.style = config.style || { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 };
    config.interactions = config.interactions || { buttons: [] };
    config.actions = config.actions || [];
    config.conditional_logic = config.conditional_logic || { definedLogics: [] };
    config.logging = config.logging || { queries: [] };
    return config;
  }, [initialConfig]);

  const handleConfigChanged = useCallback((newConfig: Partial<InventreeCardConfig>) => {
    logger.debug('handleConfigChanged', 'Editor config changed.', { newConfig });
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
        />
      )}

      {activeTab === 'appearance' && (
        <>
          <ElementVisibilitySection
            displayConfig={currentEditorConfig.display!}
            onDisplayConfigChanged={handleDisplayConfigChanged}
            definedLogics={currentEditorConfig.conditional_logic?.definedLogics || []}
          />
          <CardStylingSection
            styleConfig={currentEditorConfig.style!}
            onStyleConfigChanged={handleStyleConfigChanged}
          />
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