import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.getMe();
          if (data.success) {
            setUser(data.user);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const signup = async (displayName, email, password) => {
    try {
      setError(null);
      const data = await authAPI.signup({ displayName, email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Handle OAuth callback token
  const handleOAuthCallback = async (token) => {
    try {
      localStorage.setItem('token', token);
      const data = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      localStorage.removeItem('token');
      const message = err.response?.data?.message || 'OAuth authentication failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Switch role (Talent Finder <-> Talent Seeker)
  const switchRole = async (role) => {
    try {
      setError(null);
      const data = await authAPI.switchRole(role);
      if (data.success) {
        setUser(prev => ({ ...prev, activeRole: data.activeRole }));
        return { success: true, message: data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to switch role';
      setError(message);
      return { success: false, message };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await authAPI.updateProfile(profileData);
      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update profile' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      setError(message);
      return { success: false, message };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const data = await authAPI.getMe();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    handleOAuthCallback,
    switchRole,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user,
    activeRole: user?.activeRole || 'talent-seeker',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
