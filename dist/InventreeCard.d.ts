import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from './types';
interface InventreeCardProps {
    hass?: HomeAssistant;
    config?: InventreeCardConfig;
}
declare const InventreeCard: ({ hass, config }: InventreeCardProps) => JSX.Element | null;
export default InventreeCard;
