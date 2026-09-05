// services/productService.js - Product API calls

import axios from 'axios';
import { GUEST_ENDPOINTS, CUSTOMER_ENDPOINTS, ADMIN_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

export const productService = {
  // Guest & Public products
  getPublicProducts: async (category = '') => {
    try {
      let url = GUEST_ENDPOINTS.PRODUCTS;
      if (category) url += `?category=${category}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      return { success: false, data: [] };
    }
  },

  // Customer products
  getCustomerProducts: async (category = '') => {
    try {
      let url = CUSTOMER_ENDPOINTS.PRODUCTS;
      if (category) url += `?category=${category}`;
      
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      return { success: false, data: [] };
    }
  },

  // Admin - get all products
  getAdminProducts: async (category = '') => {
    try {
      let url = ADMIN_ENDPOINTS.PRODUCTS;
      if (category) url += `?category=${category}`;
      
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      return { success: false, data: [] };
    }
  },

  // Admin - create product
  createProduct: async (productData) => {
    try {
      const response = await axios.post(ADMIN_ENDPOINTS.PRODUCTS, productData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tạo sản phẩm'
      };
    }
  },

  // Admin - update product
  updateProduct: async (id, productData) => {
    try {
      const response = await axios.put(
        ADMIN_ENDPOINTS.PRODUCT(id),
        productData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi cập nhật sản phẩm'
      };
    }
  },

  // Admin - delete product
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(
        ADMIN_ENDPOINTS.PRODUCT(id),
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi xóa sản phẩm'
      };
    }
  }
};
