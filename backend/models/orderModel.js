const pool = require('../config/database');

const Order = {
  // Tạo đơn hàng mới & snapshot thông tin chi tiết
  async createOrder(connection, orderData, items) {
    const { userId, shippingAddress, paymentMethod, note, totalPrice } = orderData;

    // 1. Tạo đơn hàng chính
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, note, status, total_price)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, shippingAddress, paymentMethod, note, totalPrice]
    );
    const orderId = orderResult.insertId;

    // 2. Tạo chi tiết đơn hàng (Snapshot sản phẩm và giá)
    const itemValues = items.map(item => [
      orderId,
      item.product_id,
      item.product_name,
      item.quantity,
      item.unit_price
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES ?`,
      [itemValues]
    );

    return orderId;
  },

  // Lấy lịch sử đơn hàng của cá nhân Khách hàng
  async getOrdersByUser(userId) {
    const [orders] = await pool.query(
      `SELECT id, payment_method, status, total_price, created_at
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    return orders;
  },

  // Lấy chi tiết đơn hàng cho Admin / Staff (bao gồm ghi chú nội bộ & thông tin người đặt)
  async getOrderDetailsForAdmin(orderId) {
    const [orders] = await pool.query(
      `SELECT o.*, u.username, u.email, u.phone
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) return null;

    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return {
      ...orders[0],
      items
    };
  },

  // Cập nhật trạng thái vòng đời đơn hàng
  async updateOrderStatus(orderId, status, internalNote = null) {
    if (internalNote !== null) {
      await pool.query(
        'UPDATE orders SET status = ?, internal_note = ?, updated_at = NOW() WHERE id = ?',
        [status, internalNote, orderId]
      );
    } else {
      await pool.query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, orderId]
      );
    }
  }
};

module.exports = Order;