export { default } from './Navbar';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Header({ onOpenLogin }) {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-warning" to="/">
          <i className="fa-solid fa-store me-2"></i>E-Shop
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Giỏ hàng */}
            <Link to="/cart" className="btn btn-outline-light position-relative">
              <i className="fa-solid fa-cart-shopping"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Menu Tài khoản */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-light dropdown-toggle fw-bold"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fa-solid fa-user me-2"></i>{user?.username || 'Tài khoản'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow">
                  {role === 'admin' && (
                    <li>
                      <Link className="dropdown-menu-item dropdown-item text-danger fw-bold" to="/admin">
                        <i className="fa-solid fa-user-shield me-2"></i>Trang Admin
                      </Link>
                    </li>
                  )}
                  {role === 'customer' && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          <i className="fa-solid fa-id-card me-2"></i>Hồ sơ của tôi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/orders">
                          <i className="fa-solid fa-box-archive me-2"></i>Đơn mua
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light" onClick={onOpenLogin}>
                  Đăng nhập
                </button>
                <button className="btn btn-warning fw-bold" onClick={() => navigate('/register')}>
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}