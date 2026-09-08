const pool = require('../config/database');

const Product = {
  async getAllCategories() {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return categories;
  },
  // 1. Đếm tổng số sản phẩm theo bộ lọc
  async countProducts(whereClause, params) {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(p.id) AS total FROM products p ${whereClause}`,
      params
    );
    return total;
  },

  // 2. Lấy danh sách sản phẩm phân trang
  async getProducts({ whereClause, orderByClause, params, limit, offset }) {
    const [products] = await pool.query(
      `SELECT 
          p.id, p.category_id, p.name, p.description, p.price, p.stock, 
          p.attributes, p.created_at,
          c.name AS category_name, c.slug AS category_slug,
          pi.image_url AS primary_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       ${whereClause}
       ${orderByClause}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return products;
  },

  // 3. Lấy thông tin cơ bản của 1 sản phẩm
  async getById(id) {
    const [[product]] = await pool.query(
      `SELECT p.*, c.name AS category_name, pt.name AS partner_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN partners pt ON pt.id = p.partner_id
       WHERE p.id = ?`,
      [id]
    );
    return product || null;
  },

  // 4. Lấy danh sách ảnh sản phẩm
  async getProductImages(productId) {
    const [images] = await pool.query(
      `SELECT id, image_url, is_primary FROM product_images WHERE product_id = ?`,
      [productId]
    );
    return images;
  },

  // 5. Lấy danh sách đánh giá đã duyệt
  async getApprovedReviews(productId) {
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.title, r.content, r.is_verified_purchase, r.created_at,
              COALESCE(c.full_name, u.username) AS reviewer_name
       FROM product_reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [productId]
    );
    return reviews;
  },

  // 6. Tạo sản phẩm mới kèm hình ảnh (Sử dụng Transaction)
  async create(connection, productData, images) {
    const { category_id, partner_id, name, description, price, stock, attributes } = productData;

    const [result] = await connection.query(
      `INSERT INTO products (category_id, partner_id, name, description, price, stock, attributes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, partner_id || null, name, description, price, stock || 0, JSON.stringify(attributes || {})]
    );

    const productId = result.insertId;

    if (images && Array.isArray(images) && images.length > 0) {
      const imageValues = images.map((img, index) => [
        productId,
        img.url,
        img.is_primary ? 1 : (index === 0 ? 1 : 0)
      ]);

      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?`,
        [imageValues]
      );
    }

    return productId;
  },

  // 7. Cập nhật thông tin sản phẩm
  async update(id, productData) {
    const { category_id, partner_id, name, description, price, stock, attributes } = productData;

    const [result] = await pool.query(
      `UPDATE products 
       SET category_id = ?, partner_id = ?, name = ?, description = ?, price = ?, stock = ?, attributes = ?, updated_at = NOW()
       WHERE id = ?`,
      [category_id, partner_id || null, name, description, price, stock, JSON.stringify(attributes || {}), id]
    );

    return result.affectedRows > 0;
  },

  // 8. Xóa sản phẩm
  async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Product;