// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  // Lấy token từ header Authorization (Định dạng: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Truy cập bị từ chối! Bạn chưa đăng nhập (Thiếu Token).' 
    });
  }
  // Khóa bí mật dùng để mã hóa token (nên để trong file .env)
  const JWT_SECRET = process.env.JWT_SECRET || 'chuoi_bi_mat_sieu_an_toan';

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc đã hết hạn!' 
      });
    }
    
    // Lưu thông tin user vào request để dùng tiếp ở Controller nếu cần
    req.user = user; 
    next(); // Cho phép đi tiếp vào Controller
  });
};


// Kiểm tra xem user có phải là admin không (dùng sau verifyToken)
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Từ chối truy cập! Yêu cầu quyền Quản trị viên (Admin).' });
  }
};