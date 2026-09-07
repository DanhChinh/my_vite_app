// constants/api.js - API Endpoints tập trung

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// Guest endpoints
export const PUBLIC_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  PRODUCTS: `${API_BASE_URL}/products`,
  REGISTER: `${API_BASE_URL}/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password`,
  PRODUCT_DETAIL:(id) => `${API_BASE_URL}/products/${id}`,
  PRODUCT_REVIEWS: (id) => `${API_BASE_URL}/products/${id}/reviews`,
  CATEGORIES:`${API_BASE_URL}/categories`,
  CART:`${API_BASE_URL}/cart`,
  ADD_TO_CART:`${API_BASE_URL}/cart/add`,
  UPDATE_CART_ITEM:`${API_BASE_URL}/cart/update`,
  REMOVE_CART_ITEM:(cart_item_id) => `${API_BASE_URL}/cart/item/${cart_item_id}`,
  CHECKOUT:`${API_BASE_URL}/checkout`,
  ORDER_TRACKING:`${API_BASE_URL}/order-tracking`,

};

// Customer endpoints
export const CUSTOMER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/customer/profile`,
  PASSWORD: `${API_BASE_URL}/customer/password`,
  ADDRESSES: `${API_BASE_URL}/customer/addresses`,
  ADDRESS: (id) => `${API_BASE_URL}/customer/addresses/${id}`,
  PRODUCTS: `${API_BASE_URL}/customer/products`,
  CREATE_ORDER: `${API_BASE_URL}/customer/orders`,
  ORDER: (id) => `${API_BASE_URL}/customer/orders/${id}`,
  CANCEL_ORDER: (id) => `${API_BASE_URL}/customer/orders/${id}/cancel`,
  PRODUCT_REVIEWS: (id) => `${API_BASE_URL}/customer/products/${id}/reviews`,
  REVIEWABLE_ORDERS: (id) => `${API_BASE_URL}/customer/products/${id}/reviewable-orders`,
  REVIEW: (id) => `${API_BASE_URL}/customer/reviews/${id}`,
  REMOVE_CART_ITEM:(cart_item_id) => `${API_BASE_URL}/cart/item/${cart_item_id}`

  
};

// Staff endpoints
export const STAFF_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/staff/products`,
  ORDERS: `${API_BASE_URL}/staff/orders`,
  INCOMPLETE_CARTS: `${API_BASE_URL}/staff/incomplete-carts`,
  ORDER: (orderId) => `${API_BASE_URL}/staff/orders/${orderId}`,
  UPDATE_ORDER: (orderId) => `${API_BASE_URL}/staff/orders/${orderId}`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  STATISTICS: `${API_BASE_URL}/admin/statistics`,
  CUSTOMERS: `${API_BASE_URL}/admin/customers`,
  CUSTOMER_STATUS: (id) => `${API_BASE_URL}/admin/customers/${id}/status`,
  CATEGORIES: `${API_BASE_URL}/admin/categories`,
  CATEGORY: (id) => `${API_BASE_URL}/admin/categories/${id}`,
  REVIEWS: `${API_BASE_URL}/admin/reviews`,
  REVIEW_STATUS: (id) => `${API_BASE_URL}/admin/reviews/${id}/status`,
  REVIEW_REPLY: (id) => `${API_BASE_URL}/admin/reviews/${id}/reply`,
  
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
