import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import publicService from '../services/publicService';
import customerService from '../services/customerService';
import adminService from '../services/adminService'; // Nhớ import adminService (nếu có)
import { getGuestSessionId, clearGuestSessionId } from '../utils/auth';

import {
  saveAuthToken,
  clearAuthToken,
  getUserRole,
} from '../utils/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => getUserRole() || 'guest');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log('AuthProvider initialized with token:', token, 'role:', role);

  // 1. Tải thông tin Profile phù hợp theo Role
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      let result;

      // Phân nhánh API gọi theo vai trò (Role)
      if (role === 'customer') {
        result = await customerService.getProfile();
      } else if (role === 'admin' && adminService?.getProfile) {
        result = await adminService.getProfile();
      } else {
        // Nếu là Admin/Staff nhưng chưa có API Profile riêng, giữ nguyên dữ liệu cơ bản từ Token/State
        setLoading(false);
        return;
      }
      // console.log('fetchUserProfile result:', result);

      if (result && result.success) {
        setUser(result.data);
      } else if (result && result.status === 401) {
        // Chỉ logout khi Token hết hạn hoặc không hợp lệ (401)
        logout();
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

// 2. Xử lý Đăng nhập
  const login = async (username, password) => {
    try {
      const result = await publicService.login({ username, password });
      console.log("publicService.login",result)

      if (result.success) {
        const newToken = result.token;
        const userRole = result.role;
        const userData = {
          username: result.username,
          role: result.role
        };

        // Lưu thông tin xác thực vào Storage & State
        saveAuthToken(newToken, userRole);
        setToken(newToken);
        setRole(userRole);
        setUser(userData);

        // ==========================================
        // BỔ SUNG: Hợp nhất giỏ hàng vãng lai (Guest Cart)
        // ==========================================
        if (userRole === 'customer') {
          const guestSessionId = getGuestSessionId();
          if (guestSessionId) {
            try {
              const mergeRes = await customerService.mergeGuestCart(guestSessionId);
              console.log("customerService.mergeGuestCart", mergeRes)
              if (mergeRes.success) {
                clearGuestSessionId(); // Xóa session vãng lai sau khi merge thành công
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
      const result = await publicService.register(userData);
      return result;
    } catch (error) {
      return { success: false, message: error.message || 'Không thể kết nối đến máy chủ' };
    }
  };

  // 4. Xử lý Đăng xuất
  const logout = () => {
    clearAuthToken();
    setToken(null);
    setRole('guest');
    setUser(null);
  };

  // 5. Cập nhật thông tin User
  const updateUserProfile = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUserProfile,
        refreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);