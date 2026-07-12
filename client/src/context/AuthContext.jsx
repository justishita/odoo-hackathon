import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Bypass API token check for development sandbox
      if (token.startsWith('mock-')) {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            setUser(JSON.parse(localUser));
          } catch (e) {
            handleLogoutLocal();
          }
        } else {
          handleLogoutLocal();
        }
        setLoading(false);
        return;
      }

      try {
        // GET /api/auth/me to verify token and restore user details
        const response = await axiosInstance.get('/auth/me');
        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } else {
          // If response isn't formatted as expected, clear token
          handleLogoutLocal();
        }
      } catch (error) {
        console.error('Error verifying auth session:', error);
        handleLogoutLocal();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogoutLocal = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Perform API login
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data?.success && response.data?.data) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return response.data;
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  };

  // Perform API logout
  const logout = async () => {
    try {
      // Optional: notify backend about logout
      await axiosInstance.post('/auth/logout').catch(() => {});
    } catch (error) {
      console.warn('Backend logout call failed', error);
    } finally {
      handleLogoutLocal();
    }
  };

  // Helpers
  const isAuthenticated = !!user;

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
