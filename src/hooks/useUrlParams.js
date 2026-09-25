'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { PAGINATION, VALID_SORT_FIELDS, VALID_SORT_ORDERS } from '@/utils/constants';

/**
 * Custom hook to read, sanitize, and update URL search parameters.
 * Guarantees that URL is the single source of truth for pagination, search, category, and sorting.
 */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Sanitizes 'page':
   * Must be a positive integer >= 1.
   * Invalid values (abc, -5, 0, empty) fallback to 1.
   */
  const page = useMemo(() => {
    const rawPage = searchParams.get('page');
    if (!rawPage) return PAGINATION.DEFAULT_PAGE;
    const parsed = parseInt(rawPage, 10);
    return isNaN(parsed) || parsed < 1 ? PAGINATION.DEFAULT_PAGE : parsed;
  }, [searchParams]);

  /**
   * Sanitizes 'limit':
   * Must be one of the supported values: 10, 20, 50.
   * Invalid values (abc, 15, -10, 0, empty) fallback to 10.
   */
  const limit = useMemo(() => {
    const rawLimit = searchParams.get('limit');
    if (!rawLimit) return PAGINATION.DEFAULT_LIMIT;
    const parsed = parseInt(rawLimit, 10);
    return PAGINATION.LIMIT_OPTIONS.includes(parsed)
      ? parsed
      : PAGINATION.DEFAULT_LIMIT;
  }, [searchParams]);

  /**
   * Sanitizes 'search':
   * Returns trimmed string, or empty string if not present.
   */
  const search = useMemo(() => {
    const rawSearch = searchParams.get('search');
    return rawSearch ? rawSearch.trim() : '';
  }, [searchParams]);

  /**
   * Sanitizes 'category':
   * Returns trimmed string, or empty string if not present.
   */
  const category = useMemo(() => {
    const rawCategory = searchParams.get('category');
    return rawCategory ? rawCategory.trim() : '';
  }, [searchParams]);

  /**
   * Sanitizes 'sortBy':
   * Must be in VALID_SORT_FIELDS ('price', 'rating', 'title').
   * Invalid values fallback to empty string (default sorting).
   */
  const sortBy = useMemo(() => {
    const rawSortBy = (searchParams.get('sortBy') || '').trim().toLowerCase();
    return VALID_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : '';
  }, [searchParams]);

  /**
   * Sanitizes 'order':
   * Must be in VALID_SORT_ORDERS ('asc', 'desc').
   * Fallback is 'asc'. Only relevant if sortBy is present.
   */
  const order = useMemo(() => {
    const rawOrder = (searchParams.get('order') || '').trim().toLowerCase();
    return VALID_SORT_ORDERS.includes(rawOrder) ? rawOrder : 'asc';
  }, [searchParams]);

  /**
   * Composite sort value matching SORT_OPTIONS values (e.g. 'price-asc', 'rating-desc', or '').
   */
  const sortValue = useMemo(() => {
    return sortBy ? `${sortBy}-${order}` : '';
  }, [sortBy, order]);

  /**
   * Updates query parameters while strictly preserving all other existing parameters.
   * Uses router.replace with scroll: false to avoid jumping to top of page.
   * Passing empty string, null, or undefined deletes the key.
   * @param {Object} newParams - Key/value pairs to update or remove
   */
  const setParams = useCallback(
    (newParams) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(targetUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return {
    page,
    limit,
    search,
    category,
    sortBy,
    order,
    sortValue,
    searchParams,
    setParams,
  };
}
