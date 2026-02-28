import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationsAPI, postsAPI, getFullResumeUrl, interviewsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  reviewing: { label: 'In Review', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const STATUS_ACTIONS = {
  pending: [
    { status: 'reviewing', label: 'Start Review', color: 'blue' },
    { status: 'rejected', label: 'Reject', color: 'red' }
  ],
  reviewing: [
    { status: 'shortlisted', label: 'Shortlist', color: 'purple' },
    { status: 'rejected', label: 'Reject', color: 'red' }
  ],
  shortlisted: [
    { status: 'accepted', label: 'Accept', color: 'emerald' },
    { status: 'rejected', label: 'Reject', color: 'red' }
  ],
  accepted: [],
  rejected: [
    { status: 'reviewing', label: 'Reconsider', color: 'blue' }
  ]
};

export default function PostApplications() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ all: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewApp, setInterviewApp] = useState(null);
  const [cancellingInterview, setCancellingInterview] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [postRes, appsRes] = await Promise.all([
        postsAPI.getPost(postId),
        applicationsAPI.getPostApplications(postId, { status: filter === 'all' ? undefined : filter })
      ]);
      setPost(postRes.post);
      setApplications(appsRes.applications || []);
      setCounts(appsRes.counts || { all: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
    } catch {
      showToast('Failed to load applications', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [postId, filter, showToast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      showToast(`Application ${newStatus}`, 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatInterviewDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancelInterview = async (applicationId) => {
    setCancellingInterview(applicationId);
    try {
      await interviewsAPI.cancelInterview(applicationId);
      showToast('Interview cancelled', 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel interview', 'error');
    } finally {
      setCancellingInterview(null);
    }
  };

  if (loading && !post) {
    return (
      <div className="finder-theme min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1152d4]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="finder-theme min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/posts/${postId}`} className="text-[#1152d4] hover:text-[#0d42a8] text-sm font-medium mb-2 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Post
            </Link>
            <h1 className="text-3xl font-bold text-[#1E293B]">Applications</h1>
            <p className="text-[#64748B] mt-1">{post?.title}</p>
          </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'].map((status) => {
            const config = STATUS_CONFIG[status] || {};
            const count = counts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === status
                    ? status === 'all' 
                      ? 'bg-[#1152d4] text-white' 
                      : `${config.bg} ${config.text}`
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#1152d4]/30'
                }`}
              >
                {status === 'all' ? 'All' : config.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  filter === status 
                    ? status === 'all' ? 'bg-[#0d42a8]' : 'bg-white/50'
                    : 'bg-[#EBF1FF]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.06)] p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-[#EBF1FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">No applications yet</h3>
            <p className="text-[#64748B]">Share your post to start receiving applications</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              const actions = STATUS_ACTIONS[app.status] || [];
              
              return (
                <div 
                  key={app._id} 
                  className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                  {/* Card Content */}
                  <div className="p-5">
                    {/* Header Section */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#1152d4] to-[#0d42a8] flex items-center justify-center text-white font-bold text-base shrink-0">
                        {app.applicant?.displayName?.slice(0, 2).toUpperCase() || 'UN'}
                      </div>
                      
                      {/* Name & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#1E293B] text-base truncate">
                            {app.applicant?.displayName || 'Unknown User'}
                          </h3>
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#64748B] mt-1">
                          {app.applicant?.university || 'University not specified'}
                          {app.applicant?.department && ` • ${app.applicant.department}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Skills Tags */}
                    {app.applicant?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {app.applicant.skills.slice(0, 4).map((skill) => (
                          <span 
                            key={skill} 
                            className="px-2 py-1 bg-[#EBF1FF] text-[#1152d4] rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.applicant.skills.length > 4 && (
                          <span className="px-2 py-1 text-xs text-[#64748B] font-medium">
                            +{app.applicant.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Proposal Section */}
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-[#1E293B] mb-1.5">Proposal</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                        {app.coverLetter || 'No cover letter provided by the applicant.'}
                      </p>
                    </div>
                    
                    {/* Interview Status Section */}
                    {app.interview?.status === 'scheduled' && app.interview?.scheduledAt ? (
                      <div className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#1E293B]">Interview Scheduled</p>
                            <p className="text-xs text-[#64748B]">{formatInterviewDate(app.interview.scheduledAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/interview/${app._id}`)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                          >
                            Join
                          </button>
                          <button
                            onClick={() => handleCancelInterview(app._id)}
                            disabled={cancellingInterview === app._id}
                            className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-medium disabled:opacity-50"
                          >
                            {cancellingInterview === app._id ? '...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : app.interview?.status === 'completed' ? (
                      <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1E293B]">Interview Completed</p>
                          <p className="text-xs text-[#64748B]">{app.interview?.scheduledAt ? formatInterviewDate(app.interview.scheduledAt) : 'Date not available'}</p>
                        </div>
                      </div>
                    ) : app.interview?.status === 'cancelled' ? (
                      <div className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#64748B]">Interview cancelled</p>
                        </div>
                        <button
                          onClick={() => setInterviewApp(app)}
                          className="px-3 py-1.5 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition text-xs font-medium"
                        >
                          Reschedule
                        </button>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Footer Section */}
                  <div className="px-5 py-3 bg-[#FAFBFC] border-t border-[#E2E8F0]">
                    {/* Top Row: Applied date & Links */}
                    <div className="flex items-center gap-3 text-xs mb-3">
                      <span className="text-[#64748B]">
                        Applied <span className="font-medium text-[#1E293B]">{formatDate(app.appliedAt)}</span>
                      </span>
                      {app.resumeUrl && (
                        <a 
                          href={getFullResumeUrl(app.resumeUrl)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#1152d4] hover:text-[#0d42a8] font-medium transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Resume
                        </a>
                      )}
                      {app.portfolioUrl && (
                        <a 
                          href={app.portfolioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#1152d4] hover:text-[#0d42a8] font-medium transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Portfolio
                          </a>
                        )}
                    </div>
                      
                    {/* Bottom Row: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Status Action Buttons */}
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          onClick={() => handleStatusUpdate(app._id, action.status)}
                          disabled={updatingId === app._id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                            action.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' :
                            action.color === 'purple' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200' :
                            action.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' :
                            action.color === 'red' ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' :
                            'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {updatingId === app._id ? '...' : action.label}
                        </button>
                      ))}
                      
                      {/* Schedule Interview Button (if no interview) */}
                      {!app.interview?.status && (
                        <button
                          onClick={() => setInterviewApp(app)}
                          className="px-2.5 py-1 bg-white text-[#1152d4] border border-[#1152d4] rounded-lg hover:bg-[#EBF1FF] transition text-xs font-medium"
                        >
                          Interview
                        </button>
                      )}
                      
                      {/* View Details Button - pushed to the right */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="ml-auto px-3 py-1 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition text-xs font-semibold"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {interviewApp && (
        <ScheduleInterviewModal
          application={interviewApp}
          onClose={() => setInterviewApp(null)}
          onScheduled={() => {
            setInterviewApp(null);
            fetchData();
          }}
        />
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1E293B]">Applicant Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] transition text-[#64748B]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Applicant Info Section */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#EBF1FF] rounded-full flex items-center justify-center text-[#1152d4] text-xl font-bold shrink-0">
                  {selectedApp.applicant?.displayName?.slice(0, 1).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-[#1E293B]">{selectedApp.applicant?.displayName || 'Unknown'}</h4>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[selectedApp.status]?.bg} ${STATUS_CONFIG[selectedApp.status]?.text}`}>
                      {STATUS_CONFIG[selectedApp.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B]">
                    {selectedApp.applicant?.university || 'University'} {selectedApp.applicant?.department && `• ${selectedApp.applicant.department}`}
                  </p>
                </div>
              </div>
              
              {/* Email Row */}
              <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] rounded-xl">
                <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${selectedApp.applicant?.email}`} className="text-sm text-[#1E293B] hover:text-[#1152d4] transition">
                  {selectedApp.applicant?.email || 'No email provided'}
                </a>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              {/* Applied Date */}
              <p className="text-xs text-[#64748B]">Applied {formatDate(selectedApp.appliedAt)}</p>

              {/* About Section */}
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About
                </h4>
                <p className="text-sm text-[#64748B] leading-relaxed">{selectedApp.applicant?.bio || 'No bio provided'}</p>
              </div>
              
              {/* Proposal Section */}
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Cover Letter / Proposal
                </h4>
                <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">{selectedApp.coverLetter || 'No cover letter provided'}</p>
              </div>
              
              {/* Highlighted Skills */}
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Highlighted Skills
                </h4>
                {selectedApp.highlightedSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.highlightedSkills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-[#EBF1FF] text-[#1152d4] rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B]">No skills highlighted</p>
                )}
              </div>

              {/* Links Section */}
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1152d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Attachments & Links
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedApp.resumeUrl && (
                    <a 
                      href={getFullResumeUrl(selectedApp.resumeUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1152d4] hover:bg-[#EBF1FF] hover:border-[#1152d4] transition font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Resume
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a 
                      href={selectedApp.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#1152d4] hover:bg-[#EBF1FF] hover:border-[#1152d4] transition font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Portfolio
                    </a>
                  )}
                  {!selectedApp.resumeUrl && !selectedApp.portfolioUrl && (
                    <p className="text-sm text-[#64748B]">No attachments provided</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFBFC]">
              <button
                onClick={() => navigate(`/chat?user=${selectedApp.applicant?._id}`)}
                className="w-full px-4 py-2.5 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

