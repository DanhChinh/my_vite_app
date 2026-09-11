const Product = require('../models/productModel');
const pool = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

const productController = {
  // [GET] /api/categories
  getCategories: catchAsync(async (req, res) => {
    const categories = await Product.getAllCategories();
    return sendSuccess(res, categories, 'Lấy danh sách danh mục thành công');
  }),

  // [GET] /api/products
  getProducts: catchAsync(async (req, res) => {
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

    return sendSuccess(
      res,
      {
        items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      'Lấy danh sách sản phẩm thành công'
    );
  }),

  // [GET] /api/products/:id
  getProductDetail: catchAsync(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user ? req.user.role : 'guest';

    const product = await Product.getById(id);
    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
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

    return sendSuccess(
      res,
      { ...product, images, reviews },
      'Lấy chi tiết sản phẩm thành công'
    );
  }),

  // [POST] /api/products
  createProduct: catchAsync(async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { images, ...productData } = req.body;

      await connection.beginTransaction();
      const productId = await Product.create(connection, productData, images);
      await connection.commit();

      return sendSuccess(res, { productId }, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
      await connection.rollback();
      throw error; // Đẩy lỗi về cho catchAsync xử lý
    } finally {
      connection.release();
    }
  }),

  // [PUT] /api/products/:id
  updateProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    const updated = await Product.update(id, req.body);

    if (!updated) {
      throw new AppError('Không tìm thấy sản phẩm để cập nhật', 404, 'PRODUCT_NOT_FOUND');
    }

    return sendSuccess(res, null, 'Cập nhật sản phẩm thành công');
  }),

  // [DELETE] /api/products/:id
  deleteProduct: catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleted = await Product.delete(id);

    if (!deleted) {
      throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    return sendSuccess(res, null, 'Xóa sản phẩm thành công');
  })
};

module.exports = productController;