import React from 'react';

export default function BannerCarousel() {
  const banners = [
    {
      id: 1,
      image: 'https://via.placeholder.com/1200x400/212529/ffffff?text=Sieu+Khuyen+Mai+Cong+Nghe',
      title: 'Bùng Nổ Ưu Đãi Công Nghệ',
      subtitle: 'Giảm giá lên đến 50% cho tất cả các phụ kiện cao cấp'
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/1200x400/0d6efd/ffffff?text=San+Pham+Moi+Ra+Mat',
      title: 'Bộ Bộ Bộ Sản Phẩm Mới 2026',
      subtitle: 'Trải nghiệm đỉnh cao với thiết bị tối tân nhất'
    }
  ];

  return (
    <div id="mainCarousel" className="carousel slide shadow-sm rounded-3 overflow-hidden mb-4" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#mainCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {banners.map((b, index) => (
          <div key={b.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <img src={b.image} className="d-block w-100 object-fit-cover" style={{ height: '360px' }} alt={b.title} />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
              <h4 className="fw-bold text-warning">{b.title}</h4>
              <p className="mb-0">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}