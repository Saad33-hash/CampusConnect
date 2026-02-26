import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import Navbar from '../components/Navbar';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  reviewing: { label: 'In Review', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  accepted: { label: 'Accepted', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const TYPE_CONFIG = {
  'academic-project': { label: 'Academic Project', gradient: 'from-violet-500 to-purple-600' },
  'startup-gig': { label: 'Startup Gig', gradient: 'from-orange-500 to-rose-500' },
  'part-time-job': { label: 'Part-time Job', gradient: 'from-cyan-500 to-blue-600' },
  'hackathon': { label: 'Hackathon', gradient: 'from-emerald-500 to-teal-600' },
};

export default function MyApplications() {
  const { showToast } = useToast();
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
        applicationsAPI.getMyApplications({ status: filter === 'all' ? undefined : filter, page, limit: 10 }),
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

  const handleWithdraw = async (applicationId) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-600 mt-2">Track and manage your job applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <button
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`p-4 rounded-xl border transition-all ${
              filter === 'all' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className={`text-sm ${filter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Total</p>
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1); }}
              className={`p-4 rounded-xl border transition-all ${
                filter === key 
                  ? `${config.bg} border-transparent` 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-2xl font-bold ${filter === key ? config.text : 'text-slate-900'}`}>
                {stats[key] || 0}
              </p>
              <p className={`text-sm ${filter === key ? config.text : 'text-slate-500'}`}>{config.label}</p>
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-500 mb-4">Start applying to opportunities to see them here</p>
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
              >
                Browse Opportunities
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => {
                const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const typeConfig = TYPE_CONFIG[app.post?.type] || TYPE_CONFIG['part-time-job'];
                
                return (
                  <div key={app._id} className="p-5 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-4">
                      {/* Type indicator */}
                      <div className={`w-2 h-full min-h-[60px] rounded-full bg-gradient-to-b ${typeConfig.gradient}`} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/posts/${app.post?._id}`}
                              className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition truncate block"
                            >
                              {app.post?.title || 'Post deleted'}
                            </Link>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                              <span className="capitalize">{app.post?.type?.replace('-', ' ')}</span>
                              {app.post?.creator && (
                                <>
                                  <span>•</span>
                                  <span>by {app.post.creator.displayName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Status badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${statusConfig.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                            <span className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
                          </div>
                        </div>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Applied {formatDate(app.appliedAt)}
                          </span>
                          {app.post?.deadline && (
                            <span className={`flex items-center gap-1.5 ${new Date(app.post.deadline) < new Date() ? 'text-red-500' : ''}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Deadline: {formatDate(app.post.deadline)}
                            </span>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4">
                          <Link
                            to={`/posts/${app.post?._id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View Post
                          </Link>
                          {['pending', 'reviewing'].includes(app.status) && (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              disabled={withdrawing === app._id}
                              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {page} of {pagination.pages} ({pagination.total} applications)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
