import React, { useMemo, useState, forwardRef, HTMLAttributes, useCallback, useRef, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { get } from 'lodash';
import { motion, Reorder, useDragControls, Variants } from 'framer-motion';

import { HomeAssistant } from 'custom-card-helpers';
import { ActionEngine } from '../../services/ActionEngine';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { selectCombinedParts } from '../../store/slices/partsSlice';
import { ActionDefinition, InventreeItem, LayoutColumn, LayoutConfig, VisualEffect, ReactGridLayout, InventreeCardConfig } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  selectLayoutsForInstance, 
  selectColumnsForInstance, 
  setLayouts as setReduxLayouts, 
  setColumns as setReduxColumns,
} from '../../store/slices/layoutSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

ConditionalLoggerEngine.getInstance().registerCategory('TableLayout', { enabled: false, level: 'info', verbose: false });

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const LOCAL_THUMB_BASE_PATH = '/local/inventree_thumbs/';
const PREFERRED_THUMB_EXTENSIONS = ['png', 'jpg', 'webp'];

// --- GridCell Wrapper Component ---
// This is a simple, "dumb" component that correctly receives and passes 
// through the props from react-grid-layout to a DOM element.
interface GridCellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const GridCell = forwardRef<HTMLDivElement, GridCellProps>((props, ref) => {
  return (
    <div ref={ref} {...props}>
      {props.children}
    </div>
  );
});

// --- CellRenderer Component ---
// This component is responsible for rendering the content of a single cell.
// It correctly uses hooks to get the data it needs.
interface CellRendererProps {
  partId: number;
  column: LayoutColumn;
  isSelected: boolean;
  cardInstanceId: string;
}

const itemVariants: Variants = {
  idle: {
    x: 0,
  },
  shaking: (custom: any) => custom?.animate || {},
};

