import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
      <img
        src={product.image_url || 'https://via.placeholder.com/300'}
        className="card-img-top object-fit-cover"
        alt={product.name}
        style={{ height: '200px' }}
      />
      <div className="card-body d-flex flex-column">
        <span className="badge bg-light text-dark mb-2 w-auto me-auto">{product.category_name}</span>
        <h6 className="card-title fw-bold text-truncate">{product.name}</h6>
        <p className="text-danger fw-bold fs-5 mt-auto mb-3">
          {formatCurrency(product.price)}
        </p>
        <div className="d-flex gap-2">
          <Link to={`/products/${product.id}`} className="btn btn-outline-dark btn-sm flex-grow-1">
            Chi tiết
          </Link>
          <button className="btn btn-dark btn-sm" onClick={() => onAddToCart(product)}>
            <i className="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}