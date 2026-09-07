const pool = require('../../config/database');

/**
 * Tổng quan các chỉ số hệ thống cho Dashboard
 * GET /api/v1/admin/statistics/dashboard
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status = 'completed'`
    );

    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(id) AS totalOrders FROM orders`);

    const [[{ totalCustomers }]] = await pool.query(
      `SELECT COUNT(id) AS totalCustomers FROM users WHERE role = 'customer'`
    );

    const [[{ totalProducts }]] = await pool.query(`SELECT COUNT(id) AS totalProducts FROM products`);

    // Biểu đồ doanh thu 7 ngày gần nhất
    const [revenue7Days] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(id) AS order_count
       FROM orders
       WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Top 5 sản phẩm bán chạy nhất
    const [topProducts] = await pool.query(
      `SELECT p.id, p.name, SUM(oi.quantity) AS total_sold, SUM(oi.quantity * oi.unit_price) AS total_revenue
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       INNER JOIN products p ON p.id = oi.product_id
       WHERE o.status = 'completed'
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        cards: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts
        },
        revenue7Days,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};