const pool = require('../config/database');

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
    const { category, search, minPrice, maxPrice, sort = 'newest' } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 100);
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const filters = [];

    if (category) {
      filters.push('c.slug = ?');
      params.push(category);
    }

    if (search) {
      filters.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice !== undefined && minPrice !== '') {
      filters.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      filters.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    if (filters.length > 0) query += ` WHERE ${filters.join(' AND ')}`;

    const orderBy = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.id DESC',
      best_selling: 'p.id DESC'
    }[sort] || 'p.id DESC';
    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const productIds = rows.map((product) => product.id);
    let images = [];
    let reviewSummary = [];

    if (productIds.length > 0) {
      const [imageRows] = await pool.query(
        'SELECT id, product_id, image_url, is_primary FROM product_images WHERE product_id IN (?) ORDER BY is_primary DESC, id ASC',
        [productIds]
      );
      images = imageRows;
      try {
        const [reviewRows] = await pool.query(
          `SELECT product_id, COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
           FROM product_reviews
           WHERE product_id IN (?) AND status = 'approved'
           GROUP BY product_id`,
          [productIds]
        );
        reviewSummary = reviewRows;
      } catch (reviewError) {
        if (reviewError.code !== 'ER_NO_SUCH_TABLE') throw reviewError;
      }
    }

    const data = rows.map((product) => ({
      ...product,
      images: images.filter((image) => image.product_id === product.id),
      review_count: Number(reviewSummary.find((review) => review.product_id === product.id)?.review_count || 0),
      average_rating: Number(reviewSummary.find((review) => review.product_id === product.id)?.average_rating || 0)
    }));

    res.json({ success: true, data, pagination: { page, limit, count: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
