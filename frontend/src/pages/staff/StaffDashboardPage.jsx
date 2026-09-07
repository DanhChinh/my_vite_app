import React, { useEffect, useState } from 'react';
import Header from '../../components/shared/Header';
import DashboardSidebar from '../../components/common/DashboardSidebar';
import { staffService } from '../../services/staffService';
import { useToast } from '../../context/ToastProvider';

const statuses = [['', 'Tất cả trạng thái'], ['pending', 'Chờ xử lý'], ['confirmed', 'Đã xác nhận'], ['shipping', 'Đang giao'], ['completed', 'Đã hoàn thành'], ['cancelled', 'Đã hủy']];
const statusLabels = Object.fromEntries(statuses);

export default function StaffDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [incompleteCarts, setIncompleteCarts] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    setErrorMsg('');
    const [result, cartResult] = await Promise.all([staffService.getOrders(filters), staffService.getIncompleteCarts()]);
    if (result.success) setOrders(result.data || []);
    else setErrorMsg(result.message || 'Không thể tải danh sách đơn hàng.');
    if (cartResult.success) setIncompleteCarts(cartResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 250);
    return () => window.clearTimeout(timer);
  }, [filters.status, filters.search]);

  const openOrder = async (order) => {
    const result = await staffService.getOrder(order.id);
    if (!result.success) return showToast(result.message || 'Không thể tải chi tiết đơn.', 'danger');
    setSelectedOrder(result.data);
    setStatus(result.data.status);
    setInternalNote(result.data.internal_note || '');
  };

  const updateOrder = async (event) => {
    event.preventDefault();
    const result = await staffService.updateOrderStatus(selectedOrder.id, status, internalNote);
    showToast(result.message || 'Đã cập nhật đơn hàng.', result.success ? 'success' : 'danger');
    if (result.success) {
      setSelectedOrder(null);
      loadOrders();
    }
  };

  return <div className="bg-light min-vh-100"><Header /><div className="container-fluid py-4"><div className="dashboard-layout"><DashboardSidebar role="staff" /><main className="dashboard-content">
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><span className="section-kicker">VẬN HÀNH</span><h2 className="fw-bold mb-1">Quản lý đơn hàng</h2><p className="text-muted mb-0">Tra cứu, xác nhận và theo dõi tiến độ giao hàng.</p></div><button className="btn btn-outline-dark" onClick={loadOrders}><i className="fa-solid fa-rotate-right me-2" />Làm mới</button></div>
    <div className="card border-0 shadow-sm p-3 mb-4"><div className="row g-2"><div className="col-lg-8"><div className="input-group"><span className="input-group-text bg-white"><i className="fa-solid fa-magnifying-glass" /></span><input className="form-control" placeholder="Mã đơn, tên hoặc số điện thoại khách hàng" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></div></div><div className="col-lg-4"><select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>{statuses.map(([value, label]) => <option value={value} key={value || 'all'}>{label}</option>)}</select></div></div></div>
    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
    {incompleteCarts.length > 0 && <div className="card border-0 shadow-sm p-3 mb-4"><div className="d-flex justify-content-between align-items-center mb-3"><h3 className="h5 fw-bold mb-0"><i className="fa-solid fa-cart-shopping text-warning me-2" />Giỏ hàng chưa hoàn tất</h3><span className="badge bg-warning text-dark">{incompleteCarts.length} khách cần liên hệ</span></div><div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Cập nhật</th><th>Sản phẩm</th><th>Tạm tính</th></tr></thead><tbody>{incompleteCarts.slice(0, 10).map((cart) => <tr key={cart.cart_id}><td>{cart.full_name || 'Chưa có tên'}</td><td>{cart.phone || 'Chưa có số điện thoại'}</td><td>{new Date(cart.updated_at).toLocaleDateString('vi-VN')}</td><td>{cart.item_count}</td><td className="text-danger fw-bold">{Number(cart.total_price).toLocaleString('vi-VN')} đ</td></tr>)}</tbody></table></div></div>}
    <div className="card border-0 shadow-sm overflow-hidden">{loading ? <div className="text-center py-5"><div className="spinner-border" role="status" /></div> : orders.length === 0 ? <div className="text-center py-5 text-muted"><i className="fa-solid fa-clipboard-list fs-2 mb-2" /><p className="mb-0">Không có đơn hàng phù hợp.</p></div> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-dark"><tr><th className="ps-4">Mã đơn</th><th>Khách hàng</th><th>Liên hệ</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th className="text-end pe-4">Chi tiết</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="ps-4 fw-bold">#{order.id}</td><td><strong>{order.full_name || 'Chưa có tên'}</strong><small className="d-block text-muted">{order.address || 'Chưa có địa chỉ'}</small></td><td>{order.phone || 'Chưa có'}</td><td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td><td className="text-danger fw-bold">{Number(order.total_price).toLocaleString('vi-VN')} đ</td><td><span className={`badge ${order.status === 'completed' ? 'bg-success' : order.status === 'cancelled' ? 'bg-secondary' : order.status === 'shipping' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>{statusLabels[order.status] || order.status}</span></td><td className="text-end pe-4"><button className="btn btn-sm btn-outline-dark" onClick={() => openOrder(order)}>Xem chi tiết</button></td></tr>)}</tbody></table></div>}</div>
  </main></div></div>
  {selectedOrder && <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setSelectedOrder(null)}><div className="modal-dialog modal-lg modal-dialog-centered" onClick={(event) => event.stopPropagation()}><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Đơn hàng #{selectedOrder.id}</h5><button className="btn-close" type="button" onClick={() => setSelectedOrder(null)} /></div><div className="modal-body"><div className="row g-3 mb-3"><div className="col-md-6"><strong>Người nhận:</strong> {selectedOrder.full_name || 'Chưa có'}<br /><strong>Số điện thoại:</strong> {selectedOrder.phone || 'Chưa có'}</div><div className="col-md-6"><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}<br /><strong>Thanh toán:</strong> {selectedOrder.payment_method}</div></div><div className="border rounded p-3 mb-3">{selectedOrder.items?.map((item) => <div className="d-flex justify-content-between border-bottom py-2" key={item.product_id}><span>{item.name} × {item.quantity}</span><strong>{(Number(item.unit_price) * item.quantity).toLocaleString('vi-VN')} đ</strong></div>)}</div><form onSubmit={updateOrder}><div className="row g-3"><div className="col-md-5"><label className="form-label">Cập nhật trạng thái</label><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.slice(1).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div><div className="col-md-7"><label className="form-label">Ghi chú nội bộ</label><input className="form-control" value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="Ví dụ: khách đổi màu sản phẩm" /></div></div><div className="text-end mt-3"><button className="btn btn-dark" type="submit">Lưu cập nhật</button></div></form></div></div></div></div>}
  </div>;
}
