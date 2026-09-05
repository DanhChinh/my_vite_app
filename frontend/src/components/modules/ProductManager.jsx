// src/components/admin/ProductManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const createAttributeRow = () => ({ id: crypto.randomUUID(), label: '', value: '' });
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const parseAttributesObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const getCategoryAttributeLabels = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === 'object') return Object.keys(value);
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    if (parsed && typeof parsed === 'object') return Object.keys(parsed);
  } catch {
    return value.split(',').map((label) => label.trim()).filter(Boolean);
  }

  return [];
};

const formatAttributeValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const parseAttributeRows = (value) => {
  if (!value) return [createAttributeRow()];

  const parsedValue = parseAttributesObject(value);

  if (Object.keys(parsedValue).length === 0 && typeof value === 'string') {
    return [{ ...createAttributeRow(), label: 'Thông tin', value }];
  }

  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return [{ ...createAttributeRow(), value: String(value) }];
  }

  const rows = Object.entries(parsedValue).map(([label, attributeValue]) => ({
    ...createAttributeRow(),
    label,
    value: formatAttributeValue(attributeValue)
  }));

  return rows.length > 0 ? rows : [createAttributeRow()];
};

const createRowsFromCategory = (categoryAttributes, currentRows = []) => {
  const categoryLabels = getCategoryAttributeLabels(categoryAttributes);
  const currentValues = currentRows.reduce((result, row) => {
    if (row.label) result[row.label] = row.value;
    return result;
  }, {});

  if (categoryLabels.length === 0) return currentRows.length > 0 ? currentRows : [createAttributeRow()];

  return categoryLabels.map((label) => ({
    ...createAttributeRow(),
    label,
    value: currentValues[label] || ''
  }));
};

