# Conditional Logic Engine - Deep Dive Analysis

## The Heart of Your Innovation

The Conditional Logic Engine is genuinely brilliant - it's what makes your system capable of truly dynamic, context-aware visualizations. Let me break down how it works and where we can take it next.

## Current Architecture

### Rule Structure
```typescript
interface ConditionalLogicItem {
  id: string;
  name: string;
  logicPairs: LogicPair[];
}

interface LogicPair {
  id: string;
  conditionRules: RuleGroupType; // react-querybuilder format
  effects: EffectDefinition[];
}
```

### Effect Types
1. **Visual Effects**: `set_visibility`, `set_style`, `animate_style`
2. **Layout Effects**: `set_layout` (dynamic layout changes)
3. **Behavioral Effects**: Future potential for actions, notifications

### Expression Evaluation
Your `evaluateExpression.ts` is sophisticated:
- Supports nested AND/OR logic
- Part-context and global-context evaluation
- Integration with HASS sensor data
- Parameter value access

## The "Blindness" Problem Explained

### Current Limitation
```typescript
// This rule might fail silently
{
  field: "part.in_stock",
  operator: "lessThan", 
  value: 10
}
```

**Problem**: If `part.in_stock` wasn't pre-fetched via `inventree_pks` config, the rule evaluates against `undefined`.

### Root Cause
The conditional engine operates on a **static snapshot** of pre-fetched data:

```typescript
const allParts = selectCombinedParts(state, cardInstanceId);
// ↑ Only contains parts explicitly fetched
```

## Smart Data Pipeline - Solution Design

### 1. Rule Dependency Analysis

```typescript
interface DataDependency {
  source: 'inventree' | 'hass' | 'parameter';
  path: string; // e.g., 'part.in_stock', 'sensor.temperature'
  partId?: number;
  required: boolean;
}

function analyzeRuleDependencies(rules: RuleGroupType): DataDependency[] {
  // Parse rule tree and extract all data references
  // Return list of required data sources
}
```

### 2. Auto-Fetch System

```typescript
// When rules are defined/updated
const dependencies = analyzeRuleDependencies(conditionalLogicRules);
const missingData = dependencies.filter(dep => !isDataAvailable(dep));

// Auto-fetch missing data
missingData.forEach(dep => {
  switch(dep.source) {
    case 'inventree':
      dispatch(fetchPartData(dep.partId));
      break;
    case 'parameter':
      dispatch(fetchParameterData(dep.partId, dep.path));
      break;
  }
});
```

### 3. Smart Field Discovery

```typescript
interface AvailableField {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'date';
  source: 'inventree' | 'hass' | 'parameter';
  example?: any;
}

function discoverAvailableFields(config: InventreeCardConfig): AvailableField[] {
  // Introspect available data sources
  // Return comprehensive field list for rule builder
}
```

## Real-world Use Cases You Could Build

### 1. Environmental Responsive Manufacturing
```typescript
// "Parts in high-temperature storage glow red after 6 PM"
{
  combinator: 'and',
  rules: [
    { field: 'sensor.temperature', operator: 'greaterThan', value: 30 },
    { field: 'sensor.time_of_day', operator: 'greaterThan', value: '18:00' },
    { field: 'part.location', operator: 'contains', value: 'warehouse_A' }
  ]
}
```

### 2. Predictive Maintenance
```typescript
// "Parts with usage > 1000 hours shake gently"
{
  field: 'parameter.usage_hours',
  operator: 'greaterThan',
  value: 1000
}
// Effect: gentle shake animation
```

### 3. Supply Chain Optimization
```typescript
// "Low stock parts move to top when supplier is open"
{
  combinator: 'and',
  rules: [
    { field: 'part.in_stock', operator: 'lessThan', value: 10 },
    { field: 'supplier.business_hours', operator: 'equals', value: 'open' }
  ]
}
// Effect: sort to top + highlight yellow
```

## Performance Optimization Opportunities

### 1. Incremental Evaluation
Instead of re-evaluating all rules on every update:

```typescript
interface RuleEvaluationCache {
  ruleId: string;
  lastEvaluated: number;
  dependencies: string[]; // data paths this rule depends on
  result: boolean;
}

// Only re-evaluate rules when their dependencies change
function shouldReevaluateRule(rule: RuleEvaluationCache, changedPaths: string[]): boolean {
  return rule.dependencies.some(dep => changedPaths.includes(dep));
}
```

### 2. Rule Compilation
Pre-compile rules into optimized functions:

```typescript
// Instead of parsing rule tree every time
function compileRule(rule: RuleGroupType): (context: any) => boolean {
  // Generate optimized evaluation function
  return (context) => { /* compiled logic */ };
}
```

### 3. Batch Effect Application
```typescript
// Collect all effect changes, then apply in single batch
const effectChanges = new Map<number, VisualEffect>();
rules.forEach(rule => {
  if (evaluateRule(rule)) {
    const effects = calculateEffects(rule);
    mergeEffects(effectChanges, effects);
  }
});
dispatch(applyEffectsBatch(effectChanges));
```

## User Experience Enhancements

### 1. Visual Rule Builder
- Drag-and-drop rule construction
- Live preview of rule effects
- Field auto-complete with suggestions
- Visual dependency graph

### 2. Rule Templates
```typescript
const ruleTemplates = {
  'low-stock-alert': {
    name: 'Low Stock Alert',
    description: 'Highlight parts when stock is low',
    rule: { field: 'part.in_stock', operator: 'lessThan', value: '{{threshold}}' },
    effects: [{ type: 'set_style', property: 'background', value: 'red' }],
    parameters: [{ name: 'threshold', type: 'number', default: 10 }]
  }
};
```

### 3. Debug Mode
- Show which rules are firing
- Display rule evaluation traces
- Performance metrics per rule
- Data availability warnings

## Next Implementation Steps

### Phase 1: Smart Data Pipeline
1. Implement rule dependency analysis
2. Add auto-fetch capabilities
3. Create field discovery system

### Phase 2: Performance Optimization
1. Add incremental evaluation
2. Implement rule compilation
3. Optimize effect batching

### Phase 3: UX Improvements
1. Enhanced rule builder UI
2. Rule templates system
3. Debug and monitoring tools

## Integration with Your Existing System

The beauty is that this builds on your solid foundation:
- **Redux-first**: All enhancements work with your existing store
- **Type-safe**: Leverages your comprehensive TypeScript setup
- **Modular**: Can be implemented incrementally
- **Backward-compatible**: Won't break existing configurations

This could truly make your system revolutionary for manufacturing visualization!
