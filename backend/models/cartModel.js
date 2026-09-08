const pool = require('../config/database');

const Cart = {
  // 1. Lấy danh sách sản phẩm trong giỏ hàng của User đã đăng nhập
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

  // 2. Tìm thông tin sản phẩm và kiểm tra tồn kho
  async findProductById(connection, productId) {
    const [[product]] = await connection.query(
      `SELECT id, stock FROM products WHERE id = ?`, 
      [productId]
    );
    return product || null;
  },

  // 3. Tìm giỏ hàng của User trong database
  async findUserCart(connection, userId) {
    const [[cart]] = await connection.query(
      `SELECT id FROM carts WHERE user_id = ?`, 
      [userId]
    );
    return cart || null;
  },

  // 4. Tạo mới giỏ hàng cho User
  async createUserCart(connection, userId) {
    const [newCart] = await connection.query(
      `INSERT INTO carts (user_id) VALUES (?)`, 
      [userId]
    );
    return newCart.insertId;
  },

  // 5. Kiểm tra sản phẩm đã tồn tại trong giỏ hàng của user chưa
  async findCartItem(connection, cartId, productId) {
    const [[existingItem]] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    );
    return existingItem || null;
  },

  // 6. Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItemQuantity(connection, cartItemId, quantity) {
    await connection.query(
      `UPDATE cart_items SET quantity = ? WHERE id = ?`, 
      [quantity, cartItemId]
    );
  },

  // 7. Thêm mới một dòng sản phẩm vào giỏ hàng
  async addCartItem(connection, cartId, productId, quantity) {
    await connection.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
      [cartId, productId, quantity]
    );
  },

  // 8. Tìm item trong giỏ hàng kèm stock và kiểm tra quyền sở hữu của user (dùng khi update/delete item)
  async findUserCartItemWithStock(connection, cartItemId, userId) {
    const [[cartItem]] = await connection.query(
      `SELECT ci.id, p.stock 
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    );
    return cartItem || null;
  },

  // 9. Xóa một sản phẩm khỏi giỏ hàng của user
  async removeUserCartItem(connection, cartItemId, userId) {
    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    );
  }
};

module.exports = Cart;