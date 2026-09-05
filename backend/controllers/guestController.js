const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category) {
      query += ' WHERE c.slug = ?';
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    const productIds = rows.map((product) => product.id);
    let images = [];

    if (productIds.length > 0) {
      const [imageRows] = await pool.query(
        'SELECT id, product_id, image_url, is_primary FROM product_images WHERE product_id IN (?) ORDER BY is_primary DESC, id ASC',
        [productIds]
      );
      images = imageRows;
    }

    const data = rows.map((product) => ({
      ...product,
      images: images.filter((image) => image.product_id === product.id)
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
