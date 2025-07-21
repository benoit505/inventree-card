import * as React from 'react';
import { useMemo } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, ProcessedVariant, InventreeItem } from '../../types';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { VariantHandler } from '../common/variant-handler'; // Assuming this is now a .ts file with exported functions

// Import child React components
import PartThumbnail from './PartThumbnail';
import PartView from './PartView'; // Assuming PartView can now take partId or partData

interface PartVariantProps {
  variant?: ProcessedVariant;
  config?: InventreeCardConfig;
  hass?: HomeAssistant;
  cardInstanceId?: string;
}

// Basic styling (can be expanded or moved to CSS modules/files)
const styles = {
  // Grid View
  variantGrid: { display: 'flex', flexDirection: 'column' as 'column', gap: '16px', padding: '8px' },
  variantTemplateGrid: { borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' },
  templateDetailsGrid: { display: 'flex', gap: '16px', alignItems: 'center' },
  templateInfoGrid: { flexGrow: 1 },
  templateStockGrid: { fontWeight: 'bold' as 'bold' },
  variantsContainerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  variantItemGrid: { border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' },

  // List View
  variantList: { padding: '8px' },
  variantTemplateList: { marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #eee' },
  templateHeaderList: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  templateStockList: { fontSize: '0.9em', color: '#555' },
  variantsListContainer: { marginTop: '8px' },
  variantListHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 3fr', fontWeight: 'bold' as 'bold', padding: '4px 0', borderBottom: '1px solid #ccc' },
  variantNameHeader: { paddingLeft: '30px' /* Space for thumbnail */ }, 
  variantStockHeader: { textAlign: 'right' as 'right' },
  variantListItem: { display: 'grid', gridTemplateColumns: '2fr 1fr 3fr', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f0f0f0' },
  variantNameList: { display: 'flex', alignItems: 'center', gap: '8px' },
  variantStockList: { textAlign: 'right' as 'right' },
  variantDescriptionList: { fontSize: '0.9em', color: '#777', whiteSpace: 'nowrap' as 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  // Tree View
  variantTree: { padding: '8px' },
  treeContainer: { display: 'flex', position: 'relative' as 'relative', gap: '20px' },
  treeTemplate: { flexShrink: 0, width: '250px', borderRight: '2px solid #ccc', paddingRight: '20px' },
  treeVariants: { display: 'flex', flexDirection: 'column' as 'column', gap: '15px', paddingTop: '20px' /* Align with template content */ },
  treeVariantItem: { display: 'flex', alignItems: 'flex-start', position: 'relative' as 'relative' },
  treeLineContainer: { 
    width: '30px', // Width of the horizontal line + space
    height: '50%', // Should be dynamic based on content later
    position: 'absolute' as 'absolute',
    left: '-30px', // Position it to the left of the variant content
    top: '0',
  },
  treeLineVertical: {
    position: 'absolute' as 'absolute',
    left: '15px', // Center of the 30px container
    top: '-50%', // Start from the middle of the previous item or template top
    bottom: '50%', // End at the middle of current item
    width: '2px',
    backgroundColor: '#ccc',
  },
  treeLineHorizontal: {
    position: 'absolute' as 'absolute',
    left: '15px', // Start from the vertical line
    top: '50%', // Middle of the item
    width: '15px', // Connect to the item content box
    height: '2px',
    backgroundColor: '#ccc',
  },
  variantChildContent: { flexGrow: 1, border: '1px solid #e0e0e0', padding: '8px', borderRadius: '4px' },
  noVariantData: { padding: '10px', color: 'red' },
  invalidVariantData: { padding: '10px', color: 'orange' },
};

const PartVariant: React.FC<PartVariantProps> = ({ variant, config, hass, cardInstanceId }) => {
  const logger = React.useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('PartVariant', cardInstanceId);
  }, [cardInstanceId]);

  const viewType = useMemo(() => {
    const type = config?.variant_view_type || config?.parts_layout_mode || 'grid'; // parts_layout_mode as potential fallback
    logger.debug('useMemo[viewType]', `View type determined: ${type}`);
    return type;
  }, [config]);

  React.useEffect(() => {
    if (variant) {
      logger.debug('useEffect[variant]', 'Received variant data:', {
        template: variant.template.name,
        numVariants: variant.variants.length,
      });
    }
  }, [variant]);

  if (!variant) {
    return <div style={styles.noVariantData}>No variant data provided</div>;
  }

  if (!config || !hass) {
    return <div style={{ padding: '10px' }}>Loading configuration...</div>;
  }

  if (!VariantHandler.isVariant(variant)) {
    logger.error('PartVariant', 'Invalid variant data structure');
    return <div style={styles.invalidVariantData}>Invalid variant data structure</div>;
  }

  const renderGridView = () => (
    <div style={styles.variantGrid}>
      <div style={styles.variantTemplateGrid}>
        <h3>{variant.template.name}</h3>
        <div style={styles.templateDetailsGrid}>
          <div style={{width: '100px', height: '100px'}}>
             <PartThumbnail partData={variant.template} config={config} layout="grid" cardInstanceId={cardInstanceId} />
          </div>
          <div style={styles.templateInfoGrid}>
            <div style={styles.templateStockGrid}>Total Stock: {variant.totalStock}</div>
            <div>{variant.template.description || ''}</div>
          </div>
        </div>
      </div>
      <div style={styles.variantsContainerGrid}>
        {variant.variants.map(v => (
          <div key={v.pk} style={styles.variantItemGrid}>
            <PartView partId={v.pk} config={config} hass={hass} cardInstanceId={cardInstanceId} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div style={styles.variantList}>
      <div style={styles.variantTemplateList}>
        <div style={styles.templateHeaderList}>
          <div style={{width: '60px', height: '60px'}}>
            <PartThumbnail partData={variant.template} config={config} layout="list" cardInstanceId={cardInstanceId} />
          </div>
          <div>
            <h3>{variant.template.name}</h3>
            <div style={styles.templateStockList}>Total Stock: {variant.totalStock}</div>
          </div>
        </div>
        <div>{variant.template.description || ''}</div>
      </div>
      <div style={styles.variantsListContainer}>
        <div style={styles.variantListHeader}>
          <div style={styles.variantNameHeader}>Name</div>
          <div style={styles.variantStockHeader}>Stock</div>
          <div>Description</div>
        </div>
        {variant.variants.map(v => (
          <div key={v.pk} style={styles.variantListItem}>
            <div style={styles.variantNameList}>
              <div style={{width: '30px', height: '30px'}}>
                <PartThumbnail partData={v} config={config} layout="list" cardInstanceId={cardInstanceId} />
              </div>
              {v.name}
            </div>
            <div style={styles.variantStockList}>{v.in_stock}</div>
            <div style={styles.variantDescriptionList}>{v.description || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTreeView = () => (
    <div style={styles.variantTree}>
      <div style={styles.treeContainer}>
        <div style={styles.treeTemplate}>
          <PartView partId={variant.template.pk} config={config} hass={hass} cardInstanceId={cardInstanceId} />
        </div>
        <div style={styles.treeVariants}>
          {variant.variants.map((v, index) => (
            <div key={v.pk} style={styles.treeVariantItem}>
              <div style={styles.treeLineContainer}>
                <div style={{...styles.treeLineVertical, height: index === 0 ? '50%' : '100%', top: index === 0 ? '50%' : '-50%'}}></div>
                <div style={styles.treeLineHorizontal}></div>
              </div>
              <div style={styles.variantChildContent}>
                <PartView partId={v.pk} config={config} hass={hass} cardInstanceId={cardInstanceId} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  logger.debug('PartVariant', `Rendering variant for ${variant.template.name}, view: ${viewType}`);

  switch(viewType) {
    case 'list':
      return renderListView();
    case 'tree':
      return renderTreeView();
    default: // grid
      return renderGridView();
  }
};

export default PartVariant; 