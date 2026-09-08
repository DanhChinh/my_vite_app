// services/authService.js
import axiosInstance from './axiosInstance';
import { AUTH_ENDPOINTS } from '../constants/api';

export const authService = {
  login: (credentials) => axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials),
  register: (userData) => axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData),
  changePassword: (data) => axiosInstance.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, data),
  getProfile: () => axiosInstance.get(AUTH_ENDPOINTS.PROFILE)
};