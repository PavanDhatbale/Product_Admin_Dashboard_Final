'use client';

import { useState } from 'react';

/**
 * ProductImageGallery component.
 * Displays the active main product image and interactive thumbnail switcher.
 */
export default function ProductImageGallery({ images = [], title = 'Product image' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images provided
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
        No image available
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="w-full aspect-square rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={`${title} - view ${selectedIndex + 1}`}
          className="w-full h-full object-contain p-4 transition-all duration-200"
          loading="eager"
        />
      </div>

      {/* Thumbnails Row (only rendered if more than 1 image exists) */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;

            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Switch to product image ${idx + 1}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border overflow-hidden transition-all cursor-pointer p-1 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
