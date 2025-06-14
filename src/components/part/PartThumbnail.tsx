import React, { useState, useEffect, useCallback } from 'react';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';
import { RootState } from '../../store';
import { Logger } from '../../utils/logger';
import { motion, TargetAndTransition, Transition } from 'framer-motion';

interface PartThumbnailProps {
  partData?: InventreeItem;
  config?: InventreeCardConfig;
  layout?: 'grid' | 'list' | 'detail' | 'button' | 'default';
  icon?: string;
  badge?: string | number;
  visualModifiers?: VisualEffect;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  className?: string;
}

// Define preferred extensions and base path (could be made configurable later)
const LOCAL_THUMB_BASE_PATH = '/local/inventree_thumbs/';
const PREFERRED_THUMB_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

const PartThumbnail: React.FC<PartThumbnailProps> = React.memo(({ 
  partData, 
  config, 
  layout: propLayout,
  icon: directIcon,
  badge: directBadge,
  visualModifiers,
  onClick,
  style: propStyle,
  className: propClassName,
}) => {
  const logger = Logger.getInstance();
  
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [imageToAttempt, setImageToAttempt] = useState<string | null>(null);

  const [attemptedAutoprobeIndex, setAttemptedAutoprobeIndex] = useState<number>(0);
  const [hasTriedAllLocalAutoprobe, setHasTriedAllLocalAutoprobe] = useState<boolean>(false);
  const [explicitOverrideAttempted, setExplicitOverrideAttempted] = useState<boolean>(false);
  const [explicitOverrideFailed, setExplicitOverrideFailed] = useState<boolean>(false);

  // Animation props are now derived from visualModifiers
  // const animationProps = visualModifiers?.animation; // No longer needed here

  // Effect 1: Initiate image loading sequence when partData or config changes
  useEffect(() => {
    setAttemptedAutoprobeIndex(0);
    setHasTriedAllLocalAutoprobe(false);
    setExplicitOverrideAttempted(false);
    setExplicitOverrideFailed(false);
    setImageToAttempt(null); 

    if (!partData || !partData.pk) {
      setCurrentSrc(null); 
      return;
    }

    const overrides = config?.data_sources?.inventree_pk_thumbnail_overrides;
    const explicitOverride = overrides?.find((ov: { pk: number; path: string; }) => ov.pk === partData.pk);

    let initialAttemptPath: string | null = null;

    if (explicitOverride && explicitOverride.path) {
      let path = explicitOverride.path;
      if (!path.startsWith('/')) path = `/${path}`;
      if (!path.startsWith('/local/')) path = `/local${path}`;
      initialAttemptPath = path;
      setExplicitOverrideAttempted(true);
    } else if (PREFERRED_THUMB_EXTENSIONS.length > 0) {
      initialAttemptPath = `${LOCAL_THUMB_BASE_PATH}part_${partData.pk}.${PREFERRED_THUMB_EXTENSIONS[0]}`;
    } else {
      initialAttemptPath = partData.thumbnail || null;
      setHasTriedAllLocalAutoprobe(true); 
    }
    setImageToAttempt(initialAttemptPath);
  }, [partData, config]);

  // Effect 2: Process imageToAttempt (preload and set currentSrc or find next)
  useEffect(() => {
    if (!imageToAttempt) {
      return;
    }
    
    const img = new window.Image();
    img.onload = () => {
      setCurrentSrc(imageToAttempt);
    };

    img.onerror = () => {
      let nextImageToTry: string | null = null;

      if (explicitOverrideAttempted && !explicitOverrideFailed) {
        setExplicitOverrideFailed(true);
        nextImageToTry = partData?.thumbnail || null;
      } else if (!hasTriedAllLocalAutoprobe && !explicitOverrideFailed) {
        const nextIdx = attemptedAutoprobeIndex + 1;
        if (nextIdx < PREFERRED_THUMB_EXTENSIONS.length) {
          setAttemptedAutoprobeIndex(nextIdx);
          nextImageToTry = `${LOCAL_THUMB_BASE_PATH}part_${partData!.pk}.${PREFERRED_THUMB_EXTENSIONS[nextIdx]}`;
        } else {
          setHasTriedAllLocalAutoprobe(true);
          nextImageToTry = partData?.thumbnail || null;
        }
      } else {
        setCurrentSrc(null); 
      }
      
      if (imageToAttempt !== nextImageToTry) {
        setImageToAttempt(nextImageToTry);
      } else if (nextImageToTry === null) {
        setCurrentSrc(null);
      }
    };

    img.src = imageToAttempt;

    return () => { 
      img.onload = null;
      img.onerror = null;
    };
  }, [imageToAttempt, partData, explicitOverrideAttempted, explicitOverrideFailed, attemptedAutoprobeIndex, hasTriedAllLocalAutoprobe]);

  if (!partData) {
    return null; 
  }

  // Determine layout: prop > config.view_type > default ('default')
  const layout = propLayout || (config?.view_type as any) || 'default';

  // Combine direct props with modifiers for final values
  const finalIcon = directIcon ?? visualModifiers?.icon;
  const finalBadge = directBadge ?? visualModifiers?.badge;
  const thumbnailStyle = visualModifiers?.thumbnailStyle;

  const imageSizeFromConfig = config?.style?.image_size;
  const defaultGridSize = 80; 
  const gridSize = typeof imageSizeFromConfig === 'number' && imageSizeFromConfig > 0 ? imageSizeFromConfig : defaultGridSize;

  const containerStyleBase: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    cursor: onClick ? 'pointer' : 'default',
  };

  let specificContainerStyle: React.CSSProperties;

  switch(layout) {
    case 'detail':
      specificContainerStyle = { width: '100%', height: 'auto', aspectRatio: '1 / 1' };
      break;
    case 'list':
      specificContainerStyle = { width: '40px', height: '40px' };
      break;
    case 'grid':
    default:
      specificContainerStyle = { width: `${gridSize}px`, height: `${gridSize}px`, aspectRatio: '1 / 1' };
      break;
  }
  
  const containerStyle = { ...containerStyleBase, ...specificContainerStyle, ...propStyle };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: currentSrc ? 'block' : 'none',
    opacity: thumbnailStyle?.opacity ?? (currentSrc ? 1 : 0),
    filter: thumbnailStyle?.filter,
    transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
  };

  const placeholderStyle: React.CSSProperties = {
    display: !currentSrc ? 'flex' : 'none',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    color: '#757575',
    fontSize: layout === 'list' ? '1em' : (layout === 'grid' || layout === 'default' ? '1.5em' : '2em'),
    fontWeight: 'bold',
  };
  
  const iconBadgeStyleBase: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1,
  };

  const iconStyle: React.CSSProperties = {
    ...iconBadgeStyleBase,
    top: '4px',
    left: '4px',
    fontSize: layout === 'list' ? '16px' : '24px',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: '2px',
  };

  const textBadgeStyle: React.CSSProperties = {
    ...iconBadgeStyleBase,
    bottom: '4px',
    right: '4px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '2px 5px',
    borderRadius: '3px',
    fontSize: layout === 'list' ? '0.6em' : '0.7em',
  };

  // Logic to prevent rendering an empty box if there's nothing to show
  const hasContent = currentSrc || finalIcon || finalBadge;
  if (!hasContent) {
    // If layout is button-like or has a click handler, maybe show a placeholder anyway
    if (layout === 'button' || onClick) {
      // Render a generic placeholder
      return (
        <div 
          style={containerStyle} 
          onClick={onClick} 
          className={`part-thumbnail-container layout-${layout} ${propClassName || ''}`.trim()}
        >
          <div style={placeholderStyle}>
            {(partData?.name || 'Part').substring(0, 1)}
          </div>
        </div>
      );
    }
    return null; // Otherwise, render nothing
  }

  return (
    <div 
      style={containerStyle} 
      onClick={onClick} 
      className={`part-thumbnail-container layout-${layout} ${propClassName || ''}`.trim()}
    >
      {currentSrc && <img src={currentSrc} alt={partData?.name || 'Part Image'} style={imageStyle} />}
      {!currentSrc && (
        <div style={placeholderStyle}>
          {(partData?.name || 'Part').substring(0, 1)}
        </div>
      )}
      {finalIcon && (
        <span style={iconStyle}>
          {typeof finalIcon === 'string' && finalIcon.startsWith('mdi:') ? 
            <ha-icon icon={finalIcon}></ha-icon> : 
            <span dangerouslySetInnerHTML={{ __html: finalIcon || '' }} />
          }
        </span>
      )}
      {finalBadge && (
        <span style={textBadgeStyle}>
          {finalBadge}
        </span>
      )}
    </div>
  );
});

export default PartThumbnail; 