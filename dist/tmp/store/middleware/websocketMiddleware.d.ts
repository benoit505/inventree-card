/**
 * Redux Middleware for managing the WebSocketPlugin connection
 * based on the card configuration state.
 */
import { Middleware } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '../index';
export declare const websocketMiddleware: Middleware<{}, RootState, AppDispatch>;
