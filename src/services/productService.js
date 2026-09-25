import api from '@/services/api';

/**
 * Service to handle all product-related API operations using the shared Axios instance.
 */

/**
 * Fetches the dynamic list of product categories from DummyJSON.
 * Normalizes both string array and object array responses to `{ slug, name }`.
 * @returns {Promise<Array<{ slug: string, name: string }>>}
 */
export async function getCategories() {
  const response = await api.get('/products/categories');
  const data = response.data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    if (typeof item === 'string') {
      return {
        slug: item,
        name: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '),
      };
    }
    return {
      slug: item.slug || item.name || '',
      name: item.name || item.slug || '',
    };
  });
}

/**
 * Fetches products from DummyJSON with support for pagination, search, category filter,
 * sorting, request cancellation, and artificial testing delays.
 *
 * Endpoint routing behavior:
 * 1. If `search` is provided: calls `/products/search?q={search}`
 * 2. If `category` is provided (and no search): calls `/products/category/{category}`
 * 3. Default: calls `/products`
 *
 * Note: DummyJSON does not support simultaneous search + category on the server.
 * When both are present, search takes precedence globally.
 *
 * @param {Object} options
 * @param {number} [options.page=1] - 1-based page number
 * @param {number} [options.limit=10] - Number of items per page
 * @param {string} [options.search=''] - Search query string
 * @param {string} [options.category=''] - Category slug
 * @param {string} [options.sortBy=''] - Field to sort by ('price', 'rating', 'title')
 * @param {string} [options.order='asc'] - Sort direction ('asc', 'desc')
 * @param {AbortSignal} [options.signal] - AbortController signal for cancellation
 * @param {number} [options.delay] - Optional artificial delay in milliseconds (e.g. &delay=2000)
 * @returns {Promise<{ products: Array, total: number, skip: number, limit: number }>}
 */
export async function getProducts({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  sortBy = '',
  order = 'asc',
  signal,
  delay,
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (safePage - 1) * safeLimit;
  const trimmedSearch = typeof search === 'string' ? search.trim() : '';
  const trimmedCategory = typeof category === 'string' ? category.trim() : '';

  // Determine endpoint based on search vs category priority
  let endpoint = '/products';
  const params = {
    limit: safeLimit,
    skip,
  };

  if (trimmedSearch) {
    endpoint = '/products/search';
    params.q = trimmedSearch;
  } else if (trimmedCategory) {
    endpoint = `/products/category/${encodeURIComponent(trimmedCategory)}`;
  }

  // Attach sorting parameters if specified
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order === 'desc' ? 'desc' : 'asc';
  }

  // Support artificial delay parameter for testing stale request behavior
  if (typeof delay === 'number' && delay > 0) {
    params.delay = delay;
  }

  const response = await api.get(endpoint, {
    params,
    signal,
  });

  return response.data;
}

/**
 * Fetches a single product by its numeric ID.
 * Validates the ID before initiating the network request.
 * @param {string|number} id - Product ID
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @returns {Promise<Object>} The product object
 */
export async function getProductById(id, { signal } = {}) {
  const numericId = parseInt(id, 10);

  if (!id || isNaN(numericId) || numericId <= 0) {
    const error = new Error('Invalid product ID');
    error.statusCode = 400;
    error.friendlyMessage = 'The provided product ID is invalid.';
    throw error;
  }

  const response = await api.get(`/products/${numericId}`, { signal });
  return response.data;
}

/**
 * Simulates creating a new product via DummyJSON POST /products/add.
 * @param {Object} productData
 * @returns {Promise<Object>} Created product object from DummyJSON
 */
export async function createProduct(productData) {
  const response = await api.post('/products/add', productData);
  return response.data;
}

/**
 * Simulates updating an existing product via DummyJSON PUT /products/{id}.
 * @param {string|number} id
 * @param {Object} productData
 * @returns {Promise<Object>} Updated product object from DummyJSON
 */
export async function updateProduct(id, productData) {
  const numericId = parseInt(id, 10);
  if (!id || isNaN(numericId) || numericId <= 0) {
    const error = new Error('Invalid product ID');
    error.statusCode = 400;
    error.friendlyMessage = 'Cannot update product with an invalid ID.';
    throw error;
  }

  // DummyJSON only hosts mock products with IDs 1 to 194.
  // Locally created session products (> 194) succeed immediately via simulation.
  if (numericId > 194) {
    return { id: numericId, ...productData };
  }

  const response = await api.put(`/products/${numericId}`, productData);
  return response.data;
}

/**
 * Simulates deleting a product via DummyJSON DELETE /products/{id}.
 * @param {string|number} id
 * @returns {Promise<Object>} Deletion response from DummyJSON
 */
export async function deleteProduct(id) {
  const numericId = parseInt(id, 10);
  if (!id || isNaN(numericId) || numericId <= 0) {
    const error = new Error('Invalid product ID');
    error.statusCode = 400;
    error.friendlyMessage = 'Cannot delete product with an invalid ID.';
    throw error;
  }

  // DummyJSON only hosts mock products with IDs 1 to 194.
  // Locally created session products (> 194) succeed immediately via simulation.
  if (numericId > 194) {
    return { id: numericId, isDeleted: true, deletedOn: new Date().toISOString() };
  }

  const response = await api.delete(`/products/${numericId}`);
  return response.data;
}
