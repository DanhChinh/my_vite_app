# 📚 E-Commerce REST API Reference Specification

Tài liệu tham khảo API (API Reference Specification) đầy đủ cho hệ thống E-Commerce dựa trên mô hình cơ sở dữ liệu MySQL 8.0+. Tài liệu này quy định cấu trúc Endpoints, Request Body, Response Data, Authentication/Authorization, Query Parameters, và Error Codes chuẩn hóa cho đội ngũ phát triển Frontend/Backend.

---

## 📌 1. Tổng quan & Quy ước chung (Overview & Conventions)

### 1.1 Base URL
```http
https://api.ecommerce-store.com/api/v1
```

### 1.2 Authentication & Authorization
- **Cơ chế**: Bearer Token (JWT - JSON Web Token).
- **Header**:
  ```http
  Authorization: Bearer <your_access_token>
  ```
- **Phân quyền (Roles)**:
  - `public`: Không cần xác thực (Khách viếng thăm).
  - `customer`: Người dùng đã đăng ký mua hàng.
  - `staff`: Nhân viên vận hành hệ thống.
  - `admin`: Quản trị viên toàn hệ thống.

### 1.3 Format dữ liệu & Headers
- **Content-Type**: `application/json` (cho các request body ngoại trừ file upload).
- **Accept**: `application/json`

### 1.4 Quy chuẩn Response chuẩn (Standard Response Payload)

#### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 45,
    "total_pages": 5
  }
}
```

#### Error Response (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Thông tin nhập vào không hợp lệ",
    "details": [
      {
        "field": "email",
        "message": "Email đã tồn tại trong hệ thống"
      }
    ]
  }
}
```

---

## 🔐 2. Authentication & Account API (`/auth`)

### 2.1 Đăng ký tài khoản (Register)
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "customer_an",
    "password": "Password123!",
    "email": "an.nguyen@gmail.com",
    "phone": "0988888888",
    "full_name": "Nguyễn Văn An"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Đăng ký tài khoản thành công",
    "data": {
      "user_id": 3,
      "username": "customer_an",
      "email": "an.nguyen@gmail.com",
      "role": "customer"
    }
  }
  ```

### 2.2 Đăng nhập (Login)
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "customer_an",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1Ni...",
      "token_type": "Bearer",
      "expires_in": 86400,
      "user": {
        "id": 3,
        "username": "customer_an",
        "role": "customer",
        "email": "an.nguyen@gmail.com"
      }
    }
  }
  ```

### 2.3 Quên mật khẩu - Yêu cầu Reset Token (Forgot Password)
- **Endpoint**: `POST /auth/forgot-password`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "an.nguyen@gmail.com"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Mã xác minh đặt lại mật khẩu đã được gửi đến email của bạn"
  }
  ```

### 2.4 Đặt lại mật khẩu (Reset Password)
- **Endpoint**: `POST /auth/reset-password`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "token": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "new_password": "NewSecurePassword123!"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
  }
  ```

---

## 👤 3. Customer Profile API (`/customers`)

### 3.1 Lấy thông tin cá nhân (Get Current Customer Profile)
- **Endpoint**: `GET /customers/me`
- **Access**: Customer
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 3,
      "username": "customer_an",
      "full_name": "Nguyễn Văn An",
      "email": "an.nguyen@gmail.com",
      "phone": "0988888888",
      "gender": "male",
      "date_of_birth": "1995-05-15",
      "avatar_url": "https://example.com/avatars/an.jpg"
    }
  }
  ```

### 3.2 Cập nhật thông tin cá nhân (Update Profile)
- **Endpoint**: `PUT /customers/me`
- **Access**: Customer
- **Request Body**:
  ```json
  {
    "full_name": "Nguyễn Văn An",
    "gender": "male",
    "date_of_birth": "1995-05-15",
    "avatar_url": "https://example.com/avatars/an_new.jpg"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Cập nhật thông tin cá nhân thành công",
    "data": {
      "id": 1,
      "full_name": "Nguyễn Văn An",
      "gender": "male",
      "date_of_birth": "1995-05-15",
      "avatar_url": "https://example.com/avatars/an_new.jpg",
      "updated_at": "2026-09-09T14:30:00Z"
    }
  }
  ```

---

## 🏠 4. Address Book API (`/addresses`)

### 4.1 Danh sách địa chỉ của khách hàng (List Addresses)
- **Endpoint**: `GET /addresses`
- **Access**: Customer
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "recipient_name": "Nguyễn Văn An",
        "phone": "0988888888",
        "province_code": "79",
        "province_name": "Thành phố Hồ Chí Minh",
        "district_code": "770",
        "district_name": "Quận 10",
        "ward_code": "27256",
        "ward_name": "Phường 12",
        "specific_address": "123 Đường Ba Tháng Hai",
        "address_line": "123 Đường Ba Tháng Hai, Phường 12, Quận 10, Thành phố Hồ Chí Minh",
        "is_default": 1
      }
    ]
  }
  ```

