// constants/api.js - API Endpoints tập trung theo RESTful Architecture

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// 1. Authenticate & Account Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
};

// 2. Products Endpoints
export const PRODUCT_ENDPOINTS = {
  BASE: `${API_BASE_URL}/products`,
  DETAIL: (id) => `${API_BASE_URL}/products/${id}`,
  REVIEWS: (id) => `${API_BASE_URL}/products/${id}/reviews`,
  REVIEWABLE_ORDERS: (id) => `${API_BASE_URL}/products/${id}/reviewable-orders`,
};

// 3. Categories Endpoints
export const CATEGORY_ENDPOINTS = {
  BASE: `${API_BASE_URL}/categories`,
  DETAIL: (id) => `${API_BASE_URL}/categories/${id}`,
};

// 4. Cart Endpoints
export const CART_ENDPOINTS = {
  BASE: `${API_BASE_URL}/cart`,
  ADD_ITEM: `${API_BASE_URL}/cart/add`,
  UPDATE_ITEM: `${API_BASE_URL}/cart/update`,
  REMOVE_ITEM: (cartItemId) => `${API_BASE_URL}/cart/items/${cartItemId}`,
  MERGE: `${API_BASE_URL}/cart/merge`,
  INCOMPLETE_CARTS: `${API_BASE_URL}/cart/incomplete`, // Cho staff / admin quản lý giỏ hàng bỏ quên
};

// 5. Orders & Checkout Endpoints
export const ORDER_ENDPOINTS = {
  BASE: `${API_BASE_URL}/orders`,
  DETAIL: (id) => `${API_BASE_URL}/orders/${id}`,
  CANCEL: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
  TRACKING: `${API_BASE_URL}/orders/tracking`,
  CHECKOUT: `${API_BASE_URL}/orders/checkout`,
};

// 6. Customer Specific Resource Endpoints
export const CUSTOMER_ENDPOINTS = {
  ADDRESSES: `${API_BASE_URL}/customer/addresses`,
  ADDRESS_DETAIL: (id) => `${API_BASE_URL}/customer/addresses/${id}`,
  REVIEWS: `${API_BASE_URL}/customer/reviews`,
  REVIEW_DETAIL: (id) => `${API_BASE_URL}/customer/reviews/${id}`,
};

// 7. Admin & Staff Management Endpoints
export const ADMIN_ENDPOINTS = {
  STATISTICS: `${API_BASE_URL}/admin/statistics`,
  
  // Quản lý người dùng & Nhân viên
  CUSTOMERS: `${API_BASE_URL}/admin/customers`,
  CUSTOMER_STATUS: (id) => `${API_BASE_URL}/admin/customers/${id}/status`,
  STAFF: `${API_BASE_URL}/admin/staff`,
  STAFF_DETAIL: (id) => `${API_BASE_URL}/admin/staff/${id}`,
  STAFF_RESET_PASSWORD: (id) => `${API_BASE_URL}/admin/staff/${id}/reset-password`,
  
  // Quản lý Đối tác
  PARTNERS: `${API_BASE_URL}/admin/partners`,
  PARTNER_DETAIL: (id) => `${API_BASE_URL}/admin/partners/${id}`,
  
  // Quản lý Đánh giá
  REVIEWS: `${API_BASE_URL}/admin/reviews`,
  REVIEW_STATUS: (id) => `${API_BASE_URL}/admin/reviews/${id}/status`,
  REVIEW_REPLY: (id) => `${API_BASE_URL}/admin/reviews/${id}/reply`,
};

// 8. User Roles Definitions
export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const API_TIMEOUT = 5000;