// utils/format.js - Formatting utilities

export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('vi-VN');
};

export const formatCurrencyVND = (value) => {
  return `${formatCurrency(value)} đ`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

export const truncateText = (text, maxLength = 50) => {
  return text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text || '';
};
