import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Đính kèm Token & Log Request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log tự động dữ liệu GUI ĐI (Chỉ log ở môi trường Development)
    if (import.meta.env.DEV) {
      console.log(
        `🚀 [OUTGOING] ${config.method?.toUpperCase()} -> ${config.url}`,
        config.params || config.data || {}
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Trả về data, Log Response & Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => {
    // Log tự động dữ liệu NHẬN VỀ
    if (import.meta.env.DEV) {
      console.log(
        `⤵️ [INCOMING] ${response.config.method?.toUpperCase()} <- ${response.config.url}`,
        response.data
      );
    }

    // Trả về thẳng data để các Service không cần gọi response.data
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';

    // Log lỗi ở Dev Mode
    if (import.meta.env.DEV) {
      console.error(
        `❌ [ERROR ${status || 'NET'}] ${error.config?.method?.toUpperCase()} <- ${error.config?.url}`,
        error.response?.data || error.message
      );
    }

    // Xử lý khi Token hết hạn hoặc không hợp lệ (401 Unauthorized)
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chuyển hướng về trang login nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;