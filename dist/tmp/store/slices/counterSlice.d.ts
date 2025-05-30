export interface CounterState {
    value: number;
}
export declare const increment: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"counter/increment">, decrement: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"counter/decrement">, incrementByAmount: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "counter/incrementByAmount">;
declare const _default: import("redux").Reducer<CounterState>;
export default _default;
