import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationsAPI, postsAPI, getFullResumeUrl } from '../services/api';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';

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

  if (loading && !post) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/posts/${postId}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Post
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600 mt-1">{post?.title}</p>
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
                      ? 'bg-slate-900 text-white' 
                      : `${config.bg} ${config.text}`
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {status === 'all' ? 'All' : config.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  filter === status 
                    ? status === 'all' ? 'bg-slate-700' : 'bg-white/50'
                    : 'bg-slate-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-500">Share your post to start receiving applications</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              const actions = STATUS_ACTIONS[app.status] || [];
              
              return (
                <div 
                  key={app._id} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {app.applicant?.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                              {app.applicant?.displayName || 'Unknown User'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                              {app.applicant?.university && (
                                <span>{app.applicant.university}</span>
                              )}
                              {app.applicant?.department && (
                                <>
                                  <span>•</span>
                                  <span>{app.applicant.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                            <span className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        {app.applicant?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {app.applicant.skills.slice(0, 5).map((skill) => (
                              <span 
                                key={skill} 
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  post?.requiredSkills?.includes(skill)
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                            {app.applicant.skills.length > 5 && (
                              <span className="px-2 py-1 text-xs text-slate-400">
                                +{app.applicant.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Cover Letter Preview */}
                        {app.coverLetter && (
                          <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                            {app.coverLetter}
                          </p>
                        )}
                        
                        {/* Meta & Actions */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Applied {formatDate(app.appliedAt)}</span>
                            {app.resumeUrl && (
                              <a 
                                href={getFullResumeUrl(app.resumeUrl)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Resume
                              </a>
                            )}
                            {app.portfolioUrl && (
                              <a 
                                href={app.portfolioUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Portfolio
                              </a>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                            >
                              {selectedApp?._id === app._id ? 'Hide Details' : 'View Details'}
                            </button>
                            {actions.map((action) => (
                              <button
                                key={action.status}
                                onClick={() => handleStatusUpdate(app._id, action.status)}
                                disabled={updatingId === app._id}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                                  action.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                  action.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                  action.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                  action.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                  'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {updatingId === app._id ? '...' : action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {selectedApp?._id === app._id && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                        {/* About */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">About</h4>
                          <p className="text-sm text-slate-600">{app.applicant?.bio || 'No bio provided'}</p>
                        </div>
                        
                        {/* Cover Letter */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">Cover Letter</h4>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{app.coverLetter || 'No cover letter provided'}</p>
                        </div>
                        
                        {/* Highlighted Skills */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">Highlighted Skills</h4>
                          {app.highlightedSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {app.highlightedSkills.map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No skills highlighted</p>
                          )}
                        </div>
                        
                        {/* Resume */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">Resume</h4>
                          {app.resumeUrl ? (
                            <a 
                              href={getFullResumeUrl(app.resumeUrl)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download Resume
                            </a>
                          ) : (
                            <p className="text-sm text-slate-500">No resume uploaded</p>
                          )}
                        </div>
                        
                        {/* Contact */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">Contact</h4>
                          {app.applicant?.email ? (
                            <a href={`mailto:${app.applicant.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                              {app.applicant.email}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-500">Email not available</p>
                          )}
                          <button
                            onClick={() => navigate(`/chat?user=${app.applicant?._id}`)}
                            className="mt-2 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center gap-2"
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}

