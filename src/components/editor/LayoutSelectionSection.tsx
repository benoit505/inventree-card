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
  
  // 🎨 NEW: Preview zoom control (local state, not saved)
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  
  // Grid columns is now saved in the actual config!
  const gridColumns = actualLayoutConfig.gridColumns || 24; // Default to 24 columns
  
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
          <strong>Grid Columns:</strong>
          <select 
            value={gridColumns} 
            onChange={(e) => handleNonCellLayoutChange('gridColumns', parseInt(e.target.value))}
            style={{ marginLeft: '5px', fontWeight: 'bold' }}
          >
            <option value="4">4 cols (Mobile - 320px)</option>
            <option value="8">8 cols (Small - 480px)</option>
            <option value="12">12 cols (Tablet - 768px)</option>
            <option value="20">20 cols (Desktop - 996px)</option>
            <option value="24">24 cols (Large - 1200px+)</option>
          </select>
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
                  {cell.content === 'in_stock' && (
                    <button 
                      onClick={() => setEditingCellId(editingCellId === cell.id ? null : cell.id)}
                      style={{ marginRight: '8px' }}
                    >
                      {editingCellId === cell.id ? 'Close' : '⚖️ Portions'}
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
        
        {/* ⚖️ Stock Portions Configuration UI (conditionally rendered) */}
        {editingCell && editingCell.content === 'in_stock' && (() => {
          const part = parts.find(p => p.pk === editingCell.partPk);
          const header = part ? `${part.name} - ${editingCell.content}` : `Part ${editingCell.partPk} - ${editingCell.content}`;
          const currentDecrement = editingCell.decrementAmount || 1;
          const currentIncrement = editingCell.incrementAmount || 1;
          const currentUnit = editingCell.stockUnit || '';
          const currentSliderMin = editingCell.sliderMin ?? 0;
          const currentSliderMax = editingCell.sliderMax ?? 1000;
          const currentSliderStep = editingCell.sliderStep ?? 1;
          
          return (
            <div style={{ marginTop: '10px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px', background: '#f9fff9' }}>
              <h6 style={{ margin: '0 0 10px 0', color: '#2E7D32' }}>⚖️ Configure Stock Settings for "{header}"</h6>
              
              {/* Unit Selection */}
              <div style={{ marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  📏 Stock Unit
                </label>
                <select
                  value={currentUnit}
                  onChange={(e) => {
                    const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                      c.id === editingCell.id ? { ...c, stockUnit: e.target.value } : c
                    );
                    wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                  }}
                  style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                >
                  <option value="">None</option>
                  <option value="g">g (grams)</option>
                  <option value="ml">ml (milliliters)</option>
                  <option value="p">p (pieces)</option>
                  <option value="kg">kg (kilograms)</option>
                  <option value="L">L (liters)</option>
                </select>
                <small style={{ color: '#666' }}>Unit displayed next to stock value (e.g., "500g")</small>
              </div>
              
              {/* Button Portions */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#d32f2f' }}>
                    − Button (Decrease)
                  </label>
                  <input
                    type="number"
                    placeholder="Amount to subtract (e.g., 15)"
                    value={currentDecrement}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 1;
                      const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                        c.id === editingCell.id ? { ...c, decrementAmount: Math.abs(value) } : c
                      );
                      wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                    }}
                    style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                  />
                  <small style={{ color: '#666' }}>Each click will subtract {currentDecrement}{currentUnit}</small>
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#4CAF50' }}>
                    + Button (Increase)
                  </label>
                  <input
                    type="number"
                    placeholder="Amount to add (e.g., 500)"
                    value={currentIncrement}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 1;
                      const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                        c.id === editingCell.id ? { ...c, incrementAmount: Math.abs(value) } : c
                      );
                      wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                    }}
                    style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                  />
                  <small style={{ color: '#666' }}>Each click will add {currentIncrement}{currentUnit}</small>
                </div>
              </div>
              
              {/* Slider Settings */}
              <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196F3' }}>
                <h6 style={{ margin: '0 0 10px 0', color: '#1976D2' }}>🎚️ Slider Mode Settings</h6>
                <p style={{ fontSize: '11px', color: '#666', margin: '0 0 10px 0' }}>
                  Configure the slider for precise stock adjustments (opens when clicking "📊 Edit")
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>
                      Min
                    </label>
                    <input
                      type="number"
                      value={currentSliderMin}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                          c.id === editingCell.id ? { ...c, sliderMin: value } : c
                        );
                        wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                      }}
                      style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>
                      Max
                    </label>
                    <input
                      type="number"
                      value={currentSliderMax}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 1000;
                        const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                          c.id === editingCell.id ? { ...c, sliderMax: value } : c
                        );
                        wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                      }}
                      style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '3px' }}>
                      Step
                    </label>
                    <input
                      type="number"
                      value={currentSliderStep}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 1;
                        const newCells = (actualLayoutConfig.cells || []).map((c: CellDefinition) => 
                          c.id === editingCell.id ? { ...c, sliderStep: value } : c
                        );
                        wrappedOnLayoutConfigChanged({ ...actualLayoutConfig, cells: newCells });
                      }}
                      style={{ width: '100%', padding: '6px', fontSize: '13px' }}
                    />
                  </div>
                </div>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Slider range: {currentSliderMin} to {currentSliderMax}, steps of {currentSliderStep}
                </small>
              </div>
              
              {/* Example Box */}
              <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                <strong>💡 Examples:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px' }}>
                  <li><strong>Coffee (500g bag):</strong> Unit=g, Decrement=15, Increment=500, Slider: 0-1000 step 50</li>
                  <li><strong>Bananas (pieces):</strong> Unit=p, Decrement=1, Increment=6, Slider: 0-10 step 1</li>
                  <li><strong>Milk (1L carton):</strong> Unit=ml, Decrement=250, Increment=1000, Slider: 0-2000 step 250</li>
                </ul>
              </div>
            </div>
          );
        })()}
      </div>
      
      <div className="layout-preview" style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
        <h5>Live Layout Preview</h5>
        
        {/* 🎨 Preview Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '10px', 
          padding: '10px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '12px' }}>Preview Zoom:</label>
            <input
              type="range"
              min="25"
              max="150"
              step="5"
              value={previewZoom}
              onChange={(e) => setPreviewZoom(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
            <span style={{ fontSize: '12px', minWidth: '45px' }}>{previewZoom}%</span>
            <button 
              onClick={() => setPreviewZoom(100)} 
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              Reset
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={showGridLines}
                onChange={(e) => setShowGridLines(e.target.checked)}
                style={{ marginRight: '4px' }}
              />
              Show Grid Lines
            </label>
          </div>
          
          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '11px', 
            color: '#666',
            padding: '4px 8px',
            background: 'white',
            borderRadius: '4px'
          }}>
            💡 Previewing with {gridColumns} columns. Change "Grid Columns" setting above to adjust.
          </div>
        </div>
        
        <div style={{ 
          border: `1px solid ${theme.borderColor}`, 
          background: theme.backgroundGradient, 
          minHeight: '120px', 
          position: 'relative',
          borderRadius: '16px',
          padding: '16px',
          backdropFilter: 'blur(5px)',
          overflow: 'auto' // Allow scrolling if zoomed in
        }}>
          {/* 🎨 Grid lines overlay */}
          {showGridLines && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
              gap: '0',
              padding: '16px',
              opacity: 0.3
            }}>
              {Array.from({ length: gridColumns }).map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    borderRight: i < gridColumns - 1 ? '1px dashed #999' : 'none',
                    height: '100%'
                  }} 
                />
              ))}
            </div>
          )}
          
          <div style={{
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / previewZoom}%`, // Compensate for scale
            position: 'relative',
            zIndex: 1
          }}>
           {(() => {
             const gridKey = `grid-${JSON.stringify({ cells: actualLayoutConfig.cells || [], rowHeight: actualLayoutConfig.rowHeight, allowOverlap: actualLayoutConfig.allowOverlap, gridColumns })}`;
             console.log('🔄 GRID KEY: Using key:', gridKey);
             return (
           <ResponsiveReactGridLayout
              key={gridKey}
              className="layout"
              layouts={generatedLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: gridColumns, md: gridColumns, sm: gridColumns, xs: gridColumns, xxs: gridColumns }}
              rowHeight={actualLayoutConfig.rowHeight || 50}
              isDraggable={true}
              isResizable={true}
              draggableHandle=".drag-handle"
              draggableCancel=".no-drag"
              resizeHandle={CustomResizeHandle}
              compactType={null}
              preventCollision={false}
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
    </div>
  );
};

export default LayoutSelectionSection; 