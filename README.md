# TechStore Pro - Full Stack Project

Ứng dụng bán điện thoại trực tuyến với hệ thống phân quyền theo vai trò (Guest, Customer, Staff, Admin).

## Cấu trúc Project

```
my_vite_app/
├── backend/              # Node.js + Express API server
│   ├── STRUCTURE.md      # Tài liệu chi tiết cấu trúc backend
│   ├── app.js
│   ├── package.json
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   └── middlewares/
│
├── frontend/             # React + Vite app
│   ├── STRUCTURE.md      # Tài liệu chi tiết cấu trúc frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── constants/    # API endpoints, config
│       ├── services/     # API calls tập trung
│       ├── hooks/        # Custom React hooks
│       ├── utils/        # Helper functions
│       ├── components/   # Reusable UI components
│       ├── context/      # Global state (Cart)
│       └── features/     # Pages theo vai trò
│
└── README.md             # File này
```

## Các vai trò & Quyền

### 1. Guest (Khách vãng lai)
- Xem sản phẩm, danh mục
- Đăng nhập

### 2. Customer (Khách hàng)
- Cập nhật thông tin cá nhân
- Thêm giỏ hàng
- Thanh toán

### 3. Staff (Nhân viên)
- Xem các giỏ hàng đã được khách hàng gửi khi checkout
- Theo dõi tổng tiền tạm tính từ sản phẩm trong giỏ

### 4. Admin (Quản trị viên)
- Quản lý nhân viên, đối tác, sản phẩm
- Xem thống kê

## Setup & Chạy

### Backend

```bash
cd backend
npm install
npm run dev          # Development mode
```

Chạy tại: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev          # Development mode
```

Chạy tại: `http://localhost:5173`

## Database Tables

| Bảng | Mục đích |
|------|---------|
| `users` | Tất cả tài khoản (role: customer/staff/admin) |
| `customers` | Thông tin khách hàng |
| `staff` | Thông tin nhân viên |
| `categories` | Danh mục sản phẩm |
| `products` | Sản phẩm (có stock, attributes) |
| `carts` | Giỏ hàng |
| `cart_items` | Chi tiết giỏ hàng |
| `partners` | Nhà cung cấp |
| `product_images` | Ảnh sản phẩm |

> Schema hiện tại chưa có bảng `orders` hoặc `order_items`. Luồng checkout lưu dữ liệu vào `carts` và `cart_items`; trạng thái đơn hàng chưa được lưu trong database.

## API Endpoints

### Guest (Public)
```
POST   /api/login              # Đăng nhập
GET    /api/categories         # Danh mục
GET    /api/products           # Sản phẩm
```

### Customer (JWT required)
```
GET    /api/customer/profile   # Thông tin
PUT    /api/customer/profile   # Cập nhật
POST   /api/customer/orders    # Lưu cart và cart_items khi checkout
```

### Staff (JWT + role=staff required)
```
GET    /api/staff/orders       # Danh sách carts đã checkout
PUT    /api/staff/orders/:id   # Kiểm tra cart; trạng thái chưa lưu trong DB
```

### Admin (JWT + role=admin required)
```
GET    /api/admin/statistics   # Thống kê
CRUD   /api/admin/staff        # Quản lý nhân viên
CRUD   /api/admin/partners     # Quản lý đối tác
CRUD   /api/admin/products     # Quản lý sản phẩm
```

## Tech Stack

**Backend**: Express.js, MySQL2, JWT, BCrypt, CORS
**Frontend**: React, Vite, React Router, Axios, Bootstrap

## Features in scope

### Customer experience
- Browse product categories and listings
- View product metadata and catalogue details
- Add items to a cart
- Submit cart contents after authentication
- View and update profile information

### Staff operations
- Review submitted cart contents
- Manage day-to-day operational tasks

### Administrative workflows
- Access dashboard statistics
- Manage staff accounts
- Manage product records
- Manage partner information

## Prerequisites

Before running the project locally, ensure that you have:

- Node.js 18+ and npm
- MySQL 8.0 or compatible server
- Access to a terminal shell
- A browser for the frontend

## Installation and setup

### 1) Clone the repository

```bash
git clone <repository-url>
cd my_vite_app
```

### 2) Configure backend environment

Copy the example file and update the values:

```bash
cp backend/.env.example backend/.env
```

Then update the values in `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=techstore_pro
JWT_SECRET=replace_with_a_secure_secret
CORS_ORIGIN=http://localhost:5173
```

### 3) Install backend dependencies

```bash
cd backend
npm install
```

### 4) Start the backend API

```bash
npm run dev
```

If you use a start script, you can also run:

```bash
npm start
```

### 5) Configure frontend environment

```bash
cp frontend/.env.example frontend/.env
```

Set your API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 6) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 7) Start the frontend

```bash
npm run dev
```

The frontend UI should open on the Vite default port, typically:

```text
http://localhost:5173
```

## API overview

The backend exposes the following primary endpoints:

- `POST /api/login`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/customer/profile`
- `PUT /api/customer/profile`
- `POST /api/customer/orders`
- `GET /api/admin/statistics`
- `GET /api/admin/staff`
- `POST /api/admin/staff`
- `PUT /api/admin/staff/:id/reset-password`
- `DELETE /api/admin/staff/:id`

For the complete route list and expected payloads, see the API documentation in `docs/api-reference.md`.

## Database model

The application is designed around a relational model with these core entities:

- `users`
- `customers`
- `staff`
- `categories`
- `products`
- `product_images`
- `carts`
- `cart_items`
- `partners`

There are currently no `orders` or `order_items` tables. See `docs/database-schema.md` for the detailed schema and relationship notes.

## Documentation index

- `docs/architecture.md` – system design and component overview
- `docs/api-reference.md` – API contracts and endpoint summary
- `docs/database-schema.md` – database tables and relationships
- `docs/deployment.md` – local and production deployment guidance
- `docs/contributing.md` – contribution workflow and coding expectations

## Development notes

This project is intentionally structured to resemble a production-ready codebase while remaining approachable for coursework, demos, and portfolio work. Some features are implemented as route-level modules and may require additional validation, pagination, or data model hardening before production deployment.

## Recommended next steps

- Add database migration tooling
- Add API validation with a central schema library
- Introduce test coverage for routes and controllers
- Add CI checks for linting and build validation
- Consider containerization with Docker and Docker Compose

## License

This project is provided for educational and demonstration purposes. Add an explicit license before public distribution if this repository will be shared commercially or externally.

## Contributing

Please review `docs/contributing.md` before proposing changes.