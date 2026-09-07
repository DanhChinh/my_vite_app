const pool = require('../../config/database');

/**
 * Cập nhật số lượng tồn kho của sản phẩm
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ success: false, message: 'Số lượng kho không hợp lệ' });
    }

    const [result] = await pool.query(`UPDATE products SET stock = ? WHERE id = ?`, [stockNum, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    res.json({ success: true, message: 'Cập nhật tồn kho thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Thêm sản phẩm mới
 */
exports.createProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { category_id, partner_id, name, price, stock, attributes, images } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, giá và số lượng kho' });
    }

    const [newProduct] = await connection.query(
      `INSERT INTO products (category_id, partner_id, name, price, stock, attributes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id || null, partner_id || null, name, price, stock, JSON.stringify(attributes || {})]
    );

    const productId = newProduct.insertId;

    // Chèn danh sách ảnh nếu có
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)`,
          [productId, img.url, img.is_primary ? 1 : (i === 0 ? 1 : 0)]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Thêm sản phẩm thành công', data: { product_id: productId } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};