'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/services/productService';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ProductForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Save Product',
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    price: initialData.price !== undefined ? String(initialData.price) : '',
    stock: initialData.stock !== undefined ? String(initialData.stock) : '',
    rating: initialData.rating !== undefined ? String(initialData.rating) : '4.5',
    brand: initialData.brand || '',
    sku: initialData.sku || '',
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch categories for the dropdown
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const catList = await getCategories();
        if (isMounted) {
          setCategories(catList);
        }
      } catch {
        // Fallback to basic categories if categories endpoint fails
        if (isMounted) {
          setCategories([
            { slug: 'beauty', name: 'Beauty' },
            { slug: 'fragrances', name: 'Fragrances' },
            { slug: 'furniture', name: 'Furniture' },
            { slug: 'groceries', name: 'Groceries' },
          ]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Field change handler that clears specific errors on input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Client-side validation logic
  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required and cannot be only whitespace';
    }

    // Description validation
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Description is required and cannot be only whitespace';
    }

    // Category validation
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'Please select a valid category';
    }

    // Price validation
    const numPrice = Number(formData.price);
    if (formData.price === '' || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price is required and must be greater than 0';
    }

    // Stock validation
    const numStock = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(numStock) ||
      !Number.isInteger(numStock) ||
      numStock < 0
    ) {
      newErrors.stock = 'Stock is required and must be a non-negative whole integer';
    }

    // Rating validation (0 - 5)
    if (formData.rating !== '' && formData.rating !== undefined) {
      const numRating = Number(formData.rating);
      if (isNaN(numRating) || numRating < 0 || numRating > 5) {
        newErrors.rating = 'Rating must be a number between 0 and 5';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler with duplicate submit prevention
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formattedPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        brand: formData.brand.trim() || undefined,
        sku: formData.sku.trim() || undefined,
      };

      await onSubmit(formattedPayload);
    } catch (err) {
      setSubmitError(
        err.friendlyMessage ||
          err.response?.data?.message ||
          err.message ||
          'Failed to save product. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Global Submit Error Banner */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{submitError}</div>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-4">
          {isEdit ? 'Edit Product Details' : 'Product Information'}
        </h2>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            disabled={isSubmitting}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Wireless Ergonomic Mouse"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.title
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            disabled={isSubmitting}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a comprehensive description of the product features, specifications, and materials..."
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.description
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.description}
            </p>
          )}
        </div>

        {/* Category & Brand Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                disabled={isSubmitting || loadingCategories}
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer ${
                  errors.category
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                }`}
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="brand"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Brand
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              disabled={isSubmitting}
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Logitech"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none transition focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Price, Stock, Rating, SKU Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Price ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              disabled={isSubmitting}
              value={formData.price}
              onChange={handleChange}
              placeholder="29.99"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.price
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.price && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.price}</p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Stock Qty <span className="text-rose-500">*</span>
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              disabled={isSubmitting}
              value={formData.stock}
              onChange={handleChange}
              placeholder="50"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.stock
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.stock && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.stock}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label
              htmlFor="rating"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              Rating (0 – 5)
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              disabled={isSubmitting}
              value={formData.rating}
              onChange={handleChange}
              placeholder="4.5"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.rating
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.rating && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.rating}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label
              htmlFor="sku"
              className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
            >
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              disabled={isSubmitting}
              value={formData.sku}
              onChange={handleChange}
              placeholder="PRD-001"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none transition focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{submitButtonText}</span>
          )}
        </button>
      </div>
    </form>
  );
}
