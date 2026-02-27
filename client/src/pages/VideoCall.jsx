import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function VideoCall() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState(null);
  const [hasLeft, setHasLeft] = useState(false);

  // Leave call and go back
  const handleLeaveCall = useCallback(() => {
    setHasLeft(true);
  }, []);

  // Mark interview as complete (for post creator)
  const handleCompleteInterview = useCallback(async () => {
    try {
      await interviewsAPI.completeInterview(applicationId);
      showToast('Interview marked as complete', 'success');
      navigate(-1);
    } catch {
      showToast('Failed to mark interview complete', 'error');
    }
  }, [applicationId, navigate, showToast]);

  // Fetch interview data and join
  useEffect(() => {
    const joinInterview = async () => {
      try {
        setLoading(true);
        const response = await interviewsAPI.joinInterview(applicationId);
        
        if (response.success) {
          setCallData(response);
          setLoading(false);
        }
      } catch (err) {
        console.error('Join interview error:', err);
        setError(err.response?.data?.message || 'Failed to join interview');
        setLoading(false);
      }
    };

    joinInterview();
  }, [applicationId]);

  // Build Jitsi Meet URL with user's display name
  const getJitsiUrl = () => {
    if (!callData?.meetingUrl) return '';
    const displayName = encodeURIComponent(user?.displayName || 'Guest');
    // Add config parameters for better UX
    return `${callData.meetingUrl}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=false`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Join</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render call ended state
  if (hasLeft) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Interview Ended</h2>
          <p className="text-slate-400 mb-6">The video call has ended.</p>
          <div className="flex flex-col gap-3">
            {callData?.isOwner && (
              <button
                onClick={handleCompleteInterview}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Mark Interview Complete
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveCall}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-semibold">{callData?.postTitle || 'Interview'}</h1>
              <p className="text-slate-400 text-sm">
                {callData?.isOwner ? `with ${callData?.applicantName}` : 'Video Interview'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Video Container - Jitsi Meet iframe */}
      <div className="flex-1 p-4">
        <iframe
          src={getJitsiUrl()}
          className="w-full h-full min-h-[500px] bg-slate-800 rounded-2xl"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ border: 'none' }}
        />
      </div>

      {/* Footer with controls */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={handleLeaveCall}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            End Interview
          </button>
          {callData?.isOwner && (
            <button
              onClick={handleCompleteInterview}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
