import axios from 'axios';
import { API_BASE_URL, AUTH_STORAGE_KEYS } from '@/utils/constants';

/**
 * Shared Axios instance for the entire application.
 * All API service files should use this instance instead of raw Axios.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15-second timeout safeguard
});

/**
 * Request Interceptor:
 * Automatically reads the auth token from localStorage (if running in browser)
 * and attaches it as a Bearer token in the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Unable to access localStorage for auth token:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * 1. Passes through successful responses.
 * 2. Ignores canceled requests without marking them as failures.
 * 3. Normalizes error messages so UI components receive clean, predictable errors.
 * 4. Cleans up stored credentials if a 401 Unauthorized response is returned.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If request was canceled by AbortController, let it pass through unaltered
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Extract status code and server message
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // Build human-friendly message
    let friendlyMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      friendlyMessage = 'Network error. Please check your internet connection.';
    } else if (serverMessage) {
      friendlyMessage = serverMessage;
    } else if (status === 400) {
      friendlyMessage = 'Bad request. Please verify your input.';
    } else if (status === 401) {
      friendlyMessage = 'Session expired or invalid credentials. Please log in again.';
      // Clean up invalid session data from storage and redirect if not on login page
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          if (!window.location.pathname.startsWith('/login')) {
            // Non-React context: force redirect to login on 401
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = '/login';
          }
        } catch (e) {
          // ignore storage errors
        }
      }
    } else if (status === 403) {
      friendlyMessage = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      friendlyMessage = 'The requested resource was not found.';
    } else if (status >= 500) {
      friendlyMessage = 'Server error. Please try again later.';
    }

    // Attach normalized properties to the error object while preserving original fields
    error.friendlyMessage = friendlyMessage;
    error.statusCode = status || null;

    return Promise.reject(error);
  }
);

/**
 * Helper to check whether an error was caused by request cancellation.
 * Allows UI and service layers to easily ignore canceled requests.
 */
export const isRequestCanceled = (error) => axios.isCancel(error);

export default api;
