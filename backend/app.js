// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(express.json()); // Đọc dữ liệu dạng JSON từ request body
app.use(cors());         // Cho phép Frontend gọi API cross-origin

// Import các file Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const staffRoutes = require('./routes/staffRoutes');


// Đăng ký các Endpoint API chính
app.use('/api', authRoutes);         // API Đăng nhập (/api/login)
app.use('/api', productRoutes);      // API Danh mục & Sản phẩm (/api/categories, /api/products)
app.use('/api/customer', customerRoutes); // API Khách hàng bảo mật (/api/customer/profile)
app.use('/api', orderRoutes)
app.use('/api', staffRoutes)

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TechStore Pro API đang hoạt động ổn định!' });
});

// Lắng nghe cổng từ biến môi trường hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});