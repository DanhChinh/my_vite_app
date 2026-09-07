import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/public/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Lấy trang trước đó người dùng muốn vào (ví dụ: Checkout), mặc định là /customer/orders
  const from = location.state?.from?.pathname || '/customer/orders';

  // LỖI 1: Tự động chuyển hướng nếu người dùng ĐÃ ĐĂNG NHẬP mà cố truy cập vào /login
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // LỖI 2: Chuyển hướng ngay sau khi đăng nhập thành công
  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  if (user) {
    return null; // Ẩn giao diện trong lúc chờ chuyển hướng
  }

  return (
    <div className="d-flex justify-content-center align-items-center my-5">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}