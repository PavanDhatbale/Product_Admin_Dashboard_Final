'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PackageX, ArrowLeft } from 'lucide-react';
import { getProductById, deleteProduct as deleteProductApi } from '@/services/productService';
import { isRequestCanceled } from '@/services/api';
import ProductDetails from '@/components/products/ProductDetails';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/common/Button';
import { useProduct } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id;
  const fromUrl = searchParams?.get('from');

  const { isDeleted, getLocalProduct, applyOverlay, deleteProduct: removeProductFromSession } =
    useProduct();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Deletion modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const abortControllerRef = useRef(null);

  // Back navigation preserving originating product list state
  const handleBack = useCallback(() => {
    if (fromUrl) {
      router.push(fromUrl);
    } else {
      router.push('/products');
    }
  }, [fromUrl, router]);

  const loadProduct = useCallback(async () => {
    // Validate ID before issuing network request
    const numericId = parseInt(id, 10);
    if (!id || isNaN(numericId) || numericId <= 0) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    // 1. Check if product was deleted in active session
    if (isDeleted(numericId)) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    // 2. Check if product exists in local session state (e.g. locally added)
    const localProduct = getLocalProduct(numericId);
    if (localProduct) {
      setProduct(localProduct);
      setIsNotFound(false);
      setIsLoading(false);
      return;
    }

    // 3. Issue network request to fetch remote product
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    try {
      const data = await getProductById(numericId, { signal: controller.signal });
      const mergedProduct = applyOverlay(data);

      if (!mergedProduct) {
        setIsNotFound(true);
      } else {
        setProduct(mergedProduct);
      }
    } catch (err) {
      if (isRequestCanceled(err) || err.name === 'CanceledError') {
        return;
      }

      // Check if product was not found (404)
      if (err.statusCode === 404 || err.response?.status === 404) {
        setIsNotFound(true);
      } else {
        setErrorMessage(
          err.friendlyMessage ||
            err.response?.data?.message ||
            'Failed to load product details. Please check your network connection.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, isDeleted, getLocalProduct, applyOverlay]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProduct();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProduct]);

  // Navigate to Edit page
  const handleEdit = () => {
    const editUrl = fromUrl
      ? `/products/${id}/edit?from=${encodeURIComponent(fromUrl)}`
      : `/products/${id}/edit`;
    router.push(editUrl);
  };

  // Open delete dialog
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Confirm product deletion
  const handleConfirmDelete = async () => {
    const numericId = parseInt(id, 10);
    setIsDeleting(true);

    try {
      // 1. Call API DELETE /products/{id}
      await deleteProductApi(numericId);

      // 2. Add to session deleted overlay with metadata
      removeProductFromSession(numericId, product);

      // 3. Show success notification
      toast.success(`Product "${product?.title || id}" was deleted successfully.`);

      setIsDeleteDialogOpen(false);

      // 4. Navigate back to products list
      if (fromUrl) {
        router.push(fromUrl);
      } else {
        router.push('/products');
      }
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

  // Loading State
  if (isLoading) {
    return <LoadingState />;
  }

  // Not Found State
  if (isNotFound) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-10 sm:p-16 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <PackageX size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Product Not Found
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            The product you requested with ID &ldquo;{id}&rdquo; does not exist or has been removed.
          </p>
        </div>
        <div>
          <Button onClick={handleBack} variant="primary" icon={ArrowLeft}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={loadProduct} />;
  }

  // Success State
  return (
    <>
      <ProductDetails
        product={product}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        productTitle={product?.title || `Product #${id}`}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductDetailContent />
    </Suspense>
  );
}
