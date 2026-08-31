# 🛍️ TechStore Pro - Full-Stack E-Commerce Web Application

**TechStore Pro** là một ứng dụng web thương mại điện tử toàn diện (Full-Stack) chuyên kinh doanh các sản phẩm công nghệ (điện thoại, laptop, phụ kiện). Dự án được xây dựng với cấu trúc chuẩn Production, hỗ trợ phân quyền người dùng chặt chẽ và tích hợp luồng giỏ hàng, thanh toán thời gian thực.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend:
* **ReactJS** (với Vite hoặc Create React App)
* **React Router DOM** (Quản lý định tuyến & Bảo vệ tuyến đường)
* **React Context API** (Quản lý trạng thái giỏ hàng toàn cục)
* **Axios** (Giao tiếp API với Backend)
* **Bootstrap 5 & FontAwesome** (Giao diện người dùng & Biểu tượng)

### Backend:
* **Node.js & Express.js** (Xây dựng RESTful APIs)
* **MySQL** (Cơ sở dữ liệu quan hệ với Transaction đảm bảo toàn vẹn dữ liệu)
* **JSON Web Token (JWT)** (Xác thực người dùng)
* **Bcrypt** (Mã hóa mật khẩu bảo mật)

---

## 📂 Cấu trúc cơ sở dữ liệu (Database Schema)

Dự án sử dụng các bảng chính được liên kết khóa ngoại chặt chẽ:
1. **`users`**: Quản lý tài khoản chung (đăng nhập, phân quyền `admin`, `staff`, `customer`).
2. **`customers`**: Lưu thông tin chi tiết khách hàng (Họ tên, số điện thoại, địa chỉ giao hàng).
3. **`categories`**: Quản lý danh mục sản phẩm (Điện thoại, Laptop, Phụ kiện...).
4. **`products`**: Quản lý thông tin sản phẩm và giá bán.
5. **`orders`**: Lưu trữ thông tin hóa đơn đặt hàng của khách.
6. **`order_items`**: Lưu chi tiết sản phẩm và số lượng trong từng đơn hàng.

---

## 🚀 Hướng dẫn cài đặt và Chạy dự án (Local Setup)

### 1. Clone dự án và cấu hình Backend
```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các thư viện cần thiết
npm install

# Tạo file .env và cấu hình kết nối database MySQL của bạn
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=techstore_pro
JWT_SECRET=your_jwt_secret_key

# Khởi động server
npm run dev