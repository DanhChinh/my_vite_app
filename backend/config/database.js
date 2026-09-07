// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function diagnoseConnection() {
  console.log('🔄 Đang thử kết nối tới Database trên BKHOST...');
  console.log(`📌 Host: ${process.env.DB_HOST} | User: ${process.env.DB_USER}`);
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ KẾT NỐI THÀNH CÔNG! Database đã sẵn sàng hoạt động.');
    connection.release();
  } catch (error) {
    console.error('\n❌ KẾT NỐI THẤT BẠI. Chi tiết lỗi từ MySQL:');
    console.error(`- Mã lỗi (Code): ${error.code}`);
    console.error(`- Số hiệu (Errno): ${error.errno}`);
    console.error(`- Thông báo gốc: ${error.message}\n`);

    // Phân tích nguyên nhân dựa trên mã lỗi của MySQL
    console.log('🔍 CHẨN ĐOÁN & CÁCH KHẮC PHỤC:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('👉 Nguyên nhân: Sai tên User hoặc sai Mật khẩu, hoặc IP của bạn chưa được cấp quyền.');
      console.log('💡 Gợi ý khắc phục:');
      console.log('   1. Vào cPanel -> Mục "Remote MySQL" -> Kiểm tra xem IP hiện tại đã được thêm vào chưa (hoặc điền dấu "%").');
      console.log('   2. Vào cPanel -> Mục "MySQL Databases" -> Đổi lại mật khẩu mới cho user và cập nhật vào file .env.');
      console.log('   3. Đảm bảo tên user có đúng định dạng tiền tố của cPanel (ví dụ: sdxmzhoh_...).');
    } 
    else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'EHOSTUNREACH') {
      console.log('👉 Nguyên nhân: Không tìm thấy Host hoặc bị chặn tường lửa (Firewall).');
      console.log('💡 Gợi ý khắc phục:');
      console.log('   1. Kiểm tra lại biến DB_HOST trong file .env xem đã điền đúng IP máy chủ hosting hoặc domain chưa (Không được dùng localhost).');
      console.log('   2. Kiểm tra xem mạng internet của bạn có đang bật VPN hoặc Proxy làm chặn cổng 3306 không.');
    } 
    else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('👉 Nguyên nhân: Tên Database không tồn tại.');
      console.log('💡 Gợi ý khắc phục: Kiểm tra lại tên database trong file .env, nhớ kèm theo tiền tố cPanel (ví dụ: sdxmzhoh_ten_db).');
    } 
    else {
      console.log('👉 Lỗi không xác định. Hãy kiểm tra lại toàn bộ thông tin trong file .env.');
    }
  }
}

diagnoseConnection();

module.exports = pool;