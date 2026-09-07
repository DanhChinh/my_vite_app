const pool = require('../../config/database');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id DESC');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, attributes } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Tên và Slug danh mục là bắt buộc' });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (name, slug, attributes) VALUES (?, ?, ?)`,
      [name, slug, attributes ? JSON.stringify(attributes) : null]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm danh mục thành công',
      categoryId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, attributes } = req.body;

    const [result] = await pool.query(
      `UPDATE categories SET name = ?, slug = ?, attributes = ? WHERE id = ?`,
      [name, slug, attributes ? JSON.stringify(attributes) : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    res.json({ success: true, message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};