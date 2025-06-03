import { RuleGroupType } from "../types";
import { RootState } from "../store";
import { Logger } from "../core/logger";
import { InventreeItem } from "../types";
/**
 * Placeholder for a sophisticated expression evaluation engine.
 * This function will take a set of rules (RuleGroupType from react-querybuilder)
 * and evaluate them against the provided context (part data, HA states, etc.).
 *
 * @param ruleGroup The group of rules to evaluate.
 * @param partContext Optional: The current InvenTree part item to evaluate against.
 * @param globalContext Full Redux state for accessing HA states, other parameters, etc.
 * @param logger Logger instance.
 * @returns boolean - True if the conditions are met, false otherwise.
 */
export declare const evaluateExpression: (ruleGroup: RuleGroupType, partContext: InventreeItem | null, globalContext: RootState, logger: Logger) => boolean;
