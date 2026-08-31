const pool = require('../config/db');

// Lấy danh mục
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy sản phẩm (Có hỗ trợ lọc theo danh mục qua query ?category=slug)
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
    `;
    let params = [];

    if (category) {
      query += ` WHERE c.slug = ?`;
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};