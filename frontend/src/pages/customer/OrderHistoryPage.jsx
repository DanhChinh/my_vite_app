import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import customerService from '../../services/customerService';

export default function OrderHistoryPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Hàm gọi API lấy danh sách đơn hàng thực tế từ Backend
  const fetchOrders = useCallback(async () => {
    if (!token || user?.role !== 'customer') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await customerService.getOrders()
      if (result.success) {
        // Chuẩn hóa dữ liệu trả về từ Database
        const rawOrders = result.data?.orders || (Array.isArray(result.data) ? result.data : []);
        
        const formattedOrders = rawOrders.map(order => {
          let statusText = 'Chờ xác nhận';
          let badgeClass = 'bg-warning text-dark';

          switch (order.status) {
            case 'PENDING':
              statusText = 'Chờ xác nhận';
              badgeClass = 'bg-warning text-dark';
              break;
            case 'PROCESSING':
              statusText = 'Đang xử lý';
              badgeClass = 'bg-info text-dark';
              break;
            case 'DELIVERING':
              statusText = 'Đang giao hàng';
              badgeClass = 'bg-primary';
              break;
            case 'DELIVERED':
              statusText = 'Đã giao hàng';
              badgeClass = 'bg-success';
              break;
            case 'CANCELLED':
              statusText = 'Đã hủy';
              badgeClass = 'bg-danger';
              break;
            default:
              statusText = order.status;
              badgeClass = 'bg-secondary';
          }

          return {
            id: order.id,
            date: order.created_at ? order.created_at.split('T')[0] : '',
            total: Number(order.total_price || order.total || 0),
            status: order.status,
            statusText,
            badgeClass,
            itemsCount: order.items_count || order.itemsCount || 0
          };
        });

        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders =
    activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm p-4 text-center py-5">
        <div className="spinner-border text-primary mx-auto" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="text-muted mt-2">Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-bold mb-3 pb-2 border-bottom">Đơn hàng của tôi</h4>

      {/* Tabs Filter */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ALL' ? 'active fw-bold' : 'text-dark'}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'PENDING' ? 'active fw-bold' : 'text-dark'}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Chờ xác nhận
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'DELIVERED' ? 'active fw-bold' : 'text-dark'}`}
            onClick={() => setActiveTab('DELIVERED')}
          >
            Đã giao
          </button>
        </li>
      </ul>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam text-muted fs-1 d-block mb-2"></i>
          <p className="text-muted">Không tìm thấy đơn hàng nào.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="border rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <div>
                  <span className="fw-bold me-2">Mã đơn: #{order.id}</span>
                  <small className="text-muted">({order.date})</small>
                </div>
                <span className={`badge ${order.badgeClass}`}>{order.statusText}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="small text-muted">{order.itemsCount} sản phẩm</span>
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold text-danger">
                    {order.total.toLocaleString('vi-VN')} đ
                  </span>
                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}