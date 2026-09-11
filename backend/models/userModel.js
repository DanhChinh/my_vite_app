// models/User.js
const pool = require('../config/database');

const User = {
  // ==========================================
  // CÁC HÀM HIỆN CÓ CỦA BẠN (GIỮ NGUYÊN)
  // ==========================================
  async findById(userId) {
    const [rows] = await pool.query(
      `SELECT 
          u.id, u.username, u.email, u.phone, u.role, u.created_at,
          c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u
       LEFT JOIN customers c ON u.id = c.user_id
       WHERE u.id = ? AND u.is_active = 1`,
      [userId]
    );
    return rows[0] || null;
  },

  async findByLoginIdentifier(identifier) {
    const [rows] = await pool.query(
      `SELECT id, username, password, role, is_active 
       FROM users 
       WHERE (username = ? OR email = ? OR phone = ?) AND is_active = 1`,
      [identifier, identifier, identifier]
    );
    return rows[0] || null;
  },

  async checkExisting(username, email, phone) {
    const [existing] = await pool.query(
      `SELECT username, email, phone FROM users 
       WHERE username = ? 
          OR (email IS NOT NULL AND email = ?) 
          OR (phone IS NOT NULL AND phone = ?)`,
      [username, email, phone]
    );
    return existing;
  },

  async createCustomer(connection, userData) {
    const { username, passwordHash, cleanEmail, cleanPhone, full_name, cleanGender, cleanDob } = userData;
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role, is_active) 
       VALUES (?, ?, ?, ?, 'customer', 1)`,
      [username, passwordHash, cleanEmail, cleanPhone]
    );
    const userId = userResult.insertId;
    await connection.query(
      `INSERT INTO customers (user_id, full_name, gender, date_of_birth) 
       VALUES (?, ?, ?, ?)`,
      [userId, full_name.trim(), cleanGender, cleanDob]
    );
    return userId;
  },

  async findCustomerEmail(email) {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND is_active = 1 AND role = 'customer'",
      [email]
    );
    return users[0] || null;
  },

  async expireExistingResets(connection, userId) {
    await connection.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [userId]
    );
  },

  async createPasswordReset(connection, userId, tokenHash) {
    await connection.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [userId, tokenHash]
    );
  },

  async findValidResetToken(connection, tokenHash) {
    const [resets] = await connection.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );
    return resets[0] || null;
  },

  async updatePassword(connection, userId, passwordHash) {
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId]);
  },

  async markResetTokenAsUsed(connection, resetId) {
    await connection.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [resetId]);
  },

  // ==========================================
  // 1. QUẢN LÝ KHÁCH HÀNG (CUSTOMER MANAGEMENT)
  // ==========================================

  // Lấy danh sách khách hàng (Có phân trang & tìm kiếm)
  async findAllCustomers({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.query(
      `SELECT 
          u.id AS user_id, u.username, u.email, u.phone, u.is_active, u.created_at,
          c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u
       JOIN customers c ON u.id = c.user_id
       WHERE u.role = 'customer'
         AND (c.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.username LIKE ?)
       ORDER BY u.id DESC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM users u
       JOIN customers c ON u.id = c.user_id
       WHERE u.role = 'customer'
         AND (c.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.username LIKE ?)`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    return { data: rows, pagination: { total, page: Number(page), limit: Number(limit) } };
  },

  // Lấy chi tiết khách hàng theo User ID
  async findCustomerById(userId) {
    const [rows] = await pool.query(
      `SELECT 
          u.id AS user_id, u.username, u.email, u.phone, u.is_active, u.created_at,
          c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u
       JOIN customers c ON u.id = c.user_id
       WHERE u.id = ? AND u.role = 'customer'`,
      [userId]
    );
    return rows[0] || null;
  },

  // Khóa / Mở khóa tài khoản khách hàng
  async toggleUserStatus(userId, isActive) {
    const [result] = await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, userId]
    );
    return result.affectedRows > 0;
  },

  // ==========================================
  // 2. QUẢN LÝ NHÂN VIÊN (STAFF MANAGEMENT)
  // ==========================================

  // Lấy danh sách nhân viên
  async findAllStaff({ page = 1, limit = 10, search = '', department = '' }) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;
    let deptCondition = '';
    const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm];

    if (department) {
      deptCondition = ' AND s.department = ?';
      queryParams.push(department);
    }

    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(
      `SELECT 
          s.id AS staff_id, s.position, s.department, s.status AS staff_status,
          s.hire_date, s.salary, s.address, s.updated_at,
          u.id AS user_id, u.username, u.email, u.phone, u.is_active
       FROM staff s
       JOIN users u ON s.user_id = u.id
       WHERE u.role = 'staff'
         AND (s.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.username LIKE ?)` +
        deptCondition +
      ` ORDER BY s.id DESC LIMIT ? OFFSET ?`,
      queryParams
    );

    return rows;
  },

  // Lấy thông tin chi tiết nhân viên
  async findStaffById(staffId) {
    const [rows] = await pool.query(
      `SELECT 
          s.id AS staff_id, s.full_name, s.position, s.department, 
          s.status AS staff_status, s.hire_date, s.salary, s.address,
          u.id AS user_id, u.username, u.email, u.phone, u.is_active
       FROM staff s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [staffId]
    );
    return rows[0] || null;
  },

  // Tạo tài khoản Nhân viên (Dùng Transaction)
  async createStaff(connection, staffData) {
    const { username, passwordHash, email, phone, full_name, address, position, department, status, hire_date, salary } = staffData;

    // 1. Tạo User với role 'staff'
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role, is_active)
       VALUES (?, ?, ?, ?, 'staff', 1)`,
      [username, passwordHash, email || null, phone || null]
    );

    const userId = userResult.insertId;

    // 2. Tạo record trong bảng staff
    const [staffResult] = await connection.query(
      `INSERT INTO staff (user_id, full_name, address, position, department, status, hire_date, salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        full_name,
        address || null,
        position || 'Nhân viên',
        department || 'Bán hàng',
        status || 'active',
        hire_date || null,
        salary || 0.00
      ]
    );

    return { staff_id: staffResult.insertId, user_id: userId };
  },

  // Cập nhật thông tin Nhân viên (Dùng Transaction)
  async updateStaff(connection, staffId, staffData) {
    const { full_name, email, phone, position, department, status, is_active, salary, hire_date, address } = staffData;

    // Lấy user_id từ staff
    const [staffRows] = await connection.query('SELECT user_id FROM staff WHERE id = ?', [staffId]);
    if (!staffRows[0]) return false;
    const userId = staffRows[0].user_id;

    // 1. Cập nhật bảng users
    await connection.query(
      'UPDATE users SET email = ?, phone = ?, is_active = ? WHERE id = ?',
      [email || null, phone || null, is_active, userId]
    );

    // 2. Cập nhật bảng staff
    await connection.query(
      `UPDATE staff 
       SET full_name = ?, address = ?, position = ?, department = ?, status = ?, hire_date = ?, salary = ?
       WHERE id = ?`,
      [full_name, address || null, position, department, status, hire_date || null, salary, staffId]
    );

    return true;
  },

  // Xóa nhân viên (Xóa trong bảng users sẽ tự xóa staff nhờ FK ON DELETE CASCADE)
  async deleteStaff(staffId) {
    const [staffRows] = await pool.query('SELECT user_id FROM staff WHERE id = ?', [staffId]);
    if (!staffRows[0]) return false;

    const userId = staffRows[0].user_id;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    return result.affectedRows > 0;
  }
};

module.exports = User;