import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import ApplyModal from '../components/ApplyModal';

// SVG Icons
const AcademicIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StartupIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const HackathonIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const TYPE_CONFIG = {
  'academic-project': { label: 'Academic Project', Icon: AcademicIcon, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-600' },
  'startup-gig': { label: 'Startup Gig', Icon: StartupIcon, gradient: 'from-orange-500 to-rose-500', bg: 'bg-orange-500/10', text: 'text-orange-600' },
  'part-time-job': { label: 'Part-time Job', Icon: BriefcaseIcon, gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/10', text: 'text-cyan-600' },
  'hackathon': { label: 'Hackathon', Icon: HackathonIcon, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
};

const COMPENSATION_LABELS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  equity: 'Equity',
  negotiable: 'Negotiable',
};

const LOCATION_LABELS = {
  remote: 'Remote',
  'on-campus': 'On Campus',
  hybrid: 'Hybrid',
  flexible: 'Flexible',
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const response = await postsAPI.getPost(id);
      setPost(response.post);
    } catch {
      showToast('Post not found', 'error');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, navigate]);

  const checkApplicationStatus = useCallback(async () => {
    if (!user) return;
    setCheckingApplication(true);
    try {
      const response = await applicationsAPI.checkApplicationStatus(id);
      if (response.hasApplied) {
        setApplicationStatus(response.application);
      }
    } catch (error) {
      console.error('Failed to check application status:', error);
    } finally {
      setCheckingApplication(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (post && user) {
      checkApplicationStatus();
    }
  }, [post, user, checkApplicationStatus]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setActionLoading(true);
    try {
      await postsAPI.deletePost(id);
      showToast('Post deleted successfully', 'success');
      navigate('/posts');
    } catch {
      showToast('Failed to delete post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      const response = await postsAPI.publishPost(id);
      setPost(response.post);
      showToast('Post published successfully', 'success');
    } catch {
      showToast('Failed to publish post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (filled = false) => {
    setActionLoading(true);
    try {
      const response = await postsAPI.closePost(id, filled);
      setPost(response.post);
      showToast(filled ? 'Post marked as filled' : 'Post closed', 'success');
    } catch {
      showToast('Failed to close post', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG['academic-project'];
  const TypeIcon = typeConfig.Icon;
  const isOwner = user && post.creator?._id === user._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to opportunities</span>
        </Link>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          {/* Gradient Header Bar */}
          <div className={`h-2 bg-gradient-to-r ${typeConfig.gradient}`} />
          
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                    <TypeIcon className="w-4 h-4" />
                    {typeConfig.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    post.status === 'open' ? 'bg-emerald-500/10 text-emerald-600' :
                    post.status === 'draft' ? 'bg-amber-500/10 text-amber-600' :
                    post.status === 'filled' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      post.status === 'open' ? 'bg-emerald-500 animate-pulse' :
                      post.status === 'draft' ? 'bg-amber-500' :
                      post.status === 'filled' ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`} />
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{post.title}</h1>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  {post.status === 'draft' && (
                    <button
                      onClick={handlePublish}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 font-medium disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  {post.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleClose(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
                      >
                        Mark Filled
                      </button>
                      <button
                        onClick={() => handleClose(false)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
                      >
                        Close
                      </button>
                    </>
                  )}
                  <Link
                    to={`/posts/${post._id}/applications`}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25 font-medium"
                  >
                    Applications
                  </Link>
                  <Link
                    to={`/posts/${post._id}/edit`}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {post.creator?.avatar ? (
                  <img
                    src={post.creator.avatar}
                    alt={post.creator.displayName}
                    className="w-12 h-12 rounded-full ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center text-lg font-bold text-white shadow-md`}>
                    {post.creator?.displayName?.[0] || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{post.creator?.displayName}</p>
                  <p className="text-sm text-slate-500">
                    {post.creator?.university}
                    {post.creator?.department && ` · ${post.creator.department}`}
                  </p>
                </div>
              </div>
              {user && !isOwner && (
                <button
                  onClick={() => navigate(`/chat?user=${post.creator?._id}`)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 border-b border-slate-100">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Location</p>
              <p className="font-semibold text-slate-900">{LOCATION_LABELS[post.location]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Compensation</p>
              <p className="font-semibold text-slate-900">
                {COMPENSATION_LABELS[post.compensation?.type]}
                {post.compensation?.amount && ` · ${post.compensation.amount}`}
              </p>
            </div>
            {post.duration && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Duration</p>
                <p className="font-semibold text-slate-900">{post.duration}</p>
              </div>
            )}
            {post.teamSize && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Team Size</p>
                <p className="font-semibold text-slate-900">{post.teamSize} people</p>
              </div>
            )}
            {post.deadline && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Deadline</p>
                <p className={`font-semibold ${new Date(post.deadline) < new Date() ? 'text-red-500' : 'text-slate-900'}`}>
                  {formatDate(post.deadline)}
                </p>
              </div>
            )}
            {/* Type-specific fields */}
            {post.courseCode && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Course</p>
                <p className="font-semibold text-slate-900">{post.courseCode}</p>
              </div>
            )}
            {post.professor && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Professor</p>
                <p className="font-semibold text-slate-900">{post.professor}</p>
              </div>
            )}
            {post.companyName && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Company</p>
                <p className="font-semibold text-slate-900">{post.companyName}</p>
              </div>
            )}
            {post.eventDate && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Event Date</p>
                <p className="font-semibold text-slate-900">{formatDate(post.eventDate)}</p>
              </div>
            )}
            {post.venue && (
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Venue</p>
                <p className="font-semibold text-slate-900">{post.venue}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{post.description}</p>
            </div>
          </div>

          {/* Skills & Tags */}
          {(post.requiredSkills?.length > 0 || post.tags?.length > 0) && (
            <div className="p-6 md:p-8 border-b border-slate-100">
              {post.requiredSkills?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {post.tags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats & Apply */}
          <div className="p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium text-slate-700">{post.views}</span> views
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-slate-700">{post.applicationsCount || 0}</span> applications
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {!isOwner && post.status === 'open' && (
              <>
                {checkingApplication ? (
                  <div className="px-6 py-2.5 bg-slate-100 rounded-xl text-slate-500 font-medium">
                    Checking...
                  </div>
                ) : applicationStatus ? (
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      applicationStatus.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      applicationStatus.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                      applicationStatus.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
                      applicationStatus.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Application {applicationStatus.status}
                    </span>
                    <Link
                      to="/my-applications"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                ) : user ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowApplyModal(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => navigate(`/chat?user=${post.creator?._id}`)}
                      className="px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-semibold flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    Login to Apply
                  </Link>
                )}
              </>
            )}
          </div>

          {post.website && (
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <a
                href={post.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit website
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        post={post}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => {
          checkApplicationStatus();
          // Update application count
          setPost(prev => ({ ...prev, applicationsCount: (prev.applicationsCount || 0) + 1 }));
        }}
      />
    </div>
  );
}
