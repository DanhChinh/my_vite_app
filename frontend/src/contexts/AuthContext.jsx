// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { saveAuthData, clearAuthData, getToken, getUser } from '../utils/auth';
import { getGuestCart, clearGuestCart } from '../utils/guest';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getUser());
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải thông tin cá nhân khi khởi chạy hoặc làm mới
  const fetchUserProfile = useCallback(async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      // response trả về trực tiếp object { success, user/data, ... }
      const userData = response.user || response.data;
      if (userData) {
        setUser(userData);
        saveAuthData(getToken(), userData);
      }
    } catch (error) {
      // 401 đã được axiosInstance tự dọn dẹp và chuyển hướng
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 2. Xử lý Đăng nhập
  const login = async (credentials) => {
    // Nếu API lỗi, axiosInstance ném Error(message) thẳng xuống khối catch của Component gọi hàm
    const response = await authService.login(credentials);
    const { token: newToken, user: userData } = response;

    // Lưu dữ liệu xác thực
    saveAuthData(newToken, userData);
    setToken(newToken);
    setUser(userData);

    // Đồng bộ giỏ hàng khách vãng lai nếu là customer
    if (userData.role === 'customer') {
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        try {
          await cartService.mergeCart(guestItems);
          clearGuestCart();
        } catch (mergeErr) {
          console.error('Lỗi tự động hợp nhất giỏ hàng:', mergeErr);
        }
      }
    }

    return userData;
  };

  // 3. Xử lý Đăng ký
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // 4. Xử lý Đăng xuất
  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  // 5. Cập nhật State thông tin người dùng
  const updateUserProfile = (updatedData) => {
    setUser((prevUser) => {
      const newUser = prevUser ? { ...prevUser, ...updatedData } : null;
      if (newUser && getToken()) saveAuthData(getToken(), newUser);
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        // State & Biến dữ liệu (Nouns)
        token,
        user,
        role: user?.role || 'guest',
        isLoading,
        isAuthenticated: !!token,

        // Hàm & Hành động (Verbs)
        login,
        register,
        logout,
        updateUserProfile,
        releaseEventsefreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);