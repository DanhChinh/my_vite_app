// services/adminService.js - Admin API calls

import axios from 'axios';
import { ADMIN_ENDPOINTS } from '../constants/api';
import { getAuthHeader } from '../utils/auth';

export const adminService = {
  // Statistics
  getStatistics: async () => {
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.STATISTICS, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
      return { success: false, data: {} };
    }
  },

  // Staff Management
  getStaff: async () => {
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.STAFF, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  createStaff: async (staffData) => {
    try {
      const response = await axios.post(ADMIN_ENDPOINTS.STAFF, staffData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tạo tài khoản nhân viên'
      };
    }
  },

  resetStaffPassword: async (id) => {
    try {
      const response = await axios.put(
        ADMIN_ENDPOINTS.STAFF_RESET_PASSWORD(id),
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi cấp lại mật khẩu'
      };
    }
  },

  deleteStaff: async (id) => {
    try {
      const response = await axios.delete(
        ADMIN_ENDPOINTS.STAFF_ITEM(id),
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi xóa nhân viên'
      };
    }
  },

  // Partners Management
  getPartners: async () => {
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.PARTNERS, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  createPartner: async (partnerData) => {
    try {
      const response = await axios.post(ADMIN_ENDPOINTS.PARTNERS, partnerData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi tạo đối tác'
      };
    }
  },

  updatePartner: async (id, partnerData) => {
    try {
      const response = await axios.put(
        ADMIN_ENDPOINTS.PARTNER(id),
        partnerData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi cập nhật đối tác'
      };
    }
  },

  deletePartner: async (id) => {
    try {
      const response = await axios.delete(
        ADMIN_ENDPOINTS.PARTNER(id),
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi xóa đối tác'
      };
    }
  }
};
