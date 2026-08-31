// src/pages/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  // Dữ liệu giả lập hồ sơ khách hàng khớp với bảng customers
  const [customerInfo, setCustomerInfo] = useState({
    full_name: 'Trần Văn Khách',
    phone: '0987654321',
    address: '123 Cầu Giấy, Hà Nội'
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!localStorage.getItem('token') || role !== 'customer') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="bg-light min-vh-100">
      <Navbar cartCount={2} />

      <div className="container py-4" style={{ maxWidth: '800px' }}>
        <div className="card border-0 shadow-sm p-4 bg-white">
          <h3 className="fw-bold mb-3"><i className="fa-solid fa-user-circle me-2 text-dark"></i>Hồ Sơ Khách Hàng</h3>
          <p className="text-muted small">Quản lý thông tin giao hàng và lịch sử mua sắm của bạn tại TechStore.</p>
          <hr />

          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Họ và tên</label>
            <input type="text" className="form-control" value={customerInfo.full_name} readOnly />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Số điện thoại nhận hàng</label>
            <input type="text" className="form-control" value={customerInfo.phone} readOnly />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted fw-bold">Địa chỉ giao hàng mặc định</label>
            <textarea className="form-control" rows="2" value={customerInfo.address} readOnly />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-dark fw-bold px-4">Cập nhật thông tin</button>
            <button className="btn btn-outline-danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}