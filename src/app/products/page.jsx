'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { Plus, Info } from 'lucide-react';
import { getProducts, getCategories, deleteProduct as deleteProductApi } from '@/services/productService';
import { isRequestCanceled } from '@/services/api';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useProduct } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';
import ProductTable from '@/components/products/ProductTable';
import ProductCardList from '@/components/products/ProductCardList';
import ProductSearch from '@/components/products/ProductSearch';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/products/Pagination';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

function ProductsContent() {
  const {
    page,
    limit,
    search,
    category,
    sortBy,
    order,
    sortValue,
    setParams,
  } = useUrlParams();

  const { mergeCatalog, deleteProduct: removeProductFromSession } = useProduct();
  const toast = useToast();

  // Raw remote data returned by DummyJSON
  const [remoteData, setRemoteData] = useState({ products: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Dynamic categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Product deletion modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stale request protection refs
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Fetch category list on mount
  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => {
        console.warn('Failed to load categories:', err);
      })
      .finally(() => {
        if (isMounted) setCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Fetches products using URL pagination, search, category, and sorting parameters.
   * Cancels any active in-flight request and guards against out-of-order stale responses.
   */
  const fetchProductCatalog = useCallback(async () => {
    // Layer 1: Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Layer 2: Generate request identity to reject out-of-order stale responses
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getProducts({
        page,
        limit,
        search,
        category,
        sortBy,
        order,
        signal: controller.signal,
      });

      // Reject response if a newer request was dispatched while this was running
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const total = data.total || 0;
      const calculatedPages = Math.max(1, Math.ceil(total / limit));

      // Handle out-of-range page (e.g. ?page=999): Clamp to last valid page
      if (page > calculatedPages && total > 0) {
        setParams({ page: calculatedPages });
        return;
      }

      setRemoteData({
        products: data.products || [],
        total,
      });
    } catch (err) {
      // Ignore canceled requests without error toast or UI disruption
      if (isRequestCanceled(err) || err.name === 'CanceledError') {
        return;
      }

      // Only update error state if this is still the active request
      if (currentRequestId === requestIdRef.current) {
        setErrorMessage(
          err.friendlyMessage ||
            err.response?.data?.message ||
            'Failed to load products. Please check your network connection.'
        );
      }
    } finally {
      // Only reset loading if this is the active request
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, search, category, sortBy, order, setParams]);

  // Clean up any pending request on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch products whenever URL parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductCatalog();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchProductCatalog]);

  // Merge remote products with client-side session CRUD overlay
  const { products, totalCount } = useMemo(() => {
    const merged = mergeCatalog(remoteData.products, remoteData.total, {
      page,
      limit,
      search,
      category,
      sortBy,
      order,
    });
    return {
      products: merged.products || [],
      totalCount: Number.isFinite(merged.total)
        ? merged.total
        : Number.isFinite(merged.totalCount)
        ? merged.totalCount
        : 0,
    };
  }, [mergeCatalog, remoteData, page, limit, search, category, sortBy, order]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit)) || 1;

  // Handle out-of-range page after deletion (only when data has finished loading)
  useEffect(() => {
    if (!isLoading && page > totalPages && totalCount > 0) {
      setParams({ page: totalPages });
    }
  }, [isLoading, page, totalPages, totalCount, setParams]);

  // Search handler: resets page to 1
  const handleSearchChange = useCallback(
    (newSearch) => {
      setParams({
        page: 1,
        search: newSearch || null,
      });
    },
    [setParams]
  );

  // Category handler: resets page to 1
  const handleCategoryChange = useCallback(
    (newCategory) => {
      setParams({
        page: 1,
        category: newCategory || null,
      });
    },
    [setParams]
  );

  // Sort handler: resets page to 1
  const handleSortChange = useCallback(
    (option) => {
      setParams({
        page: 1,
        sortBy: option.sortBy || null,
        order: option.order || null,
      });
    },
    [setParams]
  );

  // Clear filters handler: resets category, sort, page=1, preserves search and limit
  const handleClearFilters = useCallback(() => {
    setParams({
      page: 1,
      category: null,
      sortBy: null,
      order: null,
    });
  }, [setParams]);

  // Pagination event handlers
  const handlePageChange = (newPage) => {
    setParams({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setParams({ page: 1, limit: newLimit });
  };

  // Open delete dialog from table or card list
  const handleDeleteRequest = (product) => {
    setProductToDelete(product);
  };

  // Confirm product deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Call API DELETE /products/{id}
      await deleteProductApi(productToDelete.id);

      // 2. Remove from session overlay with metadata
      removeProductFromSession(productToDelete.id, productToDelete);

      // 3. Show toast notification
      toast.success(`Product "${productToDelete.title}" has been deleted.`);
      setProductToDelete(null);
    } catch (err) {
      toast.error(
        err.friendlyMessage ||
          err.response?.data?.message ||
          'Failed to delete product. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(category || sortBy);

  // Contextual empty state message
  const emptyStateDescription = search
    ? `No products match "${search}". Try searching with different keywords.`
    : category
    ? `No products found in the "${category}" category.`
    : 'There are currently no products available in the catalog.';

  // Build originating URL query for preserve navigation
  const currentQueryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(order ? { order } : {}),
  }).toString();

  const addProductUrl = `/products/new?from=${encodeURIComponent(`/products?${currentQueryString}`)}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Products
            </h1>
            {!isLoading && !errorMessage && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {totalCount} Total
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product catalog, inventory, pricing, and availability.
          </p>
        </div>

        {/* Primary Action Button: Add Product */}
        <div>
          <Link
            href={addProductUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Toolbar / Search + Filters Container */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <ProductSearch
            search={search}
            onSearchChange={handleSearchChange}
          />
          <ProductFilters
            categories={categories}
            categoriesLoading={categoriesLoading}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            selectedSort={sortValue}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* DummyJSON limitation notice when both search and category are active */}
        {search && category && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <Info size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span className="font-semibold">DummyJSON API Scope Notice:</span> DummyJSON does not support simultaneous search and category filtering on the server. Showing global search results for &ldquo;{search}&rdquo;. The &ldquo;{category}&rdquo; category filter will automatically apply when search is cleared.
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area based on State */}
      {isLoading ? (
        <LoadingState />
      ) : errorMessage ? (
        <ErrorState
          message={errorMessage}
          onRetry={fetchProductCatalog}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={emptyStateDescription}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block">
            <ProductTable products={products} onDelete={handleDeleteRequest} />
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden">
            <ProductCardList products={products} onDelete={handleDeleteRequest} />
          </div>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            total={totalCount}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        productTitle={productToDelete?.title || 'this product'}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsContent />
    </Suspense>
  );
}
