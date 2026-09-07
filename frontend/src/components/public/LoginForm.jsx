import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSuccess, showCloseButton = false, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setLoading(true);

    try {
      const result = await login(cleanUsername, password);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card shadow-sm border-0 bg-white p-4"
      style={{ width: '100%', maxWidth: '400px', borderRadius: '1rem' }}
      onClick={(event) => event.stopPropagation()}
    >
      {showCloseButton && (
        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn-close"
            aria-label="Đóng đăng nhập"
            onClick={onClose}
          />
        </div>
      )}

      <div className="text-center mb-4">
        <div
          className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '60px', height: '60px' }}
        >
          <i className="fa-solid fa-lock fs-4" />
        </div>
        <h3 id="login-title" className="fw-bold">
          Đăng nhập
        </h3>
        <p className="text-muted small">Vui lòng nhập thông tin tài khoản</p>
      </div>

      {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label fw-semibold small">Tên đăng nhập / Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nhập username..."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold small">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-dark w-100 py-2 fw-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>

        <button
          type="button"
          className="btn btn-link w-100 mt-2 text-decoration-none text-muted small"
          onClick={() => {
            if (onClose) onClose();
            navigate('/register');
          }}
        >
          Chưa có tài khoản? <span className="text-dark fw-bold">Tạo tài khoản mới</span>
        </button>
      </form>
    </div>
  );
}