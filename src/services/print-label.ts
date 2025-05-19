import { HomeAssistant, forwardHaptic } from "custom-card-helpers";
import { InventreeItem, PrintConfig } from "../types";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();

export class PrintService {
    private hass: HomeAssistant;

    constructor(hass: HomeAssistant) {
        this.hass = hass;
        logger.log('PrintService', 'Initialized', { level: 'debug' });
    }

    async printLabel(part: InventreeItem | number, config?: PrintConfig): Promise<void> {
        try {
            // Extract part ID
            const partId = typeof part === 'number' ? part : part.pk;
            
            // Extract config values or use defaults
            const templateId = config?.template_id !== undefined ? Number(config.template_id) : 2;
            const plugin = config?.plugin || 'zebra';
            
            logger.log('PrintService', `Printing label for part ${partId} using template ${templateId} and plugin ${plugin}`);
            logger.log('PrintService', 'Part object:', { data: part, level: 'debug' });
            logger.log('PrintService', 'Config object:', { data: config, level: 'debug' });
            
            // Ensure all parameters are valid
            if (!partId) {
                throw new Error('Part ID is required');
            }
            
            // Log the exact parameters being sent
            const params = {
                item_id: Number(partId),  // Try using item_id instead of part_id
                template_id: Number(templateId),
                plugin: plugin
            };
            
            logger.log('PrintService', 'Print parameters:', { data: params, level: 'debug' });
            
            const response = await this.hass.callService('inventree', 'print_label', params);
            
            logger.log('PrintService', 'Print response:', { data: response });
        } catch (error) {
            logger.error('PrintService', 'Failed to print label:', { data: error });
            throw error;
        }
    }
}
