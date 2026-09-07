
-- =========================================================
-- DATABASE SCHEMA - E-COMMERCE
-- MySQL 8.0+
-- =========================================================


-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(255) NOT NULL,

    role ENUM('customer', 'staff', 'admin')
        NOT NULL DEFAULT 'customer',

    email VARCHAR(255) NULL,
    phone VARCHAR(32) NULL,

    is_active TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_phone (phone),

    INDEX idx_users_role_active (role, is_active),

    CONSTRAINT chk_users_active
        CHECK (is_active IN (0, 1))

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 2. CUSTOMERS
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    full_name VARCHAR(150) NOT NULL DEFAULT '',

    gender ENUM('male', 'female', 'other')
        NOT NULL DEFAULT 'other',

    date_of_birth DATE DEFAULT NULL,

    avatar_url VARCHAR(255) DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_customers_user (user_id),

    CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 3. STAFF
-- =========================================================

CREATE TABLE IF NOT EXISTS staff (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    full_name VARCHAR(150) NOT NULL DEFAULT '',

    address TEXT,

    position VARCHAR(100) NOT NULL DEFAULT 'Nhân viên',

    department VARCHAR(100) DEFAULT 'Bán hàng',

    status ENUM('active', 'inactive', 'on_leave')
        NOT NULL DEFAULT 'active',

    hire_date DATE DEFAULT NULL,

    salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_staff_user (user_id),

    CONSTRAINT fk_staff_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_staff_salary
        CHECK (salary >= 0),

    INDEX idx_staff_status (status),
    INDEX idx_staff_department (department)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 4. CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(160) NOT NULL,

    attributes JSON NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_categories_slug (slug)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 5. PARTNERS
-- =========================================================

CREATE TABLE IF NOT EXISTS partners (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    supply_type VARCHAR(150) NOT NULL DEFAULT '',

    details TEXT,

    quality_info TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_partners_name (name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 6. PRODUCTS
-- =========================================================

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,

    category_id INT NULL,

    partner_id INT NULL,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    stock INT NOT NULL DEFAULT 0,

    attributes JSON NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_products_partner
        FOREIGN KEY (partner_id)
        REFERENCES partners(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_products_price
        CHECK (price >= 0),

    CONSTRAINT chk_products_stock
        CHECK (stock >= 0),

    INDEX idx_products_category (category_id),
    INDEX idx_products_partner (partner_id),
    INDEX idx_products_name (name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 7. PRODUCT_IMAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,

    product_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    is_primary TINYINT(1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_product_images_primary
        CHECK (is_primary IN (0, 1)),

    /*
       Chỉ tạo giá trị khi is_primary = 1.
       NULL không bị UNIQUE giới hạn trong MySQL.

       => Mỗi product chỉ có tối đa 1 primary image.
    */
    primary_product_id INT
        GENERATED ALWAYS AS (
            CASE
                WHEN is_primary = 1 THEN product_id
                ELSE NULL
            END
        ) STORED,

    UNIQUE KEY uq_product_primary_image (primary_product_id),

    INDEX idx_product_images_product
        (product_id, is_primary)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 8. CARTS
-- =========================================================

CREATE TABLE IF NOT EXISTS carts (
    id INT PRIMARY KEY AUTO_INCREMENT,

    /*
       User đăng nhập:
       user_id != NULL
       session_id = NULL

       Guest:
       user_id = NULL
       session_id != NULL
    */

    user_id INT NULL,

    session_id VARCHAR(255) NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_carts_user (user_id),

    UNIQUE KEY uq_carts_session (session_id),

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_carts_owner
        CHECK (
            (user_id IS NOT NULL AND session_id IS NULL)
            OR
            (user_id IS NULL AND session_id IS NOT NULL)
        )

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 9. CART_ITEMS
-- =========================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,

    cart_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_cart_items_quantity
        CHECK (quantity > 0),

    UNIQUE KEY uq_cart_items_product
        (cart_id, product_id),

    INDEX idx_cart_items_product (product_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 10. ORDERS
-- =========================================================

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    /*
       Snapshot địa chỉ tại thời điểm đặt hàng.
       Không phụ thuộc customer_addresses.
    */
    shipping_address TEXT NOT NULL,

    payment_method VARCHAR(32)
        NOT NULL DEFAULT 'cod',

    note TEXT,

    internal_note TEXT,

    status VARCHAR(32)
        NOT NULL DEFAULT 'pending',

    total_price DECIMAL(12, 2)
        NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT chk_orders_total_price
        CHECK (total_price >= 0),

    INDEX idx_orders_user_status
        (user_id, status),

    INDEX idx_orders_created_at
        (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 11. ORDER_ITEMS
-- =========================================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,

    order_id INT NOT NULL,

    /*
       NULL nếu sản phẩm đã bị xóa.
    */
    product_id INT NULL,

    /*
       Snapshot tên sản phẩm tại thời điểm mua.
    */
    product_name VARCHAR(255) NOT NULL,

    quantity INT NOT NULL,

    /*
       Snapshot giá tại thời điểm mua.
    */
    unit_price DECIMAL(12, 2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_order_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_items_unit_price
        CHECK (unit_price >= 0),

    INDEX idx_order_items_order
        (order_id),

    INDEX idx_order_items_product
        (product_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 12. CUSTOMER_ADDRESSES
-- =========================================================

CREATE TABLE IF NOT EXISTS customer_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    recipient_name VARCHAR(150) NOT NULL,

    phone VARCHAR(32) NOT NULL,

    province_code VARCHAR(20) DEFAULT NULL,

    province_name VARCHAR(100) DEFAULT NULL,

    district_code VARCHAR(20) DEFAULT NULL,

    district_name VARCHAR(100) DEFAULT NULL,

    ward_code VARCHAR(20) DEFAULT NULL,

    ward_name VARCHAR(100) DEFAULT NULL,

    specific_address VARCHAR(255) DEFAULT NULL,

    address_line TEXT NOT NULL,

    is_default TINYINT(1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_customer_addresses_default
        CHECK (is_default IN (0, 1)),

    /*
       Chỉ tạo giá trị khi is_default = 1.
       => Mỗi user chỉ có tối đa 1 default address.
    */
    default_user_id INT
        GENERATED ALWAYS AS (
            CASE
                WHEN is_default = 1 THEN user_id
                ELSE NULL
            END
        ) STORED,

    UNIQUE KEY uq_customer_default_address
        (default_user_id),

    INDEX idx_customer_addresses_user
        (user_id),

    INDEX idx_customer_addresses_default
        (user_id, is_default)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 13. PARTNER_STAFF
-- =========================================================

CREATE TABLE IF NOT EXISTS partner_staff (
    partner_id INT NOT NULL,

    staff_id INT NOT NULL,

    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (partner_id, staff_id),

    CONSTRAINT fk_partner_staff_partner
        FOREIGN KEY (partner_id)
        REFERENCES partners(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_partner_staff_staff
        FOREIGN KEY (staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 14. PASSWORD_RESETS
-- =========================================================

CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    /*
       SHA-256 hex = 64 characters
    */
    token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_resets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_password_resets_token
        (token_hash),

    INDEX idx_password_resets_user
        (user_id, expires_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 15. PRODUCT_REVIEWS
-- =========================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,

    product_id INT NOT NULL,

    user_id INT NOT NULL,

    /*
       Có thể NULL nếu review không gắn với order cụ thể.
    */
    order_id INT NULL,

    rating TINYINT NOT NULL,

    title VARCHAR(150) NULL,

    content TEXT NOT NULL,

    status VARCHAR(20)
        NOT NULL DEFAULT 'pending',

    is_verified_purchase TINYINT(1)
        NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT chk_reviews_status
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'hidden'
            )
        ),

    CONSTRAINT chk_reviews_verified
        CHECK (is_verified_purchase IN (0, 1)),

    /*
       Một user chỉ review một product một lần.
    */
    UNIQUE KEY uq_review_user_product
        (user_id, product_id),

    INDEX idx_reviews_product_status
        (product_id, status),

    INDEX idx_reviews_user
        (user_id),

    INDEX idx_reviews_order
        (order_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 16. PRODUCT_REVIEW_REPLIES
-- =========================================================

CREATE TABLE IF NOT EXISTS product_review_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,

    review_id INT NOT NULL,

    user_id INT NOT NULL,

    /*
       NULL = reply trực tiếp vào review.
       Có giá trị = reply vào một reply khác.
    */
    parent_id INT NULL,

    content TEXT NOT NULL,

    status VARCHAR(20)
        NOT NULL DEFAULT 'approved',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_replies_review
        FOREIGN KEY (review_id)
        REFERENCES product_reviews(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_replies_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    /*
       FK này đảm bảo parent reply phải thuộc
       cùng review_id.
    */
    CONSTRAINT fk_replies_parent_same_review
        FOREIGN KEY (review_id, parent_id)
        REFERENCES product_review_replies(review_id, id)
        ON DELETE CASCADE,

    CONSTRAINT chk_replies_status
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'hidden'
            )
        ),

    /*
       Cần UNIQUE để tạo composite FK
       (review_id, parent_id).
    */
    UNIQUE KEY uq_replies_review_id_id
        (review_id, id),

    INDEX idx_replies_review_status
        (review_id, status),

    INDEX idx_replies_parent
        (parent_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 17. PRODUCT_REVIEW_IMAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS product_review_images (
    id INT PRIMARY KEY AUTO_INCREMENT,

    review_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_images_review
        FOREIGN KEY (review_id)
        REFERENCES product_reviews(id)
        ON DELETE CASCADE,

    INDEX idx_review_images_review
        (review_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- =========================================================
-- SEED DATA FOR E-COMMERCE SYSTEM
-- =========================================================

-- 1. DỮ LIỆU MẪU: USERS
-- Mật khẩu mặc định cho tất cả tài khoản mẫu là: "123456" (Đã mã hóa Bcrypt cost=10)
INSERT INTO users (id, username, password, role, email, phone, is_active) VALUES
(1, 'admin', '1', 'admin', 'admin@store.com', '0900000001', 1),
(2, 'staff_nam', '1', 'staff', 'nam.staff@store.com', '0900000002', 1),
(3, 'customer_an', '1', 'customer', 'an.nguyen@gmail.com', '0988888888', 1),
(4, 'customer_binh', '1', 'customer', 'binh.tran@gmail.com', '0977777777', 1);

-- 2. DỮ LIỆU MẪU: CUSTOMERS
INSERT INTO customers (user_id, full_name, gender, date_of_birth, avatar_url) VALUES
(3, 'Nguyễn Văn An', 'male', '1995-05-15', 'https://example.com/avatars/an.jpg'),
(4, 'Trần Thị Bình', 'female', '1998-10-20', 'https://example.com/avatars/binh.jpg');

-- 3. DỮ LIỆU MẪU: STAFF
INSERT INTO staff (user_id, full_name, address, position, department, status, hire_date, salary) VALUES
(2, 'Lê Văn Nam', '123 Đường 3/2, Quận 10, TP.HCM', 'Nhân viên bán hàng', 'Bán hàng', 'active', '2023-01-15', 10000000.00);

-- 4. DỮ LIỆU MẪU: CATEGORIES (DANH MỤC)
INSERT INTO categories (id, name, slug, attributes) VALUES
(1, 'Điện thoại', 'dien-thoai', '{"supported_rams": ["4GB", "8GB", "12GB"], "supported_storages": ["128GB", "256GB", "512GB"]}'),
(2, 'Phụ kiện', 'phu-kien', '{"types": ["Sạc", "Tai nghe", "Ốp lưng"]}'),
(3, 'Máy tính bảng', 'may-tinh-bang', '{"screen_sizes": ["10.9 inch", "11 inch", "12.9 inch"]}');

-- 5. DỮ LIỆU MẪU: PARTNERS (ĐỐI TÁC / NHÀ CUNG CẤP)
INSERT INTO partners (id, name, supply_type, details, quality_info) VALUES
(1, 'Apple Việt Nam', 'Chính hãng', 'Nhà phân phối ủy quyền chính thức của Apple tại Việt Nam', 'Hàng VN/A, bảo hành 12 tháng chính hãng'),
(2, 'Samsung Electronics', 'Chính hãng', 'Đơn vị cung cấp thiết bị Samsung Galaxy chính hãng', 'Bảo hành điện tử 12 tháng tại Samsung Care');

-- 6. DỮ LIỆU MẪU: PRODUCTS (SẢN PHẨM)
INSERT INTO products (id, category_id, partner_id, name, description, price, stock, attributes) VALUES
(1, 1, 1, 'iPhone 15 Pro Max 256GB', 'Điện thoại Apple iPhone 15 Pro Max chính hãng VN/A khung Titan siêu bền nhẹ.', 29500000.00, 15, '{"color": "Titan Tự Nhiên", "ram": "8GB", "storage": "256GB"}'),
(2, 1, 2, 'Samsung Galaxy S24 Ultra 512GB', 'Flagship Samsung S24 Ultra trang bị Galaxy AI và bút S-Pen tích hợp.', 27900000.00, 10, '{"color": "Xám Titan", "ram": "12GB", "storage": "512GB"}'),
(3, 2, 1, 'Sạc Apple 20W USB-C', 'Củ sạc nhanh Apple 20W Type-C chính hãng dùng cho iPhone, iPad.', 520000.00, 50, '{"port": "USB-C", "power": "20W"}');

-- 7. DỮ LIỆU MẪU: PRODUCT_IMAGES (ẢNH SẢN PHẨM)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://example.com/images/iphone-15-pro-max-main.jpg', 1),
(1, 'https://example.com/images/iphone-15-pro-max-back.jpg', 0),
(2, 'https://example.com/images/s24-ultra-main.jpg', 1),
(3, 'https://example.com/images/charger-20w-main.jpg', 1);