// constants/api.js

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// ==========================================
// 1. ROLES & PERMISSIONS
// ==========================================
export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// ==========================================
// 2. AUTHENTICATION & PROFILE (Customer, Staff, Admin)
// ==========================================
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register', // Dành cho Customer tự đăng ký
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/users/me', // Chuẩn RESTful cho thông tin cá nhân hiện tại
};

// ==========================================
// 3. PRODUCTS & CATEGORIES (Guest, Customer, Staff, Admin)
// ==========================================
// Tất cả các Role dùng chung Resource Endpoint, hành động CRUD sẽ do Middleware ở Backend phân quyền.
export const PRODUCT_ENDPOINTS = {
  BASE: '/products',
  DETAIL: (id) => `/products/${id}`,
  CATEGORIES: '/products/categories',
  REVIEWS: (productId) => `/products/${productId}/reviews`,
};

// ==========================================
// 4. CART MANAGEMENT (Guest, Customer)
// ==========================================
export const CART_ENDPOINTS = {
  BASE: '/carts',
  MERGE: '/carts/merge', // Đồng bộ giỏ hàng từ Guest (Local) sang Customer khi Đăng nhập
  ITEMS: '/carts/items',
  ITEM_DETAIL: (cartItemId) => `/carts/items/${cartItemId}`,
};

// ==========================================
// 5. ADDRESSES (Customer)
// ==========================================
export const ADDRESS_ENDPOINTS = {
  BASE: '/addresses',
  DETAIL: (id) => `/addresses/${id}`,
  SET_DEFAULT: (id) => `/addresses/${id}/default`,
};

// ==========================================
// 6. ORDERS (Customer)
// ==========================================
export const ORDER_ENDPOINTS = {
  BASE: '/orders', // GET (Danh sách đơn cá nhân), POST (Tạo đơn)
  DETAIL: (id) => `/orders/${id}`,
  CANCEL: (id) => `/orders/${id}/cancel`,
};

// ==========================================
// 7. STAFF & ADMIN MANAGEMENT (Staff & Admin)
// ==========================================
export const MANAGEMENT_ENDPOINTS = {
  // Thống kê & Báo cáo tổng quan (Admin, Staff)
  STATISTICS: '/admin/statistics',

  // Quản lý Đơn hàng nâng cao (Staff xử lý đơn, Admin quản lý)
  ORDERS: '/admin/orders',
  ORDER_DETAIL: (id) => `/admin/orders/${id}`,
  ORDER_STATUS: (id) => `/admin/orders/${id}/status`, // Cập nhật trạng thái giao hàng/hoàn tất

  // Quản lý Khách hàng (Admin, Staff)
  CUSTOMERS: '/admin/customers',
  CUSTOMER_DETAIL: (id) => `/admin/customers/${id}`,
  CUSTOMER_STATUS: (id) => `/admin/customers/${id}/status`, // Khóa / Kích hoạt tài khoản

  // Quản lý Nhân viên (Chỉ Admin)
  STAFF: '/admin/staff',
  STAFF_DETAIL: (id) => `/admin/staff/${id}`,
  STAFF_RESET_PASSWORD: (id) => `/admin/staff/${id}/reset-password`,

  // Quản lý Đối tác / Nhà cung cấp (Admin, Staff)
  PARTNERS: '/admin/partners',
  PARTNER_DETAIL: (id) => `/admin/partners/${id}`,

  // Quản lý Đánh giá & Phản hồi (Staff duyêt/trả lời, Admin quản lý)
  REVIEWS: '/admin/reviews',
  REVIEW_DETAIL: (id) => `/admin/reviews/${id}`,
  REVIEW_REPLY: (id) => `/admin/reviews/${id}/reply`,
};

// ==========================================
// 8. SYSTEM CONFIGURATION
// ==========================================
export const API_TIMEOUT = 5000;