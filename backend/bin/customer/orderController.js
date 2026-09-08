const pool = require('../../config/database');

/**
 * Đặt hàng từ giỏ hàng đã đăng nhập
 */
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    // Nhận đúng cấu trúc từ customer_info và payment_method do Frontend gửi lên
    const { customer_info, payment_method = 'COD' } = req.body;

    if (!customer_info || !customer_info.address) {
      return res.status(400).json({ success: false, message: 'Địa chỉ giao hàng không được để trống' });
    }

    if (!customer_info.full_name || !customer_info.phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ tên và số điện thoại người nhận' });
    }

    const shipping_address = customer_info.address;
    const note = customer_info.note || '';

    // Lấy giỏ hàng
    const [[cart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
    }

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name AS product_name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
    }

    let totalPrice = 0;
    for (const item of cartItems) {
      const [[product]] = await connection.query(
        `SELECT stock FROM products WHERE id = ? FOR UPDATE`, 
        [item.product_id]
      );

      if (!product || product.stock < item.quantity) {
        const err = new Error(`Sản phẩm "${item.product_name}" không đủ số lượng tồn kho`);
        err.statusCode = 400;
        throw err;
      }

      totalPrice += Number(item.price) * item.quantity;
    }

    // Tạo đơn hàng
    const [newOrder] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, note, status, total_price)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, shipping_address, payment_method, note, totalPrice]
    );

    const orderId = newOrder.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cart.id]);

    await connection.commit();
    res.json({
      success: true,
      message: 'Đặt hàng thành công',
      order_id: orderId, // Đưa ra root để frontend nhận diện chính xác
      data: { order_id: orderId, total_price: totalPrice }
    });
  } catch (error) {
    await connection.rollback();
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
/**
 * Xem lịch sử danh sách đơn hàng
 */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const filters = ['user_id = ?'];
    const params = [userId];

    if (status) {
      filters.push('status = ?');
      params.push(status);
    }

    const whereClause = filters.join(' AND ');

    // 1. Tạo câu query đếm tổng số lượng
    const countSql = `SELECT COUNT(id) AS total FROM orders WHERE ${whereClause}`;
    console.log("SQL Count:", pool.format(countSql, params));

    const [[{ total }]] = await pool.query(countSql, params);

    // 2. Tạo câu query lấy danh sách orders có phân trang
    const ordersSql = `SELECT id, total_price, status, payment_method, shipping_address, created_at
       FROM orders
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`;
       
    // Lưu ý: truyền thêm limitNum và offset vào mảng params khi dùng format
    console.log("SQL Orders:", pool.format(ordersSql, [...params, limitNum, offset]));

    const [orders] = await pool.query(ordersSql, [...params, limitNum, offset]);

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
    console.error("Lỗi getMyOrders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Chi tiết đơn hàng
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [[order]] = await pool.query(
      `SELECT id, shipping_address, payment_method, note, status, total_price, created_at
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [id, userId]
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

    res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Khách hàng hủy đơn hàng (khi đơn còn ở trạng thái pending)
 */
exports.cancelOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { id } = req.params;

    const [[order]] = await connection.query(
      `SELECT id, status FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' });
    }

    // Hoàn trả số lượng tồn kho
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

    // Cập nhật trạng thái hủy
    await connection.query(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [id]);

    await connection.commit();
    res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};