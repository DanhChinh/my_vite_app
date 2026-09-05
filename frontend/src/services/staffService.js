// services/staffService.js - Staff API calls

import axios from 'axios';
import { STAFF_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

export const staffService = {
  // Get all orders (for staff to view)
  getOrders: async () => {
    try {
      const response = await axios.get(STAFF_ENDPOINTS.ORDERS, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tải danh sách đơn hàng',
        data: []
      };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(
        STAFF_ENDPOINTS.UPDATE_ORDER(orderId),
        { status },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi cập nhật trạng thái'
      };
    }
  }
};
