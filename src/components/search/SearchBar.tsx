import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ConditionalLoggerEngine } from '../../core/logging/ConditionalLoggerEngine';

const logger = ConditionalLoggerEngine.getInstance().getLogger('SearchBar');
ConditionalLoggerEngine.getInstance().registerCategory('SearchBar', { enabled: false, level: 'info' });

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
  initialQuery: string;
  onSearchChange: (query: string) => void;
  // Optional: Pass loading/error states if SearchBar should display them
  // isLoading?: boolean;
  // error?: string | null;
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
  // Status indicators like loading/error are now handled by the parent (PartsLayout)
};

// Keyframes for spinner (if a spinner were used here, but it's moved to parent)
// const keyframesStyle = `
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }
// `;

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery, onSearchChange }) => {
  const [inputValue, setInputValue] = useState(initialQuery);

  // Update inputValue if initialQuery prop changes from parent
  useEffect(() => {
    if (initialQuery !== inputValue) {
      setInputValue(initialQuery);
    }
  }, [initialQuery, inputValue]);

  const debouncedTriggerSearch = useCallback(
    debounce((query: string) => {
      logger.debug('debouncedTriggerSearch', `Triggering search for: "${query}" via onSearchChange prop`);
      onSearchChange(query.trim()); // Parent will handle if it's empty or not
    }, 300),
    [onSearchChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query); // Update local input state immediately
    debouncedTriggerSearch(query); // Trigger debounced search via prop
  };

  const handleClear = () => {
    logger.debug('handleClear', 'Clearing search via onSearchChange prop');
    setInputValue(''); // Clear local input
    onSearchChange(''); // Notify parent
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    // To cancel a pending debounce, our simple debounce needs enhancement.
    // For now, we directly call onSearchChange, which might cause two calls if debounce is pending.
    // A more robust debounce would return a cancel function.
    logger.debug('handleSearchSubmit', `Submitting search for: "${inputValue}" via onSearchChange prop`);
    onSearchChange(inputValue.trim()); // Notify parent immediately
  };

  return (
    <form onSubmit={handleSearchSubmit} style={{width: '100%'}}>
      {/* <style>{keyframesStyle}</style> */}
      <div style={styles.searchContainer}>
        <span style={{paddingRight: '8px', color: '#555'}}>🔍</span> 
        <input
          type="text"
          placeholder="Search Parts..."
          value={inputValue}
          onChange={handleInputChange}
          style={styles.input}
        />
        {/* Loading/Error indicators are now handled by PartsLayout */}
        {inputValue ? (
          <button type="button" onClick={handleClear} style={{...styles.iconButton, ...styles.clearButton}} title="Clear Search">
            ✕ 
          </button>
        ) : (
          <button type="submit" style={styles.iconButton} title="Search">
            🔍
          </button>
        )}
      </div>
      {/* Error display is now handled by PartsLayout */}
    </form>
  );
};

export default SearchBar; 