const serializeAttributes = (rows) => {
  const attributes = rows.reduce((result, row) => {
    const label = row.label.trim();
    const value = row.value.trim();
    if (label && value) result[label] = value;
    return result;
  }, {});

  return Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : '';
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    category_id: '', 
    price: '', 
    stock: '', 
    description: ''
  });
  const [attributeRows, setAttributeRows] = useState([createAttributeRow()]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const selectedCategory = categories.find((category) => String(category.id) === String(form.category_id));
  const categoryAttributeLabels = getCategoryAttributeLabels(selectedCategory?.attributes);

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

  useEffect(() => () => {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [imagePreviews]);

  const resetForm = () => {
    setForm({ name: '', category_id: '', price: '', stock: '', description: '' });
    setAttributeRows([createAttributeRow()]);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsEditing(false);
    setIsFormOpen(false);
    setEditId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const oversizedFile = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      setMessage({ type: 'danger', text: `Ảnh "${oversizedFile.name}" vượt quá giới hạn 5 MB.` });
      event.target.value = '';
      return;
    }

    if (selectedFiles.length > 5) {
      setMessage({ type: 'warning', text: 'Chỉ được chọn tối đa 5 ảnh. Các ảnh vượt quá sẽ không được tải lên.' });
    }

    const files = selectedFiles.slice(0, 5);
    setImageFiles(files);
    setImagePreviews(files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    })));
    event.target.value = '';
  };

  const updateAttribute = (id, field, value) => {
    setAttributeRows((rows) => rows.map((row) => (
      row.id === id ? { ...row, [field]: value } : row
    )));
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    const category = categories.find((item) => String(item.id) === String(categoryId));
    setForm((currentForm) => ({ ...currentForm, category_id: categoryId }));
    setAttributeRows((rows) => createRowsFromCategory(category?.attributes, rows));
  };

  const removeAttribute = (id) => {
    setAttributeRows((rows) => {
      const nextRows = rows.filter((row) => row.id !== id);
      return nextRows.length > 0 ? nextRows : [createAttributeRow()];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });
      formData.append('attributes', serializeAttributes(attributeRows));
      imageFiles.forEach((file) => formData.append('images', file));

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/products/${editId}`, formData, { headers });
        setMessage({ type: 'success', text: 'Cập nhật sản phẩm thành công!' });
      } else {
        await axios.post('http://localhost:5000/api/admin/products', formData, { headers });
        setMessage({ type: 'success', text: 'Thêm sản phẩm mới thành công!' });
      }

      resetForm();
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
      stock: prod.stock || 0,
      description: prod.description || ''
    });
    const category = categories.find((item) => String(item.id) === String(prod.category_id));
    setAttributeRows(createRowsFromCategory(category?.attributes, parseAttributeRows(prod.attributes)));
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(prod.images || []);
    setIsEditing(true);
    setIsFormOpen(true);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0"><i className="fa-solid fa-box-open me-2"></i>Quản Lý Sản Phẩm Hệ Thống</h3>
        <button type="button" className="btn btn-dark fw-bold" onClick={openCreateForm}>
          <i className="fa-solid fa-plus me-2"></i>Thêm sản phẩm
        </button>
      </div>

      {/* Form Thêm / Sửa Sản phẩm */}
      {isFormOpen && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                <button type="button" className="btn-close" onClick={resetForm} aria-label="Đóng"></button>
              </div>
              <div className="modal-body p-4">
                {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}

                <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold">Tên sản phẩm</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Danh mục</label>
            <select 
              className="form-select" 
              value={form.category_id} 
              onChange={handleCategoryChange}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold">Giá bán (VNĐ)</label>
            <input 
              type="number" 
              className="form-control" 
              value={form.price} 
              onChange={(e) => setForm({ ...form, price: e.target.value })} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold">Tồn kho (Số lượng)</label>
            <input 
              type="number" 
              className="form-control" 
              value={form.stock} 
              onChange={(e) => setForm({ ...form, stock: e.target.value })} 
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold">Thuộc tính sản phẩm</label>
            {attributeRows.map((row) => (
              <div className="row g-2 mb-2" key={row.id}>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên thuộc tính, ví dụ: RAM"
                    value={row.label}
                    readOnly={categoryAttributeLabels.includes(row.label)}
                    onChange={(e) => updateAttribute(row.id, 'label', e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Giá trị, ví dụ: 8GB"
                    value={row.value}
                    onChange={(e) => updateAttribute(row.id, 'value', e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex gap-2">
                  <button type="button" className="btn btn-outline-primary" onClick={() => setAttributeRows((rows) => [...rows, createAttributeRow()])} title="Thêm thuộc tính">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                  <button type="button" className="btn btn-outline-danger" onClick={() => removeAttribute(row.id)} title="Xóa thuộc tính">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
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
            <label className="form-label small fw-bold">Ảnh sản phẩm</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <small className="text-muted">Tối đa 5 ảnh, mỗi ảnh không quá 5 MB. Khi sửa, chọn ảnh mới để thay bộ ảnh hiện tại.</small>
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="d-flex flex-wrap gap-3 mt-3">
                {existingImages.map((image) => (
                  <div key={image.id} className="text-center">
                    <img src={`http://localhost:5000${image.image_url}`} alt="Ảnh hiện tại" width="96" height="96" className="rounded border object-fit-cover" />
                    <div className="small text-muted mt-1">Ảnh hiện tại</div>
                  </div>
                ))}
                {imagePreviews.map((preview) => (
                  <div key={preview.url} className="text-center">
                    <img src={preview.url} alt={preview.name} width="96" height="96" className="rounded border object-fit-cover" />
                    <div className="small text-success mt-1">Ảnh mới</div>
                  </div>
                ))}
              </div>
            )}
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
                onClick={resetForm}
              >
                Hủy bỏ
              </button>
            )}
          </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isFormOpen && <div className="modal-backdrop fade show" onClick={resetForm}></div>}

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
                  <th className="py-3">Giá</th>
                  <th className="py-3">Tồn kho</th>
                  <th className="py-3">Thuộc tính</th>
                  <th className="py-3 text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-bold">#{p.id}</td>
                    <td className="fw-semibold text-dark">
                      {p.images?.[0]?.image_url && (
                        <img
                          src={`http://localhost:5000${p.images[0].image_url}`}
                          alt={p.name}
                          width="48"
                          height="48"
                          className="rounded object-fit-cover me-2"
                        />
                      )}
                      {p.name}
                    </td>
                    <td><span className="badge bg-secondary">{p.category_name || 'Khác'}</span></td>
                    <td className="text-danger fw-bold">{Number(p.price).toLocaleString('vi-VN')} đ</td>
                    <td><span className={`badge ${p.stock > 0 ? 'bg-success' : 'bg-danger'}`}>{p.stock || 0}</span></td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={formatAttributeValue(p.attributes)}>{formatAttributeValue(p.attributes) || '-'}</td>
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