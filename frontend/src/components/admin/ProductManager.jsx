// src/components/admin/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', price: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/categories')
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu sản phẩm/danh mục:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/products/${editId}`, form, { headers });
        setMessage({ type: 'success', text: 'Cập nhật sản phẩm thành công!' });
      } else {
        await axios.post('http://localhost:5000/api/admin/products', form, { headers });
        setMessage({ type: 'success', text: 'Thêm sản phẩm mới thành công!' });
      }

      setForm({ name: '', category_id: '', price: '', description: '' });
      setIsEditing(false);
      setEditId(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra.' });
    }
  };

  const handleEdit = (prod) => {
    setForm({
      name: prod.name,
      category_id: prod.category_id || '',
      price: prod.price,
      description: prod.description || ''
    });
    setIsEditing(true);
    setEditId(prod.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Lỗi xóa sản phẩm.');
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4"><i className="fa-solid fa-box-open me-2"></i>Quản Lý Sản Phẩm Hệ Thống</h3>

      {/* Form Thêm / Sửa Sản phẩm */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white rounded-3">
        <h5 className="fw-bold mb-3 text-secondary">{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
        {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold">Tên sản phẩm</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Danh mục</label>
            <select 
              className="form-select" 
              value={form.category_id} 
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold">Giá bán (VNĐ)</label>
            <input 
              type="number" 
              className="form-control" 
              value={form.price} 
              onChange={(e) => setForm({ ...form, price: e.target.value })} 
              required 
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold">Mô tả sản phẩm</label>
            <textarea 
              className="form-control" 
              rows="2"
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            ></textarea>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark fw-bold px-4 me-2">
              <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-plus'} me-1`}></i> 
              {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                className="btn btn-outline-secondary fw-bold px-3"
                onClick={() => { setIsEditing(false); setForm({ name: '', category_id: '', price: '', description: '' }); }}
              >
                Hủy bỏ
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bảng danh sách sản phẩm */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
        <div className="card-body p-0">
          <div className="table-responsive m-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark text-uppercase fs-7">
                <tr>
                  <th className="py-3 ps-4">ID</th>
                  <th className="py-3">Tên sản phẩm</th>
                  <th className="py-3">Danh mục</th>
                  <th className="py-3">Giá bán</th>
                  <th className="py-3 text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-bold">#{p.id}</td>
                    <td className="fw-semibold text-dark">{p.name}</td>
                    <td><span className="badge bg-secondary">{p.category_name || 'Khác'}</span></td>
                    <td className="text-danger fw-bold">{Number(p.price).toLocaleString('vi-VN')} đ</td>
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