// src/pages/AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar Admin */}
      <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white" style={{ width: '280px' }}>
        <a href="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <i className="fa-solid fa-user-shield fs-4 me-2 text-warning"></i>
          <span className="fs-5 fw-bold">Admin Portal</span>
        </a>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item">
            <a href="#" className="nav-link active bg-warning text-dark fw-bold"><i className="fa-solid fa-chart-line me-2"></i> Tổng quan</a>
          </li>
          <li><a href="#" className="nav-link text-white"><i className="fa-solid fa-boxes-stacked me-2"></i> Quản lý Sản phẩm</a></li>
          <li><a href="#" className="nav-link text-white"><i className="fa-solid fa-list me-2"></i> Quản lý Danh mục</a></li>
          <li><a href="#" className="nav-link text-white"><i className="fa-solid fa-users-gear me-2"></i> Quản lý Nhân sự</a></li>
          <li><a href="#" className="nav-link text-white"><i className="fa-solid fa-cart-shopping me-2"></i> Quản lý Đơn hàng</a></li>
        </ul>
        <hr />
        <button onClick={handleLogout} className="btn btn-outline-danger w-20 text-start">
          <i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="fw-bold mb-4">Xin chào, Quản Trị Viên!</h2>
        
        {/* Thẻ thống kê nhanh */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <h6 className="text-muted">Tổng doanh thu</h6>
              <h3 className="fw-bold text-success">145.800.000 đ</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <h6 className="text-muted">Tổng sản phẩm</h6>
              <h3 className="fw-bold text-primary">32 sản phẩm</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <h6 className="text-muted">Đơn hàng mới</h6>
              <h3 className="fw-bold text-danger">12 đơn</h3>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 bg-white">
          <h5 className="fw-bold mb-3">Hoạt động hệ thống gần đây</h5>
          <p className="text-muted">Hệ thống hoạt động ổn định. Các dữ liệu kho hàng và nhân sự đã được đồng bộ.</p>
        </div>
      </div>
    </div>
  );
}