import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { ActionDefinition, LayoutColumn, LayoutConfig, ReactGridLayout, InventreeItem } from '../../types';
import LayoutBuilder from './LayoutBuilder';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const CustomResizeHandle = (
  <span
    className="react-resizable-handle react-resizable-handle-se"
    style={{
      position: 'absolute',
      width: '20px',
      height: '20px',
      bottom: '0px',
      right: '0px',
      cursor: 'se-resize',
      background:
        "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=')",
      backgroundPosition: 'bottom right',
      backgroundRepeat: 'no-repeat',
      zIndex: 100
    }}
  />
);

// A mock part for preview purposes
const MOCK_PART: InventreeItem = {
  pk: 1,
  name: 'Sample Part',
  description: 'This is a sample part for layout preview.',
  thumbnail: '/assets/images/brand-header.png',
  quantity: 10,
  variant_of: 0,
  pathstring: '',
  stock_item_count: 0,
  barcode_hash: '',
};

interface LayoutSelectionSectionProps {
  layoutConfig: LayoutConfig;
  onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
  actions: ActionDefinition[];
}

const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps> = ({ layoutConfig, onLayoutConfigChanged, actions }) => {
  
  const [columns, setColumns] = useState<LayoutColumn[]>(layoutConfig.columns || []);

  // When the config from props changes (e.g., initial load), update our internal state
  useEffect(() => {
    setColumns(layoutConfig.columns || []);
  }, [layoutConfig.columns]);
  
  const handleNonColumnLayoutChange = useCallback((key: keyof Omit<LayoutConfig, 'columns'>, value: any) => {
    onLayoutConfigChanged({
      ...layoutConfig,
      [key]: value,
    });
  }, [layoutConfig, onLayoutConfigChanged]);
  
  const handleColumnsChanged = (newColumns: LayoutColumn[]) => {
    setColumns(newColumns);
    onLayoutConfigChanged({
      ...layoutConfig,
      columns: newColumns,
    });
  };

  const onLayoutChange = (layout: ReactGridLayout.Layout[]) => {
    // This is the core logic that updates the column template from the grid preview
    const updatedColumns = columns.map(col => {
      const layoutItem = layout.find(l => l.i === `mock-1-${col.id}`);
      if (layoutItem) {
        return { ...col, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
      }
      return col;
    });

    setColumns(updatedColumns);
    onLayoutConfigChanged({
      ...layoutConfig,
      columns: updatedColumns,
    });
  };

  const generatedLayouts = useMemo<ReactGridLayout.Layouts>(() => {
    // Generate the layout for the preview grid from the column definitions
    const generated: ReactGridLayout.Layout[] = columns.map((col, index) => ({
      i: `mock-1-${col.id}`,
      x: col.x ?? (index % 6) * 2,
      y: col.y ?? 0,
      w: col.w ?? 2,
      h: col.h ?? 1,
    }));
    return { lg: generated };
  }, [columns]);

  return (
    <div className="layout-selection-section" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h4>Layout Configuration</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>
          Row Height:
          <input
            type="number"
            name="rowHeight"
            value={layoutConfig.rowHeight || 50}
            onChange={(e) => handleNonColumnLayoutChange('rowHeight', parseInt(e.target.value, 10))}
            style={{ marginLeft: '5px', width: '60px' }}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          Compact Type:
          <select
            name="compactType"
            value={layoutConfig.compactType === null ? 'null' : layoutConfig.compactType || 'vertical'}
            onChange={(e) => handleNonColumnLayoutChange('compactType', e.target.value === 'null' ? null : (e.target.value as 'vertical' | 'horizontal'))}
            style={{ marginLeft: '5px' }}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
            <option value="null">None</option>
          </select>
        </label>
        <label>
          Allow Overlap:
          <input
            type="checkbox"
            name="allowOverlap"
            checked={!!layoutConfig.allowOverlap}
            onChange={(e) => handleNonColumnLayoutChange('allowOverlap', e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </label>
      </div>

      <LayoutBuilder 
        columns={columns}
        onColumnsChanged={handleColumnsChanged}
        actions={actions}
      />
      
      <div className="layout-preview" style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
        <h5>Live Layout Preview</h5>
        <div style={{ border: '1px solid #ddd', background: '#f9f9f9', minHeight: '120px', position: 'relative' }}>
           <ResponsiveReactGridLayout
              className="layout"
              layouts={generatedLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={layoutConfig.rowHeight || 50}
              isDraggable={true}
              isResizable={true}
              draggableHandle=".drag-handle" // Specify the drag handle
              resizeHandle={CustomResizeHandle} // Use our custom resize handle
              compactType={layoutConfig.compactType}
              allowOverlap={!!layoutConfig.allowOverlap}
              onLayoutChange={onLayoutChange}
            >
              {columns.map((column) => (
                <div key={`mock-1-${column.id}`} style={{ border: '1px solid #ccc', background: 'white' }}>
                  <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
                    <div className="drag-handle" style={{ cursor: 'grab', background: '#eee', padding: '2px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>
                      <span className="mdi mdi-drag-horizontal" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      <span style={{ textAlign: 'center', fontSize: '0.9em' }}>{column.header || `Content: ${column.content}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </ResponsiveReactGridLayout>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelectionSection; 