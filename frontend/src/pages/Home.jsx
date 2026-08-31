// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // <-- Import hook giỏ hàng

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Lấy hàm addToCart từ bộ quản lý toàn cục
  const { addToCart } = useCart();

  // 1. Tải danh mục khi khởi động trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Tải sản phẩm (Tự động gọi lại khi người dùng đổi danh mục lọc)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/products';
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }
        const res = await axios.get(url);
        setProducts(res.data.data);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar không cần truyền cartCount cứng nữa vì đã tự đồng bộ qua Context */}
      <Navbar />

      {/* Banner Quảng cáo */}
      <div className="bg-dark text-white py-5 mb-4 text-center shadow-sm">
        <div className="container">
          <h1 className="fw-bold display-5">TechStore Pro - Siêu Hội Công Nghệ</h1>
          <p className="lead text-muted">Điện thoại, Laptop, Phụ kiện chính hãng giá tốt nhất.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row">
          {/* Cột Danh mục (Bộ lọc) */}
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm p-3 bg-white">
              <h5 className="fw-bold mb-3"><i className="fa-solid fa-bars me-2"></i>Danh mục</h5>
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action border-0 py-2 rounded ${selectedCategory === '' ? 'active bg-dark text-white' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    className={`list-group-item list-group-item-action border-0 py-2 rounded ${selectedCategory === cat.slug ? 'active bg-dark text-white' : ''}`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Danh sách sản phẩm */}
          <div className="col-md-9">
            <h4 className="fw-bold mb-3">
              {selectedCategory ? `Sản phẩm theo danh mục` : 'Tất cả sản phẩm nổi bật'}
            </h4>
            
            {loading ? (
              <p className="text-center text-muted py-5">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-muted py-5">Không tìm thấy sản phẩm nào trong danh mục này.</p>
            ) : (
              <div className="row g-3">
                {products.map((item) => (
                  <div key={item.id} className="col-md-4">
                    <div className="card border-0 shadow-sm h-100 p-3 bg-white d-flex flex-column">
                      <div className="bg-secondary bg-opacity-10 rounded mb-3 d-flex align-items-center justify-content-center text-secondary" style={{ height: '150px' }}>
                        <i className="fa-solid fa-laptop-code fs-1"></i>
                      </div>
                      <h6 className="fw-bold text-dark">{item.name}</h6>
                      <p className="text-muted small mb-2 text-truncate">{item.category_name}</p>
                      <div className="mt-auto">
                        <span className="text-danger fw-bold fs-6 d-block mb-2">
                          {Number(item.price).toLocaleString('vi-VN')} đ
                        </span>
                        {/* Kích hoạt hàm addToCart từ Context khi bấm */}
                        <button 
                          className="btn btn-dark btn-sm w-100 fw-bold"
                          onClick={() => addToCart(item)}
                        >
                          <i className="fa-solid fa-cart-plus me-1"></i> Chọn mua
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}