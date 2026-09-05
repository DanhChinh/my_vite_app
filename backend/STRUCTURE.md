# Backend Structure Documentation

## Cấu trúc thư mục

```
backend/
├── app.js              # Express app bootstrap & route mounting
├── package.json        # Dependencies (express, mysql2, jwt, bcrypt, cors)
├── .env                # Environment variables (DB_HOST, DB_USER, etc.)
├── .gitignore          # Git ignore rules
├── README.md           # Tài liệu backend
│
├── config/
│   └── db.js           # MySQL connection pool configuration
│
├── middlewares/
│   ├── authMiddleware.js      # JWT verification & role checking
│   └── uploadMiddleware.js    # Multer image upload validation/storage

├── uploads/                   # Runtime product image files
│   └── .gitkeep
│
├── routes/             # API endpoint definitions (tổ chức theo vai trò)
│   ├── guestRoutes.js        # Public routes: login, categories, products
│   ├── customerRoutes.js     # Customer: profile, products, cart checkout
│   ├── staffRoutes.js        # Staff: products list and cart review
│   └── adminRoutes.js        # Admin: staff, partners, products, statistics
│
└── controllers/        # Business logic (xử lý request/response)
    ├── authController.js     # Login & JWT creation
    ├── guestController.js    # Public product/category listings
    ├── customerController.js # Profile, cart checkout
    ├── staffController.js    # Cart review operations
    └── adminController.js    # Staff/partner/product/image CRUD & statistics
```

## Kiến trúc theo Role

### 1. **Guest** (Khách vãng lai - Không cần login)
- **Routes**: guestRoutes.js
- **Controllers**: authController, guestController
- **Endpoints**:
  - POST `/api/login` - Đăng nhập
  - GET `/api/categories` - Danh sách danh mục
  - GET `/api/products` - Danh sách sản phẩm

### 2. **Customer** (Khách hàng đã login)
- **Routes**: customerRoutes.js
- **Controllers**: customerController (cần JWT token)
- **Endpoints**:
  - GET `/api/customer/profile` - Lấy thông tin cá nhân
  - PUT `/api/customer/profile` - Cập nhật thông tin
  - GET `/api/customer/products` - Danh sách sản phẩm
  - POST `/api/customer/orders` - Lưu cart và cart_items khi checkout

### 3. **Staff** (Nhân viên - Xem giỏ hàng checkout)
- **Routes**: staffRoutes.js
- **Controllers**: staffController (cần JWT token, role=staff)
- **Endpoints**:
  - GET `/api/staff/products` - Danh sách sản phẩm
  - GET `/api/staff/orders` - Danh sách carts và cart_items tổng hợp
  - PUT `/api/staff/orders/:orderId` - Kiểm tra cart; trạng thái chưa được lưu trong DB

### 4. **Admin** (Quản trị viên - Quản lý toàn bộ)
- **Routes**: adminRoutes.js
- **Controllers**: adminController (cần JWT token, role=admin)
- **Endpoints**:
  - GET `/api/admin/statistics` - Thống kê: doanh thu, đơn hàng, sản phẩm
  - GET `/api/admin/staff` - Danh sách nhân viên
  - POST `/api/admin/staff` - Thêm nhân viên mới
  - PUT `/api/admin/staff/:id/reset-password` - Cấp lại mật khẩu
  - DELETE `/api/admin/staff/:id` - Xóa nhân viên
  - CRUD `/api/admin/partners` - Quản lý đối tác
  - CRUD `/api/admin/products` - Quản lý sản phẩm (+ stock, attributes)

## Quy tắc Database

Tất cả truy vấn SQL đều dùng **Parameterized Queries** để tránh SQL injection:
```javascript
// ✅ Đúng (An toàn)
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ Sai (Nguy hiểm)
const rows = await pool.query(`SELECT * FROM users WHERE id = ${userId}`);
```

## Database Schema (Thực tế từ PDF)

```sql
-- Users & Authentication
users (id, username, password, role, created_at)

-- Customer Info
customers (id, user_id, full_name, phone, address, created_at)

-- Staff Info
staff (id, user_id, full_name, phone, address, position, created_at)

-- Products & Categories
categories (id, name, slug)
products (id, category_id, name, price, stock, description, attributes)
product_images (id, product_id, image_url, is_primary)

-- Shopping Cart (instead of orders)
carts (id, user_id, updated_at)
cart_items (id, cart_id, product_id, quantity)

-- Partners
partners (id, name, supply_type, details, quality_info, created_at)
```

## Error Handling

Tất cả endpoints trả về format chung:
```javascript
// Success
{ success: true, message: '...', data: {...} }

// Error
{ success: false, message: 'Chi tiết lỗi' }
```

## Middleware Authentication

```javascript
// verifyToken - Kiểm tra JWT token
// Yêu cầu: Authorization: Bearer <token>
// Thêm req.user = { id, role }

// verifyAdmin - Kiểm tra quyền admin
// Sử dụng sau verifyToken
// Yêu cầu: req.user.role === 'admin'
```

## Quy tắc Naming

- **Routes**: camelCase, đặt tên theo resource: `/api/customers`, `/api/staff`
- **Controllers**: camelCase, action ở đầu: `getCustomers()`, `createProduct()`
- **Database**: snake_case, danh từ số ít: `customers`, `staff`, `products`
- **Variables**: camelCase: `userId`, `productName`, `cartId`

## Transaction Example

Khi cần đảm bảo tính nhất quán (ví dụ: tạo user + staff cùng lúc):
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  // Thực hiện multiple queries
  const [userResult] = await connection.query('INSERT INTO users...');
  const userId = userResult.insertId;
  
  await connection.query('INSERT INTO staff WHERE user_id = ?', [userId]);
  
  await connection.commit();
} catch (error) {
  await connection.rollback();
} finally {
  connection.release();
}
```

## Environment Variables (.env)

```
DB_HOST=bkhost.com
DB_USER=sdxmzhoh_user
DB_PASSWORD=your_password
DB_NAME=sdxmzhoh_db
DB_PORT=3306

JWT_SECRET=your_secret_key_here

PORT=5000
```

## Cách chạy

```bash
# Install dependencies
npm install

# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Lợi ích của cấu trúc này

✅ **Rõ ràng**: Mỗi vai trò có routes/controllers riêng  
✅ **Bảo mật**: Middleware kiểm tra JWT & role trước khi xử lý  
✅ **Bảo trì**: Thay đổi logic của customer không ảnh hưởng staff/admin  
✅ **Mở rộng**: Thêm role mới chỉ cần thêm guestRoutes + controller  
✅ **Chuyên biệt**: Mỗi controller xử lý logic riêng của role đó  
