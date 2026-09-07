import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BannerCarousel from '../../components/public/BannerCarousel';
import CategoryFilter from '../../components/public/CategoryFilter';
import ProductCard from '../../components/public/ProductCard';
import { publicService } from '../../services/publicService';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 999999999 });
  const [sortBy, setSortBy] = useState('newest');
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get('search') || '';

  // 1. Tải danh mục khi mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await publicService.getCategories();
        setCategories(res?.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Tải danh sách sản phẩm khi các bộ lọc hoặc trang thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 12,
          category: selectedCategory,
          search: searchQuery,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          sort: sortBy
        };
        const res = await publicService.getProducts(params);
        setProducts(res?.data?.items || []);
        setTotalPages(res?.data?.totalPages || 1);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, priceRange, sortBy, currentPage]);

  // Xử lý chọn danh mục
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    if (catId) {
      searchParams.set('category', catId);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  // Xử lý lọc giá
  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
  };

  return (
    <div className="container py-4">
      {/* Banner Carousel */}
      <BannerCarousel />

      <div className="row">
        {/* Cột trái: Bộ lọc danh mục & Giá */}
        <div className="col-lg-3 col-md-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onPriceChange={handlePriceChange}
          />
        </div>

        {/* Cột phải: Danh sách sản phẩm */}
        <div className="col-lg-9 col-md-8">
          {/* Thanh công cụ / Tiêu đề */}
          <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm mb-4">
            <div className="fw-bold">
              {searchQuery ? (
                <span>Kết quả tìm kiếm cho: <span className="text-warning">"{searchQuery}"</span></span>
              ) : (
                <span>Tất cả sản phẩm ({products.length})</span>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted text-nowrap">Sắp xếp:</label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
                <option value="popular">Bán chạy nhất</option>
              </select>
            </div>
          </div>

          {/* Render Danh sách sản phẩm */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center bg-white p-5 rounded-3 shadow-sm">
              <i className="fa-solid fa-box-open fs-1 text-muted mb-3"></i>
              <h5>Không tìm thấy sản phẩm phù hợp</h5>
              <p className="text-muted small">Vui lòng thử tìm kiếm từ khóa khác hoặc thay đổi bộ lọc.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {products.map((p) => (
                <div className="col" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-item-btn page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Trước
                  </button>
                </li>
                {[...Array(totalPages)].map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                    <button
                      className="page-item-btn page-link"
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-item-btn page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}