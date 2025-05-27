import { createSlice } from '@reduxjs/toolkit';
import { Logger } from '../../utils/logger';
import { performSearch } from '../thunks/searchThunks'; // Import the thunk
const logger = Logger.getInstance();
const initialState = {
    query: '',
    results: [],
    loading: 'idle',
    error: null,
};
const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.query = action.payload;
            // Optionally reset results/status when query changes
            // state.results = [];
            // state.loading = 'idle';
            // state.error = null;
            logger.log('searchSlice', `Search query set to: "${action.payload}"`, { level: 'debug' });
        },
        clearSearch: (state) => {
            state.query = '';
            state.results = [];
            state.loading = 'idle';
            state.error = null;
            logger.log('searchSlice', 'Search state cleared.', { level: 'debug' });
        },
    },
    // Add extraReducers for handling the search thunk actions
    extraReducers: (builder) => {
        builder
            .addCase(performSearch.pending, (state) => {
            state.loading = 'pending';
            state.error = null;
            logger.log('searchSlice', 'Search pending...', { level: 'debug' });
        })
            .addCase(performSearch.fulfilled, (state, action) => {
            state.loading = 'succeeded';
            state.results = action.payload;
            state.error = null;
            logger.log('searchSlice', `Search succeeded with ${action.payload.length} results.`, { level: 'debug' });
        })
            .addCase(performSearch.rejected, (state, action) => {
            var _a;
            state.loading = 'failed';
            state.error = (_a = action.payload) !== null && _a !== void 0 ? _a : 'Search failed';
            state.results = [];
            logger.error('searchSlice', `Search failed: ${state.error}`);
        });
    }
});
export const { setSearchQuery, clearSearch, } = searchSlice.actions;
// Selectors
export const selectSearchQuery = (state) => state.search.query;
export const selectSearchResults = (state) => state.search.results;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;
export const selectHasSearchResults = (state) => state.search.results.length > 0;
export default searchSlice.reducer;
//# sourceMappingURL=searchSlice.js.map