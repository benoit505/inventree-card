import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem, WLEDConfig } from "../types";
export declare class WLEDService {
    private hass;
    constructor(hass: HomeAssistant);
    toggleLED(entityId: string): Promise<void>;
    locatePart(part: InventreeItem, config: WLEDConfig): Promise<void>;
}
