// server/controllers/adminController.js
const pool = require('../config/database');
const fs = require('fs/promises');
const path = require('path');
const { uploadDirectory } = require('../middlewares/uploadMiddleware');

const removeUploadedFiles = async (files = []) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.unlink(path.join(uploadDirectory, file));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }));
};

// ==========================================
// I. QUẢN LÝ NHÂN VIÊN (STAFF MANAGEMENT)
// ==========================================

// 1. Lấy danh sách nhân viên

// 1. Lấy danh sách nhân viên (Join giữa users và staffs)
exports.getStaffs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.user_id, u.username, s.full_name, s.phone, s.address, s.position, u.created_at
      FROM staff s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'staff'
      ORDER BY s.id DESC
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

    const { username, password, full_name, phone, address, position } = req.body;

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

    const [userResult] = await connection.query(
      'INSERT INTO users (username, password, role, created_at) VALUES (?, ?, "staff", NOW())',
      [username, password]
    );
    const userId = userResult.insertId;

    await connection.query(
      'INSERT INTO staff (user_id, full_name, phone, address, position, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, full_name || '', phone || '', address || '', position || 'Nhân viên']
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

// 3. Đặt lại mật khẩu cho nhân viên
exports.resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const [staffRows] = await pool.query('SELECT user_id FROM staff WHERE id = ?', [id]);

    if (staffRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });
    }

    const defaultPassword = 'Password123';
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [defaultPassword, staffRows[0].user_id]);

    res.json({ success: true, message: 'Đã cấp lại mật khẩu mặc định cho nhân viên: Password123' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Xóa nhân viên (Xóa ở bảng users sẽ tự động xóa hoặc xóa tường minh)
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params; // id của bảng staffs

    // Lấy user_id từ bảng staffs trước
    const [staffRows] = await pool.query('SELECT user_id FROM staff WHERE id = ?', [id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });
    }
    const userId = staffRows[0].user_id;

    // Xóa tài khoản trong bảng users (nếu thiết lập CASCADE trong DB thì bảng staffs sẽ tự xóa theo)
    await pool.query('DELETE FROM staff WHERE id = ?', [id]);
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
      'INSERT INTO partners (name, supply_type, details, quality_info, created_at) VALUES (?, ?, ?, ?, NOW())',
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
// III. QUẢN LÝ KHÁCH HÀNG VÀ DANH MỤC
// ==========================================

exports.getCustomers = async (req, res) => {
  try {
    const { search = '', is_active } = req.query;
    const filters = ["u.role = 'customer'"];
    const params = [];

    if (search) {
      filters.push('(u.username LIKE ? OR u.email LIKE ? OR c.full_name LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (is_active !== undefined && is_active !== '') {
      filters.push('u.is_active = ?');
      params.push(Number(is_active) ? 1 : 0);
    }

    const [rows] = await pool.query(
      `SELECT u.id AS user_id, u.username, u.email, u.is_active, u.created_at, u.phone,
              c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u 
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE ${filters.join(' AND ')} 
       ORDER BY u.created_at DESC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  const isActive = Number(req.body.is_active);
  if (![0, 1].includes(isActive)) {
    return res.status(400).json({ success: false, message: 'Trạng thái tài khoản không hợp lệ.' });
  }
  const [result] = await pool.query(
    "UPDATE users SET is_active = ? WHERE id = ? AND role = 'customer'",
    [isActive, req.params.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng.' });
  res.json({ success: true, message: isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.' });
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, slug, attributes = null } = req.body;
  if (!name || !slug) return res.status(400).json({ success: false, message: 'Tên và slug danh mục là bắt buộc.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, attributes) VALUES (?, ?, ?)',
      [name, slug, attributes]
    );
    res.status(201).json({ success: true, categoryId: result.insertId, message: 'Đã tạo danh mục.' });
  } catch (error) {
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, slug, attributes = null } = req.body;
  const [result] = await pool.query(
    'UPDATE categories SET name = ?, slug = ?, attributes = ? WHERE id = ?',
    [name, slug, attributes, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
  res.json({ success: true, message: 'Đã cập nhật danh mục.' });
};

exports.deleteCategory = async (req, res) => {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
  res.json({ success: true, message: 'Đã xóa danh mục.' });
};

// ==========================================
// IV. QUẢN LÝ SẢN PHẨM (ADMIN PRODUCT MANAGEMENT)
// ==========================================

// 1. Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category) {
      query += ' WHERE c.slug = ?';
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    const productIds = rows.map((product) => product.id);
    let images = [];

    if (productIds.length > 0) {
      const [imageRows] = await pool.query(
        'SELECT id, product_id, image_url, is_primary FROM product_images WHERE product_id IN (?) ORDER BY is_primary DESC, id ASC',
        [productIds]
      );
      images = imageRows;
    }

    const data = rows.map((product) => ({
      ...product,
      images: images.filter((image) => image.product_id === product.id)
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { name, category_id, price, stock, description, attributes } = req.body;
    if (!name || !price) {
      await removeUploadedFiles((req.files || []).map((file) => file.filename));
      connection.release();
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và giá sản phẩm!' });
    }

    const [productResult] = await connection.query(
      'INSERT INTO products (category_id, name, price, stock, description, attributes) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id || null, name, price, stock || 0, description || '', attributes || '']
    );
    const productId = productResult.insertId;
    const files = req.files || [];

    for (const [index, file] of files.entries()) {
      await connection.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
        [productId, `/uploads/${file.filename}`, index === 0 ? 1 : 0]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Thêm sản phẩm thành công!', productId });
  } catch (error) {
    await connection.rollback();
    connection.release();
    await removeUploadedFiles((req.files || []).map((file) => file.filename));
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Sửa thông tin sản phẩm
exports.updateProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { name, category_id, price, stock, description, attributes } = req.body;

    const [result] = await connection.query(
      'UPDATE products SET name = ?, category_id = ?, price = ?, stock = ?, description = ?, attributes = ? WHERE id = ?',
      [name, category_id || null, price, stock || 0, description || '', attributes || '', id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      await removeUploadedFiles((req.files || []).map((file) => file.filename));
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần sửa!' });
    }

    const files = req.files || [];
    if (files.length > 0) {
      const [oldImages] = await connection.query(
        'SELECT image_url FROM product_images WHERE product_id = ?',
        [id]
      );
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);

      for (const [index, file] of files.entries()) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, `/uploads/${file.filename}`, index === 0 ? 1 : 0]
        );
      }

      await removeUploadedFiles(oldImages.map((image) => path.basename(image.image_url)));
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    await removeUploadedFiles((req.files || []).map((file) => file.filename));
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const [images] = await connection.query(
      'SELECT image_url FROM product_images WHERE product_id = ?',
      [id]
    );
    await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    const [result] = await connection.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    }

    await connection.commit();
    connection.release();
    await removeUploadedFiles(images.map((image) => path.basename(image.image_url)));

    res.json({ success: true, message: 'Đã xóa sản phẩm thành công!' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// V. THỐNG KÊ HỆ THỐNG (STATISTICS / REPORTS)
// ==========================================

exports.getStatistics = async (req, res) => {
  try {
    const endDate = req.query.to || new Date().toISOString().slice(0, 10);
    const startDate = req.query.from || new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({ success: false, message: 'Khoảng thời gian không hợp lệ.' });
    }
    const dateFilter = 'created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)';
    const range = [startDate, endDate];
    const [salesStats, statusStats, revenueByDay, topProducts, topCategories, topPartners, customerStats, productStats, staffStats, partnerStats] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total_orders, COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders, COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders, COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END), 0) AS total_revenue, COALESCE(AVG(CASE WHEN status = 'completed' THEN total_price END), 0) AS average_order_value FROM orders WHERE ${dateFilter}`, range),
      pool.query(`SELECT status, COUNT(*) AS count FROM orders WHERE ${dateFilter} GROUP BY status ORDER BY count DESC`, range),
      pool.query(`SELECT DATE(created_at) AS date, COALESCE(SUM(total_price), 0) AS revenue, COUNT(*) AS orders FROM orders WHERE status = 'completed' AND ${dateFilter} GROUP BY DATE(created_at) ORDER BY date ASC`, range),
      pool.query(`SELECT p.id, p.name, SUM(oi.quantity) AS quantity, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = 'completed' AND o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY p.id, p.name ORDER BY quantity DESC LIMIT 5`, range),
      pool.query(`SELECT c.name, SUM(oi.quantity) AS quantity, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id LEFT JOIN categories c ON c.id = p.category_id WHERE o.status = 'completed' AND o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY c.id, c.name ORDER BY revenue DESC LIMIT 5`, range),
      pool.query(`SELECT COALESCE(pa.name, 'Chưa phân loại') AS name, SUM(oi.quantity) AS quantity, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id LEFT JOIN partners pa ON pa.id = p.partner_id WHERE o.status = 'completed' AND o.created_at >= ? AND o.created_at < DATE_ADD(?, INTERVAL 1 DAY) GROUP BY pa.id, pa.name ORDER BY revenue DESC LIMIT 5`, range),
      pool.query("SELECT COUNT(*) AS total_customers, SUM(created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)) AS new_customers FROM users WHERE role = 'customer'", range),
      pool.query('SELECT COUNT(id) AS total_products FROM products'),
      pool.query('SELECT COUNT(id) AS total_staff FROM staff'),
      pool.query('SELECT COUNT(id) AS total_partners FROM partners')
    ]);

    res.json({
      success: true,
      data: {
        period: { from: startDate, to: endDate },
        kpis: {
          total_revenue: Number(salesStats[0][0].total_revenue || 0),
          total_orders: Number(salesStats[0][0].total_orders || 0),
          completed_orders: Number(salesStats[0][0].completed_orders || 0),
          cancelled_orders: Number(salesStats[0][0].cancelled_orders || 0),
          average_order_value: Number(salesStats[0][0].average_order_value || 0),
          total_customers: Number(customerStats[0][0].total_customers || 0),
          new_customers: Number(customerStats[0][0].new_customers || 0),
          total_products: Number(productStats[0][0].total_products || 0),
          total_staff: Number(staffStats[0][0].total_staff || 0),
          total_partners: Number(partnerStats[0][0].total_partners || 0)
        },
        order_status: statusStats[0].map((row) => ({ status: row.status, count: Number(row.count) })),
        revenue_by_day: revenueByDay[0].map((row) => ({ date: row.date, revenue: Number(row.revenue), orders: Number(row.orders) })),
        top_products: topProducts[0].map((row) => ({ ...row, quantity: Number(row.quantity), revenue: Number(row.revenue) })),
        top_categories: topCategories[0].map((row) => ({ ...row, quantity: Number(row.quantity), revenue: Number(row.revenue) })),
        top_partners: topPartners[0].map((row) => ({ ...row, quantity: Number(row.quantity), revenue: Number(row.revenue) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};