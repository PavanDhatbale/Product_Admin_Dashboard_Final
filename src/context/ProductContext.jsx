'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEYS = {
  ADDED: 'admin_session_added_products',
  UPDATED: 'admin_session_updated_products',
  DELETED_IDS: 'admin_session_deleted_ids',
  DELETED_ITEMS: 'admin_session_deleted_items',
};

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [addedProducts, setAddedProducts] = useState([]);
  const [updatedProducts, setUpdatedProducts] = useState({});
  const [deletedIds, setDeletedIds] = useState([]);
  const [deletedItems, setDeletedItems] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session state on client mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedAdded = sessionStorage.getItem(STORAGE_KEYS.ADDED);
        const storedUpdated = sessionStorage.getItem(STORAGE_KEYS.UPDATED);
        const storedDeletedIds = sessionStorage.getItem(STORAGE_KEYS.DELETED_IDS);
        const storedDeletedItems = sessionStorage.getItem(STORAGE_KEYS.DELETED_ITEMS);

        if (storedAdded) setAddedProducts(JSON.parse(storedAdded));
        if (storedUpdated) setUpdatedProducts(JSON.parse(storedUpdated));

        let items = {};
        if (storedDeletedItems) {
          try {
            items = JSON.parse(storedDeletedItems) || {};
          } catch {}
        }

        let ids = [];
        if (storedDeletedIds) {
          try {
            ids = JSON.parse(storedDeletedIds) || [];
          } catch {}
        } else if (Object.keys(items).length > 0) {
          ids = Object.keys(items).map(Number);
        }

        setDeletedIds(ids.map(Number));
        setDeletedItems(items);
      } catch {
        // Gracefully fall back to defaults if storage is unavailable or corrupt
      } finally {
        setIsHydrated(true);
      }
    });
  }, []);

  // Sync addedProducts to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.ADDED, JSON.stringify(addedProducts));
    } catch {}
  }, [addedProducts, isHydrated]);

  // Sync updatedProducts to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.UPDATED, JSON.stringify(updatedProducts));
    } catch {}
  }, [updatedProducts, isHydrated]);

  // Sync deletedIds & deletedItems to sessionStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deletedIds));
      sessionStorage.setItem(STORAGE_KEYS.DELETED_ITEMS, JSON.stringify(deletedItems));
    } catch {}
  }, [deletedIds, deletedItems, isHydrated]);

  // Check if a product ID was deleted in the current session
  const isDeleted = useCallback(
    (id) => {
      const numId = Number(id);
      return deletedIds.includes(numId);
    },
    [deletedIds]
  );

  // Add a newly created product to the session overlay
  const addProduct = useCallback(
    (productData) => {
      // Stable sequential ID assignment starting at 1001 to avoid collisions with DummyJSON's 1-194
      const maxExisting = addedProducts.reduce(
        (max, p) => Math.max(max, Number(p.id) || 0),
        1000
      );
      const assignedId = maxExisting + 1;

      const fallbackImage = `https://dummyjson.com/image/400x400/2563eb/ffffff?text=${encodeURIComponent(
        productData.title || 'Product'
      )}`;

      const newProduct = {
        ...productData,
        id: assignedId,
        isLocalSession: true,
        createdAt: new Date().toISOString(),
        images:
          Array.isArray(productData.images) && productData.images.length > 0
            ? productData.images
            : [fallbackImage],
        thumbnail: productData.thumbnail || fallbackImage,
        rating: Number(productData.rating) || 0,
        stock: Number(productData.stock) || 0,
        price: Number(productData.price) || 0,
      };

      setAddedProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    },
    [addedProducts]
  );

  // Update a product's fields in the session overlay
  const editProduct = useCallback((id, updatedFields) => {
    const numId = Number(id);

    // If it's a locally added product, update it inside addedProducts
    setAddedProducts((prev) =>
      prev.map((p) => (p.id === numId ? { ...p, ...updatedFields } : p))
    );

    // Also track in updatedProducts dictionary for remote/local consistency
    setUpdatedProducts((prev) => ({
      ...prev,
      [numId]: { ...(prev[numId] || {}), ...updatedFields },
    }));
  }, []);

  // Mark a product as deleted in the session overlay
  const deleteProduct = useCallback(
    (id, productMeta = {}) => {
      const numId = Number(id);

      // Extract metadata if available
      const existingLocal = addedProducts.find((p) => p.id === numId);
      const existingUpdated = updatedProducts[numId] || {};
      const meta = {
        id: numId,
        category: productMeta.category || existingLocal?.category || existingUpdated.category || '',
        title: productMeta.title || existingLocal?.title || existingUpdated.title || '',
        description:
          productMeta.description || existingLocal?.description || existingUpdated.description || '',
      };

      setDeletedItems((prev) => ({ ...prev, [numId]: meta }));
      setDeletedIds((prev) => (prev.includes(numId) ? prev : [...prev, numId]));

      // Clean up from local added list if present
      setAddedProducts((prev) => prev.filter((p) => p.id !== numId));

      // Clean up from updated dictionary if present
      setUpdatedProducts((prev) => {
        const copy = { ...prev };
        delete copy[numId];
        return copy;
      });
    },
    [addedProducts, updatedProducts]
  );

  // Retrieve a product from local session state if available
  const getLocalProduct = useCallback(
    (id) => {
      const numId = Number(id);
      if (deletedIds.includes(numId)) return null;

      const localItem = addedProducts.find((p) => p.id === numId);
      if (localItem) {
        const updates = updatedProducts[numId] || {};
        return { ...localItem, ...updates };
      }

      return null;
    },
    [addedProducts, updatedProducts, deletedIds]
  );

  // Apply session overlay to a remote product
  const applyOverlay = useCallback(
    (product) => {
      if (!product) return null;
      const numId = Number(product.id);

      if (deletedIds.includes(numId)) return null;

      const localOverrides = updatedProducts[numId];
      if (localOverrides) {
        return { ...product, ...localOverrides };
      }

      return product;
    },
    [deletedIds, updatedProducts]
  );

  // Merging function for Catalog List combining remote products with session overlay
  const mergeCatalog = useCallback(
    (
      remoteProducts = [],
      remoteTotal = 0,
      { page = 1, limit = 10, search = '', category = '', sortBy = '', order = 'asc' } = {}
    ) => {
      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
      const safeRemoteTotal = Math.max(0, parseInt(remoteTotal, 10) || 0);

      // 1. Filter remote products against deleted list and apply local updates
      const updatedRemote = remoteProducts
        .filter((p) => !deletedIds.includes(Number(p.id)))
        .map((p) => {
          const updates = updatedProducts[Number(p.id)];
          return updates ? { ...p, ...updates } : p;
        });

      // 2. Find matching addedProducts for current search & category filters
      const matchingAdded = addedProducts.filter((p) => {
        if (deletedIds.includes(Number(p.id))) return false;

        // Category filter matching
        if (category && p.category?.toLowerCase() !== category.toLowerCase()) {
          return false;
        }

        // Search query matching (title, description, brand)
        if (search) {
          const q = search.toLowerCase();
          const titleMatch = p.title?.toLowerCase().includes(q);
          const descMatch = p.description?.toLowerCase().includes(q);
          const brandMatch = p.brand?.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !brandMatch) return false;
        }

        return true;
      });

      // 3. Combine matching items
      // On page 1, newly added items appear at the beginning of the list
      let combined = [];
      if (safePage === 1) {
        combined = [...matchingAdded, ...updatedRemote];
      } else {
        combined = [...updatedRemote];
      }

      // 4. Apply client-side sorting if active
      if (sortBy) {
        combined.sort((a, b) => {
          let valA = a[sortBy];
          let valB = b[sortBy];

          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = (valB || '').toLowerCase();
            return order === 'desc'
              ? valB.localeCompare(valA)
              : valA.localeCompare(valB);
          }

          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
          return order === 'desc' ? valB - valA : valA - valB;
        });
      }

      // 5. Slice to limit for the page
      const visibleProducts = combined.slice(0, safeLimit);

      // 6. Calculate effective total with query-aware deletion subtraction
      let relevantDeletedCount = 0;

      if (category) {
        // For category filter: count deletions belonging to this category
        const targetCat = category.toLowerCase();
        const itemsInCat = Object.values(deletedItems).filter(
          (item) => item.category && item.category.toLowerCase() === targetCat
        ).length;
        // Also check if any remote products in the current response were filtered out by deletedIds
        const remoteFilteredOnThisPage = remoteProducts.filter(
          (p) => deletedIds.includes(Number(p.id))
        ).length;
        relevantDeletedCount = Math.max(itemsInCat, remoteFilteredOnThisPage);
      } else if (search) {
        // For search query: count deletions matching search keywords
        const q = search.toLowerCase();
        const itemsInSearch = Object.values(deletedItems).filter(
          (item) =>
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ).length;
        const remoteFilteredOnThisPage = remoteProducts.filter(
          (p) => deletedIds.includes(Number(p.id))
        ).length;
        relevantDeletedCount = Math.max(itemsInSearch, remoteFilteredOnThisPage);
      } else {
        // For full catalog (no category, no search): count all deleted remote products (id <= 194)
        relevantDeletedCount = deletedIds.filter((id) => id <= 194).length;
      }

      // Base total from remote minus relevant deletions plus matching added products
      const calculatedTotal = Math.max(0, safeRemoteTotal - relevantDeletedCount + matchingAdded.length);

      // Invariant: The effective total can NEVER be less than the products visibly rendered on the page
      const minPossibleTotal =
        visibleProducts.length > 0
          ? (safePage - 1) * safeLimit + visibleProducts.length
          : 0;
      const effectiveTotal = Math.max(minPossibleTotal, calculatedTotal);

      return {
        products: visibleProducts,
        total: effectiveTotal,
        totalCount: effectiveTotal,
      };
    },
    [addedProducts, updatedProducts, deletedIds, deletedItems]
  );

  const value = useMemo(
    () => ({
      addedProducts,
      updatedProducts,
      deletedIds,
      deletedItems,
      isHydrated,
      addProduct,
      editProduct,
      deleteProduct,
      isDeleted,
      getLocalProduct,
      applyOverlay,
      mergeCatalog,
    }),
    [
      addedProducts,
      updatedProducts,
      deletedIds,
      deletedItems,
      isHydrated,
      addProduct,
      editProduct,
      deleteProduct,
      isDeleted,
      getLocalProduct,
      applyOverlay,
      mergeCatalog,
    ]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
