const pool = require('../config/database');
const crypto = require('crypto');
const Cart = require('../models/cartModel');

const getSessionId = (req) => {
  return (
    req.headers['x-session-id'] || 
    req.body?.session_id ||            
    req.query?.session_id ||           
    req.cookies?.session_id            
  );
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id; 
    const sessionId = !userId ? getSessionId(req) : null; 

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: { items: [], total_price: 0 }
      });
    }

    let items = [];
    if (userId) {
      items = await Cart.getCartItemsByUserId(userId);
    } else {
      items = await Cart.getCartItemsBySessionId(sessionId);
    }

    const totalPrice = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    res.json({
      success: true,
      data: {
        owner_type: userId ? 'customer' : 'guest',
        ...(sessionId && !userId ? { session_id: sessionId } : {}),
        items: items,
        total_price: totalPrice
      }
    });
  } catch (error) {
    console.error("Lỗi getCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    let sessionId = !userId ? getSessionId(req) : null;

    if (!userId && !sessionId) {
      sessionId = crypto.randomUUID();
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

    let cartId = null;

    if (userId) {
      let cart = await Cart.findUserCart(connection, userId);
      if (!cart) {
        cartId = await Cart.createUserCart(connection, userId);
      } else {
        cartId = cart.id;
      }
    } else {
      let cart = await Cart.findGuestCart(connection, sessionId);
      if (!cart) {
        cartId = await Cart.createGuestCart(connection, sessionId);
      } else {
        cartId = cart.id;
      }
    }

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
      message: 'Thêm vào giỏ hàng thành công',
      ...(!userId ? { session_id: sessionId } : {})
    });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi addToCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.mergeGuestCart = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user?.id;
    const session_id = getSessionId(req);

    if (!userId) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    if (!session_id) {
      await connection.commit();
      return res.json({ success: true, message: 'Không có session_id để merge' });
    }

    const guestCart = await Cart.findGuestCart(connection, session_id);
    if (!guestCart) {
      await connection.commit();
      return res.json({ success: true, message: 'Không tìm thấy giỏ hàng vãng lai' });
    }

    let userCart = await Cart.findUserCart(connection, userId);
    
    if (!userCart) {
      await Cart.convertGuestCartToUser(connection, userId, guestCart.id);
      await connection.commit();
      return res.json({ success: true, message: 'Đã chuyển giỏ hàng guest thành giỏ hàng user thành công' });
    }

    const guestItems = await Cart.getGuestCartItemsForMerge(connection, guestCart.id);

    for (const item of guestItems) {
      const product = await Cart.findProductById(connection, item.product_id);
      const maxStock = product ? product.stock : 999999;

      const userItem = await Cart.findCartItem(connection, userCart.id, item.product_id);

      if (userItem) {
        let newQty = userItem.quantity + item.quantity;
        if (newQty > maxStock) newQty = maxStock;
        await Cart.updateCartItemQuantity(connection, userItem.id, newQty);
      } else {
        let finalQty = item.quantity;
        if (finalQty > maxStock) finalQty = maxStock;
        await Cart.addCartItem(connection, userCart.id, item.product_id, finalQty);
      }
    }

    await Cart.deleteCart(connection, guestCart.id);

    await connection.commit();
    res.json({ success: true, message: 'Đã hợp nhất giỏ hàng thành công' });
  } catch (error) {
    await connection.rollback();
    console.error("Lỗi mergeGuestCart chung:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.updateGuestCartItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sessionId = getSessionId(req);
    const { cart_item_id, quantity } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!sessionId || !cart_item_id || qtyNum <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }

    const cartItem = await Cart.findGuestCartItemWithStock(connection, cart_item_id, sessionId);
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

exports.removeGuestCartItem = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const sessionId = getSessionId(req);
    const { cart_item_id } = req.params;

    if (!sessionId) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Session ID không tồn tại' });
    }

    await Cart.removeGuestCartItem(connection, cart_item_id, sessionId);

    await connection.commit();
    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};