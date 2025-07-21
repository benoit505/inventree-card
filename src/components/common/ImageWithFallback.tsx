import React, { useState, useEffect } from 'react';
import { LazyLoadImage, Effect } from 'react-lazy-load-image-component';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('ImageWithFallback');
ConditionalLoggerEngine.getInstance().registerCategory('ImageWithFallback', { enabled: false, level: 'info' });

interface ImageWithFallbackProps {
  sources: string[];
  alt: string;
  placeholder: React.ReactElement;
  effect?: Effect;
  style: React.CSSProperties;
  height: number;
  width: number;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ sources, alt, placeholder, ...props }) => {
  const [workingSrc, setWorkingSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const sourcesKey = sources.join(',');

  useEffect(() => {
    logger.debug('useEffect[sources]', 'Sources changed, starting probe.', { sources });
    setWorkingSrc(null);
    setHasError(false);

    if (!sources || sources.length === 0) {
      logger.warn('useEffect[sources]', 'No sources provided, rendering placeholder.');
      setHasError(true);
      return;
    }
    
    let isCancelled = false;
    let currentProbeIndex = 0;

    const probeNext = () => {
      if (isCancelled) {
        logger.debug('probeNext', 'Probe cancelled.');
        return;
      }
      if (currentProbeIndex >= sources.length) {
        logger.warn('probeNext', 'All sources failed, rendering placeholder.', { sources });
        if (!isCancelled) setHasError(true);
        return;
      }

      const sourceToProbe = sources[currentProbeIndex];
      logger.verbose('probeNext', `Probing source: ${sourceToProbe}`);
      
      const img = new Image();
      img.onload = () => {
        if (!isCancelled) {
          logger.info('probeNext', `Source succeeded: ${sourceToProbe}`);
          setWorkingSrc(sourceToProbe);
        } else {
          logger.debug('probeNext', 'Probe succeeded but component unmounted, ignoring.', { source: sourceToProbe });
        }
      };
      img.onerror = () => {
        logger.debug('probeNext', `Source failed: ${sourceToProbe}`);
        if (!isCancelled) {
          currentProbeIndex++;
          probeNext();
        }
      };
      img.src = sourceToProbe;
    };

    probeNext();

    return () => {
      logger.debug('useEffect[sources]', 'Cleanup: cancelling probe.', { sources });
      isCancelled = true;
    };
  }, [sourcesKey]); // Use a stable key for the dependency array

  if (hasError || !workingSrc) {
    logger.verbose('ImageWithFallback', 'Rendering placeholder.', { hasError, hasWorkingSrc: !!workingSrc });
    return placeholder;
  }

  logger.verbose('ImageWithFallback', 'Rendering LazyLoadImage with working source.', { workingSrc });
  return (
    <LazyLoadImage
      alt={alt}
      src={workingSrc}
      {...props}
    />
  );
};

export default ImageWithFallback; 