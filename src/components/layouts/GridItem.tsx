import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig, InventreeItem, ParameterAction, ActionDefinition, ActionExecutionContext, VisualEffect } from '../../types';
import { RootState, useAppDispatch, store } from '../../store/index';
import { selectVisualEffectForPart } from '../../store/slices/visualEffectsSlice';
import { useGetPartQuery, useGetPartParametersQuery, useUpdatePartParameterMutation } from '../../store/apis/inventreeApi';
import { setLocatingPartId, selectLocatingPartId } from '../../store/slices/partsSlice';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { actionEngine } from '../../services/ActionEngine';
import { motion, Variants } from 'framer-motion';
import { useMemo, useCallback } from 'react';

import PartButtons from '../part/PartButtons';
import PartThumbnail from '../part/PartThumbnail';

ConditionalLoggerEngine.getInstance().registerCategory('GridItem', { enabled: false, level: 'info' });

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
    height: config?.layout?.item_height ? `${config.layout.item_height}px` : 'auto',
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
  const logger = useMemo(() => {
    return ConditionalLoggerEngine.getInstance().getLogger('GridItem', cardInstanceId);
  }, [cardInstanceId]);
  
  logger.verbose('GridItem', `Render Start for partId: ${partId}`, { cardInstanceId });
  const dispatch = useAppDispatch();

  // Get config from the Redux store - CORRECTED a bug where it was looking for state.config.config
  const configState = useSelector((state: RootState) => cardInstanceId ? state.config.configsByInstance[cardInstanceId] : undefined);
  const config = configState?.config;

  // A component cannot render without its config or if its initialization flag isn't set.
  if (!configState || !configState.configInitialized || !config || !cardInstanceId) {
    logger.warn('GridItem', `Render blocked for partId ${partId}: config or cardInstanceId not ready.`, { hasConfigState: !!configState, hasConfigInitialized: !!configState?.configInitialized, hasConfig: !!config, hasId: !!cardInstanceId });
    return <div style={{ padding: '8px' }}>Loading...</div>;
  }

  // 1. Fetch own data using the partId prop
  const { data: part, isLoading: isLoadingPart, isError: isPartError, error: partError } = useGetPartQuery({ pk: partId, cardInstanceId });

  // Selectors and hooks now use the fetched part or partId
  const isCurrentlyLocating = useSelector((state: RootState) => selectLocatingPartId(state, cardInstanceId) === partId);
  const actualModifiers = useSelector((state: RootState) => selectVisualEffectForPart(state, cardInstanceId, partId)) || EMPTY_MODIFIERS;

  logger.debug('GridItem', `[partId=${partId}] Received visual modifiers`, { actualModifiers });

  // Directly access the display configuration. No special hook needed.
  const displayConfig = config.display || {};
  const shouldShowImage = displayConfig.show_image;
  const shouldShowName = displayConfig.show_name;
  const shouldShowStock = displayConfig.show_stock;
  const shouldShowDescription = displayConfig.show_description;
  const shouldShowButtons = displayConfig.show_buttons;
  const parametersDisplayEnabled = displayConfig.show_parameters;

  const {
    data: parametersData,
    isLoading: isLoadingParameters,
    isError,
    error,
  } = useGetPartParametersQuery({ partId, cardInstanceId }, { skip: !parametersDisplayEnabled });

  const [updatePartParameter] = useUpdatePartParameterMutation();

  // 2. Internalize event handlers
  const handleLocateGridItem = useCallback(() => {
    logger.info('handleLocateGridItem', `Locate clicked for partId: ${partId}`);
    dispatch(setLocatingPartId({ partId, cardInstanceId }));

    setTimeout(() => {
      // Check if this part is still the one being located before clearing
      const currentState = store.getState();
      if (selectLocatingPartId(currentState, cardInstanceId) === partId) {
        dispatch(setLocatingPartId({ partId: null, cardInstanceId }));
      }
    }, 5000); // Turn off after 5 seconds
  }, [dispatch, partId, cardInstanceId]);

  const handleParameterActionClick = useCallback(async (action: ParameterAction, parameterPk?: number) => {
    logger.info('handleParameterActionClick', `Parameter action clicked for parameterPk: ${parameterPk}`, { action });
    if (!parameterPk) return;
    
    try {
      await updatePartParameter({
        partId: partId,
        parameterPk: parameterPk,
        value: 'NewValue',
        cardInstanceId: cardInstanceId,
      }).unwrap();
      logger.info('handleParameterActionClick', `Successfully updated parameter ${parameterPk}`);
    } catch (err) {
      logger.error('handleParameterActionClick', `Failed to update parameter ${parameterPk}`, err as any);
    }
  }, [updatePartParameter, partId, cardInstanceId]);

  const handleThumbnailClick = useMemo(() => {
    if (!config.actions || !part) return undefined;

    const thumbnailClickAction = config.actions.find(
      (action: ActionDefinition) => action.trigger.type === 'ui_thumbnail_click'
    );

    if (thumbnailClickAction) {
      return (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        logger.debug('handleThumbnailClick', `Thumbnail clicked for part ${part.pk}, executing action: ${thumbnailClickAction.name}`);
        
        const executionContext: ActionExecutionContext = {
          part: part,
          hassStates: hass?.states,
          config: config,
          cardInstanceId: cardInstanceId,
          hass: hass,
        };
        actionEngine.executeAction(thumbnailClickAction.id, executionContext, cardInstanceId);
      };
    }
    return undefined;
  }, [config, part, hass, cardInstanceId]);

  // Handle loading and error states for the main part data
  if (isLoadingPart) {
    logger.verbose('GridItem', `Loading part data for partId: ${partId}`);
    return <div>Loading part {partId}...</div>;
  }

  if (isPartError || !part) {
    logger.error('GridItem', `Error loading part ${partId}.`, new Error(JSON.stringify(partError)), { isPartError });
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
    logger.debug('GridItem', `partId ${partId} is not visible, rendering null.`);
    return null;
  }

  // Correctly extract the animation object from the modifiers.
  const animation = actualModifiers.animation || {};
  
  // Determine the animation state based on whether an effect is present.
  const animationState = animation.animate ? "shaking" : "idle";

  logger.verbose('GridItem', `Render complete for partId: ${partId}`, { animationState });

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
            cardInstanceId={cardInstanceId}
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
                  if (typeof error === 'object' && error !== null && 'status' in error) {
                    const customError = error as { status?: number | 'CUSTOM_ERROR'; data?: any; message?: string };
                    if (customError.data && typeof customError.data === 'object' && customError.data.message) {
                      return customError.data.message;
                    } else if (typeof customError.data === 'string') {
                      return customError.data;
                    }
                  }
                  return 'An unknown error occurred.';
                })()
              }
            </p>
          )}
          {parametersData && parametersData.map(param => (
            <div key={param.pk} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{param.template_detail?.name}:</span>
              <span>{param.data}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

export default GridItem; 