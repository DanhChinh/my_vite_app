import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('ALL');

  // Dữ liệu mẫu đơn hàng
  const orders = [
    {
      id: 'ORD1001',
      date: '2026-03-25',
      total: 1250000,
      status: 'DELIVERED',
      statusText: 'Đã giao hàng',
      badgeClass: 'bg-success',
      itemsCount: 2
    },
    {
      id: 'ORD1002',
      date: '2026-03-28',
      total: 450000,
      status: 'PENDING',
      statusText: 'Chờ xác nhận',
      badgeClass: 'bg-warning text-dark',
      itemsCount: 1
    }
  ];

  const filteredOrders =
    activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab);

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