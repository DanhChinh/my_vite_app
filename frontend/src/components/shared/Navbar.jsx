// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const syncUser = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(Boolean(token));
    setUserRole(token ? role || 'customer' : '');
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole('');
    setIsMenuOpen(false);
    alert('Đăng xuất thành công!');
    navigate('/login');
  };

  const roleLabels = {
    customer: 'Khách hàng',
    staff: 'Nhân viên',
    admin: 'Quản trị viên'
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const linkClass = (path) => `nav-link ${isActive(path) ? 'active fw-bold text-warning' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
          <i className="fa-solid fa-mobile-screen-button me-2 text-warning"></i>TechStore Pro
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
              <Link className={linkClass('/')} to="/">Trang chủ</Link>
            </li>
            {(!isLoggedIn || userRole === 'customer') && (
              <li className="nav-item">
                <Link className={linkClass('/cart')} to="/cart">Giỏ hàng</Link>
              </li>
            )}
            {userRole === 'customer' && (
              <li className="nav-item">
                <Link className={linkClass('/customer/dashboard')} to="/customer/dashboard">Tài khoản</Link>
              </li>
            )}
            {userRole === 'staff' && (
              <li className="nav-item">
                <Link className={linkClass('/staff')} to="/staff">Khu vực làm việc</Link>
              </li>
            )}
            {userRole === 'admin' && (
              <li className="nav-item">
                <Link className={linkClass('/admin')} to="/admin">Trang quản trị</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-lg-center gap-3">
            {(!isLoggedIn || userRole === 'customer') && (
              <Link to="/cart" className="btn btn-outline-light position-relative btn-sm">
                <i className="fa-solid fa-cart-shopping me-1"></i>Giỏ hàng
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn ? (
              <div className="dropdown">
                <button className="btn btn-outline-light btn-sm dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                  <i className="fa-solid fa-user-circle me-1 text-warning"></i>{roleLabels[userRole] || 'Tài khoản'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  {userRole === 'customer' && <li><Link className="dropdown-item py-2" to="/customer/dashboard"><i className="fa-solid fa-id-card me-2 text-muted"></i>Hồ sơ cá nhân</Link></li>}
                  {userRole === 'admin' && <li><Link className="dropdown-item py-2" to="/admin"><i className="fa-solid fa-gauge me-2 text-muted"></i>Trang quản trị</Link></li>}
                  {userRole === 'staff' && <li><Link className="dropdown-item py-2" to="/staff"><i className="fa-solid fa-boxes-stacked me-2 text-muted"></i>Khu vực làm việc</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-light btn-sm fw-bold">
                <i className="fa-solid fa-right-to-bracket me-1"></i>Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}