import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastProvider';

export default function AddressPage() {
  const { token } = useAuth();
  const { showToast } = useToast() || { showToast: console.log };

  // Danh sách địa chỉ từ Database
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      user_id: 1,
      recipient_name: 'Nguyễn Văn A',
      phone: '0987654321',
      province_code: '01',
      province_name: 'Thành phố Hà Nội',
      district_code: '001',
      district_name: 'Quận Ba Đình',
      ward_code: '00001',
      ward_name: 'Phường Phúc Xá',
      specific_address: 'Số 123 đường A',
      address_line: 'Số 123 đường A, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội',
      is_default: 1
    }
  ]);

  // State Dữ liệu Hành chính (Provinces API)
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const [formData, setFormData] = useState({
    recipient_name: '',
    phone: '',
    province_code: '',
    province_name: '',
    district_code: '',
    district_name: '',
    ward_code: '',
    ward_name: '',
    specific_address: '',
    is_default: 0
  });

  // 1. Fetch danh sách Tỉnh / Thành phố khi mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error('Lỗi lấy danh sách Tỉnh/Thành:', err));
  }, []);

  // 2. Fetch Quận/Huyện khi chọn Tỉnh/Thành
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const selected = provinces.find((p) => String(p.code) === String(code));

    setFormData((prev) => ({
      ...prev,
      province_code: code,
      province_name: selected ? selected.name : '',
      district_code: '',
      district_name: '',
      ward_code: '',
      ward_name: ''
    }));

    setDistricts([]);
    setWards([]);

    if (code) {
      setLoadingGeo(true);
      fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          setLoadingGeo(false);
        })
        .catch(() => setLoadingGeo(false));
    }
  };

  // 3. Fetch Phường/Xã khi chọn Quận/Huyện
  const handleDistrictChange = (e) => {
    const code = e.target.value;
    const selected = districts.find((d) => String(d.code) === String(code));

    setFormData((prev) => ({
      ...prev,
      district_code: code,
      district_name: selected ? selected.name : '',
      ward_code: '',
      ward_name: ''
    }));

    setWards([]);

    if (code) {
      setLoadingGeo(true);
      fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
          setLoadingGeo(false);
        })
        .catch(() => setLoadingGeo(false));
    }
  };

  // 4. Chọn Phường/Xã
  const handleWardChange = (e) => {
    const code = e.target.value;
    const selected = wards.find((w) => String(w.code) === String(code));

    setFormData((prev) => ({
      ...prev,
      ward_code: code,
      ward_name: selected ? selected.name : ''
    }));
  };

  // Mở Modal
  const handleOpenModal = async (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        recipient_name: address.recipient_name,
        phone: address.phone,
        province_code: address.province_code || '',
        province_name: address.province_name || '',
        district_code: address.district_code || '',
        district_name: address.district_name || '',
        ward_code: address.ward_code || '',
        ward_name: address.ward_name || '',
        specific_address: address.specific_address || '',
        is_default: address.is_default
      });

      // Fetch lại danh sách Quận/Huyện và Phường/Xã theo mã có sẵn
      if (address.province_code) {
        const resD = await fetch(`https://provinces.open-api.vn/api/p/${address.province_code}?depth=2`);
        const dataD = await resD.json();
        setDistricts(dataD.districts || []);
      }
      if (address.district_code) {
        const resW = await fetch(`https://provinces.open-api.vn/api/d/${address.district_code}?depth=2`);
        const dataW = await resW.json();
        setWards(dataW.wards || []);
      }
    } else {
      setEditingId(null);
      setFormData({
        recipient_name: '',
        phone: '',
        province_code: '',
        province_name: '',
        district_code: '',
        district_name: '',
        ward_code: '',
        ward_name: '',
        specific_address: '',
        is_default: addresses.length === 0 ? 1 : 0
      });
      setDistricts([]);
      setWards([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // Submit Form (Tạo payload khớp với cấu trúc Database)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Ghép tự động chuỗi address_line đầy đủ
    const addressParts = [
      formData.specific_address,
      formData.ward_name,
      formData.district_name,
      formData.province_name
    ].filter(Boolean);

    const fullAddressLine = addressParts.join(', ');

    const payload = {
      ...formData,
      address_line: fullAddressLine
    };

    let updatedList = [...addresses];

    // Xử lý logic is_default duy nhất (Chỉ 1 địa chỉ có is_default = 1)
    if (payload.is_default === 1) {
      updatedList = updatedList.map((item) => ({ ...item, is_default: 0 }));
    }

    if (editingId) {
      updatedList = updatedList.map((item) =>
        item.id === editingId ? { ...payload, id: item.id } : item
      );
      showToast('Cập nhật địa chỉ thành công!', 'success');
    } else {
      updatedList.push({ ...payload, id: Date.now() });
      showToast('Thêm địa chỉ mới thành công!', 'success');
    }

    setAddresses(updatedList);
    handleCloseModal();
  };

  // Đặt mặc định
  const handleSetDefault = (id) => {
    const updated = addresses.map((item) => ({
      ...item,
      is_default: item.id === id ? 1 : 0
    }));
    setAddresses(updated);
    showToast('Đã đặt làm địa chỉ mặc định!', 'info');
  };

  // Xóa địa chỉ
  const handleDelete = (id) => {
    const target = addresses.find((a) => a.id === id);
    if (target?.is_default === 1 && addresses.length > 1) {
      alert('Không thể xóa địa chỉ mặc định. Vui lòng chọn địa chỉ khác làm mặc định trước!');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setAddresses(addresses.filter((item) => item.id !== id));
      showToast('Đã xóa địa chỉ thành công!', 'warning');
    }
  };

  return (
    <div className="card border-0 shadow-sm p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold mb-1">Sổ địa chỉ</h4>
          <p className="text-muted small mb-0">Quản lý danh sách địa chỉ nhận hàng của bạn</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm px-3 fw-semibold">
          <i className="bi bi-plus-lg me-1"></i> Thêm địa chỉ mới
        </button>
      </div>

      {/* List */}
      {addresses.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-geo-alt text-muted fs-1 d-block mb-3"></i>
          <p className="text-muted mb-0">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
        </div>
      ) : (
        <div className="row g-3">
          {addresses.map((item) => (
            <div key={item.id} className="col-12">
              <div
                className={`card border p-3 rounded-3 ${
                  item.is_default === 1 ? 'border-primary bg-light-subtle' : ''
                }`}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h6 className="fw-bold mb-0">{item.recipient_name}</h6>
                      <span className="text-muted">|</span>
                      <span className="text-muted">{item.phone}</span>
                      {item.is_default === 1 && (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-secondary small mb-0">{item.address_line}</p>
                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-center gap-2 ms-auto">
                    {item.is_default !== 1 && (
                      <button
                        onClick={() => handleSetDefault(item.id)}
                        className="btn btn-outline-secondary btn-sm me-1"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="btn btn-link text-primary p-0 me-2 text-decoration-none"
                    >
                      <i className="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-link text-danger p-0 text-decoration-none"
                    >
                      <i className="bi bi-trash fs-5"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Người nhận & SĐT */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Họ tên người nhận (*)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên người nhận"
                        value={formData.recipient_name}
                        onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Số điện thoại (*)</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    {/* Dynamic Select: Tỉnh / Huyện / Xã */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Tỉnh / Thành phố (*)</label>
                      <select
                        className="form-select"
                        value={formData.province_code}
                        onChange={handleProvinceChange}
                        required
                      >
                        <option value="">-- Chọn Tỉnh/Thành --</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Quận / Huyện (*)</label>
                      <select
                        className="form-select"
                        value={formData.district_code}
                        onChange={handleDistrictChange}
                        disabled={!formData.province_code || loadingGeo}
                        required
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Phường / Xã (*)</label>
                      <select
                        className="form-select"
                        value={formData.ward_code}
                        onChange={handleWardChange}
                        disabled={!formData.district_code || loadingGeo}
                        required
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Địa chỉ cụ thể */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Địa chỉ cụ thể (*)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Số nhà, tên đường, ngõ/ngách..."
                        value={formData.specific_address}
                        onChange={(e) => setFormData({ ...formData, specific_address: e.target.value })}
                        required
                      />
                    </div>

                    {/* Default Checkbox */}
                    <div className="col-12">
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_default_check"
                          checked={formData.is_default === 1}
                          onChange={(e) =>
                            setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })
                          }
                          disabled={editingId && addresses.find((a) => a.id === editingId)?.is_default === 1}
                        />
                        <label className="form-check-label small" htmlFor="is_default_check">
                          Đặt làm địa chỉ nhận hàng mặc định
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light px-4" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}