import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, cartCount } = useCart();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container pb-5">
        <h2 className="fw-bold mb-4"><i className="fa-solid fa-cart-shopping me-2"></i>Giỏ hàng của bạn</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-5 bg-white shadow-sm rounded">
            <p className="text-muted fs-5 mb-3">Giỏ hàng của bạn đang trống.</p>
            <button className="btn btn-dark" onClick={() => navigate('/')}>Quay lại mua sắm</button>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm p-3 bg-white">
                {cartItems.map(item => (
                  <div key={item.id} className="d-flex align-items-center justify-content-between border-bottom py-3">
                    <div>
                      <h6 className="fw-bold mb-1">{item.name}</h6>
                      <span className="text-danger fw-bold">{Number(item.price).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span className="fw-bold px-2">{item.quantity}</span>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      <button className="btn btn-outline-danger btn-sm ms-3" onClick={() => removeItem(item.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 bg-white">
                <h5 className="fw-bold mb-3">Tổng thanh toán</h5>
                <div className="d-flex justify-content-between mb-3 fs-5 fw-bold text-danger">
                  <span>Tổng tiền:</span>
                  <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
                <button className="btn btn-dark w-100 fw-bold py-2" onClick={() => navigate('/checkout')}>
                  Tiến hành đặt hàng
                </button>
                <small className="text-muted mt-3 d-block text-center">{cartCount} sản phẩm trong giỏ hàng</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
