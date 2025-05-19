import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { InventreeItem } from '../../types';
import { Logger } from '../../utils/logger';
import { inventreeApiService } from '../../services/inventree-api-service';

const logger = Logger.getInstance();

// Define the shape of the search result item returned by the thunk
// Matching the one in searchSlice.ts
type SearchResultItem = Pick<InventreeItem, 'pk' | 'name' | 'thumbnail'>;

// Thunk action to perform a part search via the API
export const performSearch = createAsyncThunk<
  SearchResultItem[], // Return type on success
  string, // Argument type (search query)
  { state: RootState; rejectValue: string } // ThunkAPI config
>(
  'search/perform', // Action type prefix
  async (query, thunkAPI) => {
    // API config is handled internally by inventreeApiService

    try {
      logger.log('performSearch', `Searching for: "${query}"`, { level: 'debug' });

      // Use the new service to get parts based on the search query
      const results: InventreeItem[] = await inventreeApiService.getParts({ search: query });

      // Map full results to the simplified SearchResultItem shape
      const simplifiedResults: SearchResultItem[] = results.map(part => ({
        pk: part.pk,
        name: part.name,
        thumbnail: part.thumbnail || undefined, // Ensure consistency with type
      }));

      logger.log('performSearch', `Search successful, found ${simplifiedResults.length} results.`);
      return simplifiedResults;

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to perform search';
      logger.error('performSearch', `Search failed: ${errorMessage}`, error);
      // Ensure error is serializable
      return thunkAPI.rejectWithValue(typeof error === 'string' ? error : errorMessage);
    }
  }
);

export const searchInventree = createAsyncThunk<
    InventreeItem[], // Return type
    string,          // Argument type (search query)
    { state: RootState } // Thunk config
>(
    'search/searchInventree',
    async (query, { getState, rejectWithValue }) => {
        const state = getState();
        // Config is no longer in Redux state.
        // API details need to be accessed differently.
        // Option 1: Assume API is already initialized elsewhere (e.g., inventree-card.ts)
        // Option 2: Pass API config as part of the thunk argument (less ideal)
        // Option 3: Create a separate slice to hold API instance/config (better)

        // For now, we attempt to create a new API instance here, but this is NOT ideal.
        // Ideally, the initialized API instance should be retrieved from somewhere.
        // This requires refactoring how the API instance is managed.
        logger.warn('searchInventree Thunk', 'Attempting to create API instance inside thunk - this should be refactored.');

        // Placeholder: How do we get URL/API key here now?
        // We might need to reject if the info isn't available.
        // const { url, apiKey } = /* Get from somewhere? */;
        // if (!url || !apiKey) {
        //    logger.error('searchInventree Thunk', 'API URL/Key not available.');
        //    return rejectWithValue('API configuration not available');
        // }

        try {
            // This instantiation will fail without url/apiKey
            // const api = new InvenTreeDirectAPI(url, apiKey);
            // const results = await api.searchPart(query);

            // --- TEMPORARY MOCK --- 
            // Remove this when API access is fixed
            logger.warn('searchInventree Thunk', 'Using MOCKED API response');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            const mockResults: InventreeItem[] = query.toLowerCase().includes('resistor') ? 
                [ { pk: 101, name: 'Resistor 1k', in_stock: 100, thumbnail: '' }, { pk: 102, name: 'Resistor 10k', in_stock: 50, thumbnail: '' } ] :
                [];
            // --- END MOCK --- 

            logger.log('searchInventree Thunk', `Search for "${query}" returned ${mockResults.length} results.`);
            return mockResults; // Use mockResults for now
        } catch (error: any) {
            logger.error('searchInventree Thunk', `Search failed: ${error.message || error}`);
            return rejectWithValue(error.message || 'Search failed');
        }
    }
); 

// REMOVE THIS BLOCK related to old API
/*
export const searchParts = createAsyncThunk<
    InventreeItem[],
    { query: string, category?: string },
    { state: RootState, rejectWithValue: string }
>(
    'search/searchParts',
    async ({ query, category }, { getState, rejectWithValue }) => {
        // Temporary config - replace with actual config access
        const tempApiConfig = { url: 'TEMP_URL', apiKey: 'TEMP_KEY' }; 
        const api = new InvenTreeDirectAPI(tempApiConfig.url, tempApiConfig.apiKey);

        try {
            const results = await api.searchParts(query, category);
            return results;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
*/