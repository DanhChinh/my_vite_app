// services/addressService.js
import axiosInstance from './axiosInstance';
import { ADDRESS_ENDPOINTS } from '../constants/api';

export const addressService = {
  getAddresses: () => axiosInstance.get(ADDRESS_ENDPOINTS.BASE),
  createAddress: (data) => axiosInstance.post(ADDRESS_ENDPOINTS.BASE, data),
  updateAddress: (id, data) => axiosInstance.put(ADDRESS_ENDPOINTS.DETAIL(id), data),
  setDefaultAddress: (id) => axiosInstance.patch(ADDRESS_ENDPOINTS.SET_DEFAULT(id)),
  deleteAddress: (id) => axiosInstance.delete(ADDRESS_ENDPOINTS.DETAIL(id)),
};