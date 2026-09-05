// src/components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : { Value: value };
  } catch {
    return { Value: value };
  }
};

const formatAttributeValue = (value) => (
  typeof value === 'object' ? JSON.stringify(value) : String(value)
);

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Format giá tiền sang VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xử lý khi bấm nút "Xem chi tiết"
  const handleViewDetail = () => {
    navigate(`/products/${product.id}`); // Chuyển hướng đến trang chi tiết sản phẩm
  };

  // Xử lý khi bấm nút "Mua"
  const handleBuy = () => {
    const token = localStorage.getItem('token'); // Kiểm tra token đăng nhập

    if (!token) {
      alert('Vui lòng đăng nhập để tiến hành mua hàng!');
      navigate('/login'); // Chưa đăng nhập -> đá sang trang login
    } else {
      // Đã đăng nhập -> Cho phép mua hàng hoặc thêm vào giỏ hàng
      alert(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng!`);
      // Thực hiện logic gọi API thêm vào giỏ hàng ở đây nếu có
    }
  };

  return (
    <div className="col-md-3 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm border-0 d-flex flex-column">
        {/* Khu vực ảnh sản phẩm */}
        <div className="position-relative bg-white text-center p-3" style={{ height: '200px' }}>
          <img 
            src={product.image || 'https://via.placeholder.com/150'} 
            alt={product.name} 
            className="img-fluid h-100" 
            style={{ objectFit: 'contain' }}
          />
          {product.category_name && (
            <span className="badge bg-secondary position-absolute top-0 start-0 m-2 small">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Nội dung thông tin */}
        <div className="card-body d-flex flex-column">
          <h6 className="card-title fw-bold text-dark text-truncate-2" style={{ minHeight: '40px' }}>
            {product.name}
          </h6>
          
          {/* Hiển thị thông số cấu hình JSON thu gọn */}
          {product.attributes && (
            <div className="text-muted small mb-2">
              {Object.entries(parseAttributes(product.attributes)).slice(0, 2).map(([key, val]) => (
                <span key={key} className="me-1 bg-light px-1 rounded border small">
                  {formatAttributeValue(val)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <p className="text-success fw-bold fs-6 mb-3">{formatPrice(product.price)}</p>
            
            {/* Hàng nút bấm: Xem chi tiết bên trái, Mua bên phải */}
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-dark btn-sm w-50 fw-bold"
                onClick={handleViewDetail}
              >
                Xem chi tiết
              </button>
              <button 
                className="btn btn-success btn-sm w-50 fw-bold"
                onClick={handleBuy}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}