/*
    Archivo: SearchBar.tsx
    Descripcion: componente de barra de búsqueda reutilizable.
    Autor: Marilyn Castro
    Fecha creacion: 3/07/2025
    Version: 2.0.1
*/

import React, { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, X } from 'react-feather';

import Dropdown from './Dropdown';
import { type DropdownOption } from '../types/ui';


export interface SearchItem {
  id: string;
  name: string;
  category?: string;
}

interface LiveSearchProps {
  fetchResults: (query: string, page: number) => Promise<{ items: SearchItem[], hasMore: boolean }>;
  placeholder?: string;
  onSelect?: (item: SearchItem) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchOnType?: boolean;
}

interface DateSelectorProps {
  onDateChange: (value: string) => void;
  value: string;
  label?: string;
  className?: string;
}

interface SearchBarProps {
  leftDropdown?: {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  rightDropdown?: {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  centerDropdown?: {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  dateSelector?: {
    value: string;
    onDateChange: (date: string) => void;
    label?: string;
    className?: string;
  }
  liveSearch?: {
    fetchResults: (query: string, page: number) => Promise<{ items: SearchItem[], hasMore: boolean }>;
    onSelect?: (item: SearchItem) => void;
    searchOnType?: boolean;
  };
  onSearch?: (query: string, leftValue?: string, rightValue?: string, dateValue?: string, centerValue?: string) => void;
  searchButtonText?: string;
  searchPlaceholder?: string;
  className?: string;
  showSearchBar?: boolean;
  showButtonSearch?: boolean;
  automaticSearch?: boolean;
  onLiveSearchQueryChange?: (query: string) => void;
}

const LiveSearch: React.FC<LiveSearchProps> = ({
  fetchResults,
  placeholder = "Buscar...",
  onSelect,
  query,
  onQueryChange,
  searchOnType,
}) => {
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelectingRef = useRef(false);
  const justSelectedRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);


  // Función para realizar búsqueda
  const performSearch = async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const { items, hasMore } = await fetchResults(searchQuery, pageNum);
      if (pageNum === 1) {
        setResults(items);
        setPage(2);
        setIsOpen(items.length > 0);
      } else {
        setResults(prev => [...prev, ...items]);
        setPage(prev => prev + 1);
      }

      setHasMore(hasMore);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error al buscar:', error);
      }
      console.error("Error al buscar");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      justSelectedRef.current = false;
    }

    if (searchOnType && !justSelectedRef.current) {
      const delayDebounce = setTimeout(() => {
        performSearch(query, 1);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
    }
  }, [query, searchOnType]);

