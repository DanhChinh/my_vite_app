// controllers/orderController.js
const pool = require('../config/database');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { customer_info, payment_method, items, total_amount } = req.body;

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!customer_info || !customer_info.address || !payment_method ||!customer_info.phone) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin giao hàng hoặc phương thức thanh toán' 
      });
    }
    const recipient_name = customer_info.full_name || 'Khách hàng';
    const recipient_phone = customer_info.phone || 'Chưa cung cấp';
    const recipient_address = customer_info.address || 'Chưa cung cấp';

    const orderNote = customer_info.note || '';

    let checkoutItems = Array.isArray(items) && items.length > 0 ? items : [];
    if (checkoutItems.length === 0) {
      const cartItems = await Cart.getCartItemsByUserId(userId);
      if (!cartItems || cartItems.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Giỏ hàng của bạn đang trống' });
      }
      checkoutItems = cartItems;
    }

    let calculatedTotalPrice = 0;
    const orderItemsData = [];

    for (const item of checkoutItems) {
      const productId = item.product_id || item.id;
      const quantity = Number(item.quantity) || 1;

      // 1. Lấy sản phẩm từ DB
      const product = await Cart.findProductById(connection, productId);

      if (!product) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm (ID: ${productId}) không tồn tại` 
        });
      }

      if (product.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Sản phẩm "${product.name || product.product_name}" không đủ số lượng trong kho` 
        });
      }

      // 2. Trừ tồn kho
      const decreaseSuccess = await Order.decreaseStock(connection, productId, quantity);
      if (!decreaseSuccess) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Lỗi cập nhật tồn kho cho sản phẩm` 
        });
      }

      // 3. XỬ LÝ AN TOÀN GIÁ & TÊN SẢN PHẨM (Sửa lỗi NaN và NULL ở đây)
      // Kiểm tra lần lượt các field giá có thể có trong DB / Body
      const rawPrice = product.price ?? product.unit_price ?? item.price ?? 0;
      const unitPrice = isNaN(Number(rawPrice)) ? 0 : Number(rawPrice);

      // Kiểm tra tên sản phẩm
      const productName = product.name || product.product_name || item.product_name || item.name || 'Sản phẩm';

      calculatedTotalPrice += unitPrice * quantity;

      orderItemsData.push({
        product_id: productId,
        product_name: productName,
        quantity: quantity,
        unit_price: unitPrice
      });
    }

    const finalTotalPrice = calculatedTotalPrice > 0 ? calculatedTotalPrice : Number(total_amount || 0);

    // 4. Tạo Order
    const orderId = await Order.createOrder(
      connection,
      {
        userId,
        recipient_name,
        recipient_phone,
        recipient_address,
        paymentMethod: payment_method.toLowerCase(),
        note: orderNote,
        totalPrice: finalTotalPrice
      },
      orderItemsData
    );

    // 5. Xóa giỏ hàng
    const userCart = await Cart.findUserCart(connection, userId);
    if (userCart) {
      await Cart.deleteCart(connection, userCart.id);
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        order_id: orderId,
        total_price: finalTotalPrice
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Lỗi createOrder:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi hệ thống khi tạo đơn hàng: ' + error.message 
    });
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