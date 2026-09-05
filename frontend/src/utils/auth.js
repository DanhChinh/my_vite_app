// utils/auth.js - Authentication utilities

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserRole = () => {
  return localStorage.getItem('role') || 'guest';
};

export const saveAuthToken = (token, role) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const hasRole = (role) => {
  return getUserRole() === role;
};
