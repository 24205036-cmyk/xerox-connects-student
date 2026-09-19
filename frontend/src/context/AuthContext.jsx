import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authLogin, authRegister, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('xeroxpress_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize Axios default header and load current user profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('xeroxpress_token');
      if (storedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const res = await getMe();
          setUser(res.user);
          setToken(storedToken);
        } catch (error) {
          console.warn('Session expired or invalid, logging out.');
          localStorage.removeItem('xeroxpress_token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password, role) => {
    const res = await authLogin({ identifier, password, role });
    if (res.token && res.user) {
      localStorage.setItem('xeroxpress_token', res.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authRegister(formData);
    if (res.token && res.user) {
      localStorage.setItem('xeroxpress_token', res.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('xeroxpress_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
