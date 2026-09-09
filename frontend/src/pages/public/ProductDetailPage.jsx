import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastProvider';
import { formatCurrency } from '../../utils/formatters';
import ProductCard from '../../components/public/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductDetail(id);
        // Bóc tách dữ liệu linh hoạt (hỗ trợ cả response.data hoặc response trực tiếp)
        const productData = response?.data || response;
        setProduct(productData);

        // Tải sản phẩm liên quan theo danh mục
        if (productData?.category_id) {
          const relatedRes = await productService.getProducts({
            category: productData.category_id,
            limit: 4
          });
          const items = relatedRes?.items || relatedRes?.data?.items || (Array.isArray(relatedRes) ? relatedRes : []);
          setRelatedProducts(items.filter((item) => Number(item.id) !== Number(productData.id)));
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết sản phẩm:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // ✅ Sửa lại hàm thêm vào giỏ hàng đồng bộ với CartContext & Object-based
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      // 1. Gom dữ liệu truyền thành 1 Object duy nhất
      await addToCart({ product, quantity });
      
      // 2. Thông báo thành công qua Toast
      showToast(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`, 'success');
    } catch (error) {
      console.error('Lỗi thêm giỏ hàng:', error);
      showToast(error.message || 'Thêm vào giỏ hàng thất bại, vui lòng thử lại!', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải chi tiết...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold text-secondary">Sản phẩm không tồn tại hoặc đã bị xóa.</h4>
        <Link to="/" className="btn btn-warning mt-3 fw-semibold">Quay lại Trang Chủ</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Chi tiết sản phẩm */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-5 bg-white">
        <div className="row g-4">
          {/* Ảnh sản phẩm */}
          <div className="col-md-5 text-center">
            <img
              src={product.image_url || product.image || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="img-fluid rounded-3 object-fit-cover w-100"
              style={{ maxHeight: '400px' }}
            />
          </div>

          {/* Thông tin mua hàng */}
          <div className="col-md-7 d-flex flex-column">
            <h3 className="fw-bold">{product.name}</h3>
            <p className="text-muted small">Mã SP: #{product.id}</p>

            <div className="my-3">
              <span className="text-danger fw-bold fs-2 me-3">
                {formatCurrency(product.price)}
              </span>
              {product.old_price && (
                <span className="text-muted text-decoration-line-through fs-5">
                  {formatCurrency(product.old_price)}
                </span>
              )}
            </div>

            <p className="text-secondary">{product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>

            {/* Bộ chọn số lượng */}
            <div className="d-flex align-items-center gap-3 my-4">
              <span className="fw-semibold">Số lượng:</span>
              <div className="input-group" style={{ width: '130px' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center bg-white"
                  value={quantity}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="d-flex gap-3 mt-auto">
              <button 
                type="button" 
                className="btn btn-warning btn-lg fw-bold flex-grow-1 text-dark" 
                onClick={handleAddToCart}
              >
                <i className="fa-solid fa-cart-plus me-2"></i>Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-4">Sản Phẩm Cùng Danh Mục</h5>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
            {relatedProducts.map((rp) => (
              <div className="col" key={rp.id}>
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}