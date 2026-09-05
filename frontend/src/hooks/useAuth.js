// hooks/useAuth.js - Authentication hook

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { clearAuthToken, isAuthenticated, getUserRole } from '../utils/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError('');
    
    const result = await authService.login(username, password);
    
    if (result.success) {
      const role = result.role;
      // Redirect theo role
      if (role === 'customer') navigate('/customer/dashboard');
      else if (role === 'staff') navigate('/staff/dashboard');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
    return result.success;
  }, [navigate]);

  const logout = useCallback(() => {
    clearAuthToken();
    navigate('/login');
  }, [navigate]);

  return {
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    userRole: getUserRole(),
    loading,
    error
  };
};
