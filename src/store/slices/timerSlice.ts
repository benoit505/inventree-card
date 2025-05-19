import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cleanupAllTimers, safeSetTimeout, safeClearTimeout, safeSetInterval, safeClearInterval } from '../../utils/safe-timer';
import { RootState } from '../index';

interface Timer {
  id: number;
  componentId: string;
  label?: string;
  startTime: number;
  delay: number;
  type: 'timeout' | 'interval';
}

interface TimerState {
  timers: Record<number, Timer>;
  componentTimers: Record<string, Set<number>>;
  lastId: number;
}

const initialState: TimerState = {
  timers: {},
  componentTimers: {},
  lastId: 0
};

export const timerSlice = createSlice({
  name: 'timers',
  initialState,
  reducers: {
    addTimer: (state: TimerState, action: PayloadAction<Omit<Timer, 'id'>>) => {
      const { componentId, label, startTime, delay, type } = action.payload;
      const id = ++state.lastId;
      
      // Add timer to the timers map
      state.timers[id] = {
        id,
        componentId,
        label,
        startTime,
        delay,
        type
      };
      
      // Ensure the component exists in the componentTimers map
      if (!state.componentTimers[componentId]) {
        state.componentTimers[componentId] = new Set<number>();
      }
      
      // Add the timer ID to the component's set of timers
      state.componentTimers[componentId].add(id);
    },
    
    removeTimer: (state: TimerState, action: PayloadAction<number>) => {
      const id = action.payload;
      const timer = state.timers[id];
      
      if (timer) {
        // Remove from componentTimers
        if (state.componentTimers[timer.componentId]) {
          state.componentTimers[timer.componentId].delete(id);
          
          // Clean up empty component entries
          if (state.componentTimers[timer.componentId].size === 0) {
            delete state.componentTimers[timer.componentId];
          }
        }
        
        // Remove from timers map
        delete state.timers[id];
      }
    },
    
    clearComponentTimers: (state: TimerState, action: PayloadAction<string>) => {
      const componentId = action.payload;
      const timers = state.componentTimers[componentId];
      
      if (timers) {
        // Clean up each timer
        timers.forEach((id: number) => {
          delete state.timers[id];
        });
        
        // Remove the component entry
        delete state.componentTimers[componentId];
      }
    },
    
    clearAllTimers: (state: TimerState) => {
      state.timers = {};
      state.componentTimers = {};
      // Do not reset lastId to prevent ID collisions
    }
  }
});

// Action creators
export const { addTimer, removeTimer, clearComponentTimers, clearAllTimers } = timerSlice.actions;

// Selectors
export const selectAllTimers = (state: RootState) => state.timers.timers;
export const selectComponentTimers = (state: RootState, componentId: string) => 
  Object.values(state.timers.timers).filter((timer): timer is Timer => 
    timer !== null && 
    typeof timer === 'object' && 
    'componentId' in timer && 
    timer.componentId === componentId
  );
export const selectTimerStats = (state: RootState) => {
  const timers = Object.values(state.timers.timers) as Timer[];
  return {
    total: timers.length,
    timeouts: timers.filter((t): t is Timer => t.type === 'timeout').length,
    intervals: timers.filter((t): t is Timer => t.type === 'interval').length,
    byComponent: Object.fromEntries(
      Object.entries(state.timers.componentTimers).map(([componentId, timerIds]) => [
        componentId,
        {
          total: (timerIds as Set<number>).size,
          timeouts: Array.from(timerIds as Set<number>)
            .filter(id => state.timers.timers[id]?.type === 'timeout').length,
          intervals: Array.from(timerIds as Set<number>)
            .filter(id => state.timers.timers[id]?.type === 'interval').length
        }
      ])
    )
  };
};

// Middleware functions
/**
 * Create a timeout and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call when timeout expires
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Timeout ID
 */
export function createTimeout(
  componentId: string,
  callback: (...args: any[]) => void,
  delay: number,
  label?: string
) {
  return (dispatch: any) => {
    const id = safeSetTimeout(callback, delay, label);
    
    dispatch(addTimer({
      componentId,
      label,
      startTime: Date.now(),
      delay,
      type: 'timeout'
    }));
    
    return id;
  };
}

/**
 * Create an interval and track it in Redux
 * @param componentId Component ID for tracking
 * @param callback Function to call on each interval
 * @param delay Delay in milliseconds
 * @param label Optional label for debugging
 * @returns Interval ID
 */
export function createInterval(
  componentId: string,
  callback: (...args: any[]) => void,
  delay: number,
  label?: string
) {
  return (dispatch: any) => {
    const id = safeSetInterval(callback, delay, label);
    
    dispatch(addTimer({
      componentId,
      label,
      startTime: Date.now(),
      delay,
      type: 'interval'
    }));
    
    return id;
  };
}

/**
 * Clear a timeout and remove it from Redux
 * @param id Timeout ID to clear
 */
export function clearTimeout(id: number) {
  return (dispatch: any) => {
    safeClearTimeout(id);
    dispatch(removeTimer(id));
  };
}

/**
 * Clear an interval and remove it from Redux
 * @param id Interval ID to clear
 */
export function clearInterval(id: number) {
  return (dispatch: any) => {
    safeClearInterval(id);
    dispatch(removeTimer(id));
  };
}

/**
 * Clear all timers for a component
 * @param componentId Component ID
 */
export function clearTimersForComponent(componentId: string) {
  return (dispatch: any, getState: () => RootState) => {
    const timers = selectComponentTimers(getState(), componentId);
    
    timers.forEach((timer: Timer) => {
      if (timer.type === 'timeout') {
        safeClearTimeout(timer.id);
      } else {
        safeClearInterval(timer.id);
      }
    });
    
    dispatch(clearComponentTimers(componentId));
  };
}

/**
 * Clear all timers across all components
 */
export function clearAllTimersAction() {
  return (dispatch: any) => {
    cleanupAllTimers();
    dispatch(clearAllTimers());
  };
}

export default timerSlice.reducer; 