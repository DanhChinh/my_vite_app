// server/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json()); // Đọc dữ liệu dạng JSON từ request body
app.use(cors());         // Cho phép Frontend gọi API cross-origin
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n================= [REQUEST LOG] =================`);
  console.log(`⏰ Time   : ${timestamp}`);
  console.log(`📌 Method : ${req.method}`);
  console.log(`🌐 URL    : ${req.originalUrl}`);
  console.log(`📥 Query  :`, req.query);            // Dữ liệu trên URL (?page=1&limit=10)
  console.log(`📦 Body   :`, req.body);             // Dữ liệu Client gửi lên (POST/PUT)
  console.log(`🔑 Headers:`, {
    authorization: req.headers.authorization,    // Token
    'content-type': req.headers['content-type']
  });
  console.log(`=================================================\n`);
  
  next(); // Cho phép request đi tiếp vào Controller
});

// server/server.js
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Ưu tiên các Route Public trước
app.use('/api', productRoutes);  
app.use('/api', authRoutes);         
app.use('/api', cartRoutes);     
app.use('/api', orderRoutes);   
app.use('/api', addressRoutes);  // Thêm route địa chỉ 
// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TechStore Pro API đang hoạt động ổn định!' });
});

// Lắng nghe cổng từ biến môi trường hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});