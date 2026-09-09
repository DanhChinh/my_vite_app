// constants/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const PRODUCT_ENDPOINTS = {
  CATEGORIES: '/categories',
  BASE: '/products',
  DETAIL: (id) => `/products/${id}`
};

export const CART_ENDPOINTS = {
  BASE: '/carts',
  MERGE: '/carts/merge',
  ITEM: '/carts/item',
  ITEM_DETAIL: (cartItemId) => `/carts/item/${cartItemId}`,
};

export const ORDER_ENDPOINTS = {
  BASE: '/orders',
  DETAIL: (id) => `/orders/${id}`,
  CANCEL: (id) => `/orders/${id}/cancel`,
};

export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register' ,
  CHANGE_PASSWORD: '/change-password',
  PROFILE: '/profile',
  ADDRESSES: '/addresses',
};

export const ADDRESS_ENDPOINTS = {
    BASE: '/addresses',
    DETAIL: (id) => `/addresses/${id}`,
    SET_DEFAULT: (id) => `/addresses/${id}/default`,
  };

export const ADMIN_ENDPOINTS = {
  STATISTICS: '/admin/statistics',
  ORDERS: '/admin/orders',
  ORDER_DETAIL: (id) => `/admin/orders/${id}`,
  ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
  PRODUCTS: '/admin/products',
  PRODUCT_DETAIL: (id) => `/admin/products/${id}`,
  CATEGORIES: '/admin/categories',
  CATEGORY_DETAIL: (id) => `/admin/categories/${id}`,
  CUSTOMERS: '/admin/customers',
  CUSTOMER_STATUS: (id) => `/admin/customers/${id}/status`,
  STAFF: '/admin/staff',
  STAFF_DETAIL: (id) => `/admin/staff/${id}`,
  STAFF_RESET_PASSWORD: (id) => `/admin/staff/${id}/reset-password`,
  PARTNERS: '/admin/partners',
  PARTNER_DETAIL: (id) => `/admin/partners/${id}`,
  REVIEWS: '/admin/reviews',
  REVIEW_STATUS: (id) => `/admin/reviews/${id}/status`,
  REVIEW_REPLY: (id) => `/admin/reviews/${id}/reply`,
};

export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const API_TIMEOUT = 5000;