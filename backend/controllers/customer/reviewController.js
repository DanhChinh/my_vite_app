const pool = require('../../config/database');

/**
 * Gửi đánh giá sản phẩm (chỉ khi đã mua hàng thành công)
 */
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, title, content } = req.body;

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Thông tin đánh giá không hợp lệ' });
    }

    // Kiểm tra khách hàng đã từng hoàn thành đơn hàng chứa sản phẩm này chưa
    const [[purchaseCheck]] = await pool.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'
       LIMIT 1`,
      [userId, product_id]
    );

    const isVerifiedPurchase = purchaseCheck ? 1 : 0;

    await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, title, content, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [product_id, userId, rating, title || '', content || '', isVerifiedPurchase]
    );

    res.json({
      success: true,
      message: 'Đánh giá của bạn đã được gửi và đang chờ kiểm duyệt'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};