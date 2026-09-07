const pool = require('../../config/database');

/**
 * Lấy danh sách khách hàng (Có tìm kiếm, lọc active, phân trang và tổng chi tiêu)
 * GET /api/v1/admin/customers
 */
exports.getCustomers = async (req, res) => {
  try {
    const { search = '', is_active, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const filters = ["u.role = 'customer'"];
    const params = [];

    if (search.trim()) {
      filters.push('(u.username LIKE ? OR u.email LIKE ? OR c.full_name LIKE ? OR u.phone LIKE ?)');
      const searchKeyword = `%${search.trim()}%`;
      params.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword);
    }

    if (is_active !== undefined && is_active !== '') {
      filters.push('u.is_active = ?');
      params.push(Number(is_active) === 1 ? 1 : 0);
    }

    const whereClause = filters.join(' AND ');

    // 1. Đếm tổng số bản ghi
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(u.id) AS total 
       FROM users u 
       LEFT JOIN customers c ON c.user_id = u.id 
       WHERE ${whereClause}`,
      params
    );

    // 2. Lấy danh sách kèm số đơn và tổng chi tiêu (Đã sửa o.total_price)
    const [rows] = await pool.query(
      `SELECT 
          u.id AS user_id, u.username, u.email, u.phone, u.is_active, u.created_at,
          c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url,
          COUNT(DISTINCT o.id) AS total_orders,
          COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_price ELSE 0 END), 0) AS total_spent
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       LEFT JOIN orders o ON o.user_id = u.id
       WHERE ${whereClause}
       GROUP BY 
          u.id, u.username, u.email, u.phone, u.is_active, u.created_at,
          c.id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Xem chi tiết 1 khách hàng (Hồ sơ, Sổ địa chỉ, Lịch sử đơn hàng)
 * GET /api/v1/admin/customers/:id
 */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Hồ sơ cá nhân
    const [[customer]] = await pool.query(
      `SELECT u.id AS user_id, u.username, u.email, u.phone, u.is_active, u.created_at,
              c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ? AND u.role = 'customer'`,
      [id]
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
    }

    // 2. Danh sách địa chỉ giao hàng
    const [addresses] = await pool.query(
      `SELECT id, recipient_name, phone, address_line, specific_address, 
              ward_name, district_name, province_name, is_default
       FROM customer_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [id]
    );

    // 3. Lịch sử đơn hàng gần đây (Đã sửa: total_price & bỏ payment_status)
    const [recentOrders] = await pool.query(
      `SELECT id, total_price, status, payment_method, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...customer,
        addresses,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Khóa / Mở khóa tài khoản người dùng (Khách hàng hoặc Nhân viên)
 * PATCH /api/v1/admin/users/:id/active
 */
exports.toggleUserActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({ success: false, message: 'Trạng thái is_active là bắt buộc' });
    }

    const [result] = await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    res.json({
      success: true,
      message: `Đã ${is_active ? 'kích hoạt' : 'khóa'} tài khoản thành công`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};