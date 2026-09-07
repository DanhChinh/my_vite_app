import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/public/LoginModal';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { token } = useAuth();

  // State quản lý việc hiển thị LoginModal
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Xử lý khi người dùng bấm nút "Tiến hành thanh toán"
  const handleProceedToCheckout = () => {
    if (!token) {
      // Chưa đăng nhập -> Mở Modal Đăng nhập
      setIsLoginOpen(true);
      return;
    }

    // Đã đăng nhập -> Chuyển sang trang Checkout
    navigate('/checkout');
  };

  // Callback kích hoạt sau khi đăng nhập thành công trên Modal
  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container my-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải giỏ hàng...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thông tin giỏ hàng...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container my-5 text-center py-5">
        <div className="mb-4">
          <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
        </div>
        <h3 className="fw-bold mb-3">Giỏ hàng của bạn đang trống</h3>
        <p className="text-muted mb-4">Hãy chọn thêm sản phẩm để tiếp tục mua sắm nhé!</p>
        <Link to="/products" className="btn btn-primary btn-lg px-4">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-uppercase">Giỏ hàng của bạn</h2>

      <div className="row g-4">
        {/* Cột trái: Danh sách sản phẩm trong giỏ hàng */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-3 mb-3">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: '45%' }}>Sản phẩm</th>
                    <th scope="col" className="text-center">Đơn giá</th>
                    <th scope="col" className="text-center">Số lượng</th>
                    <th scope="col" className="text-end">Thành tiền</th>
                    <th scope="col" className="text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 0;
                    const itemTotal = itemPrice * itemQty;
                    const productId = item.product_id || item.id;

                    return (
                      <tr key={item.cart_item_id || productId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.image_url || item.primary_image || 'https://via.placeholder.com/80'}
                              alt={item.name || item.product_name}
                              className="rounded me-3"
                              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-1 text-truncate" style={{ maxWidth: '200px' }}>
                                {item.name || item.product_name}
                              </h6>
                              {item.stock !== undefined && (
                                <small className="text-muted">
                                  Kho: {item.stock} sản phẩm
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {itemPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center">
                            <button
                              className="btn btn-outline-secondary btn-sm px-2"
                              onClick={() => updateQuantity(productId, itemQty - 1)}
                              disabled={itemQty <= 1}
                            >
                              -
                            </button>
                            <span className="mx-3 fw-bold">{itemQty}</span>
                            <button
                              className="btn btn-outline-secondary btn-sm px-2"
                              onClick={() => updateQuantity(productId, itemQty + 1)}
                              disabled={item.stock !== undefined && itemQty >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-danger">
                          {itemTotal.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => removeFromCart(productId)}
                            title="Xóa khỏi giỏ hàng"
                          >
                            xoa
                            <i className="bi bi-trash fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <Link to="/" className="btn btn-outline-primary">
              &larr; Tiếp tục mua hàng
            </Link>
          </div>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng & Nút Thanh toán */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-3 text-primary">Tóm tắt đơn hàng</h4>
            
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tổng số lượng:</span>
              <span className="fw-semibold">
                {cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)} sản phẩm
              </span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Tạm tính:</span>
              <span className="fw-semibold">{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-danger">
              <span>Tổng thanh toán:</span>
              <span>{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn btn-danger w-100 py-3 fw-bold text-uppercase shadow-sm"
            >
              Tiến hành thanh toán
            </button>

            {!token && (
              <p className="text-center text-muted small mt-2 mb-0">
                <i className="bi bi-info-circle me-1"></i>
                Bạn cần đăng nhập để tiến hành thanh toán.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal khi khách vãng lai bấm Thanh toán */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}