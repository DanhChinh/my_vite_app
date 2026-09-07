import { ADMIN_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

/**
 * Helper xử lý Response từ Fetch API
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Đã có lỗi xảy ra từ máy chủ');
  }
  return data;
};

export const adminService = {
  // ==========================================
  // 1. THỐNG KÊ & BÁO CÁO (Dashboard Statistics)
  // ==========================================

  /**
   * Lấy số liệu thống kê tổng quan (doanh thu, đơn hàng, khách hàng, tồn kho)
   */
  async getStatistics() {
    const response = await fetch(ADMIN_ENDPOINTS.STATISTICS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // ==========================================
  // 2. QUẢN LÝ KHÁCH HÀNG (Customers)
  // ==========================================

  /**
   * Lấy danh sách khách hàng (hỗ trợ phân trang, tìm kiếm)
   */
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${ADMIN_ENDPOINTS.CUSTOMERS}${queryString ? `?${queryString}` : ''}`;

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
   * Cập nhật trạng thái tài khoản khách hàng (Khóa / Kích hoạt)
   * @param {number|string} customerId 
   * @param {string} status 'active' | 'blocked'
   */
  async updateCustomerStatus(customerId, status) {
    const response = await fetch(ADMIN_ENDPOINTS.CUSTOMER_STATUS(customerId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 3. QUẢN LÝ DANH MỤC (Categories)
  // ==========================================

  /**
   * Lấy danh sách danh mục sản phẩm
   */
  async getCategories() {
    const response = await fetch(ADMIN_ENDPOINTS.CATEGORIES, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Tạo danh mục mới
   */
  async createCategory(categoryData) {
    const response = await fetch(ADMIN_ENDPOINTS.CATEGORIES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật danh mục
   */
  async updateCategory(id, categoryData) {
    const response = await fetch(ADMIN_ENDPOINTS.CATEGORY(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  /**
   * Xóa danh mục
   */
  async deleteCategory(id) {
    const response = await fetch(ADMIN_ENDPOINTS.CATEGORY(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // ==========================================
  // 4. QUẢN LÝ SẢN PHẨM (Products)
  // ==========================================

  /**
   * Lấy danh sách sản phẩm quản trị
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${ADMIN_ENDPOINTS.PRODUCTS}${queryString ? `?${queryString}` : ''}`;

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
   * Tạo mới sản phẩm
   */
  async createProduct(productData) {
    const response = await fetch(ADMIN_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  async updateProduct(id, productData) {
    const response = await fetch(ADMIN_ENDPOINTS.PRODUCT(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  /**
   * Xóa sản phẩm
   */
  async deleteProduct(id) {
    const response = await fetch(ADMIN_ENDPOINTS.PRODUCT(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // ==========================================
  // 5. QUẢN LÝ NHÂN VIÊN (Staff Management)
  // ==========================================

  /**
   * Lấy danh sách nhân viên
   */
  async getStaffList() {
    const response = await fetch(ADMIN_ENDPOINTS.STAFF, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Tạo tài khoản nhân viên mới
   */
  async createStaff(staffData) {
    const response = await fetch(ADMIN_ENDPOINTS.STAFF, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(staffData),
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật thông tin nhân viên
   */
  async updateStaff(id, staffData) {
    const response = await fetch(ADMIN_ENDPOINTS.STAFF_ITEM(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(staffData),
    });
    return handleResponse(response);
  },

  /**
   * Reset mật khẩu cho nhân viên
   */
  async resetStaffPassword(id, newPassword) {
    const response = await fetch(ADMIN_ENDPOINTS.STAFF_RESET_PASSWORD(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ password: newPassword }),
    });
    return handleResponse(response);
  },

  /**
   * Xóa tài khoản nhân viên
   */
  async deleteStaff(id) {
    const response = await fetch(ADMIN_ENDPOINTS.STAFF_ITEM(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // ==========================================
  // 6. QUẢN LÝ ĐÁNH GIÁ (Reviews Management)
  // ==========================================

  /**
   * Lấy danh sách toàn bộ đánh giá sản phẩm
   */
  async getReviews(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${ADMIN_ENDPOINTS.REVIEWS}${queryString ? `?${queryString}` : ''}`;

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
   * Thay đổi trạng thái hiển thị/kiểm duyệt của đánh giá
   * @param {number|string} reviewId 
   * @param {string} status 'approved' | 'rejected' | 'pending'
   */
  async updateReviewStatus(reviewId, status) {
    const response = await fetch(ADMIN_ENDPOINTS.REVIEW_STATUS(reviewId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  /**
   * Admin trả lời đánh giá của khách hàng
   */
  async replyToReview(reviewId, replyContent) {
    const response = await fetch(ADMIN_ENDPOINTS.REVIEW_REPLY(reviewId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reply: replyContent }),
    });
    return handleResponse(response);
  },

  // ==========================================
  // 7. QUẢN LÝ ĐỐI TÁC (Partners / Suppliers)
  // ==========================================

  /**
   * Lấy danh sách đối tác
   */
  async getPartners() {
    const response = await fetch(ADMIN_ENDPOINTS.PARTNERS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Thêm đối tác mới
   */
  async createPartner(partnerData) {
    const response = await fetch(ADMIN_ENDPOINTS.PARTNERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(partnerData),
    });
    return handleResponse(response);
  },

  /**
   * Cập nhật thông tin đối tác
   */
  async updatePartner(id, partnerData) {
    const response = await fetch(ADMIN_ENDPOINTS.PARTNER(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(partnerData),
    });
    return handleResponse(response);
  },

  /**
   * Xóa đối tác
   */
  async deletePartner(id) {
    const response = await fetch(ADMIN_ENDPOINTS.PARTNER(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

export default adminService;