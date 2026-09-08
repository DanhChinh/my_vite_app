userModel.js

    Mục đích: Quản lý toàn bộ thông tin tài khoản người dùng, hồ sơ khách hàng và tính năng khôi phục mật khẩu.

    Các bảng liên quan: users, customers, password_resets.

    Các hàm chính:

    findByLoginIdentifier(identifier): Tìm kiếm user dựa vào username hoặc email với điều kiện tài khoản đang hoạt động (is_active = 1).

    checkExisting(username, email, phone): Kiểm tra sự tồn tại trùng lặp của tên đăng nhập, email hoặc số điện thoại khi đăng ký.

    createCustomer(connection, userData): Thực hiện transaction thêm mới đồng thời vào bảng users (role customer) và bảng customers.

    findCustomerEmail(email): Tìm user theo email dành riêng cho tính năng quên mật khẩu.

    findValidResetToken(connection, tokenHash): Xác thực token khôi phục mật khẩu còn hạn sử dụng (FOR UPDATE chống race condition).

    updatePassword(connection, userId, passwordHash): Cập nhật mật khẩu mới đã mã hóa bằng bcrypt.

productModel.js

    Mục đích: Quản lý thông tin hàng hóa, hình ảnh và phân tách quyền truy cập dữ liệu nhạy cảm theo phân quyền người dùng.

    Các bảng liên quan: products, product_images.

    Các hàm chính:

    getProductForCustomer(productId): Lấy thông tin công khai (tên, mô tả, giá bán, hình ảnh chính) của sản phẩm đang kinh doanh (is_active = 1).

    getProductForStaff(productId): Lấy thêm thông tin vận hành kho (tồn kho, mã SKU, trạng thái ẩn/hiện) cho nhân viên quản lý.

    getProductForAdmin(productId): Lấy toàn bộ dữ liệu quản trị bao gồm giá vốn (cost_price), nhà cung cấp và lịch sử thay đổi.

categoryModel.js

    Mục đích: Tổ chức cây danh mục sản phẩm từ cấp cha đến cấp con phục vụ điều hướng và lọc sản phẩm trên giao diện.

    Các bảng liên quan: categories (hỗ trợ cột parent_id tự tham chiếu).

    Các hàm chính:

    getAllCategories(): Lấy toàn bộ danh sách danh mục để xây dựng cây phân cấp (tree structure).

    getCategoryById(categoryId): Lấy chi tiết thông tin của một danh mục cụ thể.

    createCategory(categoryData): Thêm mới danh mục hoặc danh mục con.

    updateCategory(categoryId, categoryData): Cập nhật thông tin danh mục.

cartModel.js

    Mục đích: Quản lý giỏ hàng linh hoạt cho cả khách vãng lai (dùng session_id) lẫn thành viên hệ thống (dùng user_id).

    Các bảng liên quan: carts, cart_items, products, product_images.

    Các hàm chính:

    getCartItemsByUserId(userId) / getCartItemsBySessionId(sessionId): Lấy danh sách sản phẩm, số lượng và tổng tiền trong giỏ hàng tương ứng.

    findProductById(connection, productId): Kiểm tra thông tin tồn kho và giá hiện tại của sản phẩm.

    addCartItem / updateCartItemQuantity: Thêm sản phẩm mới hoặc cập nhật số lượng hàng hóa trong giỏ.

    convertGuestCartToUser(connection, userId, guestCartId) / getGuestCartItemsForMerge: Hỗ trợ gộp giỏ hàng vãng lai sang tài khoản cá nhân khi khách đăng nhập.

orderModel.js

    Mục đích: Xử lý toàn bộ chu trình đặt hàng, lưu trữ lịch sử giao dịch và chi tiết sản phẩm mua kèm snapshot giá tại thời điểm đặt.

    Các bảng liên quan: orders, order_items.

    Các hàm chính:

    createOrder(connection, orderData, items): Tạo đơn hàng mới và ghi nhận chi tiết từng sản phẩm kèm số lượng và đơn giá cố định.

    getOrdersByUser(userId): Lấy danh sách lịch sử đơn hàng của cá nhân khách hàng.

    getOrderDetailsForAdmin(orderId): Lấy toàn bộ thông tin chi tiết đơn hàng phục vụ xử lý vận đơn cho Admin/Staff.

    updateOrderStatus(orderId, status): Cập nhật trạng thái vòng đời đơn hàng (Chờ xác nhận, Đang giao, Hoàn thành, Hủy).