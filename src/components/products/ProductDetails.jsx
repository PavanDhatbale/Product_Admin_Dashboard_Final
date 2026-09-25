'use client';

import { ArrowLeft, Star, Tag, ShieldCheck, Truck, RotateCcw, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/common/Badge';
import ProductImageGallery from './ProductImageGallery';
import ProductReviews from './ProductReviews';
import { formatCurrency, getStockStatus } from '@/utils/formatters';

/**
 * ProductDetails component.
 * Displays the complete product layout including gallery, metadata, specs, reviews, and CRUD actions.
 */
export default function ProductDetails({ product, onBack, onEdit, onDelete }) {
  if (!product) return null;

  const stockStatus = getStockStatus(product.stock);

  // Derive original price if discount percentage exists
  const hasDiscount = Boolean(product.discountPercentage && product.discountPercentage > 0);
  const originalPrice = hasDiscount
    ? product.price / (1 - product.discountPercentage / 100)
    : null;

  // Compile all images: prefer `images` array, fallback to `thumbnail`
  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : [];

  return (
    <div className="space-y-8">
      {/* Top Navigation Bar: Back Button, Breadcrumbs, and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex text-xs text-slate-400 items-center gap-1.5 mr-2">
            <span>Products</span>
            <span>/</span>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
            <span className="text-slate-600 font-medium">#{product.id}</span>
          </div>

          {/* Action Buttons: Edit and Delete */}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer shadow-2xs"
            >
              <Edit3 size={14} />
              <span>Edit Product</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Product Showcase: Two-column grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5">
          <ProductImageGallery
            images={galleryImages}
            title={product.title}
          />
        </div>

        {/* Right Column: Product Information & Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="capitalize text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/60">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                  Brand: <strong className="text-slate-900">{product.brand}</strong>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating & Stock row */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{Number(product.rating || 0).toFixed(1)}</span>
                <span className="text-amber-600 font-normal">/ 5.0</span>
              </div>

              <Badge variant={stockStatus.variant}>
                {stockStatus.label}
              </Badge>

              {product.sku && (
                <span className="text-xs text-slate-400">
                  SKU: <code className="text-slate-600 font-mono">{product.sku}</code>
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm line-through text-slate-400">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    -{Math.round(product.discountPercentage)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Tax included &bull; Availability: {product.availabilityStatus || 'Available to order'}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description || 'No description provided for this product.'}
            </p>
          </div>

          {/* Metadata Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {product.warrantyInformation && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Warranty</h4>
                  <p className="text-xs text-slate-500">{product.warrantyInformation}</p>
                </div>
              </div>
            )}

            {product.shippingInformation && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
                <Truck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Shipping</h4>
                  <p className="text-xs text-slate-500">{product.shippingInformation}</p>
                </div>
              </div>
            )}

            {product.returnPolicy && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
                <RotateCcw size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Return Policy</h4>
                  <p className="text-xs text-slate-500">{product.returnPolicy}</p>
                </div>
              </div>
            )}

            {product.minimumOrderQuantity && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-white">
                <Tag size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Min. Order Qty</h4>
                  <p className="text-xs text-slate-500">{product.minimumOrderQuantity} units</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-500 mr-2">Tags:</span>
              <div className="inline-flex flex-wrap gap-1.5 align-middle">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-6 border-t border-slate-200">
        <ProductReviews reviews={product.reviews || []} />
      </div>
    </div>
  );
}
