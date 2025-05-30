import { RootState } from '../index';
import { InventreeItem } from '../../types';
export declare const fetchPartsByPks: import("@reduxjs/toolkit").AsyncThunk<InventreeItem[], number[], {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
