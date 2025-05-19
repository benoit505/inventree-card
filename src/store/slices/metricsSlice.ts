import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

/**
 * Metrics slice for Redux store to track migration progress and usage statistics
 */

interface MetricsState {
  usage: {
    redux: Record<string, number>;
    legacy: Record<string, number>;
  };
  events: Array<{
    category: string;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
  }>;
  performance: {
    timerOperations: {
      redux: {
        setTimeout: number;
        clearTimeout: number;
        setInterval: number;
        clearInterval: number;
      };
      legacy: {
        setTimeout: number;
        clearTimeout: number;
        setInterval: number;
        clearInterval: number;
      };
    };
    renderTiming: {
      lastRender: number;
      history: Array<{
        component: string;
        duration: number;
        timestamp: number;
      }>;
      maxHistory: number;
    };
  };
}

const initialState: MetricsState = {
  usage: {
    redux: {},
    legacy: {}
  },
  events: [],
  performance: {
    timerOperations: {
      redux: {
        setTimeout: 0,
        clearTimeout: 0,
        setInterval: 0,
        clearInterval: 0
      },
      legacy: {
        setTimeout: 0,
        clearTimeout: 0,
        setInterval: 0,
        clearInterval: 0
      }
    },
    renderTiming: {
      lastRender: 0,
      history: [],
      maxHistory: 20
    }
  }
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    trackUsage: (
      state: MetricsState,
      action: PayloadAction<{
        system: 'redux' | 'legacy';
        operation: string;
      }>
    ) => {
      const { system, operation } = action.payload;
      // Initialize if doesn't exist
      if (!state.usage[system][operation]) {
        state.usage[system][operation] = 0;
      }
      // Increment counter
      state.usage[system][operation]++;
    },
    
    trackEvent: (
      state: MetricsState,
      action: PayloadAction<{
        category: string;
        action: string;
        label?: string;
        value?: number;
      }>
    ) => {
      state.events.push({
        ...action.payload,
        timestamp: Date.now()
      });
      
      // Trim events array if it gets too large
      if (state.events.length > 100) {
        state.events = state.events.slice(-100);
      }
    },
    
    trackTimerOperation: (
      state: MetricsState,
      action: PayloadAction<{
        system: 'redux' | 'legacy';
        operation: 'setTimeout' | 'clearTimeout' | 'setInterval' | 'clearInterval';
      }>
    ) => {
      const { system, operation } = action.payload;
      state.performance.timerOperations[system][operation]++;
    },
    
    trackRenderTiming: (
      state: MetricsState,
      action: PayloadAction<{
        component: string;
        duration: number;
      }>
    ) => {
      state.performance.renderTiming.lastRender = Date.now();
      
      state.performance.renderTiming.history.push({
        component: action.payload.component,
        duration: action.payload.duration,
        timestamp: Date.now()
      });
      
      // Keep history within limits
      if (state.performance.renderTiming.history.length > state.performance.renderTiming.maxHistory) {
        state.performance.renderTiming.history = state.performance.renderTiming.history.slice(
          -state.performance.renderTiming.maxHistory
        );
      }
    },
    
    clearMetrics: (state: MetricsState) => {
      state.usage = { redux: {}, legacy: {} };
      state.events = [];
      state.performance.timerOperations = {
        redux: {
          setTimeout: 0,
          clearTimeout: 0,
          setInterval: 0,
          clearInterval: 0
        },
        legacy: {
          setTimeout: 0,
          clearTimeout: 0,
          setInterval: 0,
          clearInterval: 0
        }
      };
    }
  }
});

// Action creators
export const { 
  trackUsage, 
  trackEvent, 
  trackTimerOperation, 
  trackRenderTiming, 
  clearMetrics 
} = metricsSlice.actions;

// Selectors
export const selectUsageMetrics = (state: RootState) => state.metrics.usage;
export const selectEvents = (state: RootState) => state.metrics.events;
export const selectTimerOperations = (state: RootState) => state.metrics.performance.timerOperations;
export const selectRenderTimings = (state: RootState) => state.metrics.performance.renderTiming;

export const selectMigrationProgress = (state: RootState) => {
  const { redux, legacy } = state.metrics.usage;
  
  // Calculate total operations
  let reduxTotal = 0;
  let legacyTotal = 0;
  
  // Sum all operation counts using proper type assertions
  Object.values(redux as { [key: string]: number }).forEach(count => { reduxTotal += count });
  Object.values(legacy as { [key: string]: number }).forEach(count => { legacyTotal += count });
  
  const total = reduxTotal + legacyTotal;
  
  // Calculate percentage
  const percentage = total > 0 ? Math.round((reduxTotal / total) * 100) : 0;
  
  return {
    reduxOperations: reduxTotal,
    legacyOperations: legacyTotal,
    totalOperations: total,
    migrationPercentage: percentage
  };
};

export default metricsSlice.reducer; 