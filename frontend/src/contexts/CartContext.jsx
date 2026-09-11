// contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';
import { getGuestCart, saveGuestCart, clearGuestCart } from '../utils/guest';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { role, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isCustomer = isAuthenticated && role === 'customer';

  // 1. Tải dữ liệu giỏ hàng từ Server hoặc LocalStorage
  const fetchCart = useCallback(async () => {
    setIsLoading(true);

    if (isCustomer) {
      try {
        const response = await cartService.getCart();
        // axiosInstance đã trả về response.data
        const items = response.data.items || [];
        setCartItems(items);
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng từ server:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Khách vãng lai: Đọc từ LocalStorage
      const localCart = getGuestCart();
      setCartItems(localCart);
      setIsLoading(false);
    }
  }, [isCustomer]);

  // Tự động tải lại giỏ hàng khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    if (isCustomer) {
      // Xóa bộ nhớ tạm Guest khi đã trở thành Customer
      clearGuestCart();
    }
    fetchCart();
  }, [isCustomer, fetchCart]);

  // 2. Thêm sản phẩm (Nhận gom Object: { product, quantity })
  const addToCart = async ({ product, quantity = 1 }) => {
    if (!product || !product.id) return;

    if (isCustomer) {
      // Đúng định dạng payload mong muốn của Backend: { product_id, quantity }
      await cartService.addToCart({ product_id: product.id, quantity });
      await fetchCart();
    } else {
      const currentCart = getGuestCart();
      const existingIndex = currentCart.findIndex((item) => item.product_id === product.id);

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = [...currentCart];
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart = [
          ...currentCart,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          },
        ];
      }

      saveGuestCart(updatedCart);
      setCartItems(updatedCart);
    }
  };

  // 3. Cập nhật số lượng (Nhận gom Object: { item, newQuantity })
  const updateQuantity = async ({ item, newQuantity }) => {
    if (newQuantity <= 0) {
      return removeFromCart(item);
    }

    if (isCustomer) {
      // Gọi updateCartItem với payload object gửi lên Server
      await cartService.updateCartItem({
        cart_item_id: item.cart_item_id || item.id,
        quantity: newQuantity
      });
      await fetchCart();
    } else {
      const currentCart = getGuestCart();
      const updatedCart = currentCart.map((cartItem) =>
        cartItem.product_id === item.product_id ? { ...cartItem, quantity: newQuantity } : cartItem
      );

      saveGuestCart(updatedCart);
      setCartItems(updatedCart);
    }
  };

  // 4. Xóa sản phẩm (Nhận tham số là Object `item`)
  const removeFromCart = async (item) => {
    if (!item) return;

    if (isCustomer) {
      // Khách đăng nhập: Dùng cart_item_id để xóa
      const cartItemId = item.cart_item_id || item.id;
      await cartService.removeCartItem(cartItemId);
      await fetchCart();
    } else {
      // Khách vãng lai: Dùng product_id để lọc
      const currentCart = getGuestCart();
      const updatedCart = currentCart.filter((cartItem) => cartItem.product_id !== item.product_id);
      
      saveGuestCart(updatedCart);
      setCartItems(updatedCart);
    }
  };

  const clearCart = async () => {
    // if (isCustomer) {
    //   await cartService.clearCart();
    //   await fetchCart();
    // } else {
    //   clearGuestCart();
    //   setCartItems([]);
    // }

    setCartItems([])
    
  }

  // 5. Gộp giỏ hàng Guest vào Server khi đăng nhập thành công
  const handleMergeCart = async () => {
    const localItems = getGuestCart();
    if (localItems.length > 0) {
      try {
        await cartService.mergeCart(localItems);
        clearGuestCart();
        await fetchCart();
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', error);
      }
    }
  };
  

  // Các giá trị tính toán (Calculated Values)
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartCount = safeCartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const cartTotal = safeCartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        // State & Biến dữ liệu
        cartItems: safeCartItems,
        cartCount,
        cartTotal,
        isLoading,

        // Hàm & Hành động
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        mergeCart: handleMergeCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);