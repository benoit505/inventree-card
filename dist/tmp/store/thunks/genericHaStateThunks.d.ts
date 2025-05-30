import { HomeAssistant } from 'custom-card-helpers';
import { RootState } from '../index';
import { HaEntityState } from '../slices/genericHaStateSlice';
export declare const fetchHaEntityStatesThunk: import("@reduxjs/toolkit").AsyncThunk<HaEntityState[], {
    hass: HomeAssistant;
    entityIds: string[];
}, {
    state: RootState;
    rejectValue: string;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction> | undefined;
    extra?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
