'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, PlusCircle } from 'lucide-react';
import ProductForm from '@/components/products/ProductForm';
import { createProduct } from '@/services/productService';
import { useProduct } from '@/context/ProductContext';
import { useToast } from '@/context/ToastContext';

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProduct } = useProduct();
  const toast = useToast();

  const returnUrl = searchParams.get('from') || '/products';

  const handleSubmit = async (formData) => {
    // 1. Call API POST /products/add
    const apiResult = await createProduct(formData);

    // 2. Add to session CRUD overlay with unique ID
    const newProduct = addProduct(apiResult);

    // 3. Show success toast notification
    toast.success(`Product "${newProduct.title}" created successfully!`);

    // 4. Navigate back to products list
    router.push(returnUrl);
  };

  const handleCancel = () => {
    router.push(returnUrl);
  };

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
          <span>Back to Products</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <PlusCircle size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new product in the catalog. Mocked additions are preserved in your current session.
            </p>
          </div>
        </div>
      </div>

      {/* Reusable Form */}
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitButtonText="Create Product"
        isEdit={false}
      />
    </div>
  );
}
