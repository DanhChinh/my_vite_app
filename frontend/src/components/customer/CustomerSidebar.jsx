import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/cart');
    }
  };

  return (
    <div className="card border-0 shadow-sm p-3">
      {/* Thông tin tài khoản ngắn gọn */}
      <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
        <div
          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
          style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
        >
          {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="overflow-hidden">
          <h6 className="mb-0 text-truncate fw-bold">{user?.full_name || user?.name || 'Khách hàng'}</h6>
          <small className="text-muted text-truncate d-block">{user?.email}</small>
        </div>
      </div>

      {/* Menu Điều hướng (Đã bỏ Tổng quan) */}
      <div className="nav flex-column nav-pills gap-1">
        <NavLink
          to="/customer/orders"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
              isActive ? 'bg-primary text-white fw-semibold' : 'text-dark'
            }`
          }
        >
          <i className="bi bi-bag-check"></i>
          <span>Đơn hàng của tôi</span>
        </NavLink>

        <NavLink
          to="/customer/profile"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
              isActive ? 'bg-primary text-white fw-semibold' : 'text-dark'
            }`
          }
        >
          <i className="bi bi-person-gear"></i>
          <span>Thông tin tài khoản</span>
        </NavLink>

        <NavLink
          to="/customer/addresses"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
              isActive ? 'bg-primary text-white fw-semibold' : 'text-dark'
            }`
          }
        >
          <i className="bi bi-geo-alt"></i>
          <span>Sổ địa chỉ</span>
        </NavLink>

        <hr className="my-2" />

        <button
          onClick={handleLogout}
          className="nav-link d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-danger text-start border-0 bg-transparent"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}