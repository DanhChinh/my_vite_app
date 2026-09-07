import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastProvider';
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
        const res = await publicService.getProductDetail(id);
        const productData = res?.data;
        setProduct(productData);

        // Tải sản phẩm liên quan theo danh mục
        if (productData?.category_id) {
          const relatedRes = await publicService.getProducts({
            category: productData.category_id,
            limit: 4
          });
          setRelatedProducts((relatedRes?.data?.items || []).filter((item) => item.id !== productData.id));
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product, quantity);
    if (res?.success) {
      showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
    } else {
      showToast(res?.message || 'Có lỗi xảy ra', 'danger');
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
        <h4>Sản phẩm không tồn tại hoặc đã bị xóa.</h4>
        <Link to="/" className="btn btn-warning mt-3">Quay lại Trang Chủ</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      {/* Chi tiết sản phẩm */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-5">
        <div className="row g-4">
          {/* Ảnh sản phẩm */}
          <div className="col-md-5 text-center">
            <img
              src={product.image_url || 'https://via.placeholder.com/400'}
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
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center"
                  value={quantity}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="d-flex gap-3 mt-auto">
              <button className="btn btn-warning btn-lg fw-bold flex-grow-1" onClick={handleAddToCart}>
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