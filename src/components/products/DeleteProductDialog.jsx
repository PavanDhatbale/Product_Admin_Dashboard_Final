'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteProductDialog({
  isOpen,
  onClose,
  onConfirm,
  productTitle = 'this product',
  isDeleting = false,
}) {
  const cancelButtonRef = useRef(null);

  // Keyboard accessibility: Escape key closes the dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto-focus cancel button on open for safe keyboard navigation
    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    >
      {/* Click outside to cancel (disabled during active deletion) */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 overflow-hidden animate-scaleUp">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle size={22} />
          </div>

          <div className="flex-1">
            <h3
              id="delete-dialog-title"
              className="text-base font-semibold text-slate-900"
            >
              Delete Product
            </h3>
            <p
              id="delete-dialog-desc"
              className="mt-2 text-sm text-slate-600 leading-relaxed"
            >
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                &ldquo;{productTitle}&rdquo;
              </span>
              ? This action will remove the product from your active session and cannot be undone.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
