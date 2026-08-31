// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <-- Import hook

export default function Navbar() {
  const { cartCount } = useCart(); // <-- Lấy số lượng động từ context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || 'customer');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    alert('Đăng xuất thành công!');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-decoration-none">
          <i className="fa-solid fa-mobile-screen-button me-2 text-warning"></i>TechStore Pro
        </Link>

        <div className="d-flex align-items-center gap-3">
            {
                userRole === 'customer' && (          
            <Link to="/cart" className="btn btn-outline-light position-relative btn-sm">
            <i className="fa-solid fa-cart-shopping me-1"></i> Giỏ hàng
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </Link>)
            }

          {isLoggedIn ? (
            <div className="dropdown">
              <button className="btn btn-outline-light btn-sm dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                <i className="fa-solid fa-user-circle me-1 text-warning"></i> Tài khoản
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                {userRole === 'customer' && (
                  <li><Link className="dropdown-item py-2" to="/customer/dashboard"><i className="fa-solid fa-id-card me-2 text-muted"></i> Hồ sơ cá nhân</Link></li>
                )}
                {userRole === 'admin' && (
                  <li><Link className="dropdown-item py-2" to="/admin"><i className="fa-solid fa-gauge me-2 text-muted"></i> Trang quản trị</Link></li>
                )}
                {userRole === 'staff' && (
                  <li><Link className="dropdown-item py-2" to="/staff/dashboard"><i className="fa-solid fa-boxes-stacked me-2 text-muted"></i> Khu vực làm việc</Link></li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-light btn-sm fw-bold">
              <i className="fa-solid fa-right-to-bracket me-1"></i> Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}