import React, { useState, useEffect } from 'react';
import { LazyLoadImage, Effect } from 'react-lazy-load-image-component';

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
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(sources[0]);

  useEffect(() => {
    // When the sources prop changes (e.g., for a new part), reset the state.
    setSourceIndex(0);
    setCurrentSrc(sources[0]);
    setHasError(false);
  }, [sources.join(',')]); // Depend on a string representation of the sources array

  const handleError = () => {
    if (sourceIndex < sources.length - 1) {
      // Try the next source
      const nextIndex = sourceIndex + 1;
      setSourceIndex(nextIndex);
      setCurrentSrc(sources[nextIndex]);
    } else {
      // All sources have failed
      setHasError(true);
    }
  };

  // We need a way to render the actual image tag to test the source,
  // but we can't use LazyLoadImage for that as it hides the onError event.
  // We'll use a hidden image to probe the source, and then display the real one.

  const [workingSrc, setWorkingSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset when sources change
    setWorkingSrc(null);
    if (!sources || sources.length === 0) {
      setHasError(true);
      return;
    }
    
    let isCancelled = false;
    let currentProbeIndex = 0;

    const probeNext = () => {
      if (isCancelled || currentProbeIndex >= sources.length) {
        if (!isCancelled) setHasError(true);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!isCancelled) {
          setWorkingSrc(sources[currentProbeIndex]);
        }
      };
      img.onerror = () => {
        currentProbeIndex++;
        probeNext();
      };
      img.src = sources[currentProbeIndex];
    };

    probeNext();

    return () => {
      isCancelled = true;
    };
  }, [sources.join(',')]);


  if (hasError || !workingSrc) {
    return placeholder;
  }

  return (
    <LazyLoadImage
      alt={alt}
      src={workingSrc}
      {...props}
    />
  );
};

export default ImageWithFallback; 