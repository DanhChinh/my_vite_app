// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../../context/ToastProvider';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const { showToast } = useToast();

  useEffect(() => {
    if (token && allowedRoles && !allowedRoles.includes(role)) {
      showToast('Bạn không có quyền truy cập trang này!', 'warning');
    }
  }, [allowedRoles, role, showToast, token]);

  // 1. Nếu chưa đăng nhập (không có token) -> Chuyển hướng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu có quy định danh sách quyền được phép (allowedRoles) mà user không thuộc quyền đó -> Về trang chủ
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho phép hiển thị trang
  return children;
}



// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// export default function ProtectedRoute({ allowedRoles }) {
//   const { isAuthenticated, role, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-dark"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

//   return <Outlet />;
// }