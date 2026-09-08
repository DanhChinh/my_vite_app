// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json()); // Đọc dữ liệu dạng JSON từ request body
app.use(cors());         // Cho phép Frontend gọi API cross-origin
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');

// Khai báo các endpoint theo chuẩn RESTful
app.use('/api', authRoutes);         
app.use('/api', cartRoutes);     
app.use('/api', productRoutes);  
app.use('/api', orderRoutes);     
// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TechStore Pro API đang hoạt động ổn định!' });
});

// Lắng nghe cổng từ biến môi trường hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});