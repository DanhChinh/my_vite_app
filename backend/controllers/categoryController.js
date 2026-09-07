const Category = require('../models/categoryModel');

const categoryController = {
  // [GET] /api/categories - Lấy toàn bộ danh mục
  async getCategories(req, res) {
    try {
      console.log("categoryController.getCategories")
      const categories = await Category.getAllCategories();



      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi máy chủ', 
        error: error.message 
      });
    }
  },

  // [GET] /api/categories/:id - Lấy chi tiết 1 danh mục
  async getCategoryDetail(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);

      if (!category) {
        return res.status(404).json({ 
          success: false, 
          message: 'Danh mục không tồn tại' 
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi máy chủ', 
        error: error.message 
      });
    }
  },

  // [POST] /api/categories - Tạo danh mục mới
  async createCategory(req, res) {
    try {
      const { name, slug, attributes } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tên danh mục và slug là bắt buộc' 
        });
      }

      const categoryId = await Category.create({ name, slug, attributes });

      res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: { id: categoryId }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Tạo danh mục thất bại', 
        error: error.message 
      });
    }
  },

  // [PUT] /api/categories/:id - Cập nhật danh mục
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updated = await Category.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy danh mục để cập nhật' 
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật danh mục thành công'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Cập nhật danh mục thất bại', 
        error: error.message 
      });
    }
  },

  // [DELETE] /api/categories/:id - Xóa danh mục
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Category.delete(id);

      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Danh mục không tồn tại' 
        });
      }

      res.json({
        success: true,
        message: 'Xóa danh mục thành công'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Xóa danh mục thất bại', 
        error: error.message 
      });
    }
  }
};

module.exports = categoryController;