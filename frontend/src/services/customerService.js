// services/customerService.js - Customer API calls

import axios from 'axios';
import { CUSTOMER_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

export const customerService = {
  // Get customer profile
  getProfile: async () => {
    try {
      const response = await axios.get(CUSTOMER_ENDPOINTS.PROFILE, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải thông tin'
      };
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(CUSTOMER_ENDPOINTS.PROFILE, profileData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi cập nhật thông tin'
      };
    }
  },

  // Create order (from cart)
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(CUSTOMER_ENDPOINTS.ORDERS, orderData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi đặt hàng'
      };
    }
  }
};
