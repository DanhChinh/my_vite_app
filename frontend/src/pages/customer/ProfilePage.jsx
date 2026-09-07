import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastProvider';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast() || { showToast: console.log };

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    showToast('Cập nhật thông tin cá nhân thành công!', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      alert('Mật khẩu mới không khớp nhau!');
      return;
    }
    showToast('Đổi mật khẩu thành công!', 'success');
    setPasswords({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Form Thông tin cá nhân */}
      <div className="card border-0 shadow-sm p-4">
        <h5 className="fw-bold mb-3 pb-2 border-bottom">Thông tin tài khoản</h5>
        <form onSubmit={handleProfileSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Số điện thoại</label>
              <input
                type="tel"
                className="form-control"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Địa chỉ Email (Không thể thay đổi)</label>
              <input type="email" className="form-control bg-light" value={profile.email} disabled />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3 px-4 btn-sm fw-semibold">
            Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Form Đổi mật khẩu */}
      <div className="card border-0 shadow-sm p-4">
        <h5 className="fw-bold mb-3 pb-2 border-bottom">Đổi mật khẩu</h5>
        <form onSubmit={handlePasswordSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="form-control"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-outline-danger mt-3 px-4 btn-sm fw-semibold">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}