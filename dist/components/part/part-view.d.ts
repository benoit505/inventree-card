/**
 * InvenTree Part View Component
 * ============================
 * A reusable component that displays a single InvenTree part with its details,
 * stock status, and interactive controls.
 *
 * == Architecture Overview ==
 * The PartView is a leaf component in the component tree that:
 * 1. Receives part data and configuration from parent components
 * 2. Renders part information with configurable display options
 * 3. Provides interactive controls for stock adjustment and services
 *
 * == Data Flow ==
 * Input:
 * - partData: Part information from InvenTree (via state manager)
 * - config: Card configuration for display options
 * - hass: Home Assistant instance for service calls
 *
 * Output:
 * - Stock adjustments via StockService
 * - WLED location triggers via WLEDService
 * - Print requests via PrintService
 *
 * == Service Integration ==
 * The component integrates with three services:
 * 1. StockService: Handles stock level adjustments
 * 2. WLEDService: Controls WLED indicators for part location
 * 3. PrintService: Manages label printing
 *
 * == Display Features ==
 * Configurable display elements:
 * - Part name and description
 * - Stock level with visual indicators
 * - Category information
 * - Thumbnail image
 * - Interactive buttons
 *
 * == Stock Status ==
 * Stock levels are visualized through:
 * - Color-coded indicators (red/yellow/green)
 * - Numeric display
 * - Top border color
 * - Status badges
 *
 * == Performance Considerations ==
 * 1. Services are lazily initialized when HASS becomes available
 * 2. Display options use efficient conditional rendering
 * 3. Stock status calculations are memoized per render
 *
 * == Usage Example ==
 * ```html
 * <inventree-part-view
 *   .partData=${part}
 *   .config=${config}
 *   .hass=${hass}
 * ></inventree-part-view>
 * ```
 *
 * @customElement inventree-part-view
 */
import { TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { InventreeCardConfig } from '../../core/types';
import { ReduxLitElement } from '../redux-lit-element';
import { RootState } from '../../store';
export declare class InvenTreePartView extends ReduxLitElement {
    /**
     * The ID of the part to display. This component will select the part data from Redux.
     */
    partId?: number;
    /**
     * Card configuration that controls display options.
     */
    config?: InventreeCardConfig;
    /**
     * Home Assistant instance, required for some service calls via Redux thunks.
     */
    hass?: HomeAssistant;
    private _partData?;
    private logger;
    private _quantityTimer?;
    private _timersInitialized;
    constructor();
    /**
     * Remove service initialization logic from updated().
     * Logic related to partId change will be handled by stateMap.
     */
    updated(changedProps: Map<string, unknown>): void;
    static styles: import("lit").CSSResult;
    render(): TemplateResult<1>;
    /**
     * Adjust the stock quantity for the current part.
     */
    private _adjustStock;
    /**
     * Trigger WLED location for the current part.
     */
    private _locateInWLED;
    /**
     * Request printing a label for the current part.
     */
    private _printLabel;
    private getStockStatus;
    private getStockColor;
    disconnectedCallback(): void;
    stateMap(state: RootState): {
        _partData: any;
    };
}
