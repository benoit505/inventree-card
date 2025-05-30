import { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
type WebSocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'disabled';
export interface WebSocketState {
    status: WebSocketStatus;
    lastMessage: any | null;
    lastError: string | null;
    messageCount: number;
}
export declare const websocketSlice: import("@reduxjs/toolkit").Slice<WebSocketState, {
    setWebSocketStatus: (state: WebSocketState, action: PayloadAction<WebSocketStatus>) => void;
    webSocketMessageReceived: (state: WebSocketState, action: PayloadAction<any>) => void;
    resetWebSocketState: (state: WebSocketState) => void;
}, "websocket", "websocket", import("@reduxjs/toolkit").SliceSelectors<WebSocketState>>;
export declare const setWebSocketStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<WebSocketStatus, "websocket/setWebSocketStatus">, webSocketMessageReceived: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, "websocket/webSocketMessageReceived">, resetWebSocketState: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"websocket/resetWebSocketState">;
export declare const selectWebSocketStatus: (state: RootState) => WebSocketStatus;
export declare const selectLastWebSocketMessage: (state: RootState) => any;
export declare const selectWebSocketError: (state: RootState) => string | null;
export declare const selectWebSocketMessageCount: (state: RootState) => number;
declare const _default: import("redux").Reducer<WebSocketState>;
export default _default;
