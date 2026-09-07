import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar Admin */}
      <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px' }}>
        <h4 className="fw-bold text-warning text-center my-3">
          <i className="fa-solid fa-user-shield me-2"></i>Admin CP
        </h4>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-1">
            <Link to="/admin" className="nav-link text-white fw-semibold">
              <i className="fa-solid fa-chart-line me-2"></i>Tổng quan
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/admin/products" className="nav-link text-white fw-semibold">
              <i className="fa-solid fa-box me-2"></i>Sản phẩm
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/admin/categories" className="nav-link text-white fw-semibold">
              <i className="fa-solid fa-tags me-2"></i>Danh mục
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link to="/admin/orders" className="nav-link text-white fw-semibold">
              <i className="fa-solid fa-receipt me-2"></i>Đơn hàng
            </Link>
          </li>
        </ul>
        <hr />
        <div className="d-flex align-items-center justify-content-between">
          <span className="small text-muted">{user?.username}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={() => { logout(); navigate('/login'); }}>
            Thoát
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}