import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { PUBLIC_ENDPOINTS, CUSTOMER_ENDPOINTS } from '../constants/api';
import { getGuestSessionId, clearGuestSessionId } from '../utils/auth';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm bổ trợ tạo Header cho Request
  const getHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token && user?.role === 'customer') {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Gửi Session ID qua Custom Header để Backend luôn nhận được
      headers['X-Session-Id'] = getGuestSessionId();
    }
    return headers;
  }, [token, user]);

  // 1. Tải giỏ hàng
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (token && user?.role === 'customer') {
        response = await fetch(CUSTOMER_ENDPOINTS.CART, {
          headers: getHeaders()
        });
      } else {
        const sessionId = getGuestSessionId();
        // Gửi cả trên URL query và Header để đảm bảo an toàn
        response = await fetch(`${PUBLIC_ENDPOINTS.CART}?session_id=${sessionId}`, {
          headers: getHeaders()
        });
      }

      const result = await response.json();

      if (result.success) {
        const items = result.data?.items || (Array.isArray(result.data) ? result.data : []);
        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, getHeaders]);

  // Tự động tải lại giỏ hàng khi mount hoặc khi login/logout
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    try {
      const isCustomer = token && user?.role === 'customer';
      const endpoint = isCustomer ? CUSTOMER_ENDPOINTS.ADD_TO_CART : PUBLIC_ENDPOINTS.ADD_TO_CART;
      const sessionId = getGuestSessionId();

      const bodyData = {
        product_id: product.id,
        quantity,
        session_id: sessionId // Gửi trong body
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(), // Gửi X-Session-Id trong Headers
        body: JSON.stringify(bodyData)
      });

      const result = await res.json();
      if (result.success) {
        // Cập nhật lại session_id nếu Backend trả về ID chính thức
        if (result.session_id) {
          localStorage.setItem('guest_session_id', result.session_id);
        }
        await fetchCart();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ:', error);
      return { success: false };
    }
  };

  // 3. Xóa sản phẩm khỏi giỏ
  const removeFromCart = async (productId) => {
    try {
      const isCustomer = token && user?.role === 'customer';
      // const endpoint = isCustomer 
      //   ? CUSTOMER_ENDPOINTS.REMOVE_CART_ITEM(productId) 
      //   : PUBLIC_ENDPOINTS.REMOVE_CART_ITEM(productId);
      
      const endpoint = PUBLIC_ENDPOINTS.REMOVE_CART_ITEM(productId);
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          session_id: getGuestSessionId(),
          product_id: productId
        })
      });

      const result = await res.json();
      if (result.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
      return { success: false };
    }
  };

  // 4. Cập nhật số lượng
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      const isCustomer = token && user?.role === 'customer';
      const endpoint = isCustomer ? CUSTOMER_ENDPOINTS.UPDATE_CART : PUBLIC_ENDPOINTS.UPDATE_CART;

      const bodyData = {
        product_id: productId,
        quantity: newQuantity,
        session_id: getGuestSessionId()
      };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(bodyData)
      });

      const result = await res.json();
      if (result.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
    }
  };

  // 5. Xóa sạch giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    if (!token) {
      clearGuestSessionId();
    }
  };

  // Tính toán tổng số lượng & tổng tiền
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartCount = safeCartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartTotal = safeCartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );

  return (
    <CartContext.Provider 
      value={{ 
        cartItems: safeCartItems, 
        loading, 
        addToCart, 
        updateQuantity, 
        removeFromCart,
        removeItem: removeFromCart,
        clearCart, 
        cartCount, 
        cartTotal,
        refreshCart: fetchCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);