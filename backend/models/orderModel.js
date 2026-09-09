// models/orderModel.js
const pool = require('../config/database');

const Order = {
  // Tạo đơn hàng mới & snapshot thông tin chi tiết
  async createOrder(connection, orderData, items) {
    const { userId, shippingAddress, paymentMethod, note, totalPrice } = orderData;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, note, status, total_price)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, shippingAddress, paymentMethod, note, totalPrice]
    );
    const orderId = orderResult.insertId;

    // Ép kiểu an toàn trước khi map vào SQL
    const itemValues = items.map(item => {
      const price = Number(item.unit_price);
      const safePrice = isNaN(price) ? 0 : price;
      const safeName = item.product_name || 'Sản phẩm';

      return [
        orderId,
        item.product_id,
        safeName,
        item.quantity,
        safePrice
      ];
    });

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES ?`,
      [itemValues]
    );

    return orderId;
  },
  // Trừ tồn kho sản phẩm (chạy trong transaction)
  async decreaseStock(connection, productId, quantity) {
    const [result] = await connection.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, productId, quantity]
    );
    return result.affectedRows > 0;
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

  // Lấy chi tiết đơn hàng dành riêng cho Khách hàng
  async getOrderDetailsForCustomer(userId, orderId) {
    const [orders] = await pool.query(
      `SELECT id, shipping_address, payment_method, note, status, total_price, created_at
       FROM orders 
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) return null;

    const [items] = await pool.query(
      'SELECT product_id, product_name, quantity, unit_price FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return {
      ...orders[0],
      items
    };
  },

  // Lấy chi tiết đơn hàng cho Admin / Staff
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
  },

  // Dành cho Admin: Lấy danh sách tất cả đơn hàng (có lọc theo trạng thái)
  async getAllOrders(status = null) {
    let query = `
      SELECT o.id, o.status, o.total_price, o.payment_method, o.created_at, u.username, u.email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += ` WHERE o.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY o.created_at DESC`;

    const [orders] = await pool.query(query, params);
    return orders;
  },

  // Hoàn lại tồn kho khi hủy đơn hàng (chạy trong transaction)
  async increaseStock(connection, productId, quantity) {
    await connection.query(
      'UPDATE products SET stock = stock + ? WHERE id = ?',
      [quantity, productId]
    );
  }
};

module.exports = Order;