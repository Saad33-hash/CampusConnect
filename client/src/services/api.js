import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  // Register new user
  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.get('/logout');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/resend-verification', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post('/reset-password', { token, password });
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Switch role (Talent Finder <-> Talent Seeker)
  switchRole: async (role) => {
    const response = await api.put('/switch-role', { role });
    return response.data;
  },

  // Update resume URL
  updateResume: async (resumeUrl) => {
    const response = await api.put('/resume', { resumeUrl });
    return response.data;
  },
};

// OAuth URLs
export const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';
export const GITHUB_AUTH_URL = 'http://localhost:5000/api/auth/github';

export default api;
