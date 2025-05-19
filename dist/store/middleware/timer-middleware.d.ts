import { Middleware } from '@reduxjs/toolkit';
/**
 * Middleware to handle timer-related side effects
 *
 * This middleware:
 * 1. Listens for component disconnect actions
 * 2. Cleans up all timers for disconnected components
 */
export declare const timerMiddleware: Middleware;
