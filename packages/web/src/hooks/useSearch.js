import { useState, useMemo } from 'react';

/**
 * Reusable hook for search/filter functionality
 * Follows DRY principle by extracting common search patterns
 * 
 * @param {Array} items - Array of items to search
 * @param {Function|Array} searchFields - Field(s) to search in
 * @returns {Object} Search state and filtered results
 */
export function useSearch(items = [], searchFields = []) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    
    // If searchFields is a function, use it as a custom filter
    if (typeof searchFields === 'function') {
      return items.filter(item => searchFields(item, query));
    }

    // If searchFields is an array, search in those fields
    if (Array.isArray(searchFields)) {
      return items.filter(item => {
        return searchFields.some(field => {
          const value = typeof field === 'function' 
            ? field(item) 
            : item[field];
          return value?.toString().toLowerCase().includes(query);
        });
      });
    }

    // Default: search in all string/number fields
    return items.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string' || typeof value === 'number') {
          return value.toString().toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [items, searchQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}

