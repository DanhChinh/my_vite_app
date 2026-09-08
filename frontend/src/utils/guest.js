// utils/guest.js - Quản lý giỏ hàng & phiên khách vãng lai

export const getGuestCart = () => {
  const cart = localStorage.getItem('guestCart');
  return cart ? JSON.parse(cart) : [];
};

export const saveGuestCart = (cartItems) => {
  localStorage.setItem('guestCart', JSON.stringify(cartItems));
};

export const clearGuestCart = () => {
  localStorage.removeItem('guestCart');
};

// export const getGuestSessionId = () => {
//   let sessionId = localStorage.getItem('guest_session_id');
//   if (!sessionId) {
//     sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
//     localStorage.setItem('guest_session_id', sessionId);
//   }
//   return sessionId;
// };

// export const clearGuestSessionId = () => {
//   localStorage.removeItem('guest_session_id');
// };