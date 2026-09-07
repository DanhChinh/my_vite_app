import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="container my-5 text-center py-5">
      <div className="mb-4 text-success">
        <i className="bi bi-check-circle-fill" style={{ fontSize: '4.5rem' }}></i>
      </div>
      <h2 className="fw-bold mb-2">Đặt hàng thành công!</h2>
      <p className="text-muted fs-5 mb-4">
        Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là: <strong className="text-dark">#{orderId || 'N/A'}</strong>
      </p>

      <div className="card border-0 shadow-sm mx-auto p-4 mb-4" style={{ maxWidth: '500px' }}>
        <h5 className="fw-bold mb-3">Trạng thái xử lý</h5>
        <p className="text-muted small mb-0">
          Đơn hàng của bạn đang được hệ thống tiếp nhận và chuẩn bị. Nhân viên sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận giao hàng.
        </p>
      </div>

      <div className="d-flex justify-content-center gap-3">
        <Link to="/orders" className="btn btn-outline-primary px-4">
          Xem đơn hàng của tôi
        </Link>
        <Link to="/" className="btn btn-primary px-4">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}