// services/categoryService.js - Category API calls

import axios from 'axios';
import { GUEST_ENDPOINTS } from '../constants/api';

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await axios.get(GUEST_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      return { success: false, data: [] };
    }
  }
};
