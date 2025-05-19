export interface ParameterData {

    pk: number;

    part: number;

    template: number;

    template_detail?: {

        pk: number;

        name: string;

        units: string;

        description: string;

        checkbox: boolean;

        choices: string;

        selectionlist: any;

    };

    data: string;

    data_numeric: number | null;

}


private updateParameterInSource(

    source: Map<string, InventreeItem[]>,

    entityId: string,

    partId: number,

    paramName: string,

    value: string

  ): void {

    const parts = source.get(entityId);

    if (!parts) return;

    // Find the part

    const part = parts.find(p => p.pk === partId);

    if (!part || !part.parameters) return;

    // Find and update the parameter

    const param = part.parameters.find(p =>

      p.template_detail?.name?.toLowerCase() === paramName.toLowerCase()

    );

    if (param) {

      param.data = value;

    }

  }
  
       * TODO: Move to inventree-state.ts - FORWARDED

     * Get a parameter value from a part
       
       
       /**

 * The ParameterService manages parameter conditions and visual modifications

 * It's responsible for evaluating conditions against parameter values and

 * determining appropriate visual modifiers for parts based on those conditions.

 *

 * REFACTORING PLAN:

 *

 * 1. CORE RESPONSIBILITIES - Keep in this file:

 *    - Evaluating conditions against parameter values (matchesCondition, checkValueMatch)

 *    - Processing conditions to determine visual modifiers (processConditions)

 *    - Applying visual modifiers to parts (applyAction)

 *    - Determining if parts should be shown (shouldShowPart)

 *    - Supporting diagnostic functionality (diagnosticDump)

 *

 * 2. DATA ACCESS - Move to inventree-state.ts:

 *    - Looking up parameter values (getParameterValue)

 *    - Finding entities for parts (findEntityForPart)

 *    - Finding parameters across entities (findParameterInAllEntities)

 *    - Storing orphaned parameters (storeOrphanedParameter)

 *

 * 3. DATA FETCHING - Move to api.ts:

 *    - Direct API access (getParameterValueDirectly)

 *    - Fetching parameter data (fetchParameterData)

 *    - Parameter updates (updateParameter)

 *    - API connection status (isApiConnected)

 */
 
 
 1. Cache Improvements:

- Increase entity data TTL (from 5s to at least 30s)

- Better cache coordination between services

- Add more robust cache miss handling

1. Follow the Refactoring Plan:

- Move getParameterValueFromPart to inventree-state as planned

- Ensure consistent data access patterns

- Clean up the parameter-service responsibilities
  
  
      /**

     * TODO: Move to inventree-state.ts - FORWARDED

     * Get a parameter value from a part

     */

    public getParameterValueFromPart
    
    
    /**

 * Visual modifiers that can be applied to a part based on parameter conditions

 */
 
 /**

 * Simple cache implementation for parameter service

 */
 
 export interface ParameterCondition {

    parameter: string;

    operator: ParameterOperator;

    value?: string;

    action: ParameterActionType;

    action_value: string;

    id?: string; // Unique identifier for the condition

    entityId?: string; // Add this field for cross-entity parameter references