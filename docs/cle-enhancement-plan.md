# CLE Enhancement Plan - Solving the Blindness Problem

## Current State Analysis

Your Conditional Logic Engine is already brilliant! The issue is just one missing piece:

### What Works Perfectly ✅
1. **Rule Evaluation**: Sophisticated expression evaluator with nested logic
2. **Visual Effects**: Complete animation, styling, layout effects system  
3. **WYSIWYG Editor**: React-querybuilder with auto-discovered fields
4. **Real-time Updates**: WebSocket middleware triggers re-evaluation
5. **Performance**: Memoized, throttled, batched operations

### The One Missing Piece 🔍
**Line 110 in `evaluateExpression.ts`:**
```typescript
logger.warn('getActualValue', `Part with PK ${pk} not found...`);
return undefined; // <-- Gives up instead of fetching!
```

## The Solution: Smart Auto-Fetching

### Step 1: Enhance `getActualValue` to Auto-Fetch Missing Data

```typescript
// Enhanced version that auto-fetches missing data
const getActualValue = async (
    field: string, 
    partContext: InventreeItem | null, 
    globalContext: RootState,
    logger: any,
    cardInstanceId: string,
    dispatch: AppDispatch // Add dispatch parameter
): Promise<any> => {
    // ... existing logic ...

    // When part is missing from cache:
    if (partPkAndAttributeMatch) {
        const pk = parseInt(partPkAndAttributeMatch[1], 10);
        
        const rtkQueryState = inventreeApi.endpoints.getPart.select({ pk, cardInstanceId })(globalContext);
        
        if (rtkQueryState.data && attribute in rtkQueryState.data) {
            return (rtkQueryState.data as any)[attribute];
        }
        
        // 🚀 NEW: Auto-fetch missing data!
        if (rtkQueryState.status === 'uninitialized' || !rtkQueryState.data) {
            logger.info('getActualValue', `Auto-fetching missing part ${pk} for rule evaluation`);
            
            // Trigger the fetch
            dispatch(inventreeApi.endpoints.getPart.initiate({ pk, cardInstanceId }));
            
            // Return a special "loading" indicator
            return { __loading: true, __partPk: pk };
        }
    }
    
    // ... rest of existing logic ...
};
```

### Step 2: Handle Loading State in Rule Evaluation

```typescript
const evaluateRule = async (
    rule: RuleType,
    partContext: InventreeItem | null,
    globalContext: RootState,
    logger: any,
    cardInstanceId: string,
    dispatch: AppDispatch
): Promise<boolean | 'loading'> => {
    const actualValue = await getActualValue(rule.field, partContext, globalContext, logger, cardInstanceId, dispatch);
    
    // Handle loading state
    if (actualValue && typeof actualValue === 'object' && actualValue.__loading) {
        logger.debug('evaluateRule', `Data loading for part ${actualValue.__partPk}, deferring evaluation`);
        return 'loading'; // Special return value
    }
    
    return memoizedInternalEvaluateRule(rule, actualValue, logger);
};
```

### Step 3: Update CLE to Handle Async Rules

```typescript
export class ConditionalEffectsEngine {
    public async evaluateAndApplyEffects(
        cardInstanceId: string, 
        forceReevaluation: boolean = false, 
        logicItemsToEvaluate?: ConditionalLogicItem[]  
    ): Promise<void> {
        // ... existing setup ...

        let hasLoadingRules = false;

        for (const logicItem of logicItemsToEvaluate) {
            for (const pair of logicItem.logicPairs) {
                const evaluationResult = await this.evaluateRuleGroup(
                    pair.conditionRules, 
                    null, // partContext for generic rules
                    state, 
                    logger, 
                    cardInstanceId
                );
                
                if (evaluationResult === 'loading') {
                    hasLoadingRules = true;
                    continue; // Skip this rule for now
                }
                
                if (evaluationResult === true) {
                    // Apply effects as usual
                    this.applyEffectsToTargets(/* ... */);
                }
            }
        }

        // If we have loading rules, schedule a re-evaluation
        if (hasLoadingRules) {
            logger.debug('evaluateAndApplyEffects', 'Some rules are loading data, will re-evaluate when ready');
            setTimeout(() => {
                this.evaluateAndApplyEffects(cardInstanceId, false, logicItemsToEvaluate);
            }, 500); // Re-check in 500ms
        }

        // Apply accumulated effects
        this.dispatch(setConditionalPartEffectsBatch({ cardInstanceId, effectsMap: effectsToApply }));
    }
}
```

## Smart Features to Add

### 1. Data Dependency Analysis
```typescript
interface DataDependency {
    type: 'part' | 'parameter' | 'ha_entity';
    partPk?: number;
    parameterName?: string;
    entityId?: string;
    currentlyAvailable: boolean;
    fetchTriggered: boolean;
}

function analyzeRuleDependencies(rules: ConditionalLogicItem[]): DataDependency[] {
    // Parse all rules and extract data requirements
    // Return list of missing dependencies
}
```

### 2. Rule Status Indicators
```typescript
interface RuleEvaluationStatus {
    ruleId: string;
    status: 'ready' | 'loading' | 'error' | 'missing_data';
    missingDependencies: DataDependency[];
    lastEvaluated?: Date;
    result?: boolean;
}
```

### 3. Smart Suggestions in Editor
```typescript
// In ConditionalLogicSection.tsx
const [missingDataWarnings, setMissingDataWarnings] = useState<string[]>([]);

useEffect(() => {
    const dependencies = analyzeRuleDependencies(currentRules);
    const missing = dependencies.filter(dep => !dep.currentlyAvailable);
    
    if (missing.length > 0) {
        setMissingDataWarnings([
            `⚠️ ${missing.length} rules reference unavailable data`,
            ...missing.map(dep => `Missing: ${dep.type} ${dep.partPk || dep.entityId}`)
        ]);
    } else {
        setMissingDataWarnings([]);
    }
}, [currentRules, allParts, hassStates]);
```

## Implementation Priority

### Week 1: Core Auto-Fetching
- ✅ Enhance `getActualValue` with auto-fetch capability  
- ✅ Add loading state handling to rule evaluation
- ✅ Update CLE to handle async rule evaluation

### Week 2: Smart UI Feedback  
- ✅ Add data dependency analysis
- ✅ Show missing data warnings in editor
- ✅ Add rule status indicators

### Week 3: Performance & Polish
- ✅ Optimize fetching (avoid duplicate requests)
- ✅ Add configurable retry logic
- ✅ Improve error handling

## The Magic Result

With these changes, your smart plug scenario becomes:

1. **User creates rule**: "If sensor.workshop_smart_plug_power > 5W, glow green"
2. **System auto-discovers**: Rule needs power sensor data
3. **System auto-fetches**: Adds sensor to HA entities automatically  
4. **Rule evaluates**: Works immediately without manual config
5. **Parts come alive**: Real-time bidirectional interaction! ✨

## Backward Compatibility

This enhancement is 100% backward compatible:
- ✅ Existing configurations work unchanged
- ✅ Manual data source config still supported
- ✅ Auto-fetching only triggers for missing data
- ✅ No breaking changes to existing APIs

Your brilliant CLE just becomes even smarter! 🧠✨
