import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerSidebar from '../components/customer/CustomerSidebar';

export default function CustomerLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="container my-4">
      <div className="row g-4">
        {/* Cột trái cố định: Sidebar */}
        <div className="col-lg-3 col-md-4">
          <CustomerSidebar />
        </div>

        {/* Cột phải thay đổi động: Outlet */}
        <div className="col-lg-9 col-md-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}