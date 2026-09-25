export const API_BASE_URL = 'https://dummyjson.com';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 20, 50],
};

export const VALID_SORT_FIELDS = ['price', 'rating', 'title'];
export const VALID_SORT_ORDERS = ['asc', 'desc'];

export const SORT_OPTIONS = [
  { value: '', label: 'Default Sorting', sortBy: '', order: '' },
  { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', order: 'desc' },
  { value: 'rating-asc', label: 'Rating: Low to High', sortBy: 'rating', order: 'asc' },
  { value: 'rating-desc', label: 'Rating: High to Low', sortBy: 'rating', order: 'desc' },
  { value: 'title-asc', label: 'Title: A to Z', sortBy: 'title', order: 'asc' },
  { value: 'title-desc', label: 'Title: Z to A', sortBy: 'title', order: 'desc' },
];
