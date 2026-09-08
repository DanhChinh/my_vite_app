// services/orderService.js
import axiosInstance from './axiosInstance';
import { ORDER_ENDPOINTS } from '../constants/api';

export const orderService = {
  // Khách hàng
  createOrder: (orderData) => axiosInstance.post(ORDER_ENDPOINTS.BASE, orderData),
  getMyOrders: () => axiosInstance.get(ORDER_ENDPOINTS.BASE),
  getMyOrderDetails: (id) => axiosInstance.get(ORDER_ENDPOINTS.DETAIL(id)),
  cancelOrder: (id) => axiosInstance.put(ORDER_ENDPOINTS.CANCEL(id)),

  // Admin / Staff
  getAllOrdersForAdmin: (params) => axiosInstance.get(ADMIN_ENDPOINTS.ORDERS, { params }),
  getOrderDetailsForAdmin: (id) => axiosInstance.get(ADMIN_ENDPOINTS.ORDER_DETAIL(id)),
  updateOrderStatus: (id, statusData) => axiosInstance.put(ADMIN_ENDPOINTS.ORDER_STATUS(id), statusData)
};