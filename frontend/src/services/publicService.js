import { PUBLIC_ENDPOINTS } from '../constants/api';

/**
 * Helper xử lý Response từ Fetch API
 */
const handleResponse = async (response) => {
  const data = await response.json();
  // console.log(data)
  if (!response.ok) {
    throw new Error(data.message || 'Đã có lỗi xảy ra từ máy chủ');
  }
  return data;
};

export const publicService = {
  async login(credentials) {
    const response = await fetch(PUBLIC_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   * @param {Object} userData - { name, email, password, phone, ... }
   */
  async register(userData) {
    console.log(userData)
    console.log(PUBLIC_ENDPOINTS.REGISTER)
    const response = await fetch(PUBLIC_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 2. SẢN PHẨM & DANH MỤC (Products & Categories)
  // ==========================================

  /**
   * Lấy danh sách sản phẩm hiển thị trang chủ / cửa hàng (có bộ lọc, phân trang)
   * @param {Object} params - { page, limit, category, search, sort, ... }
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${PUBLIC_ENDPOINTS.PRODUCTS}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   * @param {number|string} productId 
   */
  async getProductDetail(productId) {
    const response = await fetch(PUBLIC_ENDPOINTS.PRODUCT_DETAIL(productId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Lấy danh sách danh mục sản phẩm công khai
   */
  async getCategories() {
    const response = await fetch(PUBLIC_ENDPOINTS.CATEGORIES, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // ==========================================
  // 3. ĐẶT HÀNG & TRA CỨU KHÁCH VÃNG LAI (Guest Orders)
  // ==========================================

  /**
   * Đặt hàng dành cho Guest (Guest Checkout)
   * @param {Object} orderData - { customerInfo, items, paymentMethod, ... }
   */
  async createGuestOrder(orderData) {
    const response = await fetch(PUBLIC_ENDPOINTS.CHECKOUT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  /**
   * Tra cứu đơn hàng dành cho Guest theo mã đơn hàng + SĐT/Email
   * @param {Object} trackParams - { orderCode, phone }
   */
  async trackOrder(trackParams) {
    const queryString = new URLSearchParams(trackParams).toString();
    const url = `${PUBLIC_ENDPOINTS.ORDER_TRACKING}?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

export default publicService;