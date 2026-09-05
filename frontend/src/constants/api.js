// constants/api.js - API Endpoints tập trung

export const API_BASE_URL = 'http://localhost:5000/api';

// Guest endpoints
export const GUEST_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  PRODUCTS: `${API_BASE_URL}/products`,
};

// Customer endpoints
export const CUSTOMER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/customer/profile`,
  PRODUCTS: `${API_BASE_URL}/customer/products`,
  ORDERS: `${API_BASE_URL}/customer/orders`,
};

// Staff endpoints
export const STAFF_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/staff/products`,
  ORDERS: `${API_BASE_URL}/staff/orders`,
  UPDATE_ORDER: (orderId) => `${API_BASE_URL}/staff/orders/${orderId}`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  STATISTICS: `${API_BASE_URL}/admin/statistics`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/admin/products`,
  PRODUCT: (id) => `${API_BASE_URL}/admin/products/${id}`,
  
  // Staff
  STAFF: `${API_BASE_URL}/admin/staff`,
  STAFF_ITEM: (id) => `${API_BASE_URL}/admin/staff/${id}`,
  STAFF_RESET_PASSWORD: (id) => `${API_BASE_URL}/admin/staff/${id}/reset-password`,
  
  // Partners
  PARTNERS: `${API_BASE_URL}/admin/partners`,
  PARTNER: (id) => `${API_BASE_URL}/admin/partners/${id}`,
};

export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const API_TIMEOUT = 5000;
