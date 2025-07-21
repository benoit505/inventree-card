import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';
import { WebSocketEventMessage } from '../../types';

const logger = ConditionalLoggerEngine.getInstance().getLogger('WebSocketSlice');
ConditionalLoggerEngine.getInstance().registerCategory('WebSocketSlice', { enabled: false, level: 'info' });

type WebSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'disabled';

export interface WebSocketState {
    status: WebSocketStatus;
    lastMessage: any | null; // Store the last received message for debugging?
    lastError: string | null;
    messageCount: number;
}

const initialState: WebSocketState = {
    status: 'idle',
    lastMessage: null,
    lastError: null,
    messageCount: 0,
};

export const websocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        setWebSocketStatus: (state: WebSocketState, action: PayloadAction<WebSocketStatus>) => {
            logger.info('setWebSocketStatus', `Status changing from ${state.status} to ${action.payload}`);
            state.status = action.payload;
            if (action.payload === 'error') {
                // Potentially capture error details if provided in action payload later
                state.lastError = 'An error occurred'; // Placeholder
            } else {
                state.lastError = null;
            }
        },
        webSocketMessageReceived: (state: WebSocketState, action: PayloadAction<any>) => {
            state.lastMessage = action.payload;
            state.messageCount += 1;
            logger.debug('webSocketMessageReceived', `Message received (Count: ${state.messageCount})`, action.payload);
            // Further processing or dispatching other actions can happen in middleware
            // or components subscribing to state.lastMessage changes.
        },
        resetWebSocketState: (state: WebSocketState) => {
            logger.info('resetWebSocketState', 'Resetting WebSocket state');
            Object.assign(state, initialState);
        },
    },
});

// Export actions
export const {
    setWebSocketStatus,
    webSocketMessageReceived,
    resetWebSocketState,
} = websocketSlice.actions;

// Export selectors
export const selectWebSocketStatus = (state: RootState) => state.websocket.status;
export const selectLastWebSocketMessage = (state: RootState) => state.websocket.lastMessage;
export const selectWebSocketError = (state: RootState) => state.websocket.lastError;
export const selectWebSocketMessageCount = (state: RootState) => state.websocket.messageCount;

// Export reducer
export default websocketSlice.reducer; 