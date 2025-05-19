import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Adjust path as necessary
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { Logger } from '../../utils/logger'; // Adjust path as necessary
import { 
    selectSearchQuery, 
    selectSearchLoading, 
    selectSearchError,
    setSearchQuery,
    clearSearch
} from '../../store/slices/searchSlice'; // Adjust path as necessary
import { performSearch } from '../../store/thunks/searchThunks'; // Adjust path as necessary

// Debounce utility (can be moved to a shared utils file)
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };
}

interface SearchBarProps {
  // Config and HASS might be needed for placeholder text or other future features
  // config?: InventreeCardConfig;
  // hass?: HomeAssistant;
}

// Basic styling (can be expanded or moved to CSS modules/files)
const styles: { [key: string]: React.CSSProperties } = {
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc', // Simplified border
    borderRadius: '4px',
    padding: '4px 8px',
    backgroundColor: '#f9f9f9', // Simplified background
    position: 'relative' as 'relative',
    marginBottom: '1rem',
  },
  input: {
    flexGrow: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    padding: '8px',
    fontSize: '1rem',
  },
  iconButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#555',
  },
  clearButton: {
    color: '#333',
  },
  statusIndicator: {
    // position: 'absolute', // Kept for now, but might not be needed if inside flex
    // right: '40px', 
    // top: '50%',
    // transform: 'translateY(-50%)',
    marginLeft: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  loadingSpinner: { // Simple spinner, replace with component if available
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3498db',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    animation: 'spin 1s linear infinite',
  },
  errorMessage: {
    color: 'red',
    fontSize: '0.8em',
    // position: 'absolute', // Positioned statically below for simplicity
    // bottom: '-1.5em', 
    // left: '8px',
    marginTop: '4px',
    paddingLeft: '8px',
  }
};

// Add keyframes for spinner animation if not using a component library spinner
const keyframesStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const SearchBar: React.FC<SearchBarProps> = (props) => {
  const logger = useMemo(() => Logger.getInstance(), []);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();

  const reduxQuery = useSelector(selectSearchQuery);
  const loadingStatus = useSelector(selectSearchLoading);
  const searchError = useSelector(selectSearchError);

  const [inputValue, setInputValue] = useState(reduxQuery); // Initialize with Redux query

  // Update inputValue if Redux query changes from outside (e.g., clearSearch)
  useEffect(() => {
    if (reduxQuery !== inputValue) {
      setInputValue(reduxQuery);
    }
  }, [reduxQuery, inputValue]);

  const debouncedPerformSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length > 1) {
        logger.log('SearchBar React', `Dispatching debounced search for: "${query}"`);
        dispatch(performSearch(query.trim()));
      } else if (query.trim().length === 0) {
        logger.log('SearchBar React', 'Dispatching clearSearch due to empty debounced query');
        dispatch(clearSearch());
      }
    }, 300),
    [dispatch, logger]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query); // Update local input state immediately
    dispatch(setSearchQuery(query)); // Update Redux query state immediately for other listeners
    debouncedPerformSearch(query); // Trigger debounced API call search
  };

  const handleClear = () => {
    logger.log('SearchBar React', 'Dispatching clearSearch from clear button');
    dispatch(clearSearch());
    setInputValue(''); // Clear local input as well
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    // Clear any pending debounced search since we are submitting now
    // This typically involves cancelling the debounce timer, which our simple debounce doesn't support directly.
    // For now, the immediate dispatch will likely override/race the debounced one.
    if (inputValue.trim().length > 1) {
      logger.log('SearchBar React', `Dispatching immediate search for: "${inputValue}"`);
      dispatch(performSearch(inputValue.trim()));
    } else if (inputValue.trim().length === 0) {
      logger.log('SearchBar React', 'Dispatching clearSearch from submit (empty query)');
      dispatch(clearSearch());
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} style={{width: '100%'}}>
      <style>{keyframesStyle}</style> {/* Inject keyframes for spinner */}
      <div style={styles.searchContainer}>
        {/* Basic search icon (can be replaced with mdi:magnify if using an icon library) */}
        <span style={{paddingRight: '8px', color: '#555'}}>🔍</span> 
        <input
          type="text"
          placeholder="Search Parts..."
          value={inputValue}
          onChange={handleInputChange}
          style={styles.input}
        />
        <div style={styles.statusIndicator}>
          {loadingStatus === 'pending' && (
            <div style={styles.loadingSpinner}></div>
          )}
        </div>
        {inputValue ? (
          <button type="button" onClick={handleClear} style={{...styles.iconButton, ...styles.clearButton}} title="Clear Search">
            {/* Basic clear icon (can be replaced with mdi:close) */}
            ✕ 
          </button>
        ) : (
          <button type="submit" style={styles.iconButton} title="Search">
            {/* Re-using search icon for submit when input is empty, though functionally it might be redundant */}
            {/* if input is empty and submitted, it clears search anyway */}
            🔍
          </button>
        )}
      </div>
      {searchError && (
        <div style={styles.errorMessage}>{searchError}</div>
      )}
    </form>
  );
};

export default SearchBar; 