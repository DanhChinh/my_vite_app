// src/components/admin/PartnerManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function PartnerManager() {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ name: '', supply_type: '', details: '', quality_info: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchPartners = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/partners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(res.data.data);
    } catch (err) {
      console.error('Lỗi tải danh sách đối tác:', err);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/partners/${editId}`, form, { headers });
        setMessage({ type: 'success', text: 'Cập nhật thông tin đối tác thành công!' });
      } else {
        await axios.post('http://localhost:5000/api/admin/partners', form, { headers });
        setMessage({ type: 'success', text: 'Thêm đối tác mới thành công!' });
      }

      setForm({ name: '', supply_type: '', details: '', quality_info: '' });
      setIsEditing(false);
      setEditId(null);
      fetchPartners();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra.' });
    }
  };

  const handleEdit = (partner) => {
    setForm({
      name: partner.name,
      supply_type: partner.supply_type,
      details: partner.details,
      quality_info: partner.quality_info || ''
    });
    setIsEditing(true);
    setEditId(partner.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đối tác này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/partners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPartners();
    } catch (err) {
      alert('Lỗi xóa đối tác.');
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4"><i className="fa-solid fa-handshake me-2"></i>Quản Lý Đối Tác Cung Cấp</h3>

      {/* Form Thêm / Sửa đối tác */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <h5 className="fw-bold mb-3 text-secondary">{isEditing ? 'Chỉnh sửa thông tin đối tác' : 'Thêm đối tác mới'}</h5>
        {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold">Tên đối tác</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Loại hàng cung cấp</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.supply_type} 
              onChange={(e) => setForm({ ...form, supply_type: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Chi tiết liên hệ (SĐT, Email, Địa chỉ)</label>
            <textarea 
              className="form-control" 
              rows="2"
              value={form.details} 
              onChange={(e) => setForm({ ...form, details: e.target.value })} 
              required 
            ></textarea>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Thông tin chất lượng hàng hóa</label>
            <textarea 
              className="form-control" 
              rows="2"
              value={form.quality_info} 
              onChange={(e) => setForm({ ...form, quality_info: e.target.value })} 
            ></textarea>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark fw-bold px-4 me-2">
              <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-plus'} me-1`}></i> 
              {isEditing ? 'Cập nhật đối tác' : 'Thêm đối tác'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-outline-secondary fw-bold px-3"
                onClick={() => { setIsEditing(false); setForm({ name: '', supply_type: '', details: '', quality_info: '' }); }}
              >
                Hủy bỏ
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bảng danh sách đối tác */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
        <div className="card-body p-0">
          <div className="table-responsive m-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark text-uppercase fs-7">
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Tên đối tác</th>
                  <th className="py-3">Loại hàng cung cấp</th>
                  <th className="py-3">Chi tiết thông tin</th>
                  <th className="py-3">Chất lượng</th>
                  <th className="py-3 text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-bold">#{p.id}</td>
                    <td className="fw-semibold text-dark">{p.name}</td>
                    <td><span className="badge bg-info text-dark">{p.supply_type}</span></td>
                    <td className="small text-muted" style={{ maxWidth: '200px' }}>{p.details}</td>
                    <td className="small text-success">{p.quality_info || 'Chưa cập nhật'}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(p)} title="Sửa">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)} title="Xóa">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}