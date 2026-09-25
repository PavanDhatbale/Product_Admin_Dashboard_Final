'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { formatCurrency, getStockStatus } from '@/utils/formatters';

/**
 * Desktop Product Table component using semantic HTML table structure.
 * Displayed on screens md (768px) and above.
 */
export default function ProductTable({ products = [], onDelete }) {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const fromParam = currentQuery
    ? `?from=${encodeURIComponent('/products?' + currentQuery)}`
    : '';

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-6 py-3.5">
                Product
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5">
                Price
              </th>
              <th scope="col" className="px-6 py-3.5">
                Rating
              </th>
              <th scope="col" className="px-6 py-3.5">
                Stock
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const detailUrl = `/products/${product.id}${fromParam}`;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Product thumbnail + title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={detailUrl}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-xs sm:max-w-sm md:max-w-xs lg:max-w-sm block"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-slate-400 capitalize">
                          ID: #{product.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="capitalize text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(product.price)}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-semibold">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{Number(product.rating).toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <Link
                        href={detailUrl}
                        aria-label={`View details for ${product.title}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
                      >
                        <span>View</span>
                        <ChevronRight size={13} />
                      </Link>

                      <Link
                        href={`/products/${product.id}/edit${fromParam}`}
                        aria-label={`Edit ${product.title}`}
                        title="Edit product"
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <Edit3 size={14} />
                      </Link>

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          aria-label={`Delete ${product.title}`}
                          title="Delete product"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