  useEffect(() => {
    const container = resultsContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 20 &&
        !isLoadingMore &&
        !isSearching && hasMore
      ) {
        setIsLoadingMore(true);
        try {
          await performSearch(query, page);
        } catch {
          console.error("Error cargando más resultados");
        } finally {
          setIsLoadingMore(false);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [query, page, isLoadingMore, isSearching, hasMore]);

  const handleSelect = (item: SearchItem) => {
    justSelectedRef.current = true;
    isSelectingRef.current = true;

    onQueryChange(item.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    setResults([]);
    onSelect?.(item);

    requestAnimationFrame(() => {
      isSelectingRef.current = false;
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && results.length > 0 && selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        } else if (query.trim()) {
          performSearch(query, 1);
        }
        break;
      case 'ArrowDown':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
        }
        break;
      case 'ArrowUp':
        if (isOpen && results.length > 0) {
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    justSelectedRef.current = false;
    onQueryChange(e.target.value);
  };

  const clearSearch = () => {
    onQueryChange('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && results.length > 0 && setIsOpen(true)}
          onBlur={() => { if (!isSelectingRef.current) setIsOpen(false); }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border-0 bg-transparent focus:outline-none"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            aria-label="Borrar contenido de la barra de búsqueda"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div ref={resultsContainerRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{item.name}</span>
                {item.category && (
                  <span className="text-sm text-gray-500 mt-1">{item.category}</span>
                )}
              </div>
            </div>
          ))}
          {isLoadingMore && (
            <div className="px-3 py-3 text-center text-gray-500">
              Cargando más resultados...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DateSelector: React.FC<DateSelectorProps> = ({
  onDateChange,
  value,
  label = "Seleccionar fecha",
  className = ""
}) => {
  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState<string>(value || getCurrentDate());

  useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleChange = (newDate: string) => {
    const finalDate = newDate || getCurrentDate();
    setDate(finalDate);
    onDateChange(finalDate);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 md:gap-3">
        <label htmlFor="date-input" className="text-sm font-medium text-gray-600 mb-1 sm:mb-0
        sm:w-20 md:w-20 lg:w-48
        sm:text-right">
          {label}
        </label>

        <div className="relative w-full sm:flex-1 md:max-w-xs lg:max-w-sm">
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-2 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
};

// Componente principal SearchBar
const SearchBar: React.FC<SearchBarProps> = ({
  leftDropdown,
  rightDropdown,
  centerDropdown,
  liveSearch,
  dateSelector,
  onSearch,
  searchButtonText = "Buscar",
  searchPlaceholder = "Buscar...",
  className = "",
  showSearchBar = true,
  showButtonSearch = true,
  onLiveSearchQueryChange,
  automaticSearch = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleQueryChange = (valor: string) => {
    setSearchQuery(valor);
    if (onLiveSearchQueryChange) {
      onLiveSearchQueryChange(valor);
    }
  };

  const handleSearch = () => {
    onSearch?.(searchQuery, leftDropdown?.value, rightDropdown?.value, dateSelector?.value, centerDropdown?.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !liveSearch) {
      handleSearch();
    }
  };

  const soloFiltrosSinSearch = !showSearchBar && (leftDropdown || rightDropdown || dateSelector);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 ${className}`}>
      <div className={`w-full ${soloFiltrosSinSearch ? "flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3" : "grid grid-cols-1 md:grid-cols-6 gap-2"} mb-3`}>

        {leftDropdown && (
          <div className={`${soloFiltrosSinSearch ? "w-full sm:flex-1" : "w-full md:flex-1"}`}>
            <Dropdown
              options={leftDropdown.options}
              value={leftDropdown.value}
              onChange={leftDropdown.onChange}
              placeholder={leftDropdown.placeholder}
            />
          </div>
        )}

        {centerDropdown && (
          <div className={`${soloFiltrosSinSearch ? "w-full sm:flex-1" : "w-full md:flex-1"}`}>
            <Dropdown
              options={centerDropdown.options}
              value={centerDropdown.value}
              onChange={centerDropdown.onChange}
              placeholder={centerDropdown.placeholder}
            />
          </div>
        )}

        {showSearchBar && (
          <div className={`w-full ${leftDropdown && rightDropdown ? "md:col-span-4"
            : leftDropdown || rightDropdown
              ? "md:flex-[2]"
              : "md:col-span-6"
            }`}
            onKeyDown={handleKeyPress} >
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent h-full">
              {liveSearch ? (
                <LiveSearch
                  fetchResults={liveSearch.fetchResults}
                  placeholder={searchPlaceholder}
                  onSelect={liveSearch.onSelect}
                  query={searchQuery}
                  onQueryChange={handleQueryChange}
                  searchOnType={automaticSearch}
                />
              ) : (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent border-0 focus:outline-none"
                />
              )}
            </div>
          </div>
        )}

        {rightDropdown && (
          <div className={`${soloFiltrosSinSearch ? "w-full sm:flex-1" : "w-full md:flex-1"}`}>
            <Dropdown
              options={rightDropdown.options}
              value={rightDropdown.value}
              onChange={rightDropdown.onChange}
              placeholder={rightDropdown.placeholder}
            />
          </div>
        )}

        {dateSelector && (
          <div className={`${soloFiltrosSinSearch ? "w-full sm:flex-1" : "w-full md:flex-1"}`}>
            <DateSelector
              value={dateSelector.value}
              onDateChange={dateSelector.onDateChange}
              label={dateSelector.label}
              className={dateSelector.className}
            />
          </div>)}

        {showButtonSearch && (
          <div className={soloFiltrosSinSearch ? "order-last w-full flex justify-end mt-3 sm:order-none sm:w-auto sm:ml-auto lg:mt-0"
            : "w-full flex justify-end mt-3 md:mt-0 md:col-start-6"
          }>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full md:w-auto"
            >
              <Search className="h-4 w-4" />
              {searchButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default SearchBar;