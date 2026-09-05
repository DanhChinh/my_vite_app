// services/authService.js - Authentication API calls

import axios from 'axios';
import { GUEST_ENDPOINTS } from '../constants/api';
import { saveAuthToken } from '../utils/auth';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(GUEST_ENDPOINTS.LOGIN, {
        username,
        password
      });
      
      if (response.data.success) {
        saveAuthToken(response.data.token, response.data.role);
      }
      
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  }
};
