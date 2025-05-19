import { CustomCardEntry } from './types';
declare global {
    interface Window {
        customCards: CustomCardEntry[];
    }
}
declare let InventreeCard: any;
export { InventreeCard };
