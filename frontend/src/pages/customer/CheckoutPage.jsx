import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMER_ENDPOINTS } from '../../constants/api';
import customerService from '../../services/customerService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
  const { user, token, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD'
  });

  const [errors, setErrors] = useState({});

  // 1. Kiểm tra quyền truy cập: Bắt buộc đăng nhập
  useEffect(() => {
    if (!authLoading && !token) {
      alert('Vui lòng đăng nhập để thực hiện thanh toán!');
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [token, authLoading, navigate]);

  // 2. Tự động điền thông tin user và tải sổ địa chỉ từ API
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }

    if (token) {
      customerService.getAddresses()
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setAddresses(res.data);
            // Tìm địa chỉ mặc định hoặc lấy cái đầu tiên
            const defaultAddr = res.data.find(item => item.is_default === 1) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              fullName: defaultAddr.recipient_name || prev.fullName,
              phone: defaultAddr.phone || prev.phone,
              address: defaultAddr.address_line || ''
            }));
          }
        })
        .catch((err) => console.error('Không thể tải sổ địa chỉ:', err));
    }
  }, [user, token]);

  // Xử lý khi người dùng chọn một địa chỉ có sẵn trong sổ địa chỉ
  const handleSelectSavedAddress = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    if (addressId === 'other') {
      setFormData(prev => ({ ...prev, address: '' }));
      return;
    }

    const found = addresses.find(item => String(item.id) === String(addressId));
    if (found) {
      setFormData(prev => ({
        ...prev,
        fullName: found.recipient_name || prev.fullName,
        phone: found.phone || prev.phone,
        address: found.address_line || ''
      }));
      // Xóa lỗi địa chỉ nếu có
      if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    console.log(formData);
    
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang rỗng!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(CUSTOMER_ENDPOINTS.CREATE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_info: {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            note: formData.note
          },
          payment_method: formData.paymentMethod
        })
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        alert('Đặt hàng thành công!');
        const orderId = result.order_id || result.data?.id || '';
        navigate(`/order-success/${orderId}`);
      } else {
        alert(result.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="container my-5 text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Đang xác thực thông tin...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container my-5 text-center py-5">
        <h3 className="fw-bold mb-3">Giỏ hàng của bạn đang trống</h3>
        <p className="text-muted mb-4">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <Link to="/products" className="btn btn-primary px-4">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4 text-uppercase">Thanh toán đơn hàng</h2>

      <form onSubmit={handleSubmitOrder}>
        <div className="row g-4">
          {/* Cột trái: Thông tin nhận hàng & Thanh toán */}
          <div className="col-lg-7">
            {/* Card thông tin nhận hàng */}
            <div className="card border-0 shadow-sm p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title text-primary fw-bold mb-0">Thông tin giao hàng</h4>
                <Link to="/customer/addresses" className="small text-decoration-none fw-semibold">
                  <i className="bi bi-geo-alt me-1"></i> Quản lý sổ địa chỉ
                </Link>
              </div>

              {/* Chọn nhanh từ Sổ địa chỉ nếu có */}
              {addresses.length > 0 && (
                <div className="mb-3 p-3 bg-light rounded-3 border">
                  <label className="form-label fw-semibold small text-muted mb-1">
                    Chọn địa chỉ từ Sổ địa chỉ của bạn:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedAddressId}
                    onChange={handleSelectSavedAddress}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.recipient_name} - {addr.phone} ({addr.address_line}) {addr.is_default === 1 ? '[Mặc định]' : ''}
                      </option>
                    ))}
                    <option value="other">+ Nhập địa chỉ khác...</option>
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Địa chỉ giao hàng <span className="text-danger">*</span>
                </label>
                <textarea
                  rows="2"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                ></textarea>
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Ghi chú đơn hàng</label>
                <textarea
                  rows="2"
                  className="form-control"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về thời gian giao hàng hoặc chỉ dẫn địa điểm..."
                ></textarea>
              </div>
            </div>

            {/* Card phương thức thanh toán */}
            <div className="card border-0 shadow-sm p-4">
              <h4 className="card-title mb-3 text-primary fw-bold">Phương thức thanh toán</h4>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="paymentCOD"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="paymentCOD">
                  Thanh toán khi nhận hàng (COD)
                </label>
                <div className="text-muted small">Thanh toán bằng tiền mặt khi shiper giao hàng đến.</div>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="paymentBanking"
                  value="BANKING"
                  checked={formData.paymentMethod === 'BANKING'}
                  onChange={handleInputChange}
                />
                <label className="form-check-label fw-semibold" htmlFor="paymentBanking">
                  Chuyển khoản ngân hàng (QR Code)
                </label>
                <div className="text-muted small">Chuyển khoản trực tiếp qua ứng dụng ngân hàng.</div>
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt danh sách sản phẩm & Tổng tiền */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 position-sticky" style={{ top: '20px' }}>
              <h4 className="card-title mb-3 text-primary fw-bold">
                Đơn hàng ({cartItems.length} sản phẩm)
              </h4>

              <div className="overflow-auto mb-3" style={{ maxHeight: '320px' }}>
                {cartItems.map((item) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 0;

                  return (
                    <div key={item.cart_item_id || item.id} className="d-flex align-items-center mb-3 border-bottom pb-2">
                      <img
                        src={item.image_url || item.primary_image || 'https://via.placeholder.com/60'}
                        alt={item.name || item.product_name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        className="rounded me-3"
                      />
                      <div className="flex-grow-1 me-2">
                        <h6 className="mb-0 text-truncate" style={{ maxWidth: '180px' }}>
                          {item.name || item.product_name}
                        </h6>
                        <small className="text-muted">
                          SL: {itemQty} x {itemPrice.toLocaleString('vi-VN')} đ
                        </small>
                      </div>
                      <div className="fw-semibold text-end">
                        {(itemPrice * itemQty).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tạm tính:</span>
                  <span className="fw-semibold">{cartTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí vận chuyển:</span>
                  <span className="text-success fw-semibold">Miễn phí</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-danger">
                  <span>Tổng thanh toán:</span>
                  <span>{cartTotal.toLocaleString('vi-VN')} đ</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-danger w-100 py-3 fw-bold text-uppercase shadow-sm fs-6"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang xử lý đơn hàng...
                    </>
                  ) : (
                    'Xác nhận đặt hàng'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}