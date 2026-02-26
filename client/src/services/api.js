import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Switch role (Talent Finder <-> Talent Seeker)
  switchRole: async (role) => {
    const response = await api.put('/auth/switch-role', { role });
    return response.data;
  },

  // Update resume URL
  updateResume: async (resumeUrl) => {
    const response = await api.put('/auth/resume', { resumeUrl });
    return response.data;
  },
};

// Posts API calls
export const postsAPI = {
  // Get all posts with filters
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Get my posts
  getMyPosts: async (params = {}) => {
    const response = await api.get('/posts/user/my-posts', { params });
    return response.data;
  },

  // Get post statistics
  getPostStats: async () => {
    const response = await api.get('/posts/user/stats');
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Publish draft
  publishPost: async (id) => {
    const response = await api.patch(`/posts/${id}/publish`);
    return response.data;
  },

  // Close post
  closePost: async (id, filled = false) => {
    const response = await api.patch(`/posts/${id}/close`, { filled });
    return response.data;
  },
};

// OAuth URLs
export const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';
export const GITHUB_AUTH_URL = 'http://localhost:5000/api/auth/github';

export default api;
