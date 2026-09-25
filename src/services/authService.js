import api from '@/services/api';

/**
 * Service to handle all authentication API requests.
 */

/**
 * Authenticates user credentials with DummyJSON.
 * @param {Object} credentials - { username, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function loginUser(credentials) {
  const response = await api.post('/auth/login', {
    username: credentials.username.trim(),
    password: credentials.password,
  });

  const data = response.data;

  // DummyJSON returns `accessToken` in newer versions and `token` in older versions
  const token = data.accessToken || data.token;

  if (!token) {
    throw new Error('Authentication token was not returned by the server.');
  }

  // Extract only the minimum required user information
  const user = {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    image: data.image,
  };

  return { token, user };
}
