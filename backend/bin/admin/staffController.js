const pool = require('../../config/database');
const bcrypt = require('bcrypt');

/**
 * Lấy danh sách nhân viên
 * GET /api/v1/admin/staffs
 */
exports.getStaffs = async (req, res) => {
  try {
    const { search = '', status } = req.query;
    const filters = ["u.role = 'staff'"];
    const params = [];

    if (search.trim()) {
      filters.push('(u.username LIKE ? OR u.email LIKE ? OR s.full_name LIKE ? OR u.phone LIKE ?)');
      const searchKeyword = `%${search.trim()}%`;
      params.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword);
    }

    if (status) {
      filters.push('s.status = ?');
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT u.id AS user_id, u.username, u.email, u.phone, u.is_active,
              s.id AS staff_id, s.full_name, s.address, s.position, s.department, s.status, s.hire_date, s.salary
       FROM users u
       INNER JOIN staff s ON s.user_id = u.id
       WHERE ${filters.join(' AND ')}
       ORDER BY s.hire_date DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Tạo mới nhân viên (Sử dụng Transaction)
 * POST /api/v1/admin/staffs
 */
exports.createStaff = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { username, password, email, phone, full_name, address, position, department, salary } = req.body;

    if (!username || !email || !full_name) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Username, Email và Họ tên là bắt buộc' });
    }

    // Kiểm tra trùng lặp
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    // 1. Tạo User
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, role, email, phone, is_active)
       VALUES (?, ?, 'staff', ?, ?, 1)`,
      [username, hashedPassword, email, phone || null]
    );

    const userId = userResult.insertId;

    // 2. Tạo Hồ sơ Staff
    const [staffResult] = await connection.query(
      `INSERT INTO staff (user_id, full_name, address, position, department, status, hire_date, salary)
       VALUES (?, ?, ?, ?, ?, 'active', CURDATE(), ?)`,
      [userId, full_name, address || null, position || 'Nhân viên', department || 'Bán hàng', salary || 0]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản nhân viên thành công',
      data: { userId, staffId: staffResult.insertId }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật thông tin nhân viên
 * PUT /api/v1/admin/staffs/:id
 */
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params; // staff_id
    const { full_name, address, position, department, status, salary, phone, email } = req.body;

    const [[staff]] = await pool.query('SELECT user_id FROM staff WHERE id = ?', [id]);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
    }

    await pool.query(
      `UPDATE staff 
       SET full_name = ?, address = ?, position = ?, department = ?, status = ?, salary = ?
       WHERE id = ?`,
      [full_name, address, position, department, status, salary, id]
    );

    if (phone || email) {
      await pool.query(
        `UPDATE users SET phone = COALESCE(?, phone), email = COALESCE(?, email) WHERE id = ?`,
        [phone, email, staff.user_id]
      );
    }

    res.json({ success: true, message: 'Cập nhật thông tin nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};