import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory, onPriceChange }) {
  return (
    <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
      <h6 className="fw-bold mb-3">
        <i className="fa-solid fa-filter me-2 text-warning"></i>Danh Mục Sản Phẩm
      </h6>

      <div className="list-group list-group-flush mb-4">
        <button
          className={`list-group-item list-group-item-action border-0 rounded-2 mb-1 ${selectedCategory === '' ? 'active fw-bold' : ''}`}
          onClick={() => onSelectCategory('')}
        >
          Tất cả sản phẩm
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`list-group-item list-group-item-action border-0 rounded-2 mb-1 ${selectedCategory === cat.id ? 'active fw-bold' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <h6 className="fw-bold mb-3">Lọc Theo Giá</h6>
      <div className="d-flex flex-column gap-2">
        <button className="btn btn-outline-secondary btn-sm text-start" onClick={() => onPriceChange(0, 1000000)}>
          Dưới 1.000.000đ
        </button>
        <button className="btn btn-outline-secondary btn-sm text-start" onClick={() => onPriceChange(1000000, 5000000)}>
          1.000.000đ - 5.000.000đ
        </button>
        <button className="btn btn-outline-secondary btn-sm text-start" onClick={() => onPriceChange(5000000, 99999999)}>
          Trên 5.000.000đ
        </button>
      </div>
    </div>
  );
}