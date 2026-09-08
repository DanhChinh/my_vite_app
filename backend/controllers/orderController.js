// controllers/orderController.js
const pool = require('../config/database');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { shippingAddress, paymentMethod, note } = req.body;

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!shippingAddress || !paymentMethod) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Thiếu thông tin giao hàng hoặc phương thức thanh toán' });
    }

    // 1. Lấy giỏ hàng của user
    const cartItems = await Cart.getCartItemsByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    // 2. Kiểm tra tồn kho và chuẩn bị dữ liệu snapshot
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = await Cart.findProductById(connection, item.product_id);
      if (!product || product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm "${item.product_name}" không đủ số lượng trong kho` 
        });
      }

      // Trừ tồn kho
      const success = await Order.decreaseStock(connection, item.product_id, item.quantity);
      if (!success) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Lỗi cập nhật tồn kho cho sản phẩm ${item.product_name}` });
      }

      const itemTotal = Number(item.price) * item.quantity;
      totalPrice += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.price
      });
    }

    // 3. Tạo đơn hàng và order_items
    const orderId = await Order.createOrder(connection, {
      userId,
      shippingAddress,
      paymentMethod,
      note,
      totalPrice
    }, orderItemsData);

    // 4. Xóa giỏ hàng sau khi đặt thành công
    const userCart = await Cart.findUserCart(connection, userId);
    if (userCart) {
      await Cart.deleteCart(connection, userCart.id);
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: { order_id: orderId }
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi createOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const orders = await Order.getOrdersByUser(userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi getMyOrders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrderDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const order = await Order.getOrderDetailsForCustomer(userId, orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi getMyOrderDetails:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- DÀNH CHO ADMIN / STAFF ---

exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const { status } = req.query; // Có thể lọc theo ?status=pending
    const orders = await Order.getAllOrders(status);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi getAllOrdersForAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.getOrderDetailsForAdmin(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi getOrderDetailsForAdmin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status, internal_note } = req.body;

    const validStatuses = ['pending', 'shipping', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    await Order.updateOrderStatus(orderId, status, internal_note || null);
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error("Lỗi updateOrderStatus:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- DÀNH CHO KHÁCH HÀNG (HỦY ĐƠN) ---

exports.cancelOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { id: orderId } = req.params;

    // Lấy thông tin đơn hàng của user
    const order = await Order.getOrderDetailsForCustomer(userId, orderId);
    if (!order) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý (pending)' });
    }

    // Cập nhật trạng thái đơn thành cancelled
    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', orderId]
    );

    // Hoàn lại tồn kho cho từng sản phẩm trong đơn
    for (const item of order.items) {
      await Order.increaseStock(connection, item.product_id, item.quantity);
    }

    await connection.commit();
    res.json({ success: true, message: 'Hủy đơn hàng thành công và đã hoàn lại tồn kho' });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi cancelOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};