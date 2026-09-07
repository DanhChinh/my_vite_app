// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(express.json()); // Đọc dữ liệu dạng JSON từ request body
app.use(cors());         // Cho phép Frontend gọi API cross-origin
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import các file Routes
const productRoutes = require('./routes/productRoutes');
// const customerRoutes = require('./routes/customerRoutes');
// const staffRoutes = require('./routes/staffRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const cartRoutes = require('./routes/cartRoutes');

// Đăng ký các Endpoint API chính
app.use('/api', productRoutes);         // API công khai (/api/public-endpoint)
// app.use('/api/customer', customerRoutes); // API Khách hàng bảo mật (/api/customer/profile)
// app.use('/api/staff', staffRoutes)
// app.use('/api/admin', adminRoutes);
// app.use('/api/cart', cartRoutes);
// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TechStore Pro API đang hoạt động ổn định!' });
});

// Lắng nghe cổng từ biến môi trường hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});