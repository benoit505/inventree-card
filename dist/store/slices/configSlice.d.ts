import { RootState } from '../index';
import { ViewType, PerformanceConfig, HierarchicalDebugConfig } from '../../types';
interface DataSourceApiConfig {
    enabled: boolean;
    url: string | null;
    apiKey: string | null;
    websocketUrl: string | null;
}
interface DataSourceBindingTarget {
    contextName: string;
}
interface DataSourceBinding {
    entityId: string;
    type: 'state' | 'attribute';
    attributeName?: string;
    target: DataSourceBindingTarget;
}
interface DataSourceRefreshConfig {
    pollingInterval: number;
    websocketEnabled: boolean;
    cacheLifetime: number;
}
interface InventreeParameterFetchConfig {
    targetPartIds: number[] | 'all_loaded';
    parameterNames: string[] | '*';
    fetchOnlyIfUsed?: boolean;
}
interface DataSourcesState {
    primary: {
        entityId: string | null;
    };
    additional: {
        entities: string[];
        directPartIds: number[];
        categories: number[];
    };
    inventreeParametersToFetch: InventreeParameterFetchConfig[];
    api: DataSourceApiConfig;
    bindings: Record<string, DataSourceBinding>;
    refresh: DataSourceRefreshConfig;
}
interface ObjectFilterRule {
    name: string;
    expressionId: string;
    enabled?: boolean;
}
interface DerivedPropertyRule {
    propertyName: string;
    expressionId: string;
    enabled?: boolean;
}
interface SortingRule {
    propertyName: string;
    direction: 'asc' | 'desc';
    enabled?: boolean;
}
interface GroupingRule {
    groupByProperty: string | null;
    enabled?: boolean;
}
interface ObjectTransformationsState {
    filters: ObjectFilterRule[];
    derivedProperties: DerivedPropertyRule[];
    sorting: SortingRule[];
    grouping: GroupingRule;
    resolveVariants?: boolean;
}
interface ExpressionSource {
    type: 'parameter' | 'part_attribute' | 'entity_binding';
    id: string;
    property?: string;
}
interface ExpressionDefinition {
    id: string;
    name: string;
    type: 'comparison' | 'logical_and' | 'logical_or' | 'logical_not';
    source?: ExpressionSource;
    operator?: string;
    value?: any;
    operands?: string[];
    operand?: string;
}
type ExpressionsState = Record<string, ExpressionDefinition>;
interface VisualEffect {
    isVisible?: boolean;
    highlight?: string;
    textColor?: string;
    border?: string;
    opacity?: number;
    icon?: string;
    badge?: string;
    customClasses?: string[];
}
interface ConditionalRule {
    id: string;
    name: string;
    expressionId: string;
    priority?: number;
    effects: Partial<VisualEffect>;
    targetElements?: string[];
}
interface PresentationState {
    viewType: ViewType | string;
    layout: Record<string, any>;
    display: Record<string, boolean>;
    styling: Record<string, string>;
    conditionalRules: Record<string, ConditionalRule>;
}
interface InteractionButtonVisibilityConditions {
    expressionIds: string[];
    logic: 'AND' | 'OR';
}
interface InteractionButton {
    id: string;
    label: string;
    icon?: string;
    actionType: 'call-service';
    service?: string;
    serviceData?: Record<string, any>;
    confirmationRequired?: boolean;
    confirmationText?: string;
    visibilityConditions?: InteractionButtonVisibilityConditions;
}
interface InteractionsState {
    buttons: Record<string, InteractionButton>;
}
interface SystemDebugConfig {
    enabled: boolean;
    verbose: boolean;
    hierarchical?: HierarchicalDebugConfig;
}
interface SystemState {
    performance: PerformanceConfig;
    debug: SystemDebugConfig;
}
export interface ConfigState {
    dataSources: DataSourcesState;
    objectTransformations: ObjectTransformationsState;
    expressions: ExpressionsState;
    presentation: PresentationState;
    interactions: InteractionsState;
    system: SystemState;
    configVersion?: string;
    lastSaved?: string;
}
export declare const initialDataSourcesState: DataSourcesState;
export declare const initialObjectTransformationsState: ObjectTransformationsState;
export declare const initialExpressionsState: ExpressionsState;
export declare const initialPresentationState: PresentationState;
export declare const initialInteractionsState: InteractionsState;
export declare const initialSystemState: SystemState;
export declare const initialState: ConfigState;
export declare const setFullConfig: any, setDataSourcesConfig: any, setObjectTransformationsConfig: any, setExpressionsConfig: any, setPresentationConfig: any, setInteractionsConfig: any, setSystemConfig: any, setApiConfig: any;
export declare const selectFullConfig: (state: RootState) => ConfigState;
export declare const selectDataSourcesConfig: (state: RootState) => DataSourcesState;
export declare const selectApiFromDataSources: (state: RootState) => DataSourceApiConfig;
export declare const selectObjectTransformationsConfig: (state: RootState) => ObjectTransformationsState;
export declare const selectExpressions: (state: RootState) => ExpressionsState;
export declare const selectPresentationConfig: (state: RootState) => PresentationState;
export declare const selectInteractionsConfig: (state: RootState) => InteractionsState;
export declare const selectSystemConfig: (state: RootState) => SystemState;
export declare const selectPerformanceConfig: (state: RootState) => PerformanceConfig;
export declare const selectDebugConfig: (state: RootState) => SystemDebugConfig;
declare const _default: any;
export default _default;
