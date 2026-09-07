import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastProvider';
import Login from '../public/LoginModal';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { showToast } = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Tự động đóng menu điều hướng khi đổi đường dẫn (trên mobile)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    showToast('Đăng xuất thành công!', 'success');
    navigate('/');
  };

  const roleLabels = {
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    admin: 'Quản trị viên',
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const linkClass = (path) =>
    `nav-link ${isActive(path) ? 'active fw-bold text-warning' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
          <i className="fa-solid fa-mobile-screen-button me-2 text-warning"></i>
          TechStore Pro
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label="Mở menu điều hướng"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className={linkClass('/')} to="/">
                Trang chủ
              </Link>
            </li>

            {role === 'customer' && (
              <li className="nav-item">
                <Link
                  className={linkClass('/customer/')}
                  to="/customer/"
                >
                  <i className="fa-solid fa-user me-2" />
                  Cá nhân
                </Link>
              </li>
            )}Login

            {role === 'staff' && (
              <li className="nav-item">
                <Link className={linkClass('/staff')} to="/staff">
                  <i className="fa-solid fa-clipboard-list me-2" />
                  Khu vực làm việc
                </Link>
              </li>
            )}

            {role === 'admin' && (
              <li className="nav-item">
                <Link className={linkClass('/admin')} to="/admin">
                  <i className="fa-solid fa-gauge-high me-2" />
                  Quản trị
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-lg-center gap-3">
            {/* Giỏ hàng chỉ hiện với Khách hàng hoặc Khách vãng lai */}
            {(!isAuthenticated || role === 'customer') && (
              <Link
                to="/cart"
                className="btn btn-outline-light position-relative btn-sm"
              >
                <i className="fa-solid fa-cart-shopping me-1"></i>
                Giỏ hàng
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  className="account-summary text-decoration-none text-light d-flex align-items-center gap-2"
                  to={
                    role === 'customer'
                      ? '/customer'
                      : role === 'admin'
                      ? '/admin'
                      : '/staff'
                  }
                >
                  <span className="account-avatar bg-secondary rounded-circle px-2 py-1">
                    <i className="fa-solid fa-user" />
                  </span>
                  <span className="account-details d-flex flex-column" style={{ fontSize: '0.85rem' }}>
                    <strong>{user?.fullName || roleLabels[role] || 'Tài khoản'}</strong>
                    <small className="text-muted">{user?.email || 'Thông tin cá nhân'}</small>
                  </span>
                </Link>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  <i className="fa-solid fa-right-from-bracket me-1" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-light btn-sm fw-bold"
                onClick={() => setIsLoginOpen(true)}
              >
                <i className="fa-solid fa-right-to-bracket me-1"></i>
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoginOpen && <Login modal onClose={() => setIsLoginOpen(false)} />}
    </nav>
  );
}