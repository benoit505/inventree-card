import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, ParameterDetail, ActionDefinition, ActionExecutionContext } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { RootState, useAppDispatch } from '../../store/index';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { useGetPartQuery, useGetPartParametersQuery, useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';
import { locatePartById } from '../../store/slices/partsSlice';
import { Logger } from '../../utils/logger';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { actionEngine } from '../../services/ActionEngine';
import { useElementDisplayStatus } from '../../hooks/useElementDisplayStatus';
import { motion, TargetAndTransition, Transition, Variants } from 'framer-motion';
import { useMemo, useCallback } from 'react';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

interface GridItemProps {
  partId: number;
  hass?: HomeAssistant;
  cardInstanceId?: string;
}

const EMPTY_MODIFIERS: VisualEffect = {};

// Define animation variants. The 'shaking' variant is a function that
// receives the 'custom' prop and returns only the animatable target properties.
const itemVariants: Variants = {
  idle: {
    x: 0, // When not shaking, ensure x position is at baseline.
  },
  shaking: (custom) => custom?.animate || {},
};

// Helper functions (can be co-located or imported if used elsewhere)
const getGridItemContainerStyle = (modifiers?: VisualEffect, config?: InventreeCardConfig): React.CSSProperties => {
  const styles: React.CSSProperties = {
    border: '1px solid #eee', // Default border
    padding: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    height: config?.layout_options?.item_height ? `${config.layout_options.item_height}px` : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  if (modifiers?.highlight) styles.backgroundColor = modifiers.highlight;
  if (modifiers?.border) styles.border = modifiers.border;
  if (typeof modifiers?.opacity === 'number') styles.opacity = modifiers.opacity;
  return styles;
};

const getGridItemTextStyle = (modifiers?: VisualEffect): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  if (modifiers?.textColor) styles.color = modifiers.textColor;
  return styles;
};

const GridItem: React.FC<GridItemProps> = React.memo(({
  partId,
  hass,
  cardInstanceId,
}) => {
  const logger = Logger.getInstance();
  const dispatch = useAppDispatch();

  // Get config from the Redux store - CORRECTED a bug where it was looking for state.config.config
  const config = useSelector((state: RootState) => state.config);

  // A component cannot render without its config or if its initialization flag isn't set.
  if (!config || !config.configInitialized) {
    return <div style={{ padding: '8px' }}>Loading...</div>;
  }

  // 1. Fetch own data using the partId prop
  const { data: part, isLoading: isLoadingPart, isError: isPartError, error: partError } = useGetPartQuery(partId);

  // Selectors and hooks now use the fetched part or partId
  const isCurrentlyLocating = useSelector((state: RootState) => state.parts.locatingPartId === partId);
  const actualModifiers = useSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId!, partId)) || EMPTY_MODIFIERS;

  console.log(`[GridItem partId=${partId}] Received visual modifiers:`, actualModifiers);

  // Use the new hook for individual element visibility
  const shouldShowImage = useElementDisplayStatus(cardInstanceId, 'show_image', config.display);
  const shouldShowName = useElementDisplayStatus(cardInstanceId, 'show_name', config.display);
  const shouldShowStock = useElementDisplayStatus(cardInstanceId, 'show_stock', config.display);
  const shouldShowDescription = useElementDisplayStatus(cardInstanceId, 'show_description', config.display);
  const shouldShowButtons = useElementDisplayStatus(cardInstanceId, 'show_buttons', config.display);

  const parametersDisplayEnabled = useElementDisplayStatus(cardInstanceId, 'show_parameters', config.display);

  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError,
    error,
  } = useGetPartParametersQuery(partId, { skip: !parametersDisplayEnabled });

  const [updatePartParameter, { isLoading: isUpdatingParameter }] = useUpdatePartParameterMutation();

  // 2. Internalize event handlers
  const handleLocateGridItem = useCallback(() => {
    if (hass) {
      dispatch(locatePartById({ partId, hass }));
    }
  }, [dispatch, partId, hass]);

  const handleParameterActionClick = useCallback(async (action: ParameterAction, parameterPk?: number) => {
    if (!parameterPk) return;
    
    // This logic is simplified. A real implementation would call the appropriate service.
    // For now, we'll assume it's an update action.
    try {
      await updatePartParameter({
        partId: partId,
        parameterPk: parameterPk,
        value: 'NewValue' // This needs a way to get the new value, e.g., from a prompt
      }).unwrap();
    } catch (err) {
      logger.error('GridItem', `Failed to update parameter ${parameterPk}`, err);
    }
  }, [updatePartParameter, partId, logger]);

  const handleThumbnailClick = useMemo(() => {
    if (!config.actions || !part) return undefined;

    const thumbnailClickAction = config.actions.find(
      (action: ActionDefinition) => action.trigger.type === 'ui_thumbnail_click'
    );

    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.log('GridItem', `Thumbnail clicked for part ${part.pk}, executing action: ${thumbnailClickAction.name}`);
        const executionContext: ActionExecutionContext = {
          part: part,
          hassStates: hass?.states,
        };
        actionEngine.executeAction(thumbnailClickAction.id, { ...executionContext, hass });
      };
    }
    return undefined;
  }, [config.actions, part, hass, logger]);

  // Handle loading and error states for the main part data
  if (isLoadingPart) {
    return <div>Loading part {partId}...</div>;
  }

  if (isPartError || !part) {
    // A more sophisticated error component could be used here
    return <div style={{color: 'red'}}>Error loading part {partId}.</div>;
  }

  const itemContainerStyle = getGridItemContainerStyle(actualModifiers, config);
  const itemTextStyle = getGridItemTextStyle(actualModifiers);

  const itemClasses = [
    'part-container',
    isCurrentlyLocating ? 'locating' : '',
    actualModifiers?.priority ? `priority-${actualModifiers.priority}` : '',
    ...(actualModifiers?.customClasses || [])
  ].filter(Boolean).join(' ');

  if (actualModifiers.isVisible === false) {
    return null;
  }

  // Correctly extract the animation object from the modifiers.
  const animation = actualModifiers.animation || {};
  
  // Determine the animation state based on whether an effect is present.
  const animationState = animation.animate ? "shaking" : "idle";

  return (
    <motion.div
      key={partId}
      className={itemClasses}
      style={itemContainerStyle}
      onClick={handleLocateGridItem}
      variants={itemVariants}
      animate={animationState}
      // Pass the whole animation object (which includes 'animate' and 'transition')
      // as the custom prop. The 'shaking' variant will extract what it needs.
      custom={animation}
      // Pass the transition object directly as a prop.
      transition={animation.transition}
    >
      {shouldShowImage && (
        <div className="part-thumbnail" style={{ marginBottom: '8px' }}>
          <PartThumbnail
            partData={part}
            config={config}
            layout="grid"
            visualModifiers={actualModifiers}
            onClick={handleThumbnailClick}
          />
        </div>
      )}
      <div className="part-info" style={{ ...itemTextStyle, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {shouldShowName && <div className="part-name" style={{ fontWeight: 'bold' }}>{part.name}</div>}
        {shouldShowStock && (
          <div className="part-stock">Stock: {part.in_stock} {part.units || ''}</div>
        )}
        {shouldShowDescription && part.description && (
          <p className="part-description" style={{ fontSize: '0.8em', margin: '4px 0' }}>{part.description}</p>
        )}
      </div>
      <div className="part-actions-footer" style={{ marginTop: 'auto' }}>
        {shouldShowButtons && hass && config && (
          <div style={{ fontSize: 'small', color: 'gray', padding: '4px 0' }}>
            <PartButtons partItem={part} config={config} hass={hass} cardInstanceId={cardInstanceId} />
          </div>
        )}
        <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
          {/* This parameterActions logic will need to be re-evaluated as it was passed via props */}
          {/* For now, it is removed to complete the refactor. A new source for these actions is needed. */}
        </div>
      </div>
      {isCurrentlyLocating && <div className="locating-indicator">Locating...</div>}
      {parametersDisplayEnabled && (
        <div className="part-parameters" style={{ fontSize: '0.75em', textAlign: 'left', marginTop: '8px' }}>
          {isLoadingParameters && <p>Loading parameters...</p>}
          {isError && (
            <p style={{color: 'red'}}>
              Error loading parameters: {
                (() => {
                  if (error) {
                    if ('status' in error) {
                      const customError = error as { status?: number | 'CUSTOM_ERROR'; data?: any; message?: string };
                      if (customError.data && typeof customError.data === 'object' && customError.data.message) {
                        return customError.data.message;
                      } else if (typeof customError.data === 'string') {
                        return customError.data;
                      }
                      return customError.message || customError.status?.toString() || 'API error';
                    } else {
                      return (error as SerializedError).message || 'Unknown client error';
                    }
                  }
                  return 'Unknown error';
                })()
              }
            </p>
          )}
          {parametersData && parametersData.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {parametersData.map((parameter: ParameterDetail) => (
                <li key={parameter.pk}>{parameter.template_detail?.name}: {parameter.data}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
});

export default GridItem; 