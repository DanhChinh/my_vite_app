// utils/auth.js - Authentication & Session utilities

// 1. Quản lý Auth Token (Dành cho User/Customer/Staff/Admin đã đăng nhập)
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserRole = () => {
  return localStorage.getItem('role') || 'guest';
};

export const saveAuthToken = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const hasRole = (role) => {
  return getUserRole() === role;
};

// 2. Quản lý Guest Session ID (Dành cho Khách vãng lai)

/**
 * Lấy Session ID hiện tại của Guest. Nếu chưa có, tự động sinh mới.
 */

/**
 * Thiết lập thủ công Guest Session ID (khi nhận được từ response server)
 */
export const setGuestSessionId = (sessionId) => {
  if (sessionId) {
    localStorage.setItem('guest_session_id', sessionId);
  }
};

/**
 * Xóa Guest Session ID (dùng sau khi đã merge giỏ hàng vào tài khoản thành công)
 */


// Lấy hoặc khởi tạo Guest Session ID cố định trong LocalStorage
export const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  
  if (!sessionId) {
    // Tạo ID duy nhất cho session vãng lai
    sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('guest_session_id', sessionId);
  }
  
  return sessionId;
};

// Xóa Session ID sau khi khách đã đăng nhập và gộp giỏ hàng thành công
export const clearGuestSessionId = () => {
  localStorage.removeItem('guest_session_id');
};