// src/components/admin/StatisticsView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StatisticsView() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    total_staff: 0,
    total_partners: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu thống kê:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-dark"></div></div>;
  }

  return (
    <div>
      <h3 className="fw-bold mb-4"><i className="fa-solid fa-chart-pie me-2"></i>Thống Kê Tổng Quan Hệ Thống</h3>

      <div className="row g-4">
        {/* Doanh thu */}
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 border-start border-danger border-4">
            <div className="text-muted small fw-bold text-uppercase mb-1">Tổng Doanh Thu</div>
            <h3 className="fw-bold text-danger m-0">{Number(stats.total_revenue).toLocaleString('vi-VN')} đ</h3>
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 border-start border-primary border-4">
            <div className="text-muted small fw-bold text-uppercase mb-1">Tổng Đơn Hàng</div>
            <h3 className="fw-bold text-primary m-0">{stats.total_orders} đơn</h3>
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 border-start border-success border-4">
            <div className="text-muted small fw-bold text-uppercase mb-1">Sản Phẩm Trong Kho</div>
            <h3 className="fw-bold text-success m-0">{stats.total_products} sản phẩm</h3>
          </div>
        </div>

        {/* Nhân viên */}
        <div className="col-md-6 col-lg-6">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 border-start border-warning border-4">
            <div className="text-muted small fw-bold text-uppercase mb-1">Tài khoản Nhân viên</div>
            <h3 className="fw-bold text-warning text-dark m-0">{stats.total_staff} nhân viên</h3>
          </div>
        </div>

        {/* Đối tác */}
        <div className="col-md-6 col-lg-6">
          <div className="card border-0 shadow-sm p-4 bg-white rounded-3 border-start border-info border-4">
            <div className="text-muted small fw-bold text-uppercase mb-1">Đối Tác Cung Cấp</div>
            <h3 className="fw-bold text-info m-0">{stats.total_partners} đối tác</h3>
          </div>
        </div>
      </div>
    </div>
  );
}