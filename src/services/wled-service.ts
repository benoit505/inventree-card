import { HomeAssistant, forwardHaptic } from "custom-card-helpers";
import { InventreeItem, WLEDConfig } from "../types";

export class WLEDService {
    constructor(private hass: HomeAssistant) {
        console.debug('🌈 WLED Service: Initialized');
    }

    async toggleLED(entityId: string): Promise<void> {
        try {
            if (!entityId) {
                forwardHaptic("failure");
                throw new Error('No entity_id provided');
            }

            const state = this.hass.states[entityId];
            if (!state) {
                forwardHaptic("failure");
                throw new Error(`Entity ${entityId} not found`);
            }

            // Toggle the light
            await this.hass.callService(
                "light",
                state.state === "on" ? "turn_off" : "turn_on",
                {
                    entity_id: entityId
                }
            );

            forwardHaptic("success");

        } catch (e) {
            forwardHaptic("failure");
            console.error('Failed to toggle LED:', e);
            throw e;
        }
    }

    async locatePart(part: InventreeItem, config: WLEDConfig): Promise<void> {
        try {
            console.debug('🌈 WLED: Starting locate part process', { part, config });

            if (!config.entity_id) {
                forwardHaptic("failure");
                throw new Error('No entity_id configured for WLED');
            }

            // Get LED position from part parameters
            const positionParam = part.parameters?.find(p => 
                p.template_detail?.name === config.parameter_name
            )?.data;

            if (!positionParam) {
                throw new Error(`No ${config.parameter_name} parameter found for part`);
            }

            // Convert position to number
            const position = parseInt(positionParam);
            console.debug('🌈 WLED: Using LED position:', position);

            // Get WLED entity
            const wledEntity = this.hass.states[config.entity_id];
            if (!wledEntity) {
                throw new Error(`Entity ${config.entity_id} not found`);
            }

            // Clean up IP address (remove http:// if present)
            const wledIp = config.ip_address?.replace('http://', '') || '192.168.0.61';
            console.debug('🌈 WLED IP:', wledIp);

            // Check current state
            const isOn = wledEntity.state === 'on';

            // Use Home Assistant's rest service
            await this.hass.callService('rest_command', 'wled_segment', {
                url: `http://${wledIp}/json/state`,
                payload: JSON.stringify(isOn ? {
                    on: false
                } : {
                    on: true,
                    bri: config.intensity || 128,
                    seg: [{
                        id: 0,
                        start: position - 1,
                        stop: position,
                        col: [[255, 0, 0], [0, 0, 0], [0, 0, 0]],
                        fx: 0  // Solid effect
                    }]
                })
            });

            forwardHaptic("success");

        } catch (e) {
            forwardHaptic("failure");
            console.error('Failed to locate part with WLED:', e);
            throw e;
        }
    }
}
