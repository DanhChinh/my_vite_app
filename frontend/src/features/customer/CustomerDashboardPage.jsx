import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/shared/Navbar';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({ full_name: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!token || role !== 'customer') {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomerInfo(res.data.data || { full_name: '', phone: '', address: '' });
      } catch (err) {
        console.error('Lỗi lấy profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/customer/profile', customerInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Cập nhật thông tin thành công!');
        setIsEditing(false);
      }
    } catch (err) {
      alert('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-dark" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4" style={{ maxWidth: '800px' }}>
        <div className="card border-0 shadow-sm p-4 bg-white">
          <h3 className="fw-bold mb-3"><i className="fa-solid fa-user-circle me-2 text-dark"></i>Hồ Sơ Khách Hàng</h3>
          <p className="text-muted small">Quản lý thông tin giao hàng và lịch sử mua sắm của bạn tại TechStore.</p>
          <hr />

          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Họ và tên</label>
            <input
              type="text"
              className="form-control"
              value={customerInfo.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Số điện thoại nhận hàng</label>
            <input
              type="text"
              className="form-control"
              value={customerInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted fw-bold">Địa chỉ giao hàng mặc định</label>
            <textarea
              className="form-control"
              rows="3"
              value={customerInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {isEditing ? (
              <>
                <button className="btn btn-dark fw-bold px-4" onClick={handleSave}>Lưu thay đổi</button>
                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Hủy</button>
              </>
            ) : (
              <button className="btn btn-dark fw-bold px-4" onClick={() => setIsEditing(true)}>Cập nhật thông tin</button>
            )}
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