const CellRenderer: React.FC<CellRendererProps> = ({ partId, column, isSelected, cardInstanceId }) => {
  const part = useAppSelector((state: RootState) => selectCombinedParts(state, cardInstanceId).find((p) => p.pk === partId));
  const visualEffects = useAppSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId, partId)) || {};
  const config = useAppSelector((state: RootState) => state.config.configsByInstance[cardInstanceId]?.config);

  if (!part) {
    return <div></div>;
  }

  const animation = visualEffects.animation || {};
  const animationState = animation.animate ? "shaking" : "idle";

  const cellStyle: React.CSSProperties = {
    ...(visualEffects.cellStyles?.[column.id] || {}),
    backgroundColor: visualEffects.highlight,
    color: visualEffects.textColor,
    border: isSelected ? '2px solid #3498db' : (visualEffects.border || '1px solid #ddd'),
    opacity: visualEffects.opacity,
    boxSizing: 'border-box',
    transition: 'border 0.2s ease-in-out',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const renderContent = () => {
    const { content } = column;
    if (typeof content === 'object' && content !== null && 'type' in content && (content as any).type === 'parameter') {
      const param = part.parameters?.find((p) => p.template_detail?.name === (content as any).parameter_name);
      return <>{param?.data || 'N/A'}</>;
    }
  
    if (typeof content === 'string') {
      switch (content) {
        case 'thumbnail':
          return <img src={part.thumbnail || ''} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
        case 'buttons':
          return (
            <div style={{ display: 'flex', gap: '5px' }}>
              {(column.buttons || []).map(buttonConfig => {
                const action = config?.actions?.find(a => a.id === buttonConfig.actionId);
                if (!action) return null;

                // Check if this button should be rendered for this specific part
                const targets = buttonConfig.targetPartPks;
                if (targets && targets.length > 0 && !targets.includes(part.pk)) {
                  return null;
                }

                // Safely access properties, prioritizing the override.
                const iconString = buttonConfig.icon ?? action.trigger?.ui?.icon;
                const label = buttonConfig.label ?? action.trigger?.ui?.labelTemplate ?? action.name;

                return (
                  <button key={`${action.id}-${part.pk}`} onClick={(e) => { e.stopPropagation(); ActionEngine.getInstance().executeAction(action.id, { part: part as InventreeItem }, cardInstanceId); }} title={action.name} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {iconString ? (
                      <ha-icon icon={iconString} style={{ color: '#444' }} />
                    ) : (
                      <span>{label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        case 'description':
          return <div style={{ padding: '5px', fontSize: '0.9em' }}>{part.description}</div>;
        default:
          return <>{get(part, content, '')}</>;
      }
    }
    return null;
  };
  
  return (
    <motion.div
      style={cellStyle}
      variants={itemVariants}
      animate={animationState}
      custom={animation}
      transition={animation.transition}
    >
      {renderContent()}
    </motion.div>
  );
};

// --- Main TableLayout Component ---
interface TableLayoutProps {
  hass: HomeAssistant;
  parts: InventreeItem[];
  config: InventreeCardConfig; 
  cardInstanceId: string;
}

const TableLayout: React.FC<TableLayoutProps> = ({ hass, parts, config, cardInstanceId }): JSX.Element => {
  // ========================================================================================
  // === 1. HOOKS: All hooks must be at the top level =======================================
  // ========================================================================================
  const logger = useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('TableLayout', cardInstanceId);
  }, [cardInstanceId]);
  
  logger.verbose('TableLayout', `Render cycle started. Part count: ${parts.length}`, { cardInstanceId });

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  
  const allVisualEffects = useAppSelector((state: RootState) => state.visualEffects.effectsByCardInstance[cardInstanceId]);
  
  // ========================================================================================
  // === 2. DERIVED STATE & MEMOIZED VALUES ===============================================
  // ========================================================================================
  
  const displayColumns = useMemo(() => {
    const cols = config.layout?.columns || [];
    logger.verbose('useMemo[displayColumns]', 'Recalculated display columns from config.', { 
      columnCount: cols.length,
      columnIds: cols.map((c: LayoutColumn) => c.id) 
    });
    return cols;
  }, [config.layout?.columns, logger]);

  const filteredParts = useMemo(() => {
    if (!globalFilter) return parts;
    return parts.filter(part =>
      part.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      part.description?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [parts, globalFilter]);

  const displayLayouts = useMemo<ReactGridLayout.Layouts>(() => {
    logger.debug('useMemo[displayLayouts]', 'Recalculating display layouts from column templates.');

    const columnsForLayout = config.layout?.columns || [];
    if (columnsForLayout.length === 0) {
      logger.warn('useMemo[displayLayouts]', 'No columns defined, cannot generate layout.');
      return { lg: [] };
    }
    
    // Calculate the total height of one template row in grid units.
    // This is the maximum "bottom" position (y + h) among all columns in the template.
    // This ensures that rows with complex, multi-level layouts don't overlap.
    const templateRowHeight = columnsForLayout.reduce((maxHeight: number, col: LayoutColumn) => {
        const colBottom = (col.y ?? 0) + (col.h ?? 1);
        return Math.max(maxHeight, colBottom);
    }, 0);

    const layouts: ReactGridLayout.Layout[] = [];
    parts.forEach((part: InventreeItem, rowIndex: number) => {
      // Each part (row) is offset vertically by the height of the template multiplied by its index.
      const yOffset = rowIndex * templateRowHeight;
      columnsForLayout.forEach((col: LayoutColumn) => {
        layouts.push({ 
          i: `${part.pk}-${col.id}`, 
          x: col.x ?? 0, 
          y: (col.y ?? 0) + yOffset, // Apply the template's y-position plus the calculated row offset
          w: col.w ?? 2, 
          h: col.h ?? 1,
        });
      });
    });
    
    return { lg: layouts };
  }, [config.layout?.columns, parts, logger]);
  
  const visiblePartPks = useMemo(() => new Set(filteredParts.map((p) => p.pk)), [filteredParts]);

  const visibleLayouts: ReactGridLayout.Layouts = useMemo(() => {
    if (!displayLayouts) return { lg: [] };
    const lgLayout = displayLayouts.lg || [];
    const filteredLg = lgLayout.filter((item: ReactGridLayout.Layout) => {
      const pk = parseInt(item.i.split('-')[0], 10);
      return visiblePartPks.has(pk);
    });
    return { lg: filteredLg };
  }, [displayLayouts, visiblePartPks]);

  // ========================================================================================
  // === 3. EFFECT HOOKS (Removed, no longer needed for persistence) ========================
  // ========================================================================================
  
  // ========================================================================================
  // === 4. EVENT HANDLERS (Removed, no editing in view mode) ===============================
  // ========================================================================================

  // ========================================================================================
  // === 5. RENDER GUARDS (Early returns) =================================================
  // ========================================================================================
  
  if (!parts || !displayColumns || displayColumns.length === 0) {
    logger.warn('TableLayout', 'Render blocked: parts or columns not ready yet.', { 
      hasParts: !!parts, 
      hasDisplayColumns: !!displayColumns,
      columnCount: displayColumns?.length || 0,
    });
    return <div>Loading parts or layout configuration...</div>;
  }
  
  // ========================================================================================
  // === 6. FINAL RENDER ====================================================================
  // ========================================================================================

  logger.verbose('TableLayout', 'Final values for render:', {
    displayColumns: displayColumns.map((c: LayoutColumn) => c.id),
    layoutKeysCount: displayLayouts?.lg?.length,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Filter..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ResponsiveReactGridLayout
          className="layout"
          layouts={visibleLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={config.layout?.rowHeight || 50}
          isDraggable={false}
          isResizable={false}
          compactType={config.layout?.compactType}
          allowOverlap={!!config.layout?.allowOverlap}
          onLayoutChange={() => {}} // No-op, layout changes are not handled in view mode
        >
          {filteredParts.flatMap((part: InventreeItem) =>
            displayColumns.map((column: LayoutColumn) => {
              const cellId = `${part.pk}-${column.id}`;
              const isVisible = allVisualEffects?.[part.pk]?.isVisible !== false;
              if (!isVisible) return null;

              return (
                <div key={cellId} onClick={() => setSelectedCellId(cellId)}>
                  <CellRenderer
                    partId={part.pk}
                    column={column}
                    isSelected={selectedCellId === cellId}
                    cardInstanceId={cardInstanceId}
                  />
                </div>
              );
            })
          )}
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
};

export default TableLayout;