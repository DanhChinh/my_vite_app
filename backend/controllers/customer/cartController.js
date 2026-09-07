const pool = require('../../config/database');

/**
 * Lấy danh sách sản phẩm trong giỏ hàng
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(
      `SELECT 
          ci.id AS cart_item_id, ci.quantity,
          p.id AS product_id, p.name AS product_name, p.price, p.stock,
          pi.image_url AS primary_image,
          (p.price * ci.quantity) AS item_total
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE c.user_id = ?`,
      [userId]
    );

    const totalPrice = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    res.json({
      success: true,
      data: {
        items,
        total_price: totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
exports.addToCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!product_id || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    // Check tồn kho
    const [[product]] = await connection.query(`SELECT id, stock FROM products WHERE id = ?`, [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Tìm hoặc khởi tạo giỏ hàng cho user
    let [[cart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
    if (!cart) {
      const [newCart] = await connection.query(`INSERT INTO carts (user_id) VALUES (?)`, [userId]);
      cart = { id: newCart.insertId };
    }

    // Kiểm tra món hàng trong giỏ
    const [[existingItem]] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cart.id, product_id]
    );

    if (existingItem) {
      const newQty = existingItem.quantity + qtyNum;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
      }
      await connection.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQty, existingItem.id]);
    } else {
      if (qtyNum > product.stock) {
        return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
      }
      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
        [cart.id, product_id, qtyNum]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Thêm vào giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Merge giỏ hàng từ Guest Session vào User Account khi đăng nhập
 */
exports.mergeGuestCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Thiếu session_id' });
    }

    // Lấy cart của guest
    const [[guestCart]] = await connection.query(
      `SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`,
      [session_id]
    );

    if (!guestCart) {
      await connection.commit();
      return res.json({ success: true, message: 'Không có giỏ hàng vãng lai để chuyển' });
    }

    // Lấy hoặc tạo user cart
    let [[userCart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
    if (!userCart) {
      const [newCart] = await connection.query(`INSERT INTO carts (user_id) VALUES (?)`, [userId]);
      userCart = { id: newCart.insertId };
    }

    // Lấy items trong guest cart
    const [guestItems] = await connection.query(
      `SELECT product_id, quantity FROM cart_items WHERE cart_id = ?`,
      [guestCart.id]
    );

    for (const item of guestItems) {
      const [[userItem]] = await connection.query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [userCart.id, item.product_id]
      );

      if (userItem) {
        await connection.query(
          `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`,
          [item.quantity, userItem.id]
        );
      } else {
        await connection.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
          [userCart.id, item.product_id, item.quantity]
        );
      }
    }

    // Xóa guest cart sau khi hợp nhất
    await connection.query(`DELETE FROM carts WHERE id = ?`, [guestCart.id]);

    await connection.commit();
    res.json({ success: true, message: 'Đã hợp nhất giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};