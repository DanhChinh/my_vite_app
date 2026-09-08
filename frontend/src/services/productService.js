// services/productService.js
import axiosInstance from './axiosInstance';
import { PRODUCT_ENDPOINTS, ADMIN_ENDPOINTS } from '../constants/api';

export const productService = {
  // Public
  getCategories: () => axiosInstance.get(PRODUCT_ENDPOINTS.CATEGORIES),
  getProducts: (params) => axiosInstance.get(PRODUCT_ENDPOINTS.BASE, { params }),
  getProductDetail: (id) => axiosInstance.get(PRODUCT_ENDPOINTS.DETAIL(id)),

  // Admin / Staff
  createProduct: (productData) => axiosInstance.post(ADMIN_ENDPOINTS.PRODUCTS, productData),
  updateProduct: (id, productData) => axiosInstance.put(ADMIN_ENDPOINTS.PRODUCT_DETAIL(id), productData),
  deleteProduct: (id) => axiosInstance.delete(ADMIN_ENDPOINTS.PRODUCT_DETAIL(id))
};