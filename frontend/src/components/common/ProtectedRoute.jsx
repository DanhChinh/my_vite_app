// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. Nếu chưa đăng nhập (không có token) -> Chuyển hướng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có quy định danh sách quyền được phép (allowedRoles) mà user không thuộc quyền đó -> Về trang chủ
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho phép hiển thị trang
  return children;
}