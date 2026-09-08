const pool = require('../../config/database');

/**
 * Lấy danh sách tất cả đơn hàng (có lọc theo trạng thái, tìm kiếm, phân trang)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const filters = [];
    const params = [];

    if (status) {
      filters.push('o.status = ?');
      params.push(status);
    }

    if (search.trim()) {
      filters.push('(o.id LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR c.full_name LIKE ?)');
      const searchKeyword = `%${search.trim()}%`;
      params.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Đếm tổng số đơn hàng
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(o.id) AS total 
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       ${whereClause}`,
      params
    );

    // Lấy danh sách đơn hàng
    const [orders] = await pool.query(
      `SELECT 
          o.id AS order_id, o.shipping_address, o.payment_method, o.status, 
          o.total_price, o.note, o.created_at,
          u.id AS user_id, u.email, u.phone,
          COALESCE(c.full_name, u.username) AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: orders,
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
 * Xem chi tiết 1 đơn hàng cụ thể
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [[order]] = await pool.query(
      `SELECT 
          o.id AS order_id, o.shipping_address, o.payment_method, o.status, 
          o.total_price, o.note, o.created_at,
          u.id AS user_id, u.username, u.email, u.phone,
          COALESCE(c.full_name, u.username) AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    const [items] = await pool.query(
      `SELECT id, product_id, product_name, quantity, unit_price, (quantity * unit_price) AS total
       FROM order_items
       WHERE order_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cập nhật trạng thái đơn hàng (pending -> processing -> shipping -> completed / cancelled)
 */
exports.updateOrderStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    const [[order]] = await connection.query(`SELECT id, status FROM orders WHERE id = ?`, [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Nếu chuyển sang trạng thái Hủy (cancelled) và trước đó chưa hủy, tiến hành hoàn trả tồn kho
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const [items] = await connection.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
        [id]
      );

      for (const item of items) {
        await connection.query(
          `UPDATE products SET stock = stock + ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

    await connection.commit();
    res.json({ success: true, message: `Cập nhật trạng thái đơn hàng thành ${status}` });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};