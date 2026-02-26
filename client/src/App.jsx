import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './providers/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostDetail from './pages/PostDetail';
import MyApplications from './pages/MyApplications';
import PostApplications from './pages/PostApplications';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Chat from './pages/Chat';
import SavedJobs from './pages/SavedJobs';
import Recommendations from './pages/Recommendations';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Posts Routes */}
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/posts/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          
          {/* Applications Routes */}
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:postId/applications"
            element={
              <ProtectedRoute>
                <PostApplications />
              </ProtectedRoute>
            }
          />
          
          {/* Saved Jobs Route */}
          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobs />
              </ProtectedRoute>
            }
          />
          
          {/* Recommendations Route */}
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          
          {/* Chat Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* AI Chatbot - available on all pages */}
        <Chatbot />
      </Router>
      </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
