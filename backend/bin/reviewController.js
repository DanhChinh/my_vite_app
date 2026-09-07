const pool = require('../config/database');

exports.getProductReviews = async (req, res) => {
  try {
    const [summaryRows] = await pool.query(
      `SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
       FROM product_reviews WHERE product_id = ? AND status = 'approved'`,
      [req.params.productId]
    );
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.content, r.is_verified_purchase,
              r.admin_reply, r.replied_at, r.created_at,
              COALESCE(c.full_name, u.username) AS author_name
       FROM product_reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json({
      success: true,
      data: {
        summary: {
          review_count: Number(summaryRows[0].review_count),
          average_rating: Number(summaryRows[0].average_rating)
        },
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReview = async (req, res) => {
  const { rating, title = '', content, order_id } = req.body;
  const productId = req.params.productId;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Số sao và nội dung đánh giá là bắt buộc.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [purchases] = await connection.query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'
       LIMIT 1`,
      [order_id, req.user.id, productId]
    );
    if (purchases.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và hoàn tất.' });
    }

    await connection.query(
      `INSERT INTO product_reviews
       (product_id, user_id, order_id, rating, title, content, status, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)`,
      [productId, req.user.id, order_id, Number(rating), title.trim(), content.trim()]
    );
    await connection.commit();
    res.status(201).json({ success: true, message: 'Đánh giá đã được gửi và đang chờ duyệt.' });
  } catch (error) {
    await connection.rollback();
    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Bạn đã đánh giá sản phẩm trong đơn hàng này.' : error.message
    });
  } finally {
    connection.release();
  }
};

exports.getReviewableOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.created_at
       FROM orders o JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'
       AND NOT EXISTS (
         SELECT 1 FROM product_reviews r
         WHERE r.order_id = o.id AND r.product_id = oi.product_id
       )
       ORDER BY o.created_at DESC`,
      [req.user.id, req.params.productId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  const { rating, title = '', content } = req.body;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Số sao và nội dung đánh giá là bắt buộc.' });
  }
  const [result] = await pool.query(
    `UPDATE product_reviews SET rating = ?, title = ?, content = ?, status = 'pending'
     WHERE id = ? AND user_id = ?`,
    [Number(rating), title.trim(), content.trim(), req.params.reviewId, req.user.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
  res.json({ success: true, message: 'Đánh giá đã cập nhật và chờ duyệt lại.' });
};

exports.deleteReview = async (req, res) => {
  const [result] = await pool.query('DELETE FROM product_reviews WHERE id = ? AND user_id = ?', [req.params.reviewId, req.user.id]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
  res.json({ success: true, message: 'Đã xóa đánh giá.' });
};

exports.getAdminReviews = async (req, res) => {
  try {
    const { status = '' } = req.query;
    const params = [];
    const condition = status ? 'AND r.status = ?' : '';
    if (status) params.push(status);
    const [rows] = await pool.query(
      `SELECT r.*, p.name AS product_name, u.username,
              COALESCE(c.full_name, u.username) AS author_name
       FROM product_reviews r
       JOIN products p ON p.id = r.product_id
       JOIN users u ON u.id = r.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE 1 = 1 ${condition} ORDER BY r.created_at DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  const allowedStatuses = ['pending', 'approved', 'rejected', 'hidden'];
  if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Trạng thái đánh giá không hợp lệ.' });
  const [result] = await pool.query('UPDATE product_reviews SET status = ? WHERE id = ?', [req.body.status, req.params.reviewId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
  res.json({ success: true, message: 'Đã cập nhật trạng thái đánh giá.' });
};

exports.replyReview = async (req, res) => {
  if (!req.body.admin_reply?.trim()) return res.status(400).json({ success: false, message: 'Nội dung phản hồi là bắt buộc.' });
  const [result] = await pool.query(
    'UPDATE product_reviews SET admin_reply = ?, replied_by = ?, replied_at = NOW() WHERE id = ?',
    [req.body.admin_reply.trim(), req.user.id, req.params.reviewId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
  res.json({ success: true, message: 'Đã phản hồi đánh giá.' });
};
