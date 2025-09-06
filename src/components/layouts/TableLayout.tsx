import React, { useMemo, useState, forwardRef, HTMLAttributes, useCallback, useRef, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { get } from 'lodash';
import { motion, Reorder, useDragControls, Variants } from 'framer-motion';

import { HomeAssistant } from 'custom-card-helpers';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { ActionDefinition, InventreeItem, LayoutConfig, VisualEffect, ReactGridLayout, InventreeCardConfig, CellDefinition } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  selectVisualEffectsForCell,
  selectVisualEffectForPart
} from '../../store/slices/visualEffectsSlice';
import { updateLayout } from '../../store/slices/configSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { CellRenderer } from './CellRenderer';

ConditionalLoggerEngine.getInstance().registerCategory('TableLayout', { enabled: false, level: 'info', verbose: false });

const ResponsiveReactGridLayout = WidthProvider(Responsive);
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

// --- Main TableLayout Component ---
interface TableLayoutProps {
  hass: HomeAssistant;
  parts: InventreeItem[];
  config: InventreeCardConfig; 
  cardInstanceId: string;
}

const RenderCell: React.FC<{
  cell: CellDefinition;
  parts: InventreeItem[];
  selectedCellId: string | null;
  cardInstanceId: string;
  onCellClick: (cellId: string) => void;
}> = React.memo(({ cell, parts, selectedCellId, cardInstanceId, onCellClick }) => {
  const part = parts.find(p => p.pk === cell.partPk);
  
  // Get both part-wide and cell-specific effects
  const partVisualEffects = useAppSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId, cell.partPk));
  const cellVisualEffects = useAppSelector((state: RootState) => selectVisualEffectsForCell(state, cardInstanceId, cell.id));

  // 🔍 DEBUG: Log the effects to see what's happening
  console.log(`🔍 RenderCell DEBUG [${cell.id}]:`, {
    cardInstanceId,
    cellId: cell.id,
    partPk: cell.partPk,
    cellDimensions: { x: cell.x, y: cell.y, w: cell.w, h: cell.h },
    partVisualEffects,
    cellVisualEffects,
    hasPart: !!part
  });

  // Merge them, with cell-specific taking precedence
  const finalEffects = { ...partVisualEffects, ...cellVisualEffects };

  if (!part || cell.isHidden) {
    return null;
  }

  // Use the merged effects to determine visibility
  if (finalEffects.isVisible === false) {
    return null;
  }

  return (
    <div key={cell.id} onClick={() => onCellClick(cell.id)} style={{ width: '100%', height: '100%' }}>
      <CellRenderer
        cell={cell}
        isSelected={selectedCellId === cell.id}
        cardInstanceId={cardInstanceId}
      />
    </div>
  );
});


const TableLayout: React.FC<TableLayoutProps> = ({ hass, parts, config, cardInstanceId }): JSX.Element => {
  // ========================================================================================
  // === 1. HOOKS: All hooks must be at the top level =======================================
  // ========================================================================================
  const logger = useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('TableLayout', cardInstanceId);
  }, [cardInstanceId]);
  const { theme } = useTheme();
  
  logger.verbose('TableLayout', `Render cycle started. Part count: ${parts.length}`, { cardInstanceId });

  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  
  // ========================================================================================
  // === 2. DERIVED STATE & MEMOIZED VALUES ===============================================
  // ========================================================================================
  
  const filteredParts = useMemo(() => {
    if (!globalFilter) return parts;
    return parts.filter(part =>
      part.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      part.description?.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [parts, globalFilter]);
  
  const visiblePartPks = useMemo(() => new Set(filteredParts.map((p) => p.pk)), [filteredParts]);

  const visibleCells = useMemo(() => {
    return (config.layout?.cells || []).filter((cell: CellDefinition) => visiblePartPks.has(cell.partPk));
  }, [config.layout?.cells, visiblePartPks]);

  const displayLayouts = useMemo<ReactGridLayout.Layouts>(() => {
    logger.debug('useMemo[displayLayouts]', 'Recalculating display layouts from cells.');
    
    // The layout is a direct mapping of the visible cells.
    const layouts: ReactGridLayout.Layout[] = visibleCells.map((cell: CellDefinition) => ({
      i: cell.id,
      x: cell.x,
      y: cell.y,
      w: cell.w,
      h: cell.h,
    }));
    
    return { lg: layouts };
  }, [visibleCells, logger]);
  
  // ========================================================================================
  // === 5. RENDER GUARDS (Early returns) =================================================
  // ========================================================================================
  
  const cellsExist = config.layout?.cells && config.layout.cells.length > 0;
  if (!parts || !cellsExist) {
    logger.warn('TableLayout', 'Render blocked: parts or cells not ready yet.', { 
      hasParts: !!parts, 
      hasCells: cellsExist,
    });
    return <div>Loading parts or layout configuration...</div>;
  }
  
  // ========================================================================================
  // === 6. FINAL RENDER ====================================================================
  // ========================================================================================

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {config.layout?.show_filter && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Filter..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      )}
      
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        position: 'relative',
        background: theme.backgroundGradient,
        borderRadius: '16px',
        padding: '16px',
        backdropFilter: 'blur(5px)'
      }}>
        <ResponsiveReactGridLayout
          key={`table-layout-${JSON.stringify({ cells: config.layout?.cells || [], rowHeight: config.layout?.rowHeight })}`}
          className="layout"
          layouts={displayLayouts} // Use the simplified layouts
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
          rowHeight={config.layout?.rowHeight || 50}
          isDraggable={false}
          isResizable={false}
          draggableCancel=".no-drag" // 🚀 Add this prop
          compactType={null}
          allowOverlap={false}
          onLayoutChange={() => {}} // No-op, layout changes are not handled in view mode
        >
          {visibleCells.map((cell: CellDefinition) => (
            <div key={cell.id}>
              <RenderCell
                cell={cell}
                parts={parts}
                selectedCellId={selectedCellId}
                cardInstanceId={cardInstanceId}
                onCellClick={setSelectedCellId}
              />
            </div>
          ))}
        </ResponsiveReactGridLayout>
      </div>
    </div>
  );
};

export default TableLayout;