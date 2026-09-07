// services/productService.js
import axiosInstance from './axiosInstance';
import { PRODUCT_ENDPOINTS } from '../constants/api2';

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: async (params) => {
    const response = await axiosInstance.get(PRODUCT_ENDPOINTS.BASE, { params });
    return response.data;
  },

  // Lấy chi tiết 1 sản phẩm
  getProductById: async (id) => {
    const response = await axiosInstance.get(PRODUCT_ENDPOINTS.DETAIL(id));
    return response.data;
  },

  // Tạo sản phẩm (Admin/Staff)
  createProduct: async (productData) => {
    const response = await axiosInstance.post(PRODUCT_ENDPOINTS.BASE, productData);
    return response.data;
  }
};