### 4.2 Thêm địa chỉ mới (Create Address)
- **Endpoint**: `POST /addresses`
- **Access**: Customer
- **Request Body**:
  ```json
  {
    "recipient_name": "Nguyễn Văn An",
    "phone": "0988888888",
    "province_code": "79",
    "province_name": "Thành phố Hồ Chí Minh",
    "district_code": "770",
    "district_name": "Quận 10",
    "ward_code": "27256",
    "ward_name": "Phường 12",
    "specific_address": "123 Đường Ba Tháng Hai",
    "address_line": "123 Đường Ba Tháng Hai, Phường 12, Quận 10, Thành phố Hồ Chí Minh",
    "is_default": 1
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Thêm địa chỉ mới thành công",
    "data": {
      "id": 1,
      "is_default": 1
    }
  }
  ```

### 4.3 Cập nhật địa chỉ (Update Address)
- **Endpoint**: `PUT /addresses/:id`
- **Access**: Customer
- **Request Body**: (Các trường tương tự `POST /addresses`)
- **Response (`200 OK`)**

### 4.4 Xóa địa chỉ (Delete Address)
- **Endpoint**: `DELETE /addresses/:id`
- **Access**: Customer
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Đã xóa địa chỉ thành công"
  }
  ```

---

## 🏷️ 5. Category API (`/categories`)

### 5.1 Lấy danh sách danh mục (Get All Categories)
- **Endpoint**: `GET /categories`
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai",
        "attributes": {
          "supported_rams": ["4GB", "8GB", "12GB"],
          "supported_storages": ["128GB", "256GB", "512GB"]
        }
      },
      {
        "id": 2,
        "name": "Phụ kiện",
        "slug": "phu-kien",
        "attributes": {
          "types": ["Sạc", "Tai nghe", "Ốp lưng"]
        }
      }
    ]
  }
  ```

### 5.2 Tạo danh mục mới (Create Category)
- **Endpoint**: `POST /categories`
- **Access**: Staff / Admin
- **Request Body**:
  ```json
  {
    "name": "Máy tính bảng",
    "slug": "may-tinh-bang",
    "attributes": {
      "screen_sizes": ["10.9 inch", "11 inch", "12.9 inch"]
    }
  }
  ```
- **Response (`201 Created`)**

---

## 🤝 6. Partner API (`/partners`)

### 6.1 Danh sách nhà cung cấp / đối tác (List Partners)
- **Endpoint**: `GET /partners`
- **Access**: Staff / Admin
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Apple Việt Nam",
        "supply_type": "Chính hãng",
        "details": "Nhà phân phối ủy quyền chính thức của Apple tại Việt Nam",
        "quality_info": "Hàng VN/A, bảo hành 12 tháng chính hãng"
      }
    ]
  }
  ```

---

## 📦 7. Product API (`/products`)

### 7.1 Lấy danh sách sản phẩm (Get Products List)
- **Endpoint**: `GET /products`
- **Access**: Public
- **Query Parameters**:
  - `page` (int, default: 1): Trang hiện tại
  - `limit` (int, default: 10): Số lượng/trang
  - `category_id` (int): Lọc theo danh mục
  - `partner_id` (int): Lọc theo nhà cung cấp
  - `search` (string): Tìm theo tên sản phẩm
  - `min_price` / `max_price` (decimal): Khoảng giá
  - `sort` (string): `price_asc`, `price_desc`, `created_at_desc`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "iPhone 15 Pro Max 256GB",
        "price": 29500000.00,
        "stock": 15,
        "category": {
          "id": 1,
          "name": "Điện thoại"
        },
        "primary_image": "https://example.com/images/iphone-15-pro-max-main.jpg",
        "attributes": {
          "color": "Titan Tự Nhiên",
          "ram": "8GB",
          "storage": "256GB"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total_items": 3,
      "total_pages": 1
    }
  }
  ```

