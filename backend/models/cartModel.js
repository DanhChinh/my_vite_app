const pool = require('../config/database');

const Cart = {
  async getCartItemsByUserId(userId) {
    const [items] = await pool.query(
      `SELECT 
          p.id AS id,
          p.id AS product_id,
          ci.id AS cart_item_id, 
          ci.quantity,
          p.name AS name, 
          p.price AS price, 
          p.stock AS stock,
          pi.image_url AS image_url,
          (p.price * ci.quantity) AS item_total
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE c.user_id = ?`,
      [userId]
    );
    return items;
  },

  async getCartItemsBySessionId(sessionId) {
    const [items] = await pool.query(
      `SELECT 
          p.id AS id,
          p.id AS product_id,
          ci.id AS cart_item_id, 
          ci.quantity,
          p.name AS name, 
          p.price AS price, 
          p.stock AS stock,
          pi.image_url AS image_url,
          (p.price * ci.quantity) AS item_total
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE c.session_id = ? AND c.user_id IS NULL`,
      [sessionId]
    );
    return items;
  },

  async findProductById(connection, productId) {
    const [[product]] = await connection.query(`SELECT id, stock FROM products WHERE id = ?`, [productId]);
    return product || null;
  },

  async findUserCart(connection, userId) {
    const [[cart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
    return cart || null;
  },

  async findGuestCart(connection, sessionId) {
    const [[cart]] = await connection.query(`SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`, [sessionId]);
    return cart || null;
  },

  async createUserCart(connection, userId) {
    const [newCart] = await connection.query(`INSERT INTO carts (user_id, session_id) VALUES (?, NULL)`, [userId]);
    return newCart.insertId;
  },

  async createGuestCart(connection, sessionId) {
    const [insertCart] = await connection.query(`INSERT INTO carts (session_id, user_id) VALUES (?, NULL)`, [sessionId]);
    return insertCart.insertId;
  },

  async findCartItem(connection, cartId, productId) {
    const [[existingItem]] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    );
    return existingItem || null;
  },

  async updateCartItemQuantity(connection, cartItemId, quantity) {
    await connection.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [quantity, cartItemId]);
  },

  async addCartItem(connection, cartId, productId, quantity) {
    await connection.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
      [cartId, productId, quantity]
    );
  },

  async getGuestCartItemsForMerge(connection, cartId) {
    const [guestItems] = await connection.query(
      `SELECT product_id, quantity FROM cart_items WHERE cart_id = ?`,
      [cartId]
    );
    return guestItems;
  },

  async convertGuestCartToUser(connection, userId, guestCartId) {
    await connection.query(
      `UPDATE carts SET user_id = ?, session_id = NULL WHERE id = ?`,
      [userId, guestCartId]
    );
  },

  async deleteCart(connection, cartId) {
    await connection.query(`DELETE FROM carts WHERE id = ?`, [cartId]);
  },

  async findGuestCartItemWithStock(connection, cartItemId, sessionId) {
    const [[cartItem]] = await connection.query(
      `SELECT ci.id, p.stock 
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND c.session_id = ? AND c.user_id IS NULL`,
      [cartItemId, sessionId]
    );
    return cartItem || null;
  },

  async removeGuestCartItem(connection, cartItemId, sessionId) {
    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE ci.id = ? AND c.session_id = ? AND c.user_id IS NULL`,
      [cartItemId, sessionId]
    );
  }
};

module.exports = Cart;










