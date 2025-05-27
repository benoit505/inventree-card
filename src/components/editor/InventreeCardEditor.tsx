import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { Logger } from '../../utils/logger';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { InventreeCardConfig, DirectApiConfig, ViewType, DisplayConfig, StyleConfig, InteractionsConfig, ConditionalLogicConfig, ParameterDetail, DataSourceConfig, RuleGroupType, LayoutConfig } from '../../types';

// Import sections
import InventreeHassSensorsSection from './InventreeHassSensorsSection';
import HaEntitiesSection from './HaEntitiesSection';
import InventreePkSection from './InventreePkSection';
import InventreeParametersSection from './InventreeParametersSection';
import InventreeApiConfigSection from './InventreeApiConfigSection';
import LayoutSelectionSection, { LayoutOptions } from './LayoutSelectionSection';
import ElementVisibilitySection from './ElementVisibilitySection';
import CardStylingSection from './CardStylingSection';
import InteractionsConfigSection from './InteractionsConfigSection';
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
      
      if (!updatedConfig.data_sources) {
        updatedConfig.data_sources = {
          inventree_hass_sensors: [],
          ha_entities: [],
          inventree_pks: [],
          inventree_parameters: [],
        };
      }
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
      // Ensure conditional_logic and its definedLogics array are initialized
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

  const handleDataSourceSubKeyChanged = useCallback(<S extends keyof DataSourceConfig>(
    subKey: S,
    value: DataSourceConfig[S]
  ) => {
    setCurrentEditorConfig(prev => {
      const newConfig = { 
        ...prev,
        data_sources: {
          ...(prev.data_sources || {}),
          [subKey]: value,
        } as DataSourceConfig, // Ensure type correctness
      };
      onConfigChanged(newConfig as InventreeCardConfig);
      return newConfig;
    });
  }, [onConfigChanged]);

  const handleInventreeHassSensorsChanged = useCallback((newSensors: string[]) => {
    handleDataSourceSubKeyChanged('inventree_hass_sensors', newSensors);
  }, [handleDataSourceSubKeyChanged]);

  const handleHaEntitiesChanged = useCallback((newEntities: string[]) => {
    handleDataSourceSubKeyChanged('ha_entities', newEntities);
  }, [handleDataSourceSubKeyChanged]);

  const handleInventreePksChanged = useCallback((newPks: number[]) => {
    handleDataSourceSubKeyChanged('inventree_pks', newPks);
  }, [handleDataSourceSubKeyChanged]);

  const handleInventreeParametersChanged = useCallback((newParameters: string[]) => {
    handleDataSourceSubKeyChanged('inventree_parameters', newParameters);
  }, [handleDataSourceSubKeyChanged]);

  const handleDirectApiConfigChanged = useCallback((newApiConfig: DirectApiConfig) => {
    handleConfigPartChanged('direct_api', newApiConfig);
  }, [handleConfigPartChanged]);

  const handleLayoutConfigChanged = useCallback((newViewType: ViewType, newLayoutOptions: LayoutOptions) => {
    setCurrentEditorConfig(prev => {
        const updatedLayout: LayoutConfig = { 
            viewType: newViewType,
            columns: newLayoutOptions.columns ?? prev.layout?.columns,
            grid_spacing: newLayoutOptions.grid_spacing ?? prev.layout?.grid_spacing,
            item_height: newLayoutOptions.item_height ?? prev.layout?.item_height,
        };

        const newConfig = { 
            ...prev, 
            view_type: newViewType,
            columns: newLayoutOptions.columns ?? prev.columns,
            grid_spacing: newLayoutOptions.grid_spacing ?? prev.grid_spacing,
            item_height: newLayoutOptions.item_height ?? prev.item_height,
            layout: updatedLayout,
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

  const handleConditionalLogicConfigChanged = useCallback((newConditionalLogicConfig: ConditionalLogicConfig) => {
    // This now expects { definedLogics: ConditionalLogicItem[] }
    handleConfigPartChanged('conditional_logic', newConditionalLogicConfig);
  }, [handleConfigPartChanged]);

  if (!hass) {
    return <p>Loading Home Assistant...</p>;
  }

  // Provide default values for currentEditorConfig to prevent errors during rendering if some parts are undefined
  const editorData = useMemo(() => ({
    name: currentEditorConfig.name || '',
    entity: currentEditorConfig.entity || '',
    type: currentEditorConfig.type || CARD_NAME,
    view_type: currentEditorConfig.view_type || 'detail',
    columns: currentEditorConfig.columns,
    grid_spacing: currentEditorConfig.grid_spacing,
    item_height: currentEditorConfig.item_height,
    data_sources: currentEditorConfig.data_sources || { inventree_hass_sensors: [], ha_entities: [], inventree_pks: [], inventree_parameters: [] },
    direct_api: currentEditorConfig.direct_api || { enabled: false, url: '', api_key: '' },
    layout: currentEditorConfig.layout || { viewType: 'detail' }, 
    display: currentEditorConfig.display || { show_header: true, show_image: true, show_name: true, show_stock: true },
    style: currentEditorConfig.style || { background: 'var(--ha-card-background, var(--card-background-color, white))', spacing: 8, image_size: 50 },
    interactions: currentEditorConfig.interactions || { buttons: [] },
    conditional_logic: currentEditorConfig.conditional_logic || { definedLogics: [] }, // Ensure this matches ConditionalLogicConfig structure
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
          selectedPks={editorData.data_sources?.inventree_pks || []}
          onPksChanged={handleInventreePksChanged}
        />
        <InventreeParametersSection
          selectedParameters={editorData.data_sources?.inventree_parameters || []}
          onParametersChanged={handleInventreeParametersChanged}
        />
        <InventreeApiConfigSection
          hass={hass} 
          directApiConfig={editorData.direct_api}
          onDirectApiConfigChanged={handleDirectApiConfigChanged}
        />
      </section>

      {/* Presentation (Layout & Display) Section */}
      <section className="editor-section">
        <h3>Presentation</h3>
        <LayoutSelectionSection 
          viewType={editorData.view_type}
          layoutOptions={{
            columns: editorData.columns,
            grid_spacing: editorData.grid_spacing,
            item_height: editorData.item_height,
          }}
          onLayoutConfigChanged={handleLayoutConfigChanged}
        />
        <ElementVisibilitySection 
          displayConfig={editorData.display} 
          onDisplayConfigChanged={handleDisplayConfigChanged} 
        />
        <CardStylingSection 
          styleConfig={editorData.style} 
          onStyleConfigChanged={handleStyleConfigChanged} 
        />
      </section>

      {/* Interactions Section */}
      <section className="editor-section">
        <h3>Interactions (Actions)</h3>
        <InteractionsConfigSection
          hass={hass}
          interactionsConfig={editorData.interactions}
          onInteractionsConfigChanged={handleInteractionsConfigChanged}
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