### 7.2 Chi tiết sản phẩm (Get Product Detail)
- **Endpoint**: `GET /products/:id`
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "iPhone 15 Pro Max 256GB",
      "description": "Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A khung Titan siêu bền nhẹ.",
      "price": 29500000.00,
      "stock": 15,
      "attributes": {
        "color": "Titan Tự Nhiên",
        "ram": "8GB",
        "storage": "256GB"
      },
      "category": {
        "id": 1,
        "name": "Điện thoại",
        "slug": "dien-thoai"
      },
      "partner": {
        "id": 1,
        "name": "Apple Việt Nam"
      },
      "images": [
        {
          "id": 1,
          "image_url": "https://example.com/images/iphone-15-pro-max-main.jpg",
          "is_primary": 1
        },
        {
          "id": 2,
          "image_url": "https://example.com/images/iphone-15-pro-max-back.jpg",
          "is_primary": 0
        }
      ]
    }
  }
  ```

### 7.3 Tạo sản phẩm mới (Create Product)
- **Endpoint**: `POST /products`
- **Access**: Staff / Admin
- **Request Body**:
  ```json
  {
    "category_id": 1,
    "partner_id": 1,
    "name": "iPhone 15 Pro Max 256GB",
    "description": "Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A",
    "price": 29500000.00,
    "stock": 15,
    "attributes": {
      "color": "Titan Tự Nhiên",
      "ram": "8GB",
      "storage": "256GB"
    },
    "images": [
      {
        "image_url": "https://example.com/images/iphone-15-pro-max-main.jpg",
        "is_primary": 1
      }
    ]
  }
  ```
- **Response (`201 Created`)**

---

## 🛒 8. Cart API (`/cart`)

### 8.1 Lấy thông tin giỏ hàng (Get Cart)
- **Endpoint**: `GET /cart`
- **Access**: Public / Customer (Nhận diện qua `Authorization Token` hoặc Query/Header `session_id` với khách)
- **Headers**:
  - `X-Session-ID`: (Chỉ áp dụng khi user chưa đăng nhập)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "cart_id": 10,
      "user_id": 3,
      "session_id": null,
      "items": [
        {
          "cart_item_id": 25,
          "product_id": 1,
          "product_name": "iPhone 15 Pro Max 256GB",
          "price": 29500000.00,
          "primary_image": "https://example.com/images/iphone-15-pro-max-main.jpg",
          "quantity": 1,
          "subtotal": 29500000.00
        }
      ],
      "total_amount": 29500000.00
    }
  }
  ```

### 8.2 Thêm sản phẩm vào giỏ hàng (Add Cart Item)
- **Endpoint**: `POST /cart/items`
- **Access**: Public / Customer
- **Request Body**:
  ```json
  {
    "session_id": "sess_abc123xyz", 
    "product_id": 1,
    "quantity": 1
  }
  ```
- **Response (`200 OK`)**

### 8.3 Cập nhật số lượng item (Update Quantity)
- **Endpoint**: `PUT /cart/items/:cart_item_id`
- **Access**: Public / Customer
- **Request Body**:
  ```json
  {
    "quantity": 2
  }
  ```
- **Response (`200 OK`)**

### 8.4 Xóa sản phẩm khỏi giỏ (Remove Cart Item)
- **Endpoint**: `DELETE /cart/items/:cart_item_id`
- **Access**: Public / Customer
- **Response (`200 OK`)**

---

## 🛍️ 9. Order API (`/orders`)

### 9.1 Đặt hàng từ giỏ (Create Order)
- **Endpoint**: `POST /orders`
- **Access**: Customer
- **Request Body**:
  ```json
  {
    "recipient_name": "Nguyễn Văn An",
    "recipient_phone": "0988888888",
    "recipient_address": "123 Đường Ba Tháng Hai, Phường 12, Quận 10, TP.HCM",
    "payment_method": "cod",
    "note": "Giao hàng giờ hành chính"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Tạo đơn hàng thành công",
    "data": {
      "order_id": 1001,
      "status": "pending",
      "total_price": 29500000.00,
      "payment_method": "cod",
      "created_at": "2026-09-09T14:35:00Z"
    }
  }
  ```

