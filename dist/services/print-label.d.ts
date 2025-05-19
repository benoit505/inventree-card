import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem, PrintConfig } from "../types";
export declare class PrintService {
    private hass;
    constructor(hass: HomeAssistant);
    printLabel(part: InventreeItem | number, config?: PrintConfig): Promise<void>;
}
