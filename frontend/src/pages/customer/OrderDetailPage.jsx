import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API chi tiết đơn hàng thông qua orderService
  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrderDetails(id);
      
      // Bóc tách dữ liệu linh hoạt từ Response
      const responseData = res?.data || res;
      const orderData = responseData?.data || responseData;

      if (orderData && (orderData.id || orderData._id)) {
        setOrder(orderData);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (token && id) {
      fetchOrderDetail();
    }
  }, [token, id, fetchOrderDetail]);

  // Hàm hỗ trợ format hiển thị Badge trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge bg-warning text-dark">Chờ xác nhận</span>;
      case 'PROCESSING':
        return <span className="badge bg-info text-dark">Đang xử lý</span>;
      case 'DELIVERING':
        return <span className="badge bg-primary">Đang giao hàng</span>;
      case 'DELIVERED':
        return <span className="badge bg-success">Đã giao hàng</span>;
      case 'CANCELLED':
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Chưa rõ'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="text-muted mt-2">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container my-5 text-center">
        <i className="bi bi-exclamation-circle text-warning fs-1 d-block mb-3"></i>
        <h4 className="fw-bold">Không tìm thấy thông tin đơn hàng</h4>
        <p className="text-muted">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Link to="/orders" className="btn btn-primary mt-2">
          &larr; Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  // Tối ưu hóa đọc giá trị thuộc tính từ Database
  const orderItems = order.items || order.order_items || [];
  const totalPrice = Number(order.total_amount || order.total_price || order.total || 0);
  const recipientName = order.customer_name || order.recipient_name || order.receiver_name || 'Khách hàng';
  const recipientPhone = order.customer_phone || order.phone || order.recipient_phone || 'N/A';
  const recipientAddress = order.recipient_address || order.address || 'N/A';

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="fw-bold text-uppercase mb-0">Chi tiết đơn hàng #{order.id}</h3>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="row g-4">
        {/* Danh sách sản phẩm */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3 text-primary">Danh sách sản phẩm</h5>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Đơn giá</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => {
                    const price = Number(item.price || item.unit_price || 0);
                    const quantity = Number(item.quantity || 1);
                    const itemName = item.name || item.product_name || 'Sản phẩm';
                    const itemImage = item.image_url || item.image || item.product_image || 'https://via.placeholder.com/50';

                    return (
                      <tr key={item.id || index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="rounded me-3 border"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                            <span className="fw-semibold">{itemName}</span>
                          </div>
                        </td>
                        <td className="text-center">{price.toLocaleString('vi-VN')} đ</td>
                        <td className="text-center">{quantity}</td>
                        <td className="text-end fw-bold">
                          {(price * quantity).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <hr />
            <div className="d-flex justify-content-between fs-5 fw-bold text-danger">
              <span>Tổng thanh toán:</span>
              <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Thông tin giao hàng & Thanh toán */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3 text-primary">Thông tin nhận hàng</h5>
            <p className="mb-2"><strong>Người nhận:</strong> {recipientName}</p>
            <p className="mb-2"><strong>Số điện thoại:</strong> {recipientPhone}</p>
            <p className="mb-2"><strong>Địa chỉ:</strong> {recipientAddress}</p>
            {order.note && <p className="mb-2"><strong>Ghi chú:</strong> {order.note}</p>}
            <hr />
            <p className="mb-2">
              <strong>Phương thức thanh toán:</strong>{' '}
              <span className="text-uppercase">{order.payment_method || 'COD'}</span>
            </p>
            <div className="d-flex align-items-center gap-2">
              <strong>Trạng thái:</strong>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}