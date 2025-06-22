import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SearchFilters, PropertySearchResult } from '../lib/types';

interface SearchContextType {
  filters: SearchFilters;
  results: PropertySearchResult[];
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: SearchFilters) => void;
  search: () => Promise<void>;
  clearFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<PropertySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = (table: string, filters: SearchFilters) => {
    let query = supabase.from(table).select('*');

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.priceRange) {
      query = query
        .gte('price_per_night', filters.priceRange.min)
        .lte('price_per_night', filters.priceRange.max);
    }

    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.amenities?.length) {
      // Only apply amenities filter to hotels and apartments
      if (table !== 'restaurants') {
        query = query.contains('amenities', filters.amenities);
      }
    }

    // Only apply categories filter to hotels and apartments
    if (filters.categories?.length && table !== 'restaurants') {
      query = query.contains('categories', filters.categories);
    }

    // Property-specific filters
    if (table === 'apartments' && filters.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }

    if (table === 'apartments' && filters.guests) {
      query = query.gte('max_guests', filters.guests);
    }

    if (table === 'restaurants' && filters.cuisineType) {
      query = query.eq('cuisine_type', filters.cuisineType);
    }

    return query;
  };

  const search = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queries = [];

      // Determine which property types to search
      if (!filters.propertyType || filters.propertyType === 'hotel') {
        queries.push({ query: buildQuery('hotels', filters), type: 'hotel' });
      }
      if (!filters.propertyType || filters.propertyType === 'apartment') {
        queries.push({ query: buildQuery('apartments', filters), type: 'apartment' });
      }
      if (!filters.propertyType || filters.propertyType === 'restaurant') {
        queries.push({ query: buildQuery('restaurants', filters), type: 'restaurant' });
      }

      const results = await Promise.all(queries.map(({ query }) => query));

      const combinedResults: PropertySearchResult[] = [];

      results.forEach((result, index) => {
        if (result.error) throw result.error;

        const type = queries[index].type as 'hotel' | 'apartment' | 'restaurant';
        
        result.data?.forEach(item => {
          combinedResults.push({
            ...item,
            type,
            title: item.name,
            created_at: item.created_at
          });
        });
      });

      // Filter by availability if dates are provided
      let filteredResults = combinedResults;
      if (filters.checkIn && filters.checkOut) {
        // For now, we'll just return all results
        // In a real app, you'd check availability against bookings
        filteredResults = combinedResults;
      }

      setResults(filteredResults);
    } catch (err) {
      setError('Failed to search properties');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setResults([]);
  };

  return (
    <SearchContext.Provider value={{
      filters,
      results,
      isLoading,
      error,
      setFilters,
      search,
      clearFilters
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}