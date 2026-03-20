import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth API helpers ──────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const restaurantsAPI = {
  getAll: (params = {}) => api.get('/restaurants', { params }),
  getMenu: (restaurantId, params = {}) => api.get(`/restaurants/${restaurantId}/menu`, { params }),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (payload) => api.post('/cart', payload),
  updateItem: (itemId, payload) => api.put(`/cart/${itemId}`, payload),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

export const ordersAPI = {
  placeOrder: (payload) => api.post('/orders', payload),
  getOrders: () => api.get('/orders'),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
};

export const paymentsAPI = {
  payOrder: (orderId, payload) => api.post(`/payments/${orderId}`, payload),
  getPaymentStatus: (orderId) => api.get(`/payments/${orderId}`),
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const serverErrors = error?.response?.data?.errors;
  if (Array.isArray(serverErrors) && serverErrors.length > 0) {
    return serverErrors[0]?.msg || fallback;
  }
  return error?.response?.data?.message || fallback;
};

export default api;
