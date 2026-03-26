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
  driverLogin: (data) => api.post('/driver/login', data),
  getMe: () => api.get('/auth/me'),
};

export const restaurantsAPI = {
  getAll: (params = {}) => api.get('/user/restaurants', { params }),
  getMenu: (restaurantId, params = {}) => api.get(`/user/restaurants/${restaurantId}/menu`, { params }),
  getReviews: (restaurantId, params = {}) => api.get(`/user/restaurants/${restaurantId}/reviews`, { params }),
  addReview: (restaurantId, payload) => api.post(`/user/restaurants/${restaurantId}/reviews`, payload),
  getSmartCombo: (restaurantId, payload) => api.post(`/user/restaurants/${restaurantId}/smart-combo`, payload),
};

export const addressesAPI = {
  getAll: () => api.get('/user/addresses'),
  add: (payload) => api.post('/user/addresses', payload),
  update: (addressId, payload) => api.put(`/user/addresses/${addressId}`, payload),
  remove: (addressId) => api.delete(`/user/addresses/${addressId}`),
};

export const cartAPI = {
  getCart: () => api.get('/user/cart'),
  addItem: (payload) => api.post('/user/cart', payload),
  updateItem: (itemId, payload) => api.put(`/user/cart/${itemId}`, payload),
  removeItem: (itemId) => api.delete(`/user/cart/${itemId}`),
  clearCart: () => api.delete('/user/cart'),
};

export const ordersAPI = {
  placeOrder: (payload) => api.post('/user/orders', payload),
  getOrders: (params = {}) => api.get('/user/orders', { params }),
  getOrder: (orderId) => api.get(`/user/orders/${orderId}`),
  getTracking: (orderId) => api.get(`/user/orders/${orderId}/tracking`),
  cancelOrder: (orderId, payload = {}) => api.patch(`/user/orders/${orderId}/cancel`, payload),
};

export const groupOrderAPI = {
  createRoom: (payload) => api.post('/user/group-order/rooms', payload),
  joinRoom: (roomCode) => api.post(`/user/group-order/rooms/${roomCode}/join`),
  getRoom: (roomCode) => api.get(`/user/group-order/rooms/${roomCode}`),
  addItem: (roomCode, payload) => api.post(`/user/group-order/rooms/${roomCode}/items`, payload),
  updateItem: (roomCode, itemId, payload) => api.patch(`/user/group-order/rooms/${roomCode}/items/${itemId}`, payload),
  removeItem: (roomCode, itemId) => api.delete(`/user/group-order/rooms/${roomCode}/items/${itemId}`),
  checkoutRoom: (roomCode) => api.post(`/user/group-order/rooms/${roomCode}/checkout`),
};

export const paymentsAPI = {
  payOrder: (orderId, payload) => api.post(`/user/payments/${orderId}`, payload),
  getPaymentStatus: (orderId) => api.get(`/user/payments/${orderId}`),
};

export const driverAPI = {
  login: (payload) => api.post('/driver/login', payload),
  getAvailableOrders: () => api.get('/driver/orders/available'),
  acceptOrder: (orderId) => api.post(`/driver/orders/${orderId}/accept`),
  rejectOrder: (orderId, payload = {}) => api.post(`/driver/orders/${orderId}/reject`, payload),
  getAssignedOrders: () => api.get('/driver/orders/assigned'),
  updateOrderStatus: (orderId, status) => api.patch(`/driver/orders/${orderId}/status`, { status }),
  updateOrderLocation: (orderId, payload) => api.patch(`/driver/orders/${orderId}/location`, payload),
};

export const reelsAPI = {
  getFeed: (params = {}) => api.get('/user/reels', { params }),
  toggleLike: (reelId) => api.post(`/user/reels/${reelId}/like`),
  getComments: (reelId) => api.get(`/user/reels/${reelId}/comments`),
  addComment: (reelId, payload) => api.post(`/user/reels/${reelId}/comments`, payload),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRestaurants: (params = {}) => api.get('/admin/restaurants', { params }),
  createRestaurant: (payload) => api.post('/admin/restaurants', payload),
  updateRestaurant: (restaurantId, payload) => api.put(`/admin/restaurants/${restaurantId}`, payload),
  deleteRestaurant: (restaurantId) => api.delete(`/admin/restaurants/${restaurantId}`),
  getMenuItems: (params = {}) => api.get('/admin/menu', { params }),
  createMenuItem: (payload) => api.post('/admin/menu', payload),
  updateMenuItem: (menuItemId, payload) => api.put(`/admin/menu/${menuItemId}`, payload),
  deleteMenuItem: (menuItemId) => api.delete(`/admin/menu/${menuItemId}`),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrderStatus: (orderId, status, payload = {}) => api.patch(`/admin/orders/${orderId}/status`, { status, ...payload }),
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const serverErrors = error?.response?.data?.errors;
  if (Array.isArray(serverErrors) && serverErrors.length > 0) {
    return serverErrors[0]?.msg || fallback;
  }
  return error?.response?.data?.message || fallback;
};

export default api;
