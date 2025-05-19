import { HomeAssistant } from "custom-card-helpers";
import { InventreeItem } from "../types";
export declare const parseState: (hass: HomeAssistant, entityId: string) => InventreeItem[];
export declare const shouldUpdate: (newHass: HomeAssistant, oldHass: HomeAssistant, entityId: string) => boolean;
