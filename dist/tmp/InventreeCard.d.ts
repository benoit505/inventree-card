import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';
interface InventreeCardProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
    cardInstanceId?: string;
}
declare const InventreeCard: ({ hass, config, cardInstanceId }: InventreeCardProps) => JSX.Element | null;
export default InventreeCard;
