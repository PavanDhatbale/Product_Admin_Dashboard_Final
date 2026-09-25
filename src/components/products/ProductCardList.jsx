'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatCurrency, getStockStatus } from '@/utils/formatters';

/**
 * Mobile Product Card List component.
 * Displays stacked cards with clear visual hierarchy for smaller screens (< 768px).
 */
export default function ProductCardList({ products = [], onDelete }) {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const fromParam = currentQuery
    ? `?from=${encodeURIComponent('/products?' + currentQuery)}`
    : '';

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        const detailUrl = `/products/${product.id}${fromParam}`;

        return (
          <div
            key={product.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex gap-3.5 items-start">
              {/* Product Thumbnail */}
              <Link
                href={detailUrl}
                className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer"
              >
                {product.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No img</span>
                )}
              </Link>

              {/* Title & Category */}
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[11px] font-medium capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded mb-1">
                  {product.category}
                </span>
                <Link
                  href={detailUrl}
                  className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors block"
                  title={product.title}
                >
                  {product.title}
                </Link>
                <p className="text-[11px] text-slate-400 mt-0.5">ID: #{product.id}</p>
              </div>
            </div>

            {/* Bottom Details Row: Price, Rating, Stock & Details Link */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating).toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Badge variant={stockStatus.variant}>
                  {stockStatus.label}
                </Badge>

                <Link
                  href={`/products/${product.id}/edit${fromParam}`}
                  aria-label={`Edit ${product.title}`}
                  title="Edit product"
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                >
                  <Edit3 size={15} />
                </Link>

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.title}`}
                    title="Delete product"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <Link
                  href={detailUrl}
                  aria-label={`View details for ${product.title}`}
                  className="inline-flex items-center text-slate-700 hover:text-indigo-600 p-1 font-semibold"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
