import axiosInstance from './axiosInstance';
import { CATEGORY_ENDPOINTS } from '../constants/api2';

export const categoryService = {
  /**
   * Lấy danh sách toàn bộ danh mục sản phẩm (Public)
   * @returns {Promise<Object>} Danh sách categories
   */
  getCategories: async () => {
    return await axiosInstance.get(CATEGORY_ENDPOINTS.BASE);
  },

  /**
   * Lấy chi tiết 1 danh mục theo ID (Public)
   * @param {string|number} id 
   * @returns {Promise<Object>} Chi tiết category
   */
  getCategoryById: async (id) => {
    return await axiosInstance.get(CATEGORY_ENDPOINTS.DETAIL(id));
  },

  /**
   * Tạo danh mục mới (Admin / Staff)
   * @param {Object} categoryData - { name, slug, attributes }
   * @returns {Promise<Object>}
   */
  createCategory: async (categoryData) => {
    return await axiosInstance.post(CATEGORY_ENDPOINTS.BASE, categoryData);
  },

  /**
   * Cập nhật thông tin danh mục (Admin / Staff)
   * @param {string|number} id 
   * @param {Object} categoryData - { name, slug, attributes }
   * @returns {Promise<Object>}
   */
  updateCategory: async (id, categoryData) => {
    return await axiosInstance.put(CATEGORY_ENDPOINTS.DETAIL(id), categoryData);
  },

  /**
   * Xóa danh mục (Chỉ Admin)
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  deleteCategory: async (id) => {
    return await axiosInstance.delete(CATEGORY_ENDPOINTS.DETAIL(id));
  }
};