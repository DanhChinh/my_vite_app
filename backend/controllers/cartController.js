const pool = require('../config/database');
const Cart = require('../models/cartModel');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }
    console.log("getCart with id:", userId);
    const items = await Cart.getCartItemsByUserId(userId);
    const totalPrice = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    res.json({
      success: true,
      data: {
        owner_type: 'customer',
        items: items,
        total_price: totalPrice
      }
    });
  } catch (error) {
    console.error("Lỗi getCart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { product_id, quantity = 1 } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!product_id || qtyNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Dữ liệu sản phẩm hoặc số lượng không hợp lệ' });
    }

    const product = await Cart.findProductById(connection, product_id);
    if (!product) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    let cart = await Cart.findUserCart(connection, userId);
    let cartId = cart ? cart.id : await Cart.createUserCart(connection, userId);

    const existingItem = await Cart.findCartItem(connection, cartId, product_id);

    if (existingItem) {
      const newQty = existingItem.quantity + qtyNum;
      if (newQty > product.stock) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Số lượng sản phẩm vượt quá tồn kho' });
      }
      await Cart.updateCartItemQuantity(connection, existingItem.id, newQty);
    } else {
      if (qtyNum > product.stock) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Số lượng sản phẩm vượt quá tồn kho' });
      }
      await Cart.addCartItem(connection, cartId, product_id, qtyNum);
    }

    await connection.commit();
    res.json({ 
      success: true, 
      message: 'Thêm vào giỏ hàng thành công'
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.mergeCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { localItems } = req.body; // Danh sách sản phẩm từ localStorage gửi lên [{ product_id, quantity }]

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!localItems || !Array.isArray(localItems) || localItems.length === 0) {
      await connection.commit();
      return res.json({ success: true, message: 'Không có sản phẩm nào để hợp nhất' });
    }

    let userCart = await Cart.findUserCart(connection, userId);
    let cartId = userCart ? userCart.id : await Cart.createUserCart(connection, userId);

    for (const item of localItems) {
      const { product_id, quantity } = item;
      const qtyNum = parseInt(quantity, 10);

      if (!product_id || qtyNum <= 0) continue;

      const product = await Cart.findProductById(connection, product_id);
      if (!product) continue;

      const maxStock = product.stock;
      const userItem = await Cart.findCartItem(connection, cartId, product_id);

      if (userItem) {
        let newQty = userItem.quantity + qtyNum;
        if (newQty > maxStock) newQty = maxStock;
        await Cart.updateCartItemQuantity(connection, userItem.id, newQty);
      } else {
        let finalQty = qtyNum;
        if (finalQty > maxStock) finalQty = maxStock;
        await Cart.addCartItem(connection, cartId, product_id, finalQty);
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Hợp nhất giỏ hàng từ localStorage thành công' });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi mergeCart:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.updateCartItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { cart_item_id, quantity } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!userId || !cart_item_id || qtyNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    const cartItem = await Cart.findUserCartItemWithStock(connection, cart_item_id, userId);
    if (!cartItem) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Sản phẩm trong giỏ không tồn tại' });
    }

    if (qtyNum > cartItem.stock) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Số lượng vượt quá tồn kho' });
    }

    await Cart.updateCartItemQuantity(connection, cart_item_id, qtyNum);

    await connection.commit();
    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.removeCartItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const { cart_item_id } = req.params;

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    await Cart.removeUserCartItem(connection, cart_item_id, userId);

    await connection.commit();
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};