// src/pages/StaffDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'staff') {
        setErrorMsg('Bạn không có quyền truy cập khu vực này hoặc phiên đăng nhập đã hết hạn.');
        setLoading(false);
        return;
      }

      const res = await axios.get('http://localhost:5000/api/staff/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data.data || res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
      setErrorMsg(err.response?.data?.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/staff/orders/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Cập nhật trạng thái thành công!');
        fetchOrders();
      }
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      
      <div className="container py-4">
        {/* Tiêu đề trang */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h2 className="fw-bold text-dark m-0">
              <i className="fa-solid fa-boxes-stacked me-2 text-warning"></i>Khu Vực Nhân Viên Kho
            </h2>
            <p className="text-muted m-0">Quản lý và cập nhật tiến độ giao hàng của khách hàng</p>
          </div>
          <div className="col-auto">
            <button className="btn btn-dark btn-sm fw-bold px-3 py-2" onClick={fetchOrders}>
              <i className="fa-solid fa-rotate-right me-1"></i> Làm mới
            </button>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="alert alert-danger shadow-sm" role="alert">
            <i className="fa-solid fa-triangle-exclamation me-2"></i> {errorMsg}
            <div className="mt-2">
              <button className="btn btn-sm btn-dark" onClick={() => navigate('/login')}>Đăng nhập lại</button>
            </div>
          </div>
        )}

        {/* Khung chứa bảng dữ liệu với CHIỀU CAO TỐI THIỂU (min-height) */}
        <div className="card border-0 shadow-sm rounded-3 overflow-visible" style={{ minHeight: '400px' }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-dark mb-2" role="status"></div>
                <p className="text-muted m-0">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-clipboard-list fs-1 text-muted mb-3"></i>
                <p className="text-muted fs-5 m-0">Chưa có đơn hàng nào trong hệ thống.</p>
              </div>
            ) : (
              /* Dùng overflow-visible ở đây để dropdown không bị bóp méo hoặc ẩn đi */
              <div className="table-responsive m-0 overflow-visible" style={{ minHeight: '350px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark text-uppercase fs-7">
                    <tr>
                      <th className="py-3 ps-4">Mã đơn</th>
                      <th className="py-3">Khách hàng</th>
                      <th className="py-3">Số điện thoại</th>
                      <th className="py-3">Địa chỉ giao hàng</th>
                      <th className="py-3">Tổng tiền</th>
                      <th className="py-3">Trạng thái</th>
                      <th className="py-3 text-end pe-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="ps-4 fw-bold text-primary">#{order.id}</td>
                        <td className="fw-semibold text-dark">{order.full_name || 'Khách vãng lai'}</td>
                        <td className="text-secondary">{order.phone || 'Chưa có'}</td>
                        <td className="text-secondary text-truncate" style={{ maxWidth: '220px' }} title={order.address}>
                          {order.address || 'Chưa cập nhật'}
                        </td>
                        <td className="text-danger fw-bold">
                          {Number(order.total_price).toLocaleString('vi-VN')} đ
                        </td>
                        <td>
                          <span className={`badge px-3 py-2 fw-semibold ${
                            order.status === 'Pending' ? 'bg-warning text-dark' :
                            order.status === 'Shipping' ? 'bg-info text-dark' : 'bg-success text-white'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="dropdown">
                            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Đổi trạng thái
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2">
                              <li>
                                <button className="dropdown-item py-2" onClick={() => handleUpdateStatus(order.id, 'Pending')}>
                                  <i className="fa-solid fa-clock text-warning me-2"></i> Chờ xử lý (Pending)
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item py-2" onClick={() => handleUpdateStatus(order.id, 'Shipping')}>
                                  <i className="fa-solid fa-truck-fast text-info me-2"></i> Đang giao (Shipping)
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item py-2" onClick={() => handleUpdateStatus(order.id, 'Completed')}>
                                  <i className="fa-solid fa-circle-check text-success me-2"></i> Hoàn thành (Completed)
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}