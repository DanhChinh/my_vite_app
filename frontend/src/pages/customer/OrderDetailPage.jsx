import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMER_ENDPOINTS } from '../../constants/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(CUSTOMER_ENDPOINTS.ORDER_DETAIL(id), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setOrder(result.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchOrderDetail();
  }, [token, id]);

  if (loading) {
    return <div className="text-center my-5 py-5"><div className="spinner-border text-primary"></div></div>;
  }

  if (!order) {
    return (
      <div className="container my-5 text-center">
        <h4>Không tìm thấy thông tin đơn hàng</h4>
        <Link to="/orders" className="btn btn-primary mt-3">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-uppercase mb-0">Chi tiết đơn hàng #{order.id}</h3>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">&larr; Quay lại danh sách</Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3 text-primary">Danh sách sản phẩm</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Đơn giá</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.image_url || 'https://via.placeholder.com/50'}
                            alt={item.name}
                            className="rounded me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <span className="fw-semibold">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-center">{Number(item.price).toLocaleString('vi-VN')} đ</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end fw-bold">
                        {(Number(item.price) * item.quantity).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <hr />
            <div className="d-flex justify-content-between fs-5 fw-bold text-danger">
              <span>Tổng thanh toán:</span>
              <span>{Number(order.total_amount).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3 text-primary">Thông tin nhận hàng</h5>
            <p className="mb-1"><strong>Người nhận:</strong> {order.customer_name}</p>
            <p className="mb-1"><strong>Số điện thoại:</strong> {order.customer_phone}</p>
            <p className="mb-1"><strong>Địa chỉ:</strong> {order.shipping_address}</p>
            {order.note && <p className="mb-1"><strong>Ghi chú:</strong> {order.note}</p>}
            <hr />
            <p className="mb-1"><strong>Phương thức thanh toán:</strong> {order.payment_method}</p>
            <p className="mb-0"><strong>Trạng thái:</strong> <span className="badge bg-info text-dark">{order.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}