import React from 'react';
import { Effect } from 'react-lazy-load-image-component';
interface ImageWithFallbackProps {
    sources: string[];
    alt: string;
    placeholder: React.ReactElement;
    effect?: Effect;
    style: React.CSSProperties;
    height: number;
    width: number;
}
declare const ImageWithFallback: React.FC<ImageWithFallbackProps>;
export default ImageWithFallback;
