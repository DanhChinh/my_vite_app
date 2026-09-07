import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastProvider';
import { formatCurrency } from '../../utils/formatters';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    const res = await addToCart(product, 1);
    if (res?.success) {
      showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
    } else {
      showToast(res?.message || 'Có lỗi xảy ra', 'danger');
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden product-card">
      <div className="position-relative">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200'}
          className="card-img-top object-fit-cover"
          alt={product.name}
          style={{ height: '180px' }}
        />
        {product.discount > 0 && (
          <span className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 small fw-bold rounded-end">
            -{product.discount}%
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        <span className="text-muted small mb-1">{product.category_name || 'Sản phẩm'}</span>
        <h6 className="card-title fw-bold text-truncate mb-2" title={product.name}>
          {product.name}
        </h6>
        <div className="mt-auto mb-3">
          <span className="text-danger fw-bold fs-5 me-2">
            {formatCurrency(product.price)}
          </span>
          {product.old_price && (
            <span className="text-muted text-decoration-line-through small">
              {formatCurrency(product.old_price)}
            </span>
          )}
        </div>

        <div className="d-flex gap-2">
          <Link to={`/product/${product.id}`} className="btn btn-outline-dark btn-sm flex-grow-1">
            Chi tiết
          </Link>
          <button className="btn btn-warning btn-sm" onClick={handleAddToCart} title="Thêm vào giỏ hàng">
            <i className="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}