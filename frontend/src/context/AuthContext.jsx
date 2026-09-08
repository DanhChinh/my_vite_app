import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { saveAuthData, clearAuthData, getToken, getUser, getUserRole } from '../utils/auth';
import { getGuestCart, clearGuestCart } from '../utils/guest';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [role, setRole] = useState(() => getUserRole());
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  // 1. Lấy thông tin Profile người dùng
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setRole(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const result = await authService.getProfile();
      if (result && result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      if (error?.message?.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 2. Xử lý Đăng nhập
  const login = async (username, password) => {
    try {
      const result = await authService.login({ username, password });

      if (result.success) {
        const newToken = result.token;
        const userRole = result.role;
        const userData = {
          username: result.username,
          role: result.role
        };

        // Lưu thông tin xác thực vào Storage & State
        saveAuthData(newToken, userData);
        setToken(newToken);
        setRole(userRole);
        setUser(userData);

        // Hợp nhất giỏ hàng từ localStorage (guestCart) vào database[cite: 2]
        if (userRole === 'customer') {
          const guestItems = getGuestCart();
          if (guestItems && guestItems.length > 0) {
            try {
              const mergeRes = await cartService.mergeCart(guestItems);
              if (mergeRes.success) {
                clearGuestCart();
              }
            } catch (mergeErr) {
              console.error('Lỗi tự động hợp nhất giỏ hàng khi đăng nhập:', mergeErr);
            }
          }
        }

        return { success: true, role: userRole };
      }

      return {
        success: false,
        message: result.message || 'Đăng nhập thất bại'
      };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return {
        success: false,
        message: error.message || 'Không thể kết nối đến máy chủ'
      };
    }
  };

  // 3. Xử lý Đăng ký
  const register = async (userData) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return { success: false, message: error.message || 'Không thể kết nối đến máy chủ' };
    }
  };

  // 4. Xử lý Đăng xuất
  const logout = () => {
    clearAuthData();
    setToken(null);
    setRole('guest');
    setUser(null);
  };

  // 5. Cập nhật thông tin User State
  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = prev ? { ...prev, ...updatedData } : null;
      if (newUser && token) saveAuthData(token, newUser);
      return newUser;
    });
  };

  return (
      <AuthContext.Provider
        value={{
          // --- DỮ LIỆU / TRẠNG THÁI (Variables & States) ---
          token,                     // String: JWT Token
          role,                      // String: Vai trò ('guest', 'customer', 'admin')
          user,                      // Object: Thông tin user hiện tại
          isLoading: loading,        // Boolean: Đang tải dữ liệu hay không (dùng prefix 'is')
          isAuthenticated: !!token,  // Boolean: Đã đăng nhập hay chưa (dùng prefix 'is')

          // --- HÀM / HÀNH ĐỘNG (Functions & Handlers) ---
          handleLogin: login,                 // Hàm thực hiện đăng nhập
          handleRegister: register,           // Hàm thực hiện đăng ký
          handleLogout: logout,               // Hàm thực hiện đăng xuất
          handleUpdateUserProfile: updateUserProfile, // Hàm cập nhật user state
          handleRefreshProfile: fetchUserProfile,     // Hàm gọi lại API lấy profile
        }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);