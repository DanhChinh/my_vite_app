// src/components/admin/StaffManager.jsx (Cập nhật phần Form)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function StaffManager() {
  const [staffs, setStaffs] = useState([]);
  
  // State form bao gồm các trường dữ liệu mới
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    position: 'Nhân viên'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStaffs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffs(res.data.data);
    } catch (err) {
      console.error('Lỗi tải nhân viên:', err);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  // Xử lý Thêm nhân viên với ràng buộc kiểm tra đặc tả
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra ràng buộc ký tự & khoảng trắng cho tài khoản/mật khẩu
    const noSpaceRegex = /^\S+$/;
    if (!noSpaceRegex.test(form.username) || !noSpaceRegex.test(form.password)) {
      setError('Tên đăng nhập và mật khẩu không được chứa khoảng trắng!');
      return;
    }
    if (form.username.length < 8 || form.username.length > 16 || form.password.length < 8 || form.password.length > 16) {
      setError('Tên đăng nhập và mật khẩu phải từ 8 đến 16 ký tự!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/admin/staff', form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccess('Thêm tài khoản nhân viên thành công!');
        setForm({ username: '', password: '', full_name: '', phone: '', address: '', position: 'Nhân viên' });
        fetchStaffs();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo tài khoản.');
    }
  };

  // Các hàm reset password và delete giữ nguyên...
  // ...

  // Cấp lại mật khẩu
  const handleResetPassword = async (id) => {
    if (!window.confirm('Bạn có chắc muốn cấp lại mật khẩu mặc định (Password123) cho nhân viên này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/admin/staff/${id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xóa nhân viên
  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản nhân viên này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaffs();
    } catch (err) {
      alert('Lỗi xóa nhân viên.');
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4"><i className="fa-solid fa-users-gear me-2"></i>Quản Lý Tài Khoản Nhân Viên</h3>

      {/* Form thêm nhân viên */}
{/* Form thêm nhân viên */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <h5 className="fw-bold mb-3 text-secondary">Cấp tài khoản nhân viên mới</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
        
        <form onSubmit={handleCreateStaff} className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Tên đăng nhập (8-16 ký tự)</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.username} 
              onChange={(e) => setForm({ ...form, username: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Mật khẩu (8-16 ký tự)</label>
            <input 
              type="password" 
              className="form-control" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Họ và tên</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.full_name} 
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Số điện thoại</label>
            <input 
              type="tel" 
              className="form-control" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Chức vụ</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.position} 
              onChange={(e) => setForm({ ...form, position: e.target.value })} 
            />
          </div>
          <div className="col-md-12">
            <label className="form-label small fw-bold">Địa chỉ</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark fw-bold px-4">
              <i className="fa-solid fa-user-plus me-1"></i> Tạo tài khoản
            </button>
          </div>
        </form>
      </div>

      {/* Bảng danh sách nhân viên */}
<div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
  <div className="card-body p-0">
    <div className="table-responsive m-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-dark text-uppercase fs-7">
          <tr>
            <th className="py-3 ps-4">ID</th>
            <th className="py-3">Tên đăng nhập</th>
            <th className="py-3">Họ và tên</th>
            <th className="py-3">Số điện thoại</th>
            <th className="py-3">Chức vụ</th>
            <th className="py-3 text-end pe-4">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map(staff => (
            <tr key={staff.id}>
              <td className="ps-4 fw-bold">#{staff.id}</td>
              <td><span className="badge bg-dark">{staff.username}</span></td>
              <td className="fw-semibold text-primary">{staff.full_name || 'Chưa cập nhật'}</td>
              <td>{staff.phone || 'Chưa có'}</td>
              <td><span className="badge bg-secondary">{staff.position || 'Nhân viên'}</span></td>
              <td className="text-end pe-4">
                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleResetPassword(staff.user_id)} title="Cấp lại mật khẩu">
                  <i className="fa-solid fa-key"></i> Reset MK
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStaff(staff.id)} title="Xóa tài khoản">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
}