import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { InventreeItem } from '../../types'; // Assuming search results might be simplified items
import { RootState } from '../index';
import { Logger } from '../../utils/logger';
import { performSearch } from '../thunks/searchThunks'; // Import the thunk

const logger = Logger.getInstance();

// Define the shape of the search result item if needed (could be just part ID)
type SearchResultItem = Pick<InventreeItem, 'pk' | 'name' | 'thumbnail'>; // Example: pk, name, thumbnail

interface SearchState {
  query: string;
  results: SearchResultItem[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: 'idle',
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state: SearchState, action: PayloadAction<string>) => {
      state.query = action.payload;
      // Optionally reset results/status when query changes
      // state.results = [];
      // state.loading = 'idle';
      // state.error = null;
      logger.log('searchSlice', `Search query set to: "${action.payload}"`, { level: 'debug' });
    },
    clearSearch: (state: SearchState) => {
      state.query = '';
      state.results = [];
      state.loading = 'idle';
      state.error = null;
      logger.log('searchSlice', 'Search state cleared.', { level: 'debug' });
    },
  },
  // Add extraReducers for handling the search thunk actions
  extraReducers: (builder: ActionReducerMapBuilder<SearchState>) => {
    builder
      .addCase(performSearch.pending, (state: SearchState) => {
        state.loading = 'pending';
        state.error = null;
         logger.log('searchSlice', 'Search pending...', { level: 'debug' });
      })
      .addCase(performSearch.fulfilled, (state: SearchState, action: PayloadAction<SearchResultItem[]>) => {
        state.loading = 'succeeded';
        state.results = action.payload;
        state.error = null;
         logger.log('searchSlice', `Search succeeded with ${action.payload.length} results.`, { level: 'debug' });
      })
      .addCase(performSearch.rejected, (state: SearchState, action: PayloadAction<any>) => {
        state.loading = 'failed';
        state.error = action.payload as string ?? 'Search failed';
        state.results = [];
         logger.error('searchSlice', `Search failed: ${state.error}`);
      });
  }
});

export const {
  setSearchQuery,
  clearSearch,
} = searchSlice.actions;

// Selectors
export const selectSearchQuery = (state: RootState): string => state.search.query;
export const selectSearchResults = (state: RootState): SearchResultItem[] => state.search.results;
export const selectSearchLoading = (state: RootState): 'idle' | 'pending' | 'succeeded' | 'failed' => state.search.loading;
export const selectSearchError = (state: RootState): string | null => state.search.error;
export const selectHasSearchResults = (state: RootState): boolean => state.search.results.length > 0;

export default searchSlice.reducer; 