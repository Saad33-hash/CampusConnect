import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const data = await authAPI.verifyEmail(token);
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Verifying Your Email</h1>
            <p className="text-slate-500">Please wait while we verify your email address...</p>
          </>
        );
      
      case 'success':
        return (
          <>
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Email Verified</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Continue to Login
            </Link>
          </>
        );
      
      case 'error':
        return (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Verification Failed</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition text-center"
              >
                Go to Login
              </Link>
              <p className="text-slate-400 text-sm">
                Need a new verification link? Login and request a new one.
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 w-full max-w-md text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
