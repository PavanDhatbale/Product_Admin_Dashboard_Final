'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit3, Loader2, AlertCircle } from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';
import { getProductById, updateProduct } from '@/services/productService';
import { useProduct } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;

  const { isDeleted, getLocalProduct, applyOverlay, editProduct } = useProduct();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const returnUrl = searchParams.get('from') || `/products/${id}`;

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!id) return;

      // 1. Check if product was deleted in active session
      if (isDeleted(id)) {
        if (isMounted) {
          setError('This product has been deleted in your current session.');
          setLoading(false);
        }
        return;
      }

      // 2. Check if product exists in local session state (e.g. locally added)
      const localItem = getLocalProduct(id);
      if (localItem) {
        if (isMounted) {
          setProduct(localItem);
          setLoading(false);
        }
        return;
      }

      // 3. Fetch from remote API if not local
      try {
        const remoteData = await getProductById(id);
        if (isMounted) {
          const merged = applyOverlay(remoteData);
          if (!merged) {
            setError('This product has been deleted in your current session.');
          } else {
            setProduct(merged);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.friendlyMessage ||
              err.response?.data?.message ||
              'Failed to load product details for editing.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id, isDeleted, getLocalProduct, applyOverlay]);

  const handleSubmit = async (formData) => {
    // 1. Call API PUT /products/{id}
    await updateProduct(id, formData);

    // 2. Update session overlay
    editProduct(id, formData);

    // 3. Show success toast notification
    toast.success(`Product "${formData.title}" updated successfully!`);

    // 4. Navigate back to product details or return path
    router.push(returnUrl);
  };

  const handleCancel = () => {
    router.push(returnUrl);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
        <p className="text-xs font-medium text-slate-500">Loading product for editing...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Unable to Edit Product</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {error || 'Product could not be found or has been removed.'}
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Return to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition mb-3 group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Edit3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit Product
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Modify product details. Updates are preserved across your active session.
            </p>
          </div>
        </div>
      </div>

      {/* Reusable Form prefilled with existing product data */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitButtonText="Update Product"
        isEdit={true}
      />
    </div>
  );
}
