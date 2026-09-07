const pool = require('../config/database');

const Category = {
  // Lấy toàn bộ danh mục (Hỗ trợ phân cấp nếu mở rộng cột parent_id)
  async getAllCategories() {
    console.log("Category.getAllCategories")
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return categories;
  },

  // Lấy chi tiết 1 danh mục
  async getCategoryById(categoryId) {
    const [rows] = await pool.query(
      'SELECT id, name, slug, attributes FROM categories WHERE id = ?',
      [categoryId]
    );
    return rows[0] || null;
  },

  // Thêm mới danh mục
  async createCategory(categoryData) {
    const { name, slug, attributes } = categoryData;
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, attributes) VALUES (?, ?, ?)',
      [name, slug, JSON.stringify(attributes || {})]
    );
    return result.insertId;
  },

  // Cập nhật danh mục
  async updateCategory(categoryId, categoryData) {
    const { name, slug, attributes } = categoryData;
    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, attributes = ? WHERE id = ?',
      [name, slug, JSON.stringify(attributes || {}), categoryId]
    );
  }
};

module.exports = Category;