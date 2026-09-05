import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);

        const userRole = response.data.role;

        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'staff') navigate('/staff');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

  return (
    <div className="bg-light vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm border-0 bg-white p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
        <div className="text-center mb-4">
          <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
            <i className="fa-solid fa-lock fs-4"></i>
          </div>
          <h3 className="fw-bold">Đăng Nhập</h3>
          <p className="text-muted small">Vui lòng nhập thông tin tài khoản</p>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Tài khoản</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark w-100 py-2 fw-bold">Đăng Nhập</button>
        </form>
      </div>
    </div>
  );
}
