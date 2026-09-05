// src/components/CategoryList.jsx
import React from 'react';

export default function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="d-flex overflow-auto py-3 mb-4 gap-2 scrollbar-none">
      <button 
        className={`btn btn-sm px-3 rounded-pill ${!selectedCategory ? 'btn-dark' : 'btn-outline-dark'}`}
        onClick={() => onSelectCategory(null)}
      >
        Tất cả sản phẩm
      </button>
      {categories.map((cat) => (
        <button 
          key={cat.id}
          className={`btn btn-sm px-3 rounded-pill text-nowrap ${selectedCategory === cat.id ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}