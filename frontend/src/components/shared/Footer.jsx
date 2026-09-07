import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const footerLinks = [
  ['Sản phẩm', '/'],
  ['Giỏ hàng', '/cart'],
  ['Tài khoản', '/customer/dashboard']
];

export default function Footer() {
  const { pathname } = useLocation();
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <footer className="site-footer mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <Link to="/" className="footer-brand text-decoration-none">TechStore Pro</Link>
            <p className="text-white-50 mt-3 mb-0">Thiết bị công nghệ chính hãng, lựa chọn rõ ràng và dịch vụ tận tâm.</p>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="h6 text-white fw-bold">Khám phá</h2>
            <nav className="d-grid gap-2 mt-3" aria-label="Liên kết footer">
              {footerLinks.map(([label, path]) => <Link className="footer-link" to={path} key={path}>{label}</Link>)}
            </nav>
          </div>
          <div className="col-6 col-lg-4">
            <h2 className="h6 text-white fw-bold">Hỗ trợ khách hàng</h2>
            <p className="text-white-50 small mt-3 mb-1">Hotline: 1900 6868</p>
            <p className="text-white-50 small mb-0">Thứ 2 - Chủ nhật, 08:00 - 22:00</p>
          </div>
        </div>
        <div className="footer-bottom mt-4 pt-3">© 2026 TechStore Pro. Mua sắm công nghệ dễ dàng hơn.</div>
      </div>
    </footer>
  );
}
