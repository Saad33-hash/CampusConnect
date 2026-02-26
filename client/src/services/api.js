import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
export const API_BASE_URL = 'http://localhost:5000';

// Helper to convert resume URL to full URL
export const getFullResumeUrl = (url) => {
  if (!url) return null;
  // If it's a relative path (our proxy URL), prepend the API base
  if (url.startsWith('/api/')) {
    return `${API_BASE_URL}${url}`;
  }
  // Otherwise return as-is (for external URLs like old cloudinary URLs)
  return url;
};

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

  // Save/Bookmark a post
  savePost: async (id) => {
    const response = await api.post(`/posts/${id}/save`);
    return response.data;
  },

  // Unsave/Remove bookmark
  unsavePost: async (id) => {
    const response = await api.delete(`/posts/${id}/save`);
    return response.data;
  },

  // Get saved posts
  getSavedPosts: async () => {
    const response = await api.get('/posts/user/saved');
    return response.data;
  },
};

// Applications API calls
export const applicationsAPI = {
  // Apply to a post
  applyToPost: async (postId, applicationData) => {
    const response = await api.post(`/applications/posts/${postId}/apply`, applicationData);
    return response.data;
  },

  // Check if already applied
  checkApplicationStatus: async (postId) => {
    const response = await api.get(`/applications/posts/${postId}/check`);
    return response.data;
  },

  // Get my applications
  getMyApplications: async (params = {}) => {
    const response = await api.get('/applications/my-applications', { params });
    return response.data;
  },

  // Get my application stats
  getMyStats: async () => {
    const response = await api.get('/applications/my-stats');
    return response.data;
  },

  // Get recruiter's recent applications (across all their posts)
  getRecruiterApplications: async (params = {}) => {
    const response = await api.get('/applications/recruiter/recent', { params });
    return response.data;
  },

  // Get applications for a post (as creator)
  getPostApplications: async (postId, params = {}) => {
    const response = await api.get(`/applications/posts/${postId}`, { params });
    return response.data;
  },

  // Get single application
  getApplication: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Update application (as applicant)
  updateApplication: async (applicationId, data) => {
    const response = await api.put(`/applications/${applicationId}`, data);
    return response.data;
  },

  // Withdraw application
  withdrawApplication: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}/withdraw`);
    return response.data;
  },

  // Update application status (as post creator)
  updateStatus: async (applicationId, status, note) => {
    const response = await api.patch(`/applications/${applicationId}/status`, { status, note });
    return response.data;
  },

  // Add reviewer notes
  addNotes: async (applicationId, notes) => {
    const response = await api.patch(`/applications/${applicationId}/notes`, { notes });
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  // Upload resume file
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (publicId) => {
    const response = await api.delete('/upload/file', { data: { publicId } });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Start or get existing conversation with a user
  startConversation: async (userId) => {
    const response = await api.post('/chat/conversations', { userId });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 1) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page }
    });
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    const response = await api.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },
};

// OAuth URLs
export const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';
export const GITHUB_AUTH_URL = 'http://localhost:5000/api/auth/github';

export default api;
