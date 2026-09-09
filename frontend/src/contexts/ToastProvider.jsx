import React, { createContext, useCallback, useContext, useState } from 'react';

// 1. Đổi tên Context thành ToastContext để tránh trùng tên với Component ToastProvider
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setToasts((current) => [...current, { id, message, type }]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Vị trí hiển thị Toast: Góc trên bên phải, đè lên trên cùng (z-index cao) */}
      <div 
        className="toast-container position-fixed top-0 end-0 p-3" 
        style={{ zIndex: 1090 }} 
        aria-live="polite" 
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  // Tự động chỉnh màu nút close dựa trên nền toast
  const isLightBackground = toast.type === 'warning' || toast.type === 'light';
  const closeBtnClass = isLightBackground ? 'btn-close me-2 m-auto' : 'btn-close btn-close-white me-2 m-auto';

  return (
    <div 
      className={`toast show align-items-center text-bg-${toast.type} border-0 mb-2 shadow-sm`} 
      role="status"
    >
      <div className="d-flex">
        <div className="toast-body">{toast.message}</div>
        <button 
          type="button" 
          className={closeBtnClass} 
          aria-label="Đóng" 
          onClick={onClose} 
        />
      </div>
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được dùng bên trong ToastProvider');
  }
  return context;
};