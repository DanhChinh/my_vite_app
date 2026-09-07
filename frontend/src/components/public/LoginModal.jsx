import React, { useEffect } from 'react';
import LoginForm from './LoginForm';

export default function LoginModal({ isOpen, onClose }) {
  // Lắng nghe sự kiện nhấn phím ESC để đóng Modal
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="auth-modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <LoginForm showCloseButton onClose={onClose} onSuccess={onClose} />
      </div>
    </div>
  );
}