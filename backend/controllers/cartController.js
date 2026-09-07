const pool = require('../config/database');

// Hàm trợ giúp lấy session_id từ request (Header hoặc Query)
const getSessionId = (req) => {
  return req.headers['x-session-id'] || req.query.session_id || req.body.session_id;
};

/**
 * Lấy danh sách sản phẩm trong giỏ hàng (Dùng chung cho cả Customer và Guest)
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id; // Nếu đã đăng nhập
    const sessionId = !userId ? getSessionId(req) : null; // Nếu chưa đăng nhập thì lấy session_id
    console.log(userId)
    console.log(sessionId)

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: { items: [], total_price: 0 }
      });
    }

    let query = '';
    let queryParam = '';

    if (userId) {
      query = `
        SELECT 
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
         WHERE c.user_id = ?
      `;
      queryParam = userId;
    } else {
      query = `
        SELECT 
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
         WHERE c.session_id = ? AND c.user_id IS NULL
      `;
      queryParam = sessionId;
    }

    const [items] = await pool.query(query, [queryParam]);
    const totalPrice = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    res.json({
      success: true,
      data: {
        owner_type: userId ? 'customer' : 'guest',
        items: items,
        total_price: totalPrice
      }
    });
  } catch (error) {
    console.error("Lỗi getCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng (Dùng chung cho cả Customer và Guest)
 */
exports.addToCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const sessionId = !userId ? getSessionId(req) : null;

    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin nhận diện giỏ hàng (User hoặc Session)' });
    }

    const { product_id, quantity = 1 } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!product_id || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm hoặc số lượng không hợp lệ' });
    }

    // Kiểm tra tồn kho sản phẩm
    const [[product]] = await connection.query(`SELECT id, stock FROM products WHERE id = ?`, [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    let cartId = null;

    // Tìm hoặc tạo giỏ hàng dựa trên phân quyền
    if (userId) {
      let [[cart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
      if (!cart) {
        const [newCart] = await connection.query(`INSERT INTO carts (user_id, session_id) VALUES (?, NULL)`, [userId]);
        cartId = newCart.insertId;
      } else {
        cartId = cart.id;
      }
    } else {
      let [[cart]] = await connection.query(`SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`, [sessionId]);
      if (!cart) {
        const [newCart] = await connection.query(`INSERT INTO carts (user_id, session_id) VALUES (NULL, ?)`, [sessionId]);
        cartId = newCart.insertId;
      } else {
        cartId = cart.id;
      }
    }

    // Kiểm tra sản phẩm đã có trong cart_items chưa
    const [[existingItem]] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, product_id]
    );

    if (existingItem) {
      const newQty = existingItem.quantity + qtyNum;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: 'Số lượng sản phẩm vượt quá tồn kho' });
      }
      await connection.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQty, existingItem.id]);
    } else {
      if (qtyNum > product.stock) {
        return res.status(400).json({ success: false, message: 'Số lượng sản phẩm vượt quá tồn kho' });
      }
      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
        [cartId, product_id, qtyNum]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Thêm vào giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi addToCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Hợp nhất giỏ hàng từ Guest sang Customer khi đăng nhập
 */
exports.mergeGuestCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const session_id = getSessionId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!session_id) {
      await connection.commit();
      return res.json({ success: true, message: 'Không có session_id để merge' });
    }

    // Lấy giỏ hàng của guest
    const [[guestCart]] = await connection.query(
      `SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`,
      [session_id]
    );

    if (!guestCart) {
      await connection.commit();
      return res.json({ success: true, message: 'Không tìm thấy giỏ hàng vãng lai' });
    }

    // Lấy hoặc tạo giỏ hàng của user
    let [[userCart]] = await connection.query(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
    
    if (!userCart) {
      // Nếu user chưa có giỏ, tận dụng luôn giỏ hàng của guest bằng cách gán user_id và xóa session_id
      await connection.query(
        `UPDATE carts SET user_id = ?, session_id = NULL WHERE id = ?`,
        [userId, guestCart.id]
      );
      await connection.commit();
      return res.json({ success: true, message: 'Đã chuyển giỏ hàng guest thành giỏ hàng user thành công' });
    }

    // Nếu user đã có sẵn giỏ hàng riêng, gộp các item từ guest sang user
    const [guestItems] = await connection.query(
      `SELECT product_id, quantity FROM cart_items WHERE cart_id = ?`,
      [guestCart.id]
    );

    for (const item of guestItems) {
      const [[product]] = await connection.query(`SELECT stock FROM products WHERE id = ?`, [item.product_id]);
      const maxStock = product ? product.stock : 999999;

      const [[userItem]] = await connection.query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [userCart.id, item.product_id]
      );

      if (userItem) {
        let newQty = userItem.quantity + item.quantity;
        if (newQty > maxStock) newQty = maxStock;

        await connection.query(
          `UPDATE cart_items SET quantity = ? WHERE id = ?`,
          [newQty, userItem.id]
        );
      } else {
        let finalQty = item.quantity;
        if (finalQty > maxStock) finalQty = maxStock;

        await connection.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
          [userCart.id, item.product_id, finalQty]
        );
      }
    }

    // Xóa giỏ hàng guest cũ sau khi gộp xong
    await connection.query(`DELETE FROM carts WHERE id = ?`, [guestCart.id]);

    await connection.commit();
    res.json({ success: true, message: 'Đã hợp nhất giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi mergeGuestCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};