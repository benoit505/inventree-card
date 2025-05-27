import React from 'react';
import { StyleConfig } from '../../types';
interface CardStylingSectionProps {
    styleConfig?: Partial<StyleConfig>;
    onStyleConfigChanged: (newStyleConfig: StyleConfig) => void;
}
declare const CardStylingSection: React.FC<CardStylingSectionProps>;
export default CardStylingSection;
