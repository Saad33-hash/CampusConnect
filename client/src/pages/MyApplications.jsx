import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  reviewing: { label: 'In Review', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  accepted: { label: 'Accepted', bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const TYPE_CONFIG = {
  'academic-project': { label: 'Academic Project', bg: 'bg-slate-100', text: 'text-slate-600' },
  'startup-gig': { label: 'Startup Gig', bg: 'bg-slate-100', text: 'text-slate-600' },
  'part-time-job': { label: 'Part-time Job', bg: 'bg-slate-100', text: 'text-slate-600' },
  'hackathon': { label: 'Hackathon', bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function MyApplications() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [withdrawing, setWithdrawing] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        applicationsAPI.getMyApplications({ status: filter === 'all' ? undefined : filter, page, limit: 8 }),
        applicationsAPI.getMyStats()
      ]);
      setApplications(appsRes.applications || []);
      setPagination(appsRes.pagination || { pages: 1, total: 0 });
      setStats(statsRes.stats || { total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
    } catch (error) {
      showToast('Failed to load applications', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter, page, showToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (applicationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    setWithdrawing(applicationId);
    try {
      await applicationsAPI.withdrawApplication(applicationId);
      showToast('Application withdrawn', 'success');
      fetchApplications();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to withdraw application', 'error');
    } finally {
      setWithdrawing(null);
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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'w', seconds: 604800 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 },
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count}${interval.label} ago`;
      }
    }
    return 'just now';
  };

  const FILTER_OPTIONS = [
    { value: 'all', label: 'All', icon: 'M4 6h16M4 12h16M4 18h16' },
    { value: 'pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'reviewing', label: 'In Review', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { value: 'shortlisted', label: 'Shortlisted', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { value: 'accepted', label: 'Accepted', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'rejected', label: 'Rejected', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  // Calculate percentages for the visual chart
  const getPercentage = (value) => {
    if (stats.total === 0) return 0;
    return Math.round((stats[value] / stats.total) * 100);
  };

  // Simple donut chart component
  const DonutChart = () => {
    const data = [
      { key: 'pending', value: stats.pending || 0 },
      { key: 'reviewing', value: stats.reviewing || 0 },
      { key: 'shortlisted', value: stats.shortlisted || 0 },
      { key: 'accepted', value: stats.accepted || 0 },
      { key: 'rejected', value: stats.rejected || 0 },
    ];
    
    const total = stats.total || 1;
    let cumulativePercent = 0;
    
    // Generate conic gradient stops
    const gradientStops = data.map((item, index) => {
      const percent = (item.value / total) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      // Using different shades of slate/blue
      const colors = ['#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'];
      return `${colors[index]} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
      <div className="relative w-32 h-32">
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            background: stats.total > 0 
              ? `conic-gradient(${gradientStops})` 
              : '#e2e8f0'
          }}
        />
        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full bg-blue-600"></div>
              <h1 className="text-2xl font-semibold text-slate-900">My Applications</h1>
            </div>
            <p className="text-slate-500 ml-5 text-sm">Track and manage your job applications</p>
          </div>

          {/* Stats Overview with Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Donut Chart */}
              <div className="flex items-center justify-center lg:justify-start">
                <DonutChart />
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {FILTER_OPTIONS.filter(o => o.value !== 'all').map((option) => {
                  const count = stats[option.value] || 0;
                  const percentage = getPercentage(option.value);
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => { setFilter(option.value); setPage(1); }}
                      className={`group relative rounded-xl border p-4 transition-all duration-300 text-left ${
                        filter === option.value 
                          ? 'border-slate-300 bg-slate-50 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                        filter === option.value ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}>
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
                        </svg>
                      </div>

                      {/* Label & Count */}
                      <p className={`text-xs font-medium mb-1 ${
                        filter === option.value ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {option.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-xl font-bold ${
                          filter === option.value ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {count}
                        </p>
                        <span className="text-xs text-slate-400">{percentage}%</span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend / Quick Filter */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Quick filter:</span>
              <button
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Show All ({stats.total})
              </button>
            </div>
          </div>

          {/* Applications Grid - 2 cards per row with larger size */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Start applying to opportunities to track them here.</p>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Browse Opportunities
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <>
              {/* Applications Grid - 2 cards per row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {applications.map((app) => {
                  const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  const typeConfig = TYPE_CONFIG[app.post?.type] || TYPE_CONFIG['part-time-job'];
                  
                  return (
                    <Link
                      key={app._id}
                      to={`/posts/${app.post?._id}`}
                      className="group block bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-8">
                        {/* Header with Type & Status */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                            {typeConfig.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusConfig.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            <span className={statusConfig.text}>{statusConfig.label}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-slate-700 transition-colors leading-snug">
                          {app.post?.title || 'Post deleted'}
                        </h3>

                        {/* Creator Info */}
                        <div className="flex items-center gap-3 mb-5">
                          {app.post?.creator?.avatar ? (
                            <img
                              src={app.post.creator.avatar}
                              alt={app.post.creator.displayName}
                              className="w-8 h-8 rounded-full border-2 border-slate-100"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                              {app.post?.creator?.displayName?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="text-sm text-slate-600">
                            {app.post?.creator?.displayName || 'Unknown'}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-5">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Applied {getTimeAgo(app.appliedAt)}
                          </span>
                          {app.post?.deadline && (
                            <span className={`flex items-center gap-1.5 ${new Date(app.post.deadline) < new Date() ? 'text-slate-400' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Due {formatDate(app.post.deadline)}
                            </span>
                          )}
                        </div>

                        {/* Interview Section */}
                        {app.interview?.status === 'scheduled' && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-5">
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Interview Scheduled
                              </span>
                              <span className="text-sm text-slate-500">
                                {formatInterviewDate(app.interview.scheduledAt)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); navigate(`/interview/${app._id}`); }}
                              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Join Interview
                            </button>
                          </div>
                        )}

                        {app.interview?.status === 'completed' && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Interview completed
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                            View Details →
                          </span>
                          {['pending', 'reviewing'].includes(app.status) && (
                            <button
                              onClick={(e) => handleWithdraw(app._id, e)}
                              disabled={withdrawing === app._id}
                              className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              {withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-8 bg-white rounded-2xl border border-slate-200 px-6 py-4">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{pagination.pages}</span>
                    <span className="text-slate-400 ml-2">({pagination.total} applications)</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
