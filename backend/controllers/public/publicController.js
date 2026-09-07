const pool = require('../../config/database'); // Điều chỉnh đường dẫn tới file pool MySQL của bạn
const crypto = require('crypto');

// Utility: Lấy hoặc tạo session_id từ request
const getSessionId = (req) => {
  return (
    req.headers['x-session-id'] || // Ưu tiên 1: Lấy từ Header X-Session-Id
    req.body?.session_id ||        // Ưu tiên 2: Lấy từ Body
    req.query?.session_id ||       // Ưu tiên 3: Lấy từ Query URL
    req.cookies?.session_id        // Ưu tiên 4: Lấy từ Cookie (nếu có)
  );
};
// =========================================================
// 1. SẢN PHẨM & DANH MỤC (PUBLIC)
// =========================================================

/**
 * Lấy danh sách sản phẩm (có phân trang, lọc theo danh mục, tìm kiếm)
 */
exports.getProducts = async (req, res) => {
  console.log("getProducts called");
  try {
    const { 
      category, 
      category_id, 
      search = '', 
      minPrice, 
      maxPrice, 
      sort = 'newest', 
      page = 1, 
      limit = 12 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const offset = (pageNum - 1) * limitNum;

    const filters = [];
    const params = [];

    // 1. Lọc theo danh mục (category hoặc category_id)
    const selectedCategory = category || category_id;
    if (selectedCategory) {
      filters.push('p.category_id = ?');
      params.push(selectedCategory);
    }

    // 2. Tìm kiếm theo tên sản phẩm
    if (search.trim()) {
      filters.push('p.name LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    // 3. Lọc theo khoảng giá
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filters.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filters.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // 4. Xử lý sắp xếp (OrderBy)
    let orderByClause = 'ORDER BY p.created_at DESC';
    switch (sort) {
      case 'price_asc':
        orderByClause = 'ORDER BY p.price ASC';
        break;
      case 'price_desc':
        orderByClause = 'ORDER BY p.price DESC';
        break;
      case 'popular':
        orderByClause = 'ORDER BY p.stock ASC'; // Ưu tiên số lượng tồn kho ít / hoặc cột lượt mua nếu có
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY p.created_at DESC';
        break;
    }

    // 5. Đếm tổng số bản ghi
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(p.id) AS total FROM products p ${whereClause}`,
      params
    );

    // 6. Truy vấn danh sách sản phẩm (Khớp 100% tên cột trong DB Schema)
    const [products] = await pool.query(
      `SELECT 
          p.id, 
          p.category_id,
          p.partner_id,
          p.name, 
          p.description,
          p.price, 
          p.stock, 
          p.attributes, 
          p.created_at,
          c.name AS category_name, 
          c.slug AS category_slug,
          pi.image_url AS image_url
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       ${whereClause}
       ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    // 7. Trả về Response chuẩn định dạng Frontend cần
    res.json({
      success: true,
      data: {
        items: products,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Lỗi getProducts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy chi tiết sản phẩm + danh sách ảnh + đánh giá đã được duyệt
 */
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Thông tin sản phẩm
    const [[product]] = await pool.query(
      `SELECT p.*, c.name AS category_name, pt.name AS partner_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN partners pt ON pt.id = p.partner_id
       WHERE p.id = ?`,
      [id]
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // 2. Danh sách ảnh sản phẩm
    const [images] = await pool.query(
      `SELECT id, image_url, is_primary FROM product_images WHERE product_id = ?`,
      [id]
    );

    // 3. Đánh giá đã duyệt (approved)
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.content, r.is_verified_purchase, r.created_at,
              COALESCE(c.full_name, u.username) AS reviewer_name
       FROM product_reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        images,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// 2. GIỎ HÀNG DÀNH CHO GUEST (GUEST CART)
// =========================================================

/**
 * Lấy chi tiết giỏ hàng theo Session ID
 */
/**
 * Lấy giỏ hàng Guest
 */
exports.getGuestCart = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return res.json({ 
        success: true, 
        data: { items: [], total_price: 0 } 
      });
    }

    // Alias tên cột khớp 100% với Frontend (id, name, image_url)
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

    const totalPrice = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        items: items,
        total_price: totalPrice
      }
    });
  } catch (error) {
    console.error("Lỗi getGuestCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng Guest
 */
exports.addToGuestCart = async (req, res) => {
  console.log('addToGuestCart')
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let sessionId = getSessionId(req);
    if (!sessionId) {
      sessionId = crypto.randomUUID(); // Tự sinh nếu client chưa có
    }

    const { product_id, quantity = 1 } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!product_id || qtyNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ' });
    }

    // Kiểm tra tồn kho sản phẩm
    const [[product]] = await connection.query(
      `SELECT id, stock FROM products WHERE id = ?`,
      [product_id]
    );

    if (!product) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    if (product.stock < qtyNum) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Số lượng tồn kho không đủ' });
    }

    // Tìm hoặc tạo Cart cho Guest
    let [[cart]] = await connection.query(
      `SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`,
      [sessionId]
    );

    if (!cart) {
      const [insertCart] = await connection.query(
        `INSERT INTO carts (session_id, user_id) VALUES (?, NULL)`,
        [sessionId]
      );
      cart = { id: insertCart.insertId };
    }

    // Kiểm tra item đã có trong giỏ chưa
    const [[existingItem]] = await connection.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cart.id, product_id]
    );

    if (existingItem) {
      const newQty = existingItem.quantity + qtyNum;
      if (newQty > product.stock) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
      }
      await connection.query(
        `UPDATE cart_items SET quantity = ? WHERE id = ?`,
        [newQty, existingItem.id]
      );
    } else {
      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
        [cart.id, product_id, qtyNum]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
      session_id: sessionId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật số lượng item trong giỏ hàng Guest
 */
exports.updateGuestCartItem = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { cart_item_id, quantity } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!sessionId || !cart_item_id || qtyNum <= 0) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    // Kiểm tra giỏ thuộc session_id này
    const [[cartItem]] = await pool.query(
      `SELECT ci.id, p.stock 
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND c.session_id = ? AND c.user_id IS NULL`,
      [cart_item_id, sessionId]
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Sản phẩm trong giỏ không tồn tại' });
    }

    if (qtyNum > cartItem.stock) {
      return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
    }

    await pool.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [qtyNum, cart_item_id]);

    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xóa item khỏi giỏ hàng Guest
 */
exports.removeGuestCartItem = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { cart_item_id } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID không tồn tại' });
    }

    await pool.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE ci.id = ? AND c.session_id = ? AND c.user_id IS NULL`,
      [cart_item_id, sessionId]
    );

    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================
// 3. ĐẶT HÀNG KHÔNG CẦN ĐĂNG NHẬP (GUEST CHECKOUT)
// =========================================================

/**
 * Guest Đặt hàng trực tiếp từ giỏ hàng hoặc mua ngay
 */
exports.guestCheckout = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sessionId = getSessionId(req);
    const {
      full_name,
      email,
      phone,
      shipping_address,
      payment_method = 'cod',
      note = ''
    } = req.body;

    if (!full_name || !phone || !shipping_address) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    }

    // 1. Lấy danh sách sản phẩm từ Cart của Session
    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name AS product_name, p.price, p.stock
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products p ON p.id = ci.product_id
       WHERE c.session_id = ? AND c.user_id IS NULL`,
      [sessionId]
    );

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
    }

    // 2. Kiểm tra lại tồn kho và tính tổng tiền
    let totalPrice = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw new Error(`Sản phẩm "${item.product_name}" không đủ số lượng tồn kho`);
      }
      totalPrice += Number(item.price) * item.quantity;
    }

    // 3. Xử lý User Account cho Guest (Tạo mới User dạng guest/customer nếu chưa có email/phone)
    let userId = null;
    if (phone) {
      const [[existingUser]] = await connection.query(
        `SELECT id FROM users WHERE phone = ? OR (email = ? AND email IS NOT NULL)`,
        [phone, email || null]
      );

      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // Nếu là Guest hoàn toàn mới, tạo bản ghi user vãng lai
    if (!userId) {
      const randomUsername = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const dummyPassword = crypto.randomBytes(16).toString('hex'); // Guest không dùng password này

      const [newUser] = await connection.query(
        `INSERT INTO users (username, password, role, email, phone, is_active)
         VALUES (?, ?, 'customer', ?, ?, 1)`,
        [randomUsername, dummyPassword, email || null, phone]
      );

      userId = newUser.insertId;

      // Tạo hồ sơ customer
      await connection.query(
        `INSERT INTO customers (user_id, full_name) VALUES (?, ?)`,
        [userId, full_name]
      );
    }

    // 4. Tạo Order
    const [newOrder] = await connection.query(
      `INSERT INTO orders (user_id, shipping_address, payment_method, note, status, total_price)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, shipping_address, payment_method, note, totalPrice]
    );

    const orderId = newOrder.insertId;

    // 5. Thêm Order Items & Giảm Stock
    for (const item of cartItems) {
      // Snapshot sản phẩm vào order_items
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.quantity, item.price]
      );

      // Trừ số lượng tồn kho
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // 6. Xóa giỏ hàng Guest sau khi đặt hàng thành công
    await connection.query(
      `DELETE c FROM carts c WHERE c.session_id = ? AND c.user_id IS NULL`,
      [sessionId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        order_id: orderId,
        total_price: totalPrice,
        payment_method
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Tra cứu đơn hàng dành cho Guest (Không cần đăng nhập, chỉ cần Order ID và Số điện thoại)
 */
exports.trackGuestOrder = async (req, res) => {
  try {
    const { order_id, phone } = req.query;

    if (!order_id || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn hàng và số điện thoại' });
    }

    // Lấy thông tin đơn hàng xác thực qua Phone
    const [[order]] = await pool.query(
      `SELECT o.id AS order_id, o.shipping_address, o.payment_method, o.status, 
              o.total_price, o.created_at, u.phone, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ? AND u.phone = ?`,
      [order_id, phone]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đơn hàng' });
    }

    // Lấy chi tiết món hàng
    const [items] = await pool.query(
      `SELECT id, product_id, product_name, quantity, unit_price, (quantity * unit_price) AS total
       FROM order_items
       WHERE order_id = ?`,
      [order_id]
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

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT * FROM categories`
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}



