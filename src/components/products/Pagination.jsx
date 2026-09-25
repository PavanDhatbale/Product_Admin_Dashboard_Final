'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGINATION } from '@/utils/constants';

/**
 * Custom windowing algorithm to generate clean, legible page buttons.
 * Example for 20 pages:
 * Page 1: [1, 2, 3, 4, 5, '...', 20]
 * Page 10: [1, '...', 9, 10, 11, '...', 20]
 * Page 20: [1, '...', 16, 17, 18, 19, 20]
 */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}

/**
 * Handcrafted accessible Pagination component.
 * Uses semantic buttons, proper ARIA attributes, and responsive layout.
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
}) {
  // Compute display range: "Showing X–Y of Z"
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalPages === 0;

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 sm:px-0 text-sm text-slate-700"
    >
      {/* Left side: Showing Range & Rows per Page */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center sm:justify-start w-full sm:w-auto">
        <p className="text-xs sm:text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{start}</span>–
          <span className="font-semibold text-slate-900">{end}</span> of{' '}
          <span className="font-semibold text-slate-900">{total}</span>
        </p>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="rows-per-page" className="text-xs text-slate-500 whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="rows-per-page"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            aria-label="Select number of rows per page"
            className="text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {PAGINATION.LIMIT_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Page navigation buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirstPage}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Windowed Page Number Buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 sm:px-2 py-1 text-xs text-slate-400 select-none"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                );
              }

              const isCurrent = num === page;

              return (
                <button
                  key={`page-${num}`}
                  type="button"
                  onClick={() => onPageChange(num)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Go to page ${num}`}
                  className={`min-w-8 h-8 px-2 text-xs sm:text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage}
            aria-label="Go to next page"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
