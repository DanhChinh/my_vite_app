const Product = require('../models/productModel');
const pool = require('../config/database');

const productController = {
  async getCategories(req, res) {
    try {
      const categories = await Product.getAllCategories();

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
  // [GET] /api/products
  async getProducts(req, res) {
    try {
      const { category, category_id, search = '', minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 12);
      const offset = (pageNum - 1) * limitNum;

      // Dựng câu điều kiện Lọc
      const filters = [];
      const params = [];

      const selectedCategory = category || category_id;
      if (selectedCategory) {
        filters.push('p.category_id = ?');
        params.push(selectedCategory);
      }
      if (search.trim()) {
        filters.push('p.name LIKE ?');
        params.push(`%${search.trim()}%`);
      }
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filters.push('p.price >= ?');
        params.push(Number(minPrice));
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filters.push('p.price <= ?');
        params.push(Number(maxPrice));
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

      // Dựng Order By
      let orderByClause = 'ORDER BY p.created_at DESC';
      if (sort === 'price_asc') orderByClause = 'ORDER BY p.price ASC';
      else if (sort === 'price_desc') orderByClause = 'ORDER BY p.price DESC';
      else if (sort === 'popular') orderByClause = 'ORDER BY p.stock ASC';

      // Gọi Model
      const total = await Product.countProducts(whereClause, params);
      const items = await Product.getProducts({ whereClause, orderByClause, params, limit: limitNum, offset });
      res.json({
        success: true,
        data: {
          items,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // [GET] /api/products/:id
  async getProductDetail(req, res) {
    try {
      const { id } = req.params;
      const userRole = req.user ? req.user.role : 'guest';

      const product = await Product.getById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      }

      // Phân quyền hiển thị thuộc tính nhạy cảm
      if (userRole !== 'admin' && userRole !== 'staff') {
        delete product.partner_id;
        delete product.partner_name;
      }

      // Gọi đồng thời ảnh và đánh giá
      const [images, reviews] = await Promise.all([
        Product.getProductImages(id),
        Product.getApprovedReviews(id)
      ]);

      res.json({
        success: true,
        data: { ...product, images, reviews }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // [POST] /api/products
  async createProduct(req, res) {
    const connection = await pool.getConnection();
    try {
      const { images, ...productData } = req.body;

      await connection.beginTransaction();
      const productId = await Product.create(connection, productData, images);
      await connection.commit();

      res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: { productId } });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ success: false, message: 'Tạo sản phẩm thất bại', error: error.message });
    } finally {
      connection.release();
    }
  },

  // [PUT] /api/products/:id
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updated = await Product.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
      }

      res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Cập nhật thất bại', error: error.message });
    }
  },

  // [DELETE] /api/products/:id
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Product.delete(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
      }

      res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Xóa sản phẩm thất bại', error: error.message });
    }
  }
};

module.exports = productController;