### 9.2 Danh sách đơn hàng cá nhân (List My Orders)
- **Endpoint**: `GET /orders/my-orders`
- **Access**: Customer
- **Query Parameters**: `status` (`pending`, `processing`, `shipped`, `completed`, `cancelled`)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1001,
        "recipient_name": "Nguyễn Văn An",
        "payment_method": "cod",
        "status": "pending",
        "total_price": 29500000.00,
        "created_at": "2026-09-09T14:35:00Z",
        "item_count": 1
      }
    ]
  }
  ```

### 9.3 Chi tiết đơn hàng (Get Order Detail)
- **Endpoint**: `GET /orders/:id`
- **Access**: Customer / Staff / Admin
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1001,
      "user_id": 3,
      "recipient_name": "Nguyễn Văn An",
      "recipient_phone": "0988888888",
      "recipient_address": "123 Đường Ba Tháng Hai, Phường 12, Quận 10, TP.HCM",
      "payment_method": "cod",
      "note": "Giao hàng giờ hành chính",
      "internal_note": null,
      "status": "pending",
      "total_price": 29500000.00,
      "created_at": "2026-09-09T14:35:00Z",
      "items": [
        {
          "id": 50,
          "product_id": 1,
          "product_name": "iPhone 15 Pro Max 256GB",
          "quantity": 1,
          "unit_price": 29500000.00,
          "subtotal": 29500000.00
        }
      ]
    }
  }
  ```

### 9.4 Cập nhật trạng thái đơn hàng (Update Order Status - Admin/Staff)
- **Endpoint**: `PATCH /orders/:id/status`
- **Access**: Staff / Admin
- **Request Body**:
  ```json
  {
    "status": "processing",
    "internal_note": "Đã xác nhận đơn hàng qua điện thoại"
  }
  ```
- **Response (`200 OK`)**

---

## ⭐ 10. Reviews & Ratings API (`/reviews`)

### 10.1 Tạo đánh giá sản phẩm (Create Review)
- **Endpoint**: `POST /reviews`
- **Access**: Customer
- **Request Body**:
  ```json
  {
    "product_id": 1,
    "order_id": 1001,
    "rating": 5,
    "title": "Sản phẩm cực kỳ chất lượng",
    "content": "Máy mượt, đóng gói cẩn thận, giao hàng nhanh.",
    "images": [
      "https://example.com/reviews/img1.jpg"
    ]
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Đã gửi đánh giá thành công. Đang chờ duyệt.",
    "data": {
      "review_id": 15,
      "status": "pending"
    }
  }
  ```

### 10.2 Lấy danh sách đánh giá của sản phẩm (Get Product Reviews)
- **Endpoint**: `GET /products/:product_id/reviews`
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 15,
        "user_name": "Nguyễn Văn An",
        "rating": 5,
        "title": "Sản phẩm cực kỳ chất lượng",
        "content": "Máy mượt, đóng gói cẩn thận, giao hàng nhanh.",
        "is_verified_purchase": 1,
        "created_at": "2026-09-09T15:00:00Z",
        "images": [
          "https://example.com/reviews/img1.jpg"
        ],
        "replies": []
      }
    ]
  }
  ```

### 10.3 Phản hồi đánh giá (Reply to Review)
- **Endpoint**: `POST /reviews/:review_id/replies`
- **Access**: Customer / Staff / Admin
- **Request Body**:
  ```json
  {
    "parent_id": null,
    "content": "Cảm ơn quý khách đã tin tưởng ủng hộ shop!"
  }
  ```
- **Response (`201 Created`)**

---

## 👔 11. Staff Management API (`/staff`)

### 11.1 Danh sách nhân viên (List Staff)
- **Endpoint**: `GET /staff`
- **Access**: Admin
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "user_id": 2,
        "full_name": "Lê Văn Nam",
        "position": "Nhân viên bán hàng",
        "department": "Bán hàng",
        "status": "active",
        "hire_date": "2023-01-15",
        "salary": 10000000.00
      }
    ]
  }
  ```

---

## 🚨 12. Mã lỗi chuẩn hóa (Standard Error Codes)

| HTTP Status | Error Code | Mô tả |
| :--- | :--- | :--- |
| `400` | `INVALID_INPUT` | Dữ liệu đầu vào không hợp lệ hoặc thiếu trường bắt buộc |
| `401` | `UNAUTHORIZED` | Chưa đăng nhập hoặc Token hết hạn / không hợp lệ |
| `403` | `FORBIDDEN` | Không có quyền truy cập vào tài nguyên này |
| `404` | `NOT_FOUND` | Không tìm thấy tài nguyên (User, Product, Order,...) |
| `409` | `ALREADY_EXISTS` | Tài nguyên đã tồn tại (Username, Email, Review trùng,...) |
| `422` | `OUT_OF_STOCK` | Số lượng sản phẩm tồn kho không đủ |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi hệ thống server |