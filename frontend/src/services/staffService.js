import { STAFF_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Đã có lỗi xảy ra từ máy chủ');
  }
  return data;
};

export const staffService = {
  // ==========================================
  // 1. QUẢN LÝ ĐƠN HÀNG (Order Management)
  // ==========================================

  /**
   * Lấy danh sách đơn hàng cần xử lý
   * @param {Object} params - { status, page, limit, search }
   */
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${STAFF_ENDPOINTS.ORDERS}${queryString ? `?${queryString}` : ''}`;

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
   * Xem chi tiết đơn hàng
   */
  async getOrderDetail(orderId) {
    const response = await fetch(STAFF_ENDPOINTS.ORDER_DETAIL(orderId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật trạng thái đơn hàng (VD: Processing -> Shipping -> Completed)
   * @param {number|string} orderId 
   * @param {string} status 
   * @param {string} note 
   */
  async updateOrderStatus(orderId, status, note = '') {
    const response = await fetch(STAFF_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(response);
  },

  /**
   * Tạo đơn hàng trực tiếp tại quầy / qua điện thoại (POS)
   */
  async createOrderAtCounter(orderData) {
    const response = await fetch(STAFF_ENDPOINTS.CREATE_ORDER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 2. TỒN KHO & SẢN PHẨM (Inventory)
  // ==========================================

  /**
   * Tra cứu thông tin tồn kho sản phẩm
   */
  async getInventory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${STAFF_ENDPOINTS.INVENTORY}${queryString ? `?${queryString}` : ''}`;

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
   * Cập nhật số lượng tồn kho nhanh
   * @param {number|string} productId 
   * @param {number} stockQuantity 
   */
  async updateStock(productId, stockQuantity) {
    const response = await fetch(STAFF_ENDPOINTS.UPDATE_STOCK(productId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ stockQuantity }),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 3. HỖ TRỢ KHÁCH HÀNG (Support / Chat)
  // ==========================================

  /**
   * Lấy danh sách yêu cầu hỗ trợ từ khách hàng
   */
  async getSupportTickets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${STAFF_ENDPOINTS.CUSTOMER_SUPPORT}${queryString ? `?${queryString}` : ''}`;

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
   * Trả lời / Xử lý yêu cầu hỗ trợ
   */
  async replySupportTicket(ticketId, message) {
    const response = await fetch(STAFF_ENDPOINTS.REPLY_SUPPORT(ticketId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ message }),
    });
    return handleResponse(response);
  },
};

export default staffService;