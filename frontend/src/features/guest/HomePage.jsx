import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import { useCart } from '../../context/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/products';
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }
        const res = await axios.get(url);
        setProducts(res.data.data || []);
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
      <Navbar />

      <div className="bg-dark text-white py-5 mb-4 text-center shadow-sm">
        <div className="container">
          <h1 className="fw-bold display-5">TechStore Pro - Siêu Hội Công Nghệ</h1>
          <p className="lead text-muted">Điện thoại, Laptop, Phụ kiện chính hãng giá tốt nhất.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row">
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

          <div className="col-md-9">
            <h4 className="fw-bold mb-3">
              {selectedCategory ? 'Sản phẩm theo danh mục' : 'Tất cả sản phẩm nổi bật'}
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
                      <div className="bg-secondary bg-opacity-10 rounded mb-3 d-flex align-items-center justify-content-center text-secondary overflow-hidden" style={{ height: '150px' }}>
                        {item.images?.[0]?.image_url ? (
                          <img
                            src={`http://localhost:5000${item.images[0].image_url}`}
                            alt={item.name}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <i className="fa-solid fa-laptop-code fs-1"></i>
                        )}
                      </div>
                      <button type="button" className="btn btn-link text-start text-decoration-none p-0" onClick={() => navigate(`/products/${item.id}`)}>
                        <h6 className="fw-bold text-dark mb-0">{item.name}</h6>
                      </button>
                      <p className="text-muted small mb-2 text-truncate">{item.category_name}</p>
                      <div className="mt-auto">
                        <span className="text-danger fw-bold fs-6 d-block mb-2">
                          {Number(item.price).toLocaleString('vi-VN')} đ
                        </span>
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-outline-dark btn-sm flex-grow-1" onClick={() => navigate(`/products/${item.id}`)}>
                            Chi tiết
                          </button>
                          <button type="button" className="btn btn-dark btn-sm flex-grow-1" onClick={() => addToCart(item)}>
                            <i className="fa-solid fa-cart-plus me-1"></i>Chọn mua
                          </button>
                        </div>
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
