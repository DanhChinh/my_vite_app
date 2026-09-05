import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/shared/Navbar';
import { useCart } from '../../context/CartContext';

export default function CheckoutPage() {
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '' });
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/customer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.data || { full_name: '', phone: '', address: '' });
      } catch (err) {
        console.error('Lỗi tải thông tin giao hàng:', err);
      }
    };

    fetchProfile();
  }, [navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        items: cartItems.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
        total_price: totalPrice,
        shipping_address: profile.address || 'Địa chỉ chưa cập nhật'
      };

      const res = await axios.post('http://localhost:5000/api/customer/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Đặt hàng thành công!');
        clearCart();
        navigate('/');
      }
    } catch (err) {
      alert('Lỗi đặt hàng: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <div className="container pb-5">
        <h2 className="fw-bold mb-4"><i className="fa-solid fa-credit-card me-2"></i>Xác nhận thanh toán</h2>

        <div className="row">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3">Thông tin giao hàng</h5>
              <p><strong>Họ tên:</strong> {profile.full_name || 'Chưa cập nhật'}</p>
              <p><strong>Số điện thoại:</strong> {profile.phone || 'Chưa cập nhật'}</p>
              <p className="mb-0"><strong>Địa chỉ:</strong> {profile.address || 'Chưa cập nhật'}</p>
              <button className="btn btn-outline-dark btn-sm mt-3 w-25" onClick={() => navigate('/customer/dashboard')}>
                Thay đổi địa chỉ
              </button>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4 bg-white">
              <h5 className="fw-bold mb-3">Đơn hàng của bạn</h5>
              {cartItems.map(item => (
                <div key={item.id} className="d-flex justify-content-between mb-2 small">
                  <span>{item.name} (x{item.quantity})</span>
                  <span className="fw-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-danger">
                <span>Tổng cộng:</span>
                <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <button className="btn btn-dark w-100 fw-bold py-2" onClick={handlePlaceOrder}>
                Xác nhận đặt hàng ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
