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

const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');

// Endpoint xem giao diện tài liệu OpenAPI/Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('API Specs available at http://localhost:3000/api-docs');
});

// server/server.js
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Ưu tiên các Route Public trước
app.use('/api/auth', authRoutes);         
app.use('/api/products', productRoutes);  
app.use('/api/carts', cartRoutes);     
app.use('/api/orders', orderRoutes);   
app.use('/api/addresses', addressRoutes); 
// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TechStore Pro API đang hoạt động ổn định!' });
});

app.use(errorHandler);

// Lắng nghe cổng từ biến môi trường hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});