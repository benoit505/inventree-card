import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { CellDefinition, ActionDefinition, LayoutConfig, ReactGridLayout, InventreeItem, ButtonCellItem } from '../../types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { CellRenderer } from '../layouts/CellRenderer';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid'; // 🚀 For generating unique cell IDs
import { isEqual } from 'lodash';

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

interface LayoutSelectionSectionProps {
  layoutConfig: LayoutConfig;
  onLayoutConfigChanged: (newLayoutConfig: LayoutConfig) => void;
  actions: ActionDefinition[];
  parts: InventreeItem[];
  cardInstanceId: string;
}

// Define the specific type for LayoutColumn content to avoid ambiguity
type CellContentType = 'name' | 'thumbnail' | 'description' | 'in_stock' | 'pk' | 'IPN' | 'SKU' | 'category_detail.name' | 'location_detail.name' | 'buttons' | 'attribute' | 'template';

const AVAILABLE_COLUMNS: { value: CellContentType, label: string }[] = [
  { value: 'name', label: 'Part Name' },
  { value: 'description', label: 'Description' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'pk', label: 'Part ID (PK)' },
  { value: 'IPN', label: 'IPN' },
  { value: 'SKU', label: 'SKU' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'category_detail.name', label: 'Category Name' },
  { value: 'location_detail.name', label: 'Location Name' },
  { value: 'buttons', label: 'Action Buttons' },
  { value: 'attribute', label: 'Custom Attribute' },
  { value: 'template', label: 'Custom Template' },
];

const LayoutSelectionSection: React.FC<LayoutSelectionSectionProps> = ({ layoutConfig, onLayoutConfigChanged, actions, parts, cardInstanceId }) => {
  const { theme } = useTheme();
  
  const actualLayoutConfig = layoutConfig;
  
  // 🚀 Local state for the new cell adder form
  const [newCellPartPk, setNewCellPartPk] = useState<string>('');
  const [newCellContent, setNewCellContent] = useState<CellContentType>('name');
  
  // 🚨 DEBUGGING: Wrap onLayoutConfigChanged to catch what's happening
  const wrappedOnLayoutConfigChanged = useCallback((newConfig: LayoutConfig) => {
    console.log('🚨 CONFIG UPDATE: onLayoutConfigChanged called with:', {
      cells: newConfig.cells?.length || 0,
      newConfig
    });
    onLayoutConfigChanged(newConfig);
  }, [onLayoutConfigChanged]);

  const handleNonCellLayoutChange = useCallback((key: keyof Omit<LayoutConfig, 'cells'>, value: any) => {
    wrappedOnLayoutConfigChanged({
      ...actualLayoutConfig,
      [key]: value,
    });
  }, [actualLayoutConfig, wrappedOnLayoutConfigChanged]);

  // 🚀 Handler to add a new cell
  const handleAddCell = () => {
    if (!newCellPartPk) {
      alert('Please select a part.');
      return;
    }

    const part = parts.find(p => p.pk === parseInt(newCellPartPk, 10));

    if (!part) {
      alert('Could not find the selected part data. The parts list might be refreshing. Please try again.');
      return;
    }

    const newCell: CellDefinition = {
      id: uuidv4(),
      partPk: parseInt(newCellPartPk, 10),
      content: newCellContent,
      x: 0, // Default position, can be adjusted by user
      y: 0,
      w: 2, // Default size
      h: 1,
    };
    
    const newCells = [...(actualLayoutConfig.cells || []), newCell];
    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
  };

  // 🚀 Handler to remove a cell
  const handleRemoveCell = (cellId: string) => {
    const newCells = (actualLayoutConfig.cells || []).filter((cell: CellDefinition) => cell.id !== cellId);
    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
  };

  const onLayoutChange = (layout: ReactGridLayout.Layout[]) => {
    console.log('🔄 RESIZE: onLayoutChange called');
    
    const updatedCells = (actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
      const layoutItem = layout.find(l => l.i === cell.id);
      if (layoutItem) {
        const updatedCell = { 
          ...cell, 
          x: layoutItem.x, 
          y: layoutItem.y, 
          w: layoutItem.w, 
          h: layoutItem.h 
        };
        
        // 🔍 DEBUG: Log if this cell changed
        if (cell.x !== layoutItem.x || cell.y !== layoutItem.y || cell.w !== layoutItem.w || cell.h !== layoutItem.h) {
          console.log(`🔍 CELL CHANGED [${cell.id}]:`, {
            old: { x: cell.x, y: cell.y, w: cell.w, h: cell.h },
            new: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h }
          });
        }
        
        return updatedCell;
      }
      return cell;
    });

    // Check if anything actually changed to prevent infinite loops
    if (!isEqual(updatedCells, actualLayoutConfig.cells)) {
      console.log('🔍 LAYOUT CONFIG CHANGE: Cells updated, calling onLayoutConfigChanged');
      wrappedOnLayoutConfigChanged({
        ...actualLayoutConfig,
        cells: updatedCells,
      });
    } else {
      console.log('🔍 LAYOUT CONFIG CHANGE: No changes detected, skipping update');
    }
  };

  const generatedLayouts = useMemo<ReactGridLayout.Layouts>(() => {
    const cells = actualLayoutConfig.cells || [];
    console.log('🔄 PREVIEW: Generating layouts from', cells.length, 'cells.');

    // In the new system, the layouts array is a direct mapping of cells.
    const layouts: ReactGridLayout.Layout[] = cells.map((cell: CellDefinition) => ({
      i: cell.id,
      x: cell.x,
      y: cell.y,
      w: cell.w,
      h: cell.h,
    }));

    return { lg: layouts };
  }, [actualLayoutConfig.cells]);

  // 🚀 State for editing a specific cell's buttons
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const editingCell = actualLayoutConfig.cells?.find((cell: CellDefinition) => cell.id === editingCellId);

  // 🚀 Handlers for button configuration
  const handleUpdateButton = useCallback((cellId: string, btnIndex: number, updatedButton: any) => {
    const newCells = (actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
      if (cell.id === cellId) {
        const newButtons = [...(cell.buttons || [])];
        newButtons[btnIndex] = updatedButton;
        return { ...cell, buttons: newButtons };
      }
      return cell;
    });
    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
  }, [actualLayoutConfig, wrappedOnLayoutConfigChanged]);

  const handleRemoveButton = useCallback((cellId: string, btnIndex: number) => {
    const newCells = (actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
      if (cell.id === cellId) {
        const newButtons = [...(cell.buttons || [])];
        newButtons.splice(btnIndex, 1);
        return { ...cell, buttons: newButtons };
      }
      return cell;
    });
    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
  }, [actualLayoutConfig, wrappedOnLayoutConfigChanged]);

  const handleAddButton = useCallback((cellId: string) => {
    const newCells = (actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
      if (cell.id === cellId) {
        return {
          ...cell,
          buttons: [...(cell.buttons || []), { id: uuidv4(), actionId: '', icon: '', label: '' }]
        };
      }
      return cell;
    });
    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
  }, [actualLayoutConfig, wrappedOnLayoutConfigChanged]);

  return (
    <div className="layout-selection-section" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h4>Layout Configuration</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>
          Row Height:
          <input
            type="number"
            name="rowHeight"
            value={actualLayoutConfig.rowHeight || 50}
            onChange={(e) => handleNonCellLayoutChange('rowHeight', parseInt(e.target.value, 10))}
            style={{ marginLeft: '5px', width: '60px' }}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          Allow Overlap:
          <input
            type="checkbox"
            name="allowOverlap"
            checked={!!actualLayoutConfig.allowOverlap}
            onChange={(e) => handleNonCellLayoutChange('allowOverlap', e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginRight: '10px' }}>
          Show Filter:
          <input
            type="checkbox"
            name="showFilter"
            checked={!!actualLayoutConfig.show_filter}
            onChange={(e) => handleNonCellLayoutChange('show_filter', e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label>
          No Borders:
          <input
            type="checkbox"
            name="noBorders"
            checked={!!actualLayoutConfig.no_borders}
            onChange={(e) => handleNonCellLayoutChange('no_borders', e.target.checked)}
            style={{ marginLeft: '5px' }}
          />
        </label>
      </div>

      {/* 🚀 New Cell Management UI */}
      <div className="cell-manager" style={{ marginTop: '20px', padding: '10px', border: '1px solid #e0e0e0' }}>
        <h5>Manage Grid Cells</h5>
        <div className="add-cell-form" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
          <select value={newCellPartPk} onChange={(e) => setNewCellPartPk(e.target.value)}>
            <option value="">-- Select Part --</option>
            {parts.map(part => (
              <option key={part.pk} value={part.pk}>{part.name} (PK: {part.pk})</option>
            ))}
          </select>
          <select value={newCellContent} onChange={(e) => setNewCellContent(e.target.value as CellContentType)}>
            {AVAILABLE_COLUMNS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={handleAddCell}>Add Cell</button>
        </div>

        <div className="cell-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {(actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
            const part = parts.find(p => p.pk === cell.partPk);
            const header = part ? `${part.name} - ${cell.content}` : `Part ${cell.partPk} - ${cell.content}`;
            return (
              <div key={cell.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', borderBottom: '1px solid #eee' }}>
                <span>{header}</span>
                <div>
                  {cell.content === 'buttons' && (
                    <button 
                      onClick={() => setEditingCellId(editingCellId === cell.id ? null : cell.id)}
                      style={{ marginRight: '8px' }}
                    >
                      {editingCellId === cell.id ? 'Close' : 'Configure'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleRemoveCell(cell.id)}
                    style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🚀 Button Configuration UI (conditionally rendered) */}
        {editingCell && editingCell.content === 'buttons' && (() => {
          const part = parts.find(p => p.pk === editingCell.partPk);
          const header = part ? `${part.name} - ${editingCell.content}` : `Part ${editingCell.partPk} - ${editingCell.content}`;
          return (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <h6>Configure Buttons for "{header}"</h6>
              {(editingCell.buttons || []).map((buttonItem: ButtonCellItem, btnIndex: number) => (
                <div key={buttonItem.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  <select
                    value={buttonItem.actionId}
                    onChange={(e) => handleUpdateButton(editingCell.id, btnIndex, { ...buttonItem, actionId: e.target.value })}
                  >
                    <option value="">- Select Action -</option>
                    {actions.filter(a => a.trigger.type.startsWith('ui_')).map(action => (
                      <option key={action.id} value={action.id}>{action.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Override Icon"
                    value={buttonItem.icon || ''}
                    onChange={(e) => handleUpdateButton(editingCell.id, btnIndex, { ...buttonItem, icon: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Override Label"
                    value={buttonItem.label || ''}
                    onChange={(e) => handleUpdateButton(editingCell.id, btnIndex, { ...buttonItem, label: e.target.value })}
                  />
                  <button onClick={() => handleRemoveButton(editingCell.id, btnIndex)}>Remove</button>
                </div>
              ))}
              <button onClick={() => handleAddButton(editingCell.id)}>Add Button</button>
            </div>
          );
        })()}
      </div>
      
      <div className="layout-preview" style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
        <h5>Live Layout Preview</h5>
        <div style={{ 
          border: `1px solid ${theme.borderColor}`, 
          background: theme.backgroundGradient, 
          minHeight: '120px', 
          position: 'relative',
          borderRadius: '16px',
          padding: '16px',
          backdropFilter: 'blur(5px)'
        }}>
           {(() => {
             const gridKey = `grid-${JSON.stringify({ cells: actualLayoutConfig.cells || [], rowHeight: actualLayoutConfig.rowHeight, allowOverlap: actualLayoutConfig.allowOverlap })}`;
             console.log('🔄 GRID KEY: Using key:', gridKey);
             return (
           <ResponsiveReactGridLayout
              key={gridKey}
              className="layout"
              layouts={generatedLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
              rowHeight={actualLayoutConfig.rowHeight || 50}
              isDraggable={true}
              isResizable={true}
              draggableHandle=".drag-handle"
              draggableCancel=".no-drag" // 🚀 Add this prop
              resizeHandle={CustomResizeHandle}
              compactType={null}
              allowOverlap={!!actualLayoutConfig.allowOverlap}
              onLayoutChange={onLayoutChange}
            >
              {(actualLayoutConfig.cells || []).map((cell: CellDefinition) => {
                  const isHidden = cell.isHidden ?? false;

                  return (
                    <div key={cell.id} style={{ 
                      border: 'none', 
                      background: theme.cardBackground, 
                      position: 'relative', 
                      opacity: isHidden ? 0.5 : 1,
                      borderRadius: '12px',
                      boxShadow: `0 2px 8px ${theme.shadowColor}`,
                      backdropFilter: 'blur(10px)',
                      overflow: 'hidden'
                    }}>
                      <div className="drag-handle" style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', cursor: 'grab', zIndex: 10 }} title="Drag to move">
                        <span className="mdi mdi-drag" style={{ fontSize: '16px', color: '#666' }}></span>
                      </div>
                      <div 
                        className="visibility-toggle" 
                        style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                        title={isHidden ? 'Show' : 'Hide'}
                        onClick={() => {
                          const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                            c.id === cell.id ? { ...c, isHidden: !isHidden } : c
                          );
                          wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                        }}
                      >
                        <span className={`mdi mdi-${isHidden ? 'eye-off' : 'eye'}`} style={{ fontSize: '16px', color: '#666' }}></span>
                      </div>
                      <div style={{ zIndex: 1, width: '100%', height: '100%' }}>
                        <CellRenderer
                          cell={cell} // 🚀 Pass the entire cell object
                          isSelected={false} // isSelected logic can be re-added if needed
                          cardInstanceId={cardInstanceId}
                        />
                      </div>
                    </div>
                  );
                })
              }
            </ResponsiveReactGridLayout>
           );
           })()}
        </div>
      </div>
    </div>
  );
};

export default LayoutSelectionSection; 