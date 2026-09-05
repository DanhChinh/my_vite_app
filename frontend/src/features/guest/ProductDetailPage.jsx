import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/shared/Navbar';
import { useCart } from '../../context/CartContext';

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return { 'Thông tin': value };
  }
};

const formatAttributeValue = (value) => (
  typeof value === 'object' ? JSON.stringify(value) : String(value)
);

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        const foundProduct = (response.data.data || []).find(
          (item) => String(item.id) === String(productId)
        );

        if (!foundProduct) {
          setError('Không tìm thấy sản phẩm.');
          return;
        }

        setProduct(foundProduct);
        setSelectedImage(foundProduct.images?.[0]?.image_url || '');
      } catch (requestError) {
        setError('Không thể tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
  };

  const imageUrl = selectedImage ? `http://localhost:5000${selectedImage}` : '';
  const attributes = parseAttributes(product?.attributes);

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <main className="container py-4">
        <button type="button" className="btn btn-link text-dark px-0 mb-3" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left me-2"></i>Quay lại danh sách
        </button>

        {loading && <p className="text-center text-muted py-5">Đang tải thông tin sản phẩm...</p>}
        {!loading && error && <div className="alert alert-warning">{error}</div>}

        {!loading && product && (
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="row g-0">
              <div className="col-lg-6 p-4 bg-white">
                <div className="d-flex align-items-center justify-content-center bg-light rounded mb-3" style={{ minHeight: '420px' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="img-fluid" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                  ) : (
                    <i className="fa-solid fa-image fs-1 text-secondary"></i>
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="d-flex flex-wrap gap-2">
                    {product.images.map((image) => (
                      <button
                        type="button"
                        key={image.id}
                        className={`btn p-1 border ${selectedImage === image.image_url ? 'border-dark' : 'border-light'}`}
                        onClick={() => setSelectedImage(image.image_url)}
                      >
                        <img src={`http://localhost:5000${image.image_url}`} alt="" width="72" height="72" className="object-fit-cover rounded" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-lg-6 p-4 p-lg-5">
                <span className="badge bg-secondary mb-3">{product.category_name || 'Sản phẩm'}</span>
                <h1 className="h2 fw-bold mb-3">{product.name}</h1>
                <p className="h4 text-danger fw-bold mb-3">{Number(product.price).toLocaleString('vi-VN')} đ</p>
                <p className={`fw-semibold ${Number(product.stock) > 0 ? 'text-success' : 'text-danger'}`}>
                  {Number(product.stock) > 0 ? `Còn ${product.stock} sản phẩm` : 'Tạm hết hàng'}
                </p>
                <p className="text-secondary mb-4">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>

                {Object.keys(attributes).length > 0 && (
                  <div className="border-top pt-3 mb-4">
                    <h2 className="h5 fw-bold mb-3">Thông số sản phẩm</h2>
                    <dl className="row mb-0">
                      {Object.entries(attributes).map(([label, value]) => (
                        <React.Fragment key={label}>
                          <dt className="col-sm-5 text-secondary fw-normal">{label}</dt>
                          <dd className="col-sm-7 fw-semibold">{formatAttributeValue(value)}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  </div>
                )}

                <button type="button" className="btn btn-dark btn-lg w-100" disabled={Number(product.stock) <= 0} onClick={handleAddToCart}>
                  <i className="fa-solid fa-cart-plus me-2"></i>Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
