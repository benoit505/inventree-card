import React, { useState, useEffect, useCallback } from 'react';
import { InventreeItem, InventreeCardConfig } from '../../types';
import { VisualEffect } from '../../store/slices/visualEffectsSlice';

interface PartThumbnailProps {
  partData?: InventreeItem;
  config?: InventreeCardConfig;
  layout?: 'grid' | 'list' | 'detail';
  icon?: string; // From VisualModifiers
  badge?: string | number; // From VisualModifiers
  visualEffect?: VisualEffect;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Define preferred extensions and base path (could be made configurable later)
const LOCAL_THUMB_BASE_PATH = '/local/inventree_thumbs/';
const PREFERRED_THUMB_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

const PartThumbnail: React.FC<PartThumbnailProps> = ({ partData, config, layout: propLayout, icon: directIcon, badge: directBadge, visualEffect, onClick }) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [imageToAttempt, setImageToAttempt] = useState<string | null>(null);

  const [attemptedAutoprobeIndex, setAttemptedAutoprobeIndex] = useState<number>(0);
  const [hasTriedAllLocalAutoprobe, setHasTriedAllLocalAutoprobe] = useState<boolean>(false);
  const [explicitOverrideAttempted, setExplicitOverrideAttempted] = useState<boolean>(false);
  const [explicitOverrideFailed, setExplicitOverrideFailed] = useState<boolean>(false);

  // Effect 1: Initiate image loading sequence when partData or config changes
  useEffect(() => {
    // Reset all states when partData changes
    setAttemptedAutoprobeIndex(0);
    setHasTriedAllLocalAutoprobe(false);
    setExplicitOverrideAttempted(false);
    setExplicitOverrideFailed(false);
    setImageToAttempt(null); // Clear any pending attempt, this will trigger Effect 2 if it was previously set

    if (!partData || !partData.pk) {
      setCurrentSrc(null); // If no partData, ensure placeholder is shown
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
      console.log(`PartThumbnail PK ${partData.pk}: Initial attempt will be EXPLICIT override: ${initialAttemptPath}`);
    } else if (PREFERRED_THUMB_EXTENSIONS.length > 0) {
      initialAttemptPath = `${LOCAL_THUMB_BASE_PATH}part_${partData.pk}.${PREFERRED_THUMB_EXTENSIONS[0]}`;
      console.log(`PartThumbnail PK ${partData.pk}: No explicit override. Initial attempt will be AUTOPROBE: ${initialAttemptPath}`);
    } else {
      initialAttemptPath = partData.thumbnail || null;
      console.log(`PartThumbnail PK ${partData.pk}: No explicit override, no autoprobe extensions. Initial attempt will be API: ${initialAttemptPath}`);
      setHasTriedAllLocalAutoprobe(true); // No local to try
    }
    setImageToAttempt(initialAttemptPath);
  }, [partData, config]);

  // Effect 2: Process imageToAttempt (preload and set currentSrc or find next)
  useEffect(() => {
    if (!imageToAttempt) {
      // If imageToAttempt becomes null and it wasn't due to initial partData clearing,
      // it means we've exhausted options or hit an API fallback that was also null.
      // Ensure currentSrc is also null to show placeholder.
      if (currentSrc !== null) { // only set if it's not already null
          // console.log(`PartThumbnail PK ${partData?.pk}: imageToAttempt is null, ensuring currentSrc is null.`);
          // setCurrentSrc(null); // This might be too aggressive if currentSrc was already set to a valid API image
      }
      return;
    }
    
    // console.log(`PartThumbnail PK ${partData?.pk}: Effect 2 triggered. Attempting to load: ${imageToAttempt}`);

    const img = new window.Image();
    img.onload = () => {
      // console.log(`PartThumbnail PK ${partData?.pk}: SUCCESS loading ${imageToAttempt}. Setting currentSrc.`);
      setCurrentSrc(imageToAttempt);
      // Once an image loads successfully, we don't need to probe further for this partData instance.
    };

    img.onerror = () => {
      // console.log(`PartThumbnail PK ${partData?.pk}: ERROR loading ${imageToAttempt}. Determining next step.`);
      let nextImageToTry: string | null = null;

      if (explicitOverrideAttempted && !explicitOverrideFailed) {
        // The explicit override was attempted and failed
        // console.log(`PartThumbnail PK ${partData?.pk}: Explicit override FAILED. Falling back to API thumbnail.`);
        setExplicitOverrideFailed(true);
        nextImageToTry = partData?.thumbnail || null;
      } else if (!hasTriedAllLocalAutoprobe && !explicitOverrideFailed) {
        // Auto-probing local images (only if explicit override hasn't failed)
        const nextIdx = attemptedAutoprobeIndex + 1;
        if (nextIdx < PREFERRED_THUMB_EXTENSIONS.length) {
          // console.log(`PartThumbnail PK ${partData?.pk}: Autoprobe FAILED. Trying next extension index: ${nextIdx}`);
          setAttemptedAutoprobeIndex(nextIdx);
          nextImageToTry = `${LOCAL_THUMB_BASE_PATH}part_${partData!.pk}.${PREFERRED_THUMB_EXTENSIONS[nextIdx]}`;
        } else {
          // console.log(`PartThumbnail PK ${partData?.pk}: Autoprobe FAILED. Tried all extensions. Falling back to API thumbnail.`);
          setHasTriedAllLocalAutoprobe(true);
          nextImageToTry = partData?.thumbnail || null;
        }
      } else {
        // All local attempts (explicit or auto-probed) have failed, or API fallback failed.
        // This means imageToAttempt was likely partData.thumbnail and it also failed.
        // console.log(`PartThumbnail PK ${partData?.pk}: All fallbacks failed or API thumbnail itself failed. Setting currentSrc to null.`);
        setCurrentSrc(null); // Show placeholder definitely
        // No further imageToAttempt to prevent loops if API image is bad
      }
      
      if (imageToAttempt !== nextImageToTry) { // Avoid infinite loop if next is same as current failed one (e.g. API thumbnail is null)
         setImageToAttempt(nextImageToTry);
      } else if (nextImageToTry === null && currentSrc !== null) {
         // If the next attempt is null (meaning API fallback was null), ensure currentSrc is also null
         setCurrentSrc(null);
      }
    };

    img.src = imageToAttempt;

    return () => { // Cleanup
      img.onload = null;
      img.onerror = null;
      // console.log(`PartThumbnail PK ${partData?.pk}: Cleaning up Image preloader for ${imageToAttempt}`);
    };
  }, [imageToAttempt, partData, explicitOverrideAttempted, explicitOverrideFailed, attemptedAutoprobeIndex, hasTriedAllLocalAutoprobe]);

  if (!partData) {
    return null; // Or some generic placeholder if needed when no partData
  }

  // Determine layout: prop > config.view_type > default ('grid')
  const layout = propLayout || (config?.view_type as any) || 'grid';
  // visualEffect should not determine the fundamental layout type here.
  // It can still influence other visual aspects like icon, badge, colors etc.

  const finalIcon = visualEffect?.icon !== undefined ? visualEffect.icon : directIcon;
  const finalBadge = visualEffect?.badge !== undefined ? visualEffect.badge : directBadge;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: layout === 'detail' ? '100%' : (layout === 'list' ? '40px' : '80px'),
    height: layout === 'detail' ? 'auto' : (layout === 'list' ? '40px' : '80px'),
    aspectRatio: (layout === 'grid' || layout === 'detail') ? '1 / 1' : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Changed to cover for better fill, 'contain' might be better if aspect ratios vary a lot
    display: currentSrc ? 'block' : 'none',
    opacity: currentSrc ? 1 : 0, // For smooth transition
    transition: 'opacity 0.3s ease-in-out',
  };

  const placeholderStyle: React.CSSProperties = {
    display: !currentSrc ? 'flex' : 'none',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    color: '#757575',
    fontSize: layout === 'list' ? '1em' : (layout === 'grid' ? '1.5em' : '2em'),
    fontWeight: 'bold',
  };
  
  const iconBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    left: '4px',
    fontSize: layout === 'list' ? '16px' : '24px',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    padding: '2px',
    zIndex: 1,
  };

  const textBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '2px 5px',
    borderRadius: '3px',
    fontSize: layout === 'list' ? '0.6em' : '0.7em',
    zIndex: 1,
  };

  return (
    <div style={containerStyle} onClick={onClick} className={`part-thumbnail-container layout-${layout}`}>
      {finalIcon && (
        <span style={iconBadgeStyle}>
          {finalIcon.startsWith('mdi:') ? <ha-icon icon={finalIcon}></ha-icon> : <span dangerouslySetInnerHTML={{ __html: finalIcon }} />}
        </span>
      )}
      <img
        key={currentSrc || 'placeholder'} // Add key to help React differentiate when src changes to null then back
        src={currentSrc || undefined} // Pass undefined if null to prevent error/request
        alt={partData.name}
        style={imageStyle}
        // No onError here, as preloading effect handles it
      />
      {!currentSrc && (
        <div style={placeholderStyle}>
          <span>{partData.name ? partData.name.substring(0, 2).toUpperCase() : 'P'}</span>
        </div>
      )}
      {finalBadge && <span style={textBadgeStyle}>{finalBadge}</span>}
    </div>
  );
};

export default PartThumbnail; 