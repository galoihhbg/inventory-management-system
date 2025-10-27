import { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import client from './client';

/**
 * Base filter interface matching the backend Filter struct
 */
export interface BaseFilter {
  page?: number;
  limit?: number;
  order?: string;
  cursor?: string;
  search?: string;
  from?: string; // ISO date string
  to?: string;   // ISO date string
}

/**
 * Response type for list endpoints
 */
export interface ListResponse<T> {
  data: T[];
  meta?: any;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    nextCursor?: string;
  };
}

/**
 * Options for the useFilteredList hook
 */
export interface UseFilteredListOptions<TFilter extends BaseFilter = BaseFilter> {
  endpoint: string;
  initialFilters?: Partial<TFilter>;
  syncWithUrl?: boolean; // Whether to sync filters with URL query params
  defaultLimit?: number;
}

/**
 * Custom hook for filtered list data fetching with backend filtering
 * Supports standard filters (page, limit, order, cursor, search, from, to)
 * plus custom filters specific to each API endpoint
 * 
 * @example
 * // Basic usage with standard filters
 * const { data, isLoading, filters, setFilter, setFilters, resetFilters } = 
 *   useFilteredList({ endpoint: '/warehouses' });
 * 
 * @example
 * // With custom filters
 * interface PurchaseOrderFilter extends BaseFilter {
 *   status?: string;
 * }
 * const { data, filters, setFilter } = useFilteredList<any, PurchaseOrderFilter>({
 *   endpoint: '/purchase-orders',
 *   initialFilters: { status: 'draft' }
 * });
 */
export function useFilteredList<T = any, TFilter extends BaseFilter = BaseFilter>({
  endpoint,
  initialFilters = {},
  syncWithUrl = false,
  defaultLimit = 50
}: UseFilteredListOptions<TFilter>) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params if syncWithUrl is enabled
  const getInitialFilters = useCallback((): TFilter => {
    if (syncWithUrl) {
      const urlFilters: any = {};
      searchParams.forEach((value, key) => {
        // Parse numeric values
        if (key === 'page' || key === 'limit') {
          urlFilters[key] = parseInt(value, 10);
        } else {
          urlFilters[key] = value;
        }
      });
      return { ...initialFilters, ...urlFilters } as TFilter;
    }
    return { limit: defaultLimit, ...initialFilters } as TFilter;
  }, [syncWithUrl, searchParams, initialFilters, defaultLimit]);

  const [filters, setFiltersState] = useState<TFilter>(getInitialFilters);

  // Update URL params when filters change (if syncWithUrl is enabled)
  const updateUrlParams = useCallback((newFilters: TFilter) => {
    if (!syncWithUrl) return;
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params, { replace: true });
  }, [syncWithUrl, setSearchParams]);

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<TFilter>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      updateUrlParams(updated);
      return updated;
    });
  }, [updateUrlParams]);

  // Set a single filter
  const setFilter = useCallback(<K extends keyof TFilter>(key: K, value: TFilter[K]) => {
    setFilters({ [key]: value } as unknown as Partial<TFilter>);
  }, [setFilters]);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    const initial = { limit: defaultLimit, ...initialFilters } as TFilter;
    setFiltersState(initial);
    updateUrlParams(initial);
  }, [initialFilters, defaultLimit, updateUrlParams]);

  // Build query params for API call
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }, [filters]);

  // Fetch data with filters
  const { data, isLoading, error, refetch, isFetching } = useQuery<ListResponse<T>>({
    queryKey: [endpoint, queryParams],
    queryFn: async () => {
      const res = await client.get(endpoint, { params: queryParams });
      return res.data;
    },
    placeholderData: keepPreviousData
  });

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    setFilter('page' as keyof TFilter, page as TFilter[keyof TFilter]);
  }, [setFilter]);

  const goToNextPage = useCallback(() => {
    const currentPage = (filters.page as number) || 1;
    goToPage(currentPage + 1);
  }, [filters.page, goToPage]);

  const goToPreviousPage = useCallback(() => {
    const currentPage = (filters.page as number) || 1;
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [filters.page, goToPage]);

  const setNextCursor = useCallback((cursor: string) => {
    setFilter('cursor' as keyof TFilter, cursor as TFilter[keyof TFilter]);
  }, [setFilter]);

  return {
    // Data
    data: data?.data || [],
    meta: data?.meta,
    pagination: data?.pagination,
    
    // State
    isLoading,
    isFetching,
    error,
    
    // Filters
    filters,
    setFilter,
    setFilters,
    resetFilters,
    
    // Pagination helpers
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setNextCursor,
    
    // Refetch
    refetch
  };
}
