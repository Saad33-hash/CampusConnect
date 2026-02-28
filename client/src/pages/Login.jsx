import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { GOOGLE_AUTH_URL, GITHUB_AUTH_URL, authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  const { login, error } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setNeedsVerification(false);
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      showToast('Authentication successful', 'success');
      navigate('/dashboard');
    } else {
      if (result.needsVerification) {
        setNeedsVerification(true);
      }
      showToast(result.message || 'Authentication failed', 'error');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    setResendingEmail(true);
    try {
      await authAPI.resendVerification(email);
      showToast('Verification email sent! Check your inbox.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend verification email', 'error');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  const handleGitHubLogin = () => {
    window.location.href = GITHUB_AUTH_URL;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 py-12 relative overflow-hidden font-['Inter']">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-600/6 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/4 backdrop-blur-2xl border border-white/8 rounded-3xl p-10 shadow-2xl shadow-black/30">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-slate-400 mt-1.5 text-sm">Sign in to continue where you left off</p>
        </div>

        {(error || localError) && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 mb-6 text-sm rounded-xl">
            {error || localError}
          </div>
        )}

        {needsVerification && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 mb-6 text-sm rounded-xl">
            <p className="font-medium mb-2">Email not verified</p>
            <p className="mb-3 text-amber-400/80">Please check your inbox for the verification link, or click below to resend.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="text-amber-300 underline font-medium hover:text-amber-200 disabled:opacity-50"
            >
              {resendingEmail ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-7 flex items-center">
          <div className="flex-1 border-t border-white/8"></div>
          <span className="px-4 text-sm text-slate-500">or continue with</span>
          <div className="flex-1 border-t border-white/8"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-slate-300 font-medium hover:bg-white/8 transition cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            onClick={handleGitHubLogin}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-slate-300 font-medium hover:bg-white/8 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

