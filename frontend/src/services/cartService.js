// services/cartService.js
import axiosInstance from './axiosInstance';
import { CART_ENDPOINTS } from '../constants/api';

export const cartService = {
  getCart: () => axiosInstance.get(CART_ENDPOINTS.BASE),
  addToCart: (data) => axiosInstance.post(CART_ENDPOINTS.BASE, data),
  mergeCart: (localItems) => axiosInstance.post(CART_ENDPOINTS.MERGE, { localItems }),
  updateCartItem: (data) => axiosInstance.put(CART_ENDPOINTS.ITEM, data),
  removeCartItem: (cartItemId) => axiosInstance.delete(CART_ENDPOINTS.ITEM_DETAIL(cartItemId))
};