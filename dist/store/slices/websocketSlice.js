import { createSlice } from '@reduxjs/toolkit';
import { Logger } from '../../utils/logger';
const logger = Logger.getInstance();
const initialState = {
    status: 'idle',
    lastMessage: null,
    lastError: null,
    messageCount: 0,
};
export const websocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        setWebSocketStatus: (state, action) => {
            logger.log('WebSocketSlice', `Status changing from ${state.status} to ${action.payload}`);
            state.status = action.payload;
            if (action.payload === 'error') {
                // Potentially capture error details if provided in action payload later
                state.lastError = 'An error occurred'; // Placeholder
            }
            else {
                state.lastError = null;
            }
        },
        webSocketMessageReceived: (state, action) => {
            state.lastMessage = action.payload;
            state.messageCount += 1;
            logger.log('WebSocketSlice', `Message received (Count: ${state.messageCount})`, action.payload);
            // Further processing or dispatching other actions can happen in middleware
            // or components subscribing to state.lastMessage changes.
        },
        resetWebSocketState: (state) => {
            logger.log('WebSocketSlice', 'Resetting WebSocket state');
            Object.assign(state, initialState);
        },
    },
});
// Export actions
export const { setWebSocketStatus, webSocketMessageReceived, resetWebSocketState, } = websocketSlice.actions;
// Export selectors
export const selectWebSocketStatus = (state) => state.websocket.status;
export const selectLastWebSocketMessage = (state) => state.websocket.lastMessage;
export const selectWebSocketError = (state) => state.websocket.lastError;
export const selectWebSocketMessageCount = (state) => state.websocket.messageCount;
// Export reducer
export default websocketSlice.reducer;
//# sourceMappingURL=websocketSlice.js.map