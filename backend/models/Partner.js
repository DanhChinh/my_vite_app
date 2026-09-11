// models/Partner.js
const pool = require('../config/database');

const Partner = {
  // Lấy danh sách đối tác
  async findAll({ search = '' }) {
    const searchTerm = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT id, name, supply_type, details, quality_info, created_at
       FROM partners
       WHERE name LIKE ? OR supply_type LIKE ?
       ORDER BY id DESC`,
      [searchTerm, searchTerm]
    );
    return rows;
  },

  // Lấy chi tiết đối tác + Danh sách nhân viên phụ trách
  async findById(partnerId) {
    const [partners] = await pool.query(
      'SELECT id, name, supply_type, details, quality_info, created_at FROM partners WHERE id = ?',
      [partnerId]
    );

    if (!partners[0]) return null;

    // Lấy thêm thông tin các nhân viên được phân công cho đối tác này
    const [assignedStaff] = await pool.query(
      `SELECT s.id AS staff_id, s.full_name, s.position, s.department, ps.assigned_at
       FROM partner_staff ps
       JOIN staff s ON ps.staff_id = s.id
       WHERE ps.partner_id = ?`,
      [partnerId]
    );

    return {
      ...partners[0],
      assigned_staff: assignedStaff
    };
  },

  // Tạo đối tác mới
  async create(partnerData) {
    const { name, supply_type, details, quality_info } = partnerData;
    const [result] = await pool.query(
      `INSERT INTO partners (name, supply_type, details, quality_info)
       VALUES (?, ?, ?, ?)`,
      [name, supply_type || '', details || null, quality_info || null]
    );
    return result.insertId;
  },

  // Cập nhật thông tin đối tác
  async update(partnerId, partnerData) {
    const { name, supply_type, details, quality_info } = partnerData;
    const [result] = await pool.query(
      `UPDATE partners
       SET name = ?, supply_type = ?, details = ?, quality_info = ?
       WHERE id = ?`,
      [name, supply_type || '', details || null, quality_info || null, partnerId]
    );
    return result.affectedRows > 0;
  },

  // Xóa đối tác
  async delete(partnerId) {
    const [result] = await pool.query('DELETE FROM partners WHERE id = ?', [partnerId]);
    return result.affectedRows > 0;
  },

  // Phân công nhân viên phụ trách đối tác (Bảng partner_staff)
  async assignStaff(partnerId, staffId) {
    const [result] = await pool.query(
      `INSERT INTO partner_staff (partner_id, staff_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP`,
      [partnerId, staffId]
    );
    return result.affectedRows > 0;
  },

  // Hủy phân công nhân viên khỏi đối tác
  async removeStaff(partnerId, staffId) {
    const [result] = await pool.query(
      'DELETE FROM partner_staff WHERE partner_id = ? AND staff_id = ?',
      [partnerId, staffId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Partner;