'use client';

import { RotateCcw } from 'lucide-react';
import { SORT_OPTIONS } from '@/utils/constants';

/**
 * ProductFilters component.
 * Provides Category and Sorting dropdowns, along with a Clear Filters action.
 */
export default function ProductFilters({
  categories = [],
  categoriesLoading = false,
  selectedCategory = '',
  onCategoryChange,
  selectedSort = '',
  onSortChange,
  onClearFilters,
  hasActiveFilters = false,
}) {
  const handleSortSelect = (e) => {
    const val = e.target.value;
    const option = SORT_OPTIONS.find((opt) => opt.value === val) || SORT_OPTIONS[0];
    onSortChange(option);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Dropdown */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="category-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={categoriesLoading}
          aria-label="Filter products by category"
          className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-2xs cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 capitalize"
        >
          <option value="">All Categories</option>
          {categoriesLoading ? (
            <option disabled value="">Loading categories...</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="sort-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={selectedSort}
          onChange={handleSortSelect}
          aria-label="Sort products"
          className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-2xs cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button (active when category or sort is applied) */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          aria-label="Clear active filters and sorting"
          className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCcw size={13} />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
}
