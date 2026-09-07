import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import OrderStatusBadge from '../../components/customer/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    adminService.getOrders().then((res) => {
      if (res.success) setOrders(res.data);
    });
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    await adminService.updateOrderStatus(id, status);
    loadOrders();
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">Quản lý Đơn hàng</h3>
      <div className="card border-0 shadow-sm p-3">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái hiện tại</th>
              <th>Thao tác đổi trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name || 'Khách vãng lai'}</td>
                <td>{formatDate(o.created_at)}</td>
                <td className="fw-bold">{formatCurrency(o.total_amount)}</td>
                <td><OrderStatusBadge status={o.status} /></td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipping">Shipping</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}