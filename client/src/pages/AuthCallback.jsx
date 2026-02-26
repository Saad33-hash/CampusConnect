import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const authError = searchParams.get('error');

      if (authError) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (token) {
        const result = await handleOAuthCallback(token);
        if (result.success) {
          showToast('Authentication successful', 'success');
          navigate('/dashboard');
        } else {
          setError(result.message || 'Authentication failed');
          showToast('Authentication failed', 'error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError('No authentication token received');
        showToast('Authentication failed', 'error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        {error ? (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Failed</h2>
            <p className="text-slate-600">{error}</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Completing Sign In</h2>
            <p className="text-slate-500">Please wait while we authenticate you...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
