import { CUSTOMER_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Đã có lỗi xảy ra từ máy chủ');
  }
  return data;
};

export const customerService = {
  // ==========================================
  // 1. HỒ SƠ CÁ NHÂN (Profile)
  // ==========================================

  /**
   * Lấy thông tin tài khoản cá nhân
   */
  async getProfile() {
    const response = await fetch(CUSTOMER_ENDPOINTS.PROFILE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật thông tin tài khoản
   * @param {Object} profileData - { name, phone, address, ... }
   */
  async updateProfile(profileData) {
    const response = await fetch(CUSTOMER_ENDPOINTS.PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - { oldPassword, newPassword }
   */
  async changePassword(passwordData) {
    const response = await fetch(CUSTOMER_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 2. QUẢN LÝ ĐƠN HÀNG (Orders)
  // ==========================================

  /**
   * Tạo đơn hàng mới từ tài khoản đã đăng nhập
   */
  async createOrder(orderData) {
    const response = await fetch(CUSTOMER_ENDPOINTS.ORDERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  /**
   * Lấy danh sách lịch sử đơn hàng cá nhân
   */
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CUSTOMER_ENDPOINTS.ORDERS}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Xem chi tiết một đơn hàng
   */
  async getOrderDetail(orderId) {
    const response = await fetch(CUSTOMER_ENDPOINTS.ORDER_DETAIL(orderId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Hủy đơn hàng (nếu đơn chưa xử lý)
   */
  async cancelOrder(orderId, reason = '') {
    const response = await fetch(CUSTOMER_ENDPOINTS.CANCEL_ORDER(orderId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 3. ĐÁNH GIÁ SẢN PHẨM (Reviews)
  // ==========================================

  /**
   * Gửi đánh giá cho sản phẩm đã mua
   * @param {Object} reviewData - { productId, rating, comment, orderId }
   */
  async createReview(reviewData) {
    const response = await fetch(CUSTOMER_ENDPOINTS.REVIEWS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 4. GIỎ HÀNG DỒNG BỘ BACKEND (Cart)
  // ==========================================

  /**
   * Lấy giỏ hàng từ máy chủ
   */
  async getCart() {
    const response = await fetch(CUSTOMER_ENDPOINTS.CART, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Đồng bộ / Cập nhật giỏ hàng lên server
   * @param {Array} items - [{ productId, quantity }]
   */
  async syncCart(items) {
    const response = await fetch(CUSTOMER_ENDPOINTS.CART, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ items }),
    });
    return handleResponse(response);
  },
};

export default customerService;