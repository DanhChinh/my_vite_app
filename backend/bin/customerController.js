// server/controllers/customerController.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.username, u.email, c.full_name, c.phone, c.address, c.avatar_url
       FROM users u
       LEFT JOIN customers c ON u.id = c.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng!'
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, email, avatar_url } = req.body;

    const [existing] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO customers (user_id, full_name, phone, address, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, full_name || '', phone || '', address || '']
      );
    } else {
      await pool.query(
        `UPDATE customers
         SET full_name = ?, phone = ?, address = ?, avatar_url = ?
         WHERE user_id = ?`,
        [full_name || '', phone || '', address || '', avatar_url || null, userId]
      );
    }

    if (email) {
      await pool.query('UPDATE users SET email = ? WHERE id = ?', [email, userId]);
    }

    res.json({ success: true, message: 'Cập nhật thông tin giao hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
  }
  const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (users.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
  const currentMatches = users[0].password?.startsWith('$2')
    ? await bcrypt.compare(current_password, users[0].password)
    : current_password === users[0].password;
  if (!currentMatches) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [await bcrypt.hash(new_password, 12), req.user.id]);
  res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
};

exports.getAddresses = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC',
    [req.user.id]
  );
  res.json({ success: true, data: rows });
};

exports.createAddress = async (req, res) => {
  const { recipient_name, phone, address_line, is_default = false } = req.body;
  if (!recipient_name || !phone || !address_line) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin địa chỉ.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (is_default) await connection.query('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await connection.query(
      'INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line, is_default) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, recipient_name, phone, address_line, is_default ? 1 : 0]
    );
    await connection.commit();
    res.status(201).json({ success: true, message: 'Đã thêm địa chỉ.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.updateAddress = async (req, res) => {
  const { recipient_name, phone, address_line, is_default = false } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (is_default) await connection.query('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    const [result] = await connection.query(
      `UPDATE customer_addresses SET recipient_name = ?, phone = ?, address_line = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [recipient_name, phone, address_line, is_default ? 1 : 0, req.params.addressId, req.user.id]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });
    }
    await connection.commit();
    res.json({ success: true, message: 'Đã cập nhật địa chỉ.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.deleteAddress = async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM customer_addresses WHERE id = ? AND user_id = ?',
    [req.params.addressId, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ.' });
  res.json({ success: true, message: 'Đã xóa địa chỉ.' });
};

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
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, shipping_address, payment_method = 'cod', note = '' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const productIds = items.map((item) => item.product_id);
    const [products] = await connection.query(
      'SELECT id, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [productIds]
    );
    const productMap = new Map(products.map((product) => [product.id, product]));
    let orderTotal = 0;

    for (const item of items) {
      const product = productMap.get(Number(item.product_id));
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Sản phẩm hoặc số lượng không hợp lệ.');
      }
      if (product.stock < quantity) {
        throw new Error(`Sản phẩm #${product.id} không đủ tồn kho.`);
      }
      orderTotal += Number(product.price) * quantity;
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, note, status, total_price)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, shipping_address || '', payment_method, note, orderTotal]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, productMap.get(Number(item.product_id)).price]
      );
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Đặt hàng thành công!',
      orderId,
      total_price: orderTotal,
      shipping_address: shipping_address || ''
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, shipping_address, payment_method, note, status, total_price, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.orderId, req.user.id]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    const [items] = await pool.query(
      `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name
       FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [req.params.orderId]
    );
    res.json({ success: true, data: { ...orders[0], items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'pending' FOR UPDATE",
      [req.params.orderId, req.user.id]
    );
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Đơn hàng không thể hủy.' });
    }
    const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.orderId]);
    for (const item of items) {
      await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    await connection.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [req.params.orderId]);
    await connection.commit();
    res.json({ success: true, message: 'Đã hủy đơn hàng.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};