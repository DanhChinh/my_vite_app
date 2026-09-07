import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastProvider';
import publicService from '../../services/publicService'; // Nhập service đăng ký public

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast() || { showToast: console.log };

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    phone: '',
    full_name: '',
    gender: 'other',
    date_of_birth: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation phía Client
    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 8 ký tự!');
      return;
    }

    setLoading(true);

    // Chuẩn hóa Payload tương thích 100% với Backend Controller
    const payload = {
      username: formData.username.trim(),
      password: formData.password,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      full_name: formData.full_name.trim(),
      gender: formData.gender,
      date_of_birth: formData.date_of_birth || null
    };

    try {
      // Gọi qua publicService.register thay cho fetch trực tiếp
      const response = await publicService.register(payload);

      if (response?.data?.success || response?.success) {
        showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
        navigate('/login');
      } else {
        setErrorMsg(response?.data?.message || response?.message || 'Đăng ký thất bại, vui lòng thử lại!');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Có lỗi kết nối xảy ra. Vui lòng thử lại sau!';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-sm p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Tạo tài khoản mới</h3>
            <p className="text-muted small">Điền thông tin để trải nghiệm dịch vụ mua sắm</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* THÔNG TIN TÀI KHOẢN (users) */}
            <h6 className="fw-bold border-bottom pb-2 mb-3 text-secondary">
              <i className="bi bi-shield-lock me-2"></i>Thông tin đăng nhập
            </h6>

            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Tên đăng nhập (<span className="text-danger">*</span>)
              </label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Mật khẩu (<span className="text-danger">*</span>)
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Ít nhất 8 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Xác nhận mật khẩu (<span className="text-danger">*</span>)
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* THÔNG TIN KHÁCH HÀNG (customers & users contact) */}
            <h6 className="fw-bold border-bottom pb-2 my-3 text-secondary">
              <i className="bi bi-person me-2"></i>Thông tin cá nhân
            </h6>

            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Họ và tên (<span className="text-danger">*</span>)
              </label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="0987654321"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Giới tính</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Ngày sinh</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Đã có tài khoản? </span>
            <Link to="/login" className="text-primary text-decoration-none fw-semibold small">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}