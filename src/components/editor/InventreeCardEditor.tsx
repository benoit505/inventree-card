import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { Logger } from '../../utils/logger';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { InventreeCardConfig, DirectApiConfig, ViewType, DisplayConfig, StyleConfig, InteractionsConfig, ConditionalLogicConfig, ParameterDetail, DataSourceConfig, RuleGroupType, LayoutConfig, ActionDefinition, InventreeParameterFetchConfig, ThumbnailOverride } from '../../types';

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

const logger = Logger.getInstance();
const CARD_NAME = 'inventree-card';

export interface InventreeCardEditorProps {
  hass: HomeAssistant;
  lovelace?: LovelaceCardEditor;
  config?: InventreeCardConfig;
  onConfigChanged: (config: InventreeCardConfig) => void;
}

// Default empty rule group for conditional logic initialization
const defaultRuleGroup: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [],
  not: false
};

const InventreeCardEditor: React.FC<InventreeCardEditorProps> = ({ hass, lovelace, config: initialConfig, onConfigChanged }) => {
  const [currentEditorConfig, setCurrentEditorConfig] = useState<Partial<InventreeCardConfig>>(initialConfig || {});
  
  // Correctly get all parameter values from the store using RootState
  const allParameterValues = useSelector<RootState, Record<number, Record<string, ParameterDetail>>>(
    (state) => state.parameters.parameterValues 
  );

  useEffect(() => {
    logger.log('Editor:Main', 'Editor mounted or initialConfig changed', { initialConfig });
    setCurrentEditorConfig(prevConfig => {
      const updatedConfig: Partial<InventreeCardConfig> = { ...prevConfig, ...initialConfig };
      
      updatedConfig.data_sources = {
        inventree_hass_sensors: updatedConfig.data_sources?.inventree_hass_sensors || [],
        ha_entities: updatedConfig.data_sources?.ha_entities || [],
        inventree_pks: updatedConfig.data_sources?.inventree_pks || [],
        inventree_parameters: updatedConfig.data_sources?.inventree_parameters || [],
        inventree_parameters_to_fetch: updatedConfig.data_sources?.inventree_parameters_to_fetch || [],
        inventree_pk_thumbnail_overrides: updatedConfig.data_sources?.inventree_pk_thumbnail_overrides || [],
      };

      if (!updatedConfig.direct_api) {
        updatedConfig.direct_api = { enabled: false, url: '', api_key: '' };
      }
      if (!updatedConfig.layout) {
        updatedConfig.layout = { viewType: 'detail' };
      }
      if (!updatedConfig.view_type && updatedConfig.layout?.viewType) {
        updatedConfig.view_type = updatedConfig.layout.viewType;
      } else if (!updatedConfig.view_type) {
        updatedConfig.view_type = 'detail';
      }
      if (!updatedConfig.columns && updatedConfig.layout?.columns) updatedConfig.columns = updatedConfig.layout.columns;
      if (!updatedConfig.grid_spacing && updatedConfig.layout?.grid_spacing) updatedConfig.grid_spacing = updatedConfig.layout.grid_spacing;
      if (!updatedConfig.item_height && updatedConfig.layout?.item_height) updatedConfig.item_height = updatedConfig.layout.item_height;
      if (!updatedConfig.display) {
        updatedConfig.display = { show_header: true, show_image: true, show_name: true, show_stock: true };
      }
      if (!updatedConfig.style) {
        updatedConfig.style = { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 };
      }
      if (!updatedConfig.interactions) {
        updatedConfig.interactions = { buttons: [] };
      }
      if (!updatedConfig.actions) {
        updatedConfig.actions = [];
      }
      if (!updatedConfig.conditional_logic) {
        updatedConfig.conditional_logic = { definedLogics: [] };
      } else if (!updatedConfig.conditional_logic.definedLogics) {
        updatedConfig.conditional_logic.definedLogics = [];
      }

      return updatedConfig;
    });
  }, [initialConfig]); // Removed logger from dependencies as it's a stable instance

  const handleConfigPartChanged = useCallback(<K extends keyof InventreeCardConfig>(key: K, value: InventreeCardConfig[K]) => {
    setCurrentEditorConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      onConfigChanged(newConfig as InventreeCardConfig); 
      return newConfig;
    });
  }, [onConfigChanged]);

  const handleDataSourcesChanged = useCallback((newDataSources: DataSourceConfig) => {
    setCurrentEditorConfig(prev => {
      const newConfig = { 
        ...prev,
        data_sources: newDataSources,
      };
      onConfigChanged(newConfig as InventreeCardConfig);
      logger.log('Editor:Main', 'Updated data_sources in config', { data_sources: newConfig.data_sources });
      return newConfig;
    });
  }, [onConfigChanged]);

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
    logger.log('Editor:Main', 'Received updated InventreeParameterFetchConfig list', { configs: newFetchConfigs });
    
    const currentDataSources = currentEditorConfig.data_sources || {};
    const updatedDataSources: DataSourceConfig = {
      ...currentDataSources,
      inventree_parameters_to_fetch: newFetchConfigs,
      // inventree_parameters: [], // Optionally clear or manage the old string array if it's purely for this section's input
    };
    handleDataSourcesChanged(updatedDataSources);

  }, [currentEditorConfig.data_sources, handleDataSourcesChanged]);

  const handleDirectApiConfigChanged = useCallback((newApiConfig: DirectApiConfig) => {
    handleConfigPartChanged('direct_api', newApiConfig);
  }, [handleConfigPartChanged]);

  const handleLayoutConfigChanged = useCallback((newLayoutConfig: LayoutConfig) => {
    setCurrentEditorConfig(prev => {
        // This function now receives the entire layout object,
        // which could include updates to viewType, columns, etc.
        const newConfig = { 
            ...prev,
            // Persist the whole layout object
            layout: newLayoutConfig,
            // Also update legacy top-level fields for compatibility for now
            view_type: newLayoutConfig.viewType,
            columns: newLayoutConfig.legacy_columns,
            grid_spacing: newLayoutConfig.grid_spacing,
            item_height: newLayoutConfig.item_height,
        };
        onConfigChanged(newConfig as InventreeCardConfig);
        return newConfig;
    });
  }, [onConfigChanged]);

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

  if (!hass) {
    return <p>Loading Home Assistant...</p>;
  }

  // Provide default values for currentEditorConfig to prevent errors during rendering if some parts are undefined
  const editorData: Partial<InventreeCardConfig> = useMemo(() => ({
    name: currentEditorConfig.name || '',
    entity: currentEditorConfig.entity || '',
    type: currentEditorConfig.type || CARD_NAME,
    view_type: currentEditorConfig.view_type || 'detail',
    columns: currentEditorConfig.columns,
    grid_spacing: currentEditorConfig.grid_spacing,
    item_height: currentEditorConfig.item_height,
    data_sources: {
        inventree_hass_sensors: currentEditorConfig.data_sources?.inventree_hass_sensors || [],
        ha_entities: currentEditorConfig.data_sources?.ha_entities || [],
        inventree_pks: currentEditorConfig.data_sources?.inventree_pks || [],
        inventree_parameters: currentEditorConfig.data_sources?.inventree_parameters || [],
        inventree_parameters_to_fetch: currentEditorConfig.data_sources?.inventree_parameters_to_fetch || [],
        inventree_pk_thumbnail_overrides: currentEditorConfig.data_sources?.inventree_pk_thumbnail_overrides || [],
    },
    direct_api: currentEditorConfig.direct_api || { enabled: false, url: '', api_key: '' },
    layout: currentEditorConfig.layout || { viewType: 'detail' }, 
    display: currentEditorConfig.display || { show_header: true, show_image: true, show_name: true, show_stock: true },
    style: currentEditorConfig.style || { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 },
    interactions: currentEditorConfig.interactions || { buttons: [] },
    actions: currentEditorConfig.actions || [],
    conditional_logic: currentEditorConfig.conditional_logic || { definedLogics: [] },
  }), [currentEditorConfig]);


  return (
    <div className="inventree-card-editor">
      <h2>InvenTree Card Configuration (React Editor)</h2>

      {/* Data Sources Section */}
      <section className="editor-section">
        <h3>Data Sources</h3>
        <InventreeHassSensorsSection 
          hass={hass}
          selectedSensors={editorData.data_sources?.inventree_hass_sensors || []}
          onSensorsChanged={handleInventreeHassSensorsChanged}
        />
        <HaEntitiesSection
          hass={hass}
          selectedEntities={editorData.data_sources?.ha_entities || []}
          onEntitiesChanged={handleHaEntitiesChanged}
        />
        <InventreePkSection
          hass={hass}
          selectedPks={editorData.data_sources?.inventree_pks || []}
          onPksChanged={handleInventreePksChanged}
          thumbnailOverrides={editorData.data_sources?.inventree_pk_thumbnail_overrides || []}
          onThumbnailOverridesChanged={handleInventreePkThumbnailOverridesChanged}
        />
        <InventreeParametersToFetchSection
          hass={hass}
          parameterFetchConfigs={editorData.data_sources?.inventree_parameters_to_fetch || []}
          onFetchConfigsChanged={handleInventreeParametersToFetchChanged}
        />
        <InventreeApiConfigSection
          hass={hass} 
          directApiConfig={editorData.direct_api}
          onDirectApiConfigChanged={handleDirectApiConfigChanged}
        />
      </section>

      {/* Presentation Section */}
      <section className="editor-section">
        <h3>Presentation</h3>
        <LayoutSelectionSection 
          hass={hass}
          layoutConfig={editorData.layout}
          onLayoutConfigChanged={handleLayoutConfigChanged}
          actions={editorData.actions || []}
        />
        <ElementVisibilitySection 
          displayConfig={editorData.display}
          onDisplayConfigChanged={handleDisplayConfigChanged}
          definedLogics={editorData.conditional_logic?.definedLogics || []}
        />
        <CardStylingSection 
          styleConfig={editorData.style} 
          onStyleConfigChanged={handleStyleConfigChanged} 
        />
      </section>

      {/* Interactions (now Actions) Section */}
      <section className="editor-section">
        <h3>Actions (Triggers & Operations)</h3>
        <ConfigurableActionsSection
          hass={hass}
          actions={editorData.actions}
          onActionsChanged={handleActionsChanged}
        />
      </section>

      {/* Conditional Logic Section */}
      <section className="editor-section">
        <h3>Conditional Logic</h3>
        <ConditionalLogicSection
          conditionalLogicConfig={editorData.conditional_logic} // This is { definedLogics: ... }
          onConfigChanged={handleConditionalLogicConfigChanged} // Expects { definedLogics: ... }
          configuredDataSources={editorData.data_sources}
          hass={hass}
          directApiConfig={editorData.direct_api}
          allParameterValues={allParameterValues} 
        />
      </section>

      {/* System Settings Section - Placeholder */}
      <section className="editor-section">
        <h3>System Settings</h3>
        <p>Performance, caching, and advanced debug settings will go here.</p>
      </section>

      <details>
        <summary>Current Editor Configuration State (Debug)</summary>
        <pre style={{ fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(editorData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default InventreeCardEditor; 