// server/controllers/adminController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// ==========================================
// I. QUẢN LÝ NHÂN VIÊN (STAFF MANAGEMENT)
// ==========================================

// 1. Lấy danh sách nhân viên

// 1. Lấy danh sách nhân viên (Join giữa users và staffs)
exports.getStaffs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.user_id, u.username, s.full_name, s.department, s.position, s.salary, u.created_at
      FROM staffs s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'staff'
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Thêm nhân viên mới (Ghi vào cả users và staffs)
exports.createStaff = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { username, password, full_name, department, position, salary } = req.body;

    // Kiểm tra đặc tả username và password
    const noSpaceRegex = /^\S+$/;
    if (!username || !password) {
      await connection.release();
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
    }
    if (!noSpaceRegex.test(username) || !noSpaceRegex.test(password)) {
      await connection.release();
      return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu không được chứa khoảng trắng!' });
    }
    if (username.length < 8 || username.length > 16 || password.length < 8 || password.length > 16) {
      await connection.release();
      return res.status(400).json({ success: false, message: 'Tên đăng nhập và mật khẩu phải từ 8 đến 16 ký tự!' });
    }

    // Kiểm tra trùng username
    const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      await connection.release();
      return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã tồn tại!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Bước A: Thêm vào bảng users (lấy quyền staff)
    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, "staff")',
      [username, hashedPassword]
    );
    const userId = userResult.insertId;

    // Bước B: Thêm vào bảng staffs (liên kết user_id)
    await connection.query(
      'INSERT INTO staffs (user_id, full_name, department, position, salary) VALUES (?, ?, ?, ?, ?)',
      [userId, full_name || '', department || '', position || 'Nhân viên', salary || 0]
    );

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Tạo tài khoản nhân viên thành công!' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Xóa nhân viên (Xóa ở bảng users sẽ tự động xóa hoặc xóa tường minh)
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params; // id của bảng staffs

    // Lấy user_id từ bảng staffs trước
    const [staffRows] = await pool.query('SELECT user_id FROM staffs WHERE id = ?', [id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });
    }
    const userId = staffRows[0].user_id;

    // Xóa tài khoản trong bảng users (nếu thiết lập CASCADE trong DB thì bảng staffs sẽ tự xóa theo)
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Đã xóa tài khoản nhân viên thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// II. QUẢN LÝ ĐỐI TÁC (PARTNERS MANAGEMENT)
// ==========================================

// 1. Lấy danh sách đối tác
exports.getPartners = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM partners ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Thêm đối tác mới
exports.createPartner = async (req, res) => {
  try {
    const { name, supply_type, details, quality_info } = req.body;
    if (!name || !supply_type || !details) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc của đối tác!' });
    }

    await pool.query(
      'INSERT INTO partners (name, supply_type, details, quality_info) VALUES (?, ?, ?, ?)',
      [name, supply_type, details, quality_info || '']
    );

    res.json({ success: true, message: 'Thêm đối tác thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Sửa thông tin đối tác
exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supply_type, details, quality_info } = req.body;

    const [result] = await pool.query(
      'UPDATE partners SET name = ?, supply_type = ?, details = ?, quality_info = ? WHERE id = ?',
      [name, supply_type, details, quality_info, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác cần sửa!' });
    }

    res.json({ success: true, message: 'Cập nhật thông tin đối tác thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Xóa đối tác
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM partners WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác!' });
    }

    res.json({ success: true, message: 'Đã xóa đối tác thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ==========================================
// III. QUẢN LÝ SẢN PHẨM (ADMIN PRODUCT MANAGEMENT)
// ==========================================

// 1. Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, category_id, price, description } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và giá sản phẩm!' });
    }

    await pool.query(
      'INSERT INTO products (name, category_id, price, description) VALUES (?, ?, ?, ?)',
      [name, category_id || null, price, description || '']
    );

    res.json({ success: true, message: 'Thêm sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Sửa thông tin sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, price, description } = req.body;

    const [result] = await pool.query(
      'UPDATE products SET name = ?, category_id = ?, price = ?, description = ? WHERE id = ?',
      [name, category_id || null, price, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần sửa!' });
    }

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    }

    res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// IV. THỐNG KÊ HỆ THỐNG (STATISTICS / REPORTS)
// ==========================================

exports.getStatistics = async (req, res) => {
  try {
    // 1. Tổng doanh thu & tổng số đơn hàng
    const [orderStats] = await pool.query(`
      SELECT 
        COUNT(id) as total_orders,
        SUM(total_price) as total_revenue
      FROM orders
      WHERE status != 'Cancelled'
    `);

    // 2. Tổng số lượng sản phẩm
    const [productStats] = await pool.query('SELECT COUNT(id) as total_products FROM products');

    // 3. Tổng số nhân viên
    const [staffStats] = await pool.query('SELECT COUNT(id) as total_staff FROM users WHERE role = "staff"');

    // 4. Tổng số đối tác
    const [partnerStats] = await pool.query('SELECT COUNT(id) as total_partners FROM partners');

    res.json({
      success: true,
      data: {
        total_revenue: orderStats[0].total_revenue || 0,
        total_orders: orderStats[0].total_orders || 0,
        total_products: productStats[0].total_products || 0,
        total_staff: staffStats[0].total_staff || 0,
        total_partners: partnerStats[0].total_partners || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};