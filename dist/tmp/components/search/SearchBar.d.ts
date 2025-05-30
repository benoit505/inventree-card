import * as React from 'react';
interface SearchBarProps {
    initialQuery: string;
    onSearchChange: (query: string) => void;
}
declare const SearchBar: React.FC<SearchBarProps>;
export default SearchBar;
