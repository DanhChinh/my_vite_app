const pool = require('../../config/database');

/**
 * Lấy danh sách đánh giá chờ kiểm duyệt (status = 'pending')
 */
exports.getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(id) AS total FROM product_reviews WHERE status = 'pending'`
    );

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.content, r.is_verified_purchase, r.created_at,
              p.id AS product_id, p.name AS product_name,
              u.username, u.email
       FROM product_reviews r
       JOIN products p ON p.id = r.product_id
       JOIN users u ON u.id = r.user_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at ASC
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
    );

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Duyệt hoặc từ chối đánh giá (status: 'approved' hoặc 'rejected')
 */
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái kiểm duyệt không hợp lệ' });
    }

    const [result] = await pool.query(
      `UPDATE product_reviews SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
    }

    res.json({ success: true, message: `Đã chuyển trạng thái đánh giá thành ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};