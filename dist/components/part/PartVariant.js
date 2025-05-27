import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useMemo } from 'react';
import { Logger } from '../../utils/logger';
import { VariantHandler } from '../common/variant-handler'; // Assuming this is now a .ts file with exported functions
// Import child React components
import PartThumbnail from './PartThumbnail';
import PartView from './PartView'; // Assuming PartView can now take partId or partData
// Basic styling (can be expanded or moved to CSS modules/files)
const styles = {
    // Grid View
    variantGrid: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' },
    variantTemplateGrid: { borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' },
    templateDetailsGrid: { display: 'flex', gap: '16px', alignItems: 'center' },
    templateInfoGrid: { flexGrow: 1 },
    templateStockGrid: { fontWeight: 'bold' },
    variantsContainerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
    variantItemGrid: { border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px' },
    // List View
    variantList: { padding: '8px' },
    variantTemplateList: { marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #eee' },
    templateHeaderList: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
    templateStockList: { fontSize: '0.9em', color: '#555' },
    variantsListContainer: { marginTop: '8px' },
    variantListHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 3fr', fontWeight: 'bold', padding: '4px 0', borderBottom: '1px solid #ccc' },
    variantNameHeader: { paddingLeft: '30px' /* Space for thumbnail */ },
    variantStockHeader: { textAlign: 'right' },
    variantListItem: { display: 'grid', gridTemplateColumns: '2fr 1fr 3fr', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f0f0f0' },
    variantNameList: { display: 'flex', alignItems: 'center', gap: '8px' },
    variantStockList: { textAlign: 'right' },
    variantDescriptionList: { fontSize: '0.9em', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    // Tree View
    variantTree: { padding: '8px' },
    treeContainer: { display: 'flex', position: 'relative', gap: '20px' },
    treeTemplate: { flexShrink: 0, width: '250px', borderRight: '2px solid #ccc', paddingRight: '20px' },
    treeVariants: { display: 'flex', flexDirection: 'column', gap: '15px', paddingTop: '20px' /* Align with template content */ },
    treeVariantItem: { display: 'flex', alignItems: 'flex-start', position: 'relative' },
    treeLineContainer: {
        width: '30px', // Width of the horizontal line + space
        height: '50%', // Should be dynamic based on content later
        position: 'absolute',
        left: '-30px', // Position it to the left of the variant content
        top: '0',
    },
    treeLineVertical: {
        position: 'absolute',
        left: '15px', // Center of the 30px container
        top: '-50%', // Start from the middle of the previous item or template top
        bottom: '50%', // End at the middle of current item
        width: '2px',
        backgroundColor: '#ccc',
    },
    treeLineHorizontal: {
        position: 'absolute',
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
const PartVariant = ({ variant, config, hass }) => {
    const logger = useMemo(() => Logger.getInstance(), []);
    const viewType = useMemo(() => {
        const type = (config === null || config === void 0 ? void 0 : config.variant_view_type) || (config === null || config === void 0 ? void 0 : config.parts_layout_mode) || 'grid'; // parts_layout_mode as potential fallback
        logger.log('PartVariant React', `View type determined: ${type}`);
        return type;
    }, [config, logger]);
    React.useEffect(() => {
        if (variant) {
            logger.log('PartVariant React', 'Received variant data:', {
                template: variant.template.name,
                numVariants: variant.variants.length,
            });
        }
    }, [variant, logger]);
    if (!variant) {
        return _jsx("div", { style: styles.noVariantData, children: "No variant data provided" });
    }
    if (!VariantHandler.isVariant(variant)) {
        logger.error('PartVariant React', 'Invalid variant data structure');
        return _jsx("div", { style: styles.invalidVariantData, children: "Invalid variant data structure" });
    }
    const renderGridView = () => (_jsxs("div", { style: styles.variantGrid, children: [_jsxs("div", { style: styles.variantTemplateGrid, children: [_jsx("h3", { children: variant.template.name }), _jsxs("div", { style: styles.templateDetailsGrid, children: [_jsx("div", { style: { width: '100px', height: '100px' }, children: _jsx(PartThumbnail, { partData: variant.template, config: config, layout: "grid" }) }), _jsxs("div", { style: styles.templateInfoGrid, children: [_jsxs("div", { style: styles.templateStockGrid, children: ["Total Stock: ", variant.totalStock] }), _jsx("div", { children: variant.template.description || '' })] })] })] }), _jsx("div", { style: styles.variantsContainerGrid, children: variant.variants.map(v => (_jsx("div", { style: styles.variantItemGrid, children: _jsx(PartView, { partId: v.pk, config: config, hass: hass }) }, v.pk))) })] }));
    const renderListView = () => (_jsxs("div", { style: styles.variantList, children: [_jsxs("div", { style: styles.variantTemplateList, children: [_jsxs("div", { style: styles.templateHeaderList, children: [_jsx("div", { style: { width: '60px', height: '60px' }, children: _jsx(PartThumbnail, { partData: variant.template, config: config, layout: "list" }) }), _jsxs("div", { children: [_jsx("h3", { children: variant.template.name }), _jsxs("div", { style: styles.templateStockList, children: ["Total Stock: ", variant.totalStock] })] })] }), _jsx("div", { children: variant.template.description || '' })] }), _jsxs("div", { style: styles.variantsListContainer, children: [_jsxs("div", { style: styles.variantListHeader, children: [_jsx("div", { style: styles.variantNameHeader, children: "Name" }), _jsx("div", { style: styles.variantStockHeader, children: "Stock" }), _jsx("div", { children: "Description" })] }), variant.variants.map(v => (_jsxs("div", { style: styles.variantListItem, children: [_jsxs("div", { style: styles.variantNameList, children: [_jsx("div", { style: { width: '30px', height: '30px' }, children: _jsx(PartThumbnail, { partData: v, config: config, layout: "list" }) }), v.name] }), _jsx("div", { style: styles.variantStockList, children: v.in_stock }), _jsx("div", { style: styles.variantDescriptionList, children: v.description || '' })] }, v.pk)))] })] }));
    const renderTreeView = () => (_jsx("div", { style: styles.variantTree, children: _jsxs("div", { style: styles.treeContainer, children: [_jsx("div", { style: styles.treeTemplate, children: _jsx(PartView, { partId: variant.template.pk, config: config, hass: hass }) }), _jsx("div", { style: styles.treeVariants, children: variant.variants.map((v, index) => (_jsxs("div", { style: styles.treeVariantItem, children: [_jsxs("div", { style: styles.treeLineContainer, children: [_jsx("div", { style: Object.assign(Object.assign({}, styles.treeLineVertical), { height: index === 0 ? '50%' : '100%', top: index === 0 ? '50%' : '-50%' }) }), _jsx("div", { style: styles.treeLineHorizontal })] }), _jsx("div", { style: styles.variantChildContent, children: _jsx(PartView, { partId: v.pk, config: config, hass: hass }) })] }, v.pk))) })] }) }));
    logger.log('PartVariant React', `Rendering variant for ${variant.template.name}, view: ${viewType}`);
    switch (viewType) {
        case 'list':
            return renderListView();
        case 'tree':
            return renderTreeView();
        default: // grid
            return renderGridView();
    }
};
export default PartVariant;
//# sourceMappingURL=PartVariant.js.map