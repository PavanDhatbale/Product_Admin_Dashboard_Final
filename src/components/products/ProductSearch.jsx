'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * ProductSearch component.
 * Provides a debounced search input field that synchronizes bidirectionally with URL state.
 */
export default function ProductSearch({
  search = '',
  onSearchChange,
  placeholder = 'Search products by title or description...',
}) {
  const [prevSearch, setPrevSearch] = useState(search);
  const [inputValue, setInputValue] = useState(search);

  // React pattern: Synchronize state during render when external search prop changes
  if (search !== prevSearch) {
    setPrevSearch(search);
    setInputValue(search);
  }

  const debouncedInput = useDebounce(inputValue, 400);

  // When debounced value changes, trigger search update if different from current active search
  useEffect(() => {
    const trimmed = debouncedInput.trim();
    if (trimmed !== search) {
      onSearchChange(trimmed);
    }
  }, [debouncedInput, search, onSearchChange]);

  const handleClear = () => {
    setInputValue('');
    if (search !== '') {
      onSearchChange('');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="product-search-input" className="sr-only">
        Search products
      </label>

      {/* Leading Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search size={18} />
      </div>

      {/* Search Input Field */}
      <input
        id="product-search-input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        autoComplete="off"
        className="block w-full pl-10 pr-9 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
