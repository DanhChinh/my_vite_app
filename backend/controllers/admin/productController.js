const pool = require('../../config/database');

/**
 * Lấy danh sách sản phẩm (Phân trang + Tìm kiếm + Lọc Danh mục/Đối tác)
 * GET /api/v1/admin/products
 */
exports.getProducts = async (req, res) => {
  try {
    const { search = '', category_id, partner_id, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const filters = ['1=1'];
    const params = [];

    if (search.trim()) {
      filters.push('p.name LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    if (category_id) {
      filters.push('p.category_id = ?');
      params.push(category_id);
    }

    if (partner_id) {
      filters.push('p.partner_id = ?');
      params.push(partner_id);
    }

    const whereClause = filters.join(' AND ');

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(id) AS total FROM products p WHERE ${whereClause}`,
      params
    );

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, pt.name AS partner_name,
              pi.image_url AS primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN partners pt ON p.partner_id = pt.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: products,
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
 * Thêm sản phẩm mới kèm danh sách hình ảnh (Transaction)
 * POST /api/v1/admin/products
 */
exports.createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { category_id, partner_id, name, description, price, stock, attributes, images } = req.body;

    if (!name || !price || !category_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Tên, giá và danh mục là bắt buộc' });
    }

    const [productResult] = await connection.query(
      `INSERT INTO products (category_id, partner_id, name, description, price, stock, attributes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        partner_id || null,
        name,
        description || null,
        price,
        stock || 0,
        attributes ? JSON.stringify(attributes) : null
      ]
    );

    const productId = productResult.insertId;

    // Xử lý danh sách hình ảnh nếu có
    if (images && Array.isArray(images) && images.length > 0) {
      const imageValues = images.map((img, index) => [
        productId,
        img.image_url,
        img.is_primary ? 1 : index === 0 ? 1 : 0
      ]);

      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?`,
        [imageValues]
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm mới thành công',
      productId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Cập nhật thông tin sản phẩm
 * PUT /api/v1/admin/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, partner_id, name, description, price, stock, attributes } = req.body;

    const [result] = await pool.query(
      `UPDATE products 
       SET category_id = ?, partner_id = ?, name = ?, description = ?, price = ?, stock = ?, attributes = ?
       WHERE id = ?`,
      [
        category_id,
        partner_id || null,
        name,
        description,
        price,
        stock,
        attributes ? JSON.stringify(attributes) : null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Xóa sản phẩm
 * DELETE /api/v1/admin/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};