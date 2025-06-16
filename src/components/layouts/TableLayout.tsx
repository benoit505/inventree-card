import React, { useMemo, useState } from 'react';
import { HomeAssistant } from 'custom-card-helpers';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  Table,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { get } from 'lodash';
import { ActionEngine } from '../../services/ActionEngine';
import { InventreeItem, LayoutColumn, LayoutConfig, InventreeCardConfig } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import ImageWithFallback from '../common/ImageWithFallback';

const LOCAL_THUMB_BASE_PATH = '/local/inventree_thumbs/';
const PREFERRED_THUMB_EXTENSIONS = ['png', 'jpg', 'webp'];

interface TableLayoutProps {
  hass: HomeAssistant;
  parts: InventreeItem[];
  layoutConfig: LayoutConfig;
  cardInstanceId: string;
}

const TableLayout: React.FC<TableLayoutProps> = ({ hass, parts, layoutConfig, cardInstanceId }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const apiUrl = useSelector((state: RootState) => state.api.url);
  const actionDefinitions = useSelector((state: RootState) => state.actions.actionDefinitions);
  const visualEffectsByPart = useSelector((state: RootState) => state.visualEffects.effectsByCardInstance[cardInstanceId] || {});
  const actionEngine = useMemo(() => ActionEngine.getInstance(), []);

  const columns = useMemo<ColumnDef<InventreeItem>[]>(() => {
    return (layoutConfig.columns || []).map((col: LayoutColumn) => ({
      accessorKey: col.content,
      id: col.id,
      header: col.header ?? col.content,
      width: col.width,
      cell: info => {
        const part = info.row.original;

        if (col.content === 'thumbnail') {
          const potentialSources: string[] = [];

          // 1. Add local paths first
          PREFERRED_THUMB_EXTENSIONS.forEach(ext => {
            potentialSources.push(`${LOCAL_THUMB_BASE_PATH}part_${part.pk}.${ext}`);
          });

          // 2. Add remote API path as the last resort
          const apiThumbnailUrl = get(part, 'thumbnail');
          if (apiThumbnailUrl && apiUrl) {
            const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            const relativeUrl = apiThumbnailUrl.startsWith('/') ? apiThumbnailUrl.slice(1) : apiThumbnailUrl;
            potentialSources.push(`${baseUrl}/${relativeUrl}`);
          }
          
          return (
            <ImageWithFallback
              sources={potentialSources}
              alt={part.name}
              height={40}
              width={40}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              effect="blur"
              placeholder={<div style={{height: '40px', width: '40px', backgroundColor: '#e0e0e0', borderRadius: '4px'}} />}
            />
          );
        }

        if (col.content === 'buttons') {
          if (!col.buttons || col.buttons.length === 0) return null;

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {col.buttons.map(buttonConfig => {
                // Check if this button should be rendered for this specific part
                if (buttonConfig.targetPartPks && !buttonConfig.targetPartPks.includes(part.pk)) {
                  return null; // Don't render the button if the part PK is not in the target list
                }

                const actionDef = actionDefinitions[buttonConfig.actionId];
                if (!actionDef) return null;

                const icon = actionDef.trigger?.ui?.icon;
                const label = actionDef.name || actionDef.id;

                return (
                  <button 
                    key={buttonConfig.id} 
                    onClick={() => actionEngine.executeAction(buttonConfig.actionId, { part, hass })} 
                    style={{ display: 'flex', alignItems: 'center', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }} 
                    title={label}
                  >
                    {icon ? <ha-icon icon={icon} /> : <span>{label}</span>}
                  </button>
                );
              })}
            </div>
          );
        }

        const value = get(part, col.content);
        console.log(`[TableLayout Cell Render] Part PK: ${part.pk}, Column: ${col.id}, Content Key: ${col.content}, Value:`, value);
        return value !== null && value !== undefined ? String(value) : null;
      },
    }));
  }, [layoutConfig.columns, apiUrl, actionDefinitions, actionEngine]);

  const table = useReactTable({
    data: parts,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
  });

  return (
    <div style={{ width: '100%' }}>
      {layoutConfig.enableFiltering && <div style={{ padding: '8px' }}><input value={globalFilter ?? ''} onChange={e => setGlobalFilter(String(e.target.value))} placeholder="Search all columns..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} /></div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const colDef = header.column.columnDef as any;
                return (
                  <th key={header.id} colSpan={header.colSpan} style={{ width: colDef.width || header.getSize(), cursor: 'pointer' }} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            const effects = visualEffectsByPart[row.original.pk];
            if (effects?.isVisible === false) return null;
            
            // Start with base styles from the config
            const rowStyle: React.CSSProperties = {
              height: layoutConfig.rowHeight ? `${layoutConfig.rowHeight}px` : 'auto',
            };

            // Apply conditional effect styles, overriding base if necessary
            if (effects?.highlight) rowStyle.backgroundColor = effects.highlight;
            if (effects?.textColor) rowStyle.color = effects.textColor;
            if (effects?.border) rowStyle.border = effects.border;
            if (effects?.opacity) rowStyle.opacity = effects.opacity;

            const animation = effects?.animation || {};
            const animationState = animation.animate ? "shaking" : "idle";

            return (
              <motion.tr
                key={row.id}
                style={rowStyle}
                variants={{
                  idle: { x: 0 },
                  shaking: (custom) => custom?.animate || {},
                }}
                animate={animationState}
                custom={animation}
                transition={animation.transition}
              >
                {row.getVisibleCells().map(cell => {
                  const colDef = cell.column.columnDef as any;
                  
                  // Start with a base style object
                  let cellStyle: React.CSSProperties = {
                    width: colDef.width || cell.column.getSize(),
                  };

                  // Check for and apply cell-specific styles from the effects engine
                  const cellEffects = effects?.cellStyles?.[cell.column.id];
                  if (cellEffects) {
                    cellStyle = { ...cellStyle, ...cellEffects };
                  }

                  return (
                    <td key={cell.id} style={cellStyle}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableLayout; 