import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { postsAPI, applicationsAPI } from '../services/api';

const Dashboard = () => {
  const { user, activeRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex">
        <Sidebar />
        
        {/* Role-specific Dashboard Content */}
        {activeRole === 'talent-finder' ? (
          <TalentFinderDashboard user={user} />
        ) : (
          <div className="flex-1 min-w-0 p-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 rounded-full bg-blue-600"></div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
                </h1>
              </div>
              <p className="text-slate-500 ml-5">Discover jobs and opportunities that match your skills</p>
            </div>
            <TalentSeekerDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

// Talent Finder Dashboard - For posting jobs/opportunities
const TalentFinderDashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalPosts: 0, openPosts: 0, totalViews: 0, totalApplications: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        postsAPI.getPostStats(),
        applicationsAPI.getRecruiterApplications({ limit: 8 })
      ]);
      setStats(statsRes.stats || { totalPosts: 0, openPosts: 0, totalViews: 0, totalApplications: 0 });
      setRecentApplications(appsRes.applications || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex-1 min-w-0 p-8 space-y-6">
      {/* Welcome Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 rounded-full bg-blue-600"></div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
          </h1>
        </div>
        <p className="text-slate-500 ml-5 text-sm">Find talented students for your projects and opportunities</p>
      </div>
      {/* Futuristic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <svg className="w-8 h-8 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Posts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '—' : stats.openPosts || 0}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <svg className="w-8 h-8 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Applications</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '—' : stats.totalApplications || 0}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <svg className="w-8 h-8 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Views</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '—' : stats.totalViews || 0}</p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <svg className="w-8 h-8 text-slate-400 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Posts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '—' : stats.totalPosts || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
              <p className="text-sm text-slate-400 mt-0.5">Latest candidates for your postings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-semibold">
                {stats.totalApplications || 0} total
              </span>
              <Link to="/posts?filter=my" className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition">
                View All
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-6 pb-6">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-slate-400 text-sm mt-3">Loading applications...</p>
              </div>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="px-6 pb-6">
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-700 font-semibold text-lg mb-1">No applications yet</h3>
                <p className="text-slate-400 text-sm max-w-xs text-center">Create a post and applications from candidates will show up here</p>
                <Link to="/posts/create" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Post
                </Link>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-xl mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-4">Applicant</div>
                <div className="col-span-3">Position</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* Application Rows */}
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <Link
                    key={app._id}
                    to={`/posts/${app.post._id}/applications`}
                    className="group grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-xl hover:bg-blue-50/50 transition-all duration-200"
                  >
                    {/* Applicant */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      {app.applicant.avatar ? (
                        <img src={app.applicant.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 ring-2 ring-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {app.applicant.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">{app.applicant.displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{app.applicant.email || 'No email'}</p>
                      </div>
                    </div>

                    {/* Position */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm text-slate-600 truncate">{app.post.title}</p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-sm text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        app.status === 'pending' ? 'bg-slate-100 text-slate-600' :
                        app.status === 'reviewing' ? 'bg-blue-50 text-blue-600' :
                        app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' :
                        app.status === 'accepted' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          app.status === 'pending' ? 'bg-slate-400' :
                          app.status === 'reviewing' ? 'bg-blue-500' :
                          app.status === 'shortlisted' ? 'bg-emerald-500' :
                          app.status === 'accepted' ? 'bg-green-500' :
                          'bg-red-500'
                        }`} />
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 flex justify-end">
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

// Talent Seeker Dashboard - For browsing jobs
const TalentSeekerDashboard = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [appStats, setAppStats] = useState({ total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, statsRes] = await Promise.all([
        postsAPI.getPosts({ limit: 6, status: 'open' }),
        applicationsAPI.getMyStats()
      ]);
      setRecentPosts(postsRes.posts || []);
      setAppStats(statsRes.stats || { total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Chart data for the bar visualization
  const chartData = [
    { label: 'Pending', value: appStats.pending || 0, color: 'bg-slate-400' },
    { label: 'In Review', value: appStats.reviewing || 0, color: 'bg-slate-500' },
    { label: 'Shortlisted', value: appStats.shortlisted || 0, color: 'bg-slate-600' },
    { label: 'Accepted', value: appStats.accepted || 0, color: 'bg-slate-700' },
    { label: 'Rejected', value: appStats.rejected || 0, color: 'bg-slate-300' },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // Type badge styling
  const getTypeBadge = (type) => {
    const styles = {
      'academic-project': { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Academic' },
      'startup-gig': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Startup' },
      'part-time-job': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Part-time' },
      'hackathon': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Hackathon' },
    };
    return styles[type] || { bg: 'bg-slate-100', text: 'text-slate-600', label: type };
  };

  return (
    <div className="space-y-8">
      {/* Application Stats with Graph */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Application Overview</h2>
              <p className="text-sm text-slate-500 mt-1">Track your job application progress</p>
            </div>
            <Link 
              to="/my-applications" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Stats Overview Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : appStats.total}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : appStats.pending}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Pending</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : appStats.reviewing}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">In Review</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : appStats.shortlisted}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Shortlisted</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : appStats.accepted}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Accepted</p>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="px-6 pb-6">
          <div className="bg-slate-50 rounded-xl p-5">
            <div className="flex items-end gap-3 h-32">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-24">
                    <div 
                      className={`w-full ${item.color} rounded-t-lg transition-all duration-700 ease-out`}
                      style={{ 
                        height: loading ? '0%' : `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 15 : 0)}%`,
                        minHeight: item.value > 0 ? '12px' : '0'
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium truncate w-full text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Opportunities - Card Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Discover Opportunities</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fresh opportunities matching your profile</p>
          </div>
          <Link 
            to="/posts" 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            Browse all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-8 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-24 mb-6" />
                <div className="h-6 bg-slate-200 rounded w-full mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-6" />
                <div className="h-20 bg-slate-100 rounded-xl mb-6" />
                <div className="flex gap-3">
                  <div className="h-8 bg-slate-200 rounded-lg w-20" />
                  <div className="h-8 bg-slate-200 rounded-lg w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-16 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold text-xl mb-3">No opportunities available yet</h3>
            <p className="text-slate-500 text-base mb-6 max-w-md mx-auto">
              New opportunities are being posted regularly. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentPosts.map((post) => {
              const typeBadge = getTypeBadge(post.type);
              return (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-8 hover:bg-white/90 hover:border-slate-300/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                >
                  {/* Glassmorphism highlight */}
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Type Badge */}
                  <div className="relative flex items-center justify-between mb-5">
                    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                      {typeBadge.label}
                    </span>
                    {post.compensation?.type === 'paid' && (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                        </svg>
                        Paid
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="relative text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Description Preview */}
                  <p className="relative text-base text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                    {post.description}
                  </p>

                  {/* Skills/Tags preview if available */}
                  {post.requiredSkills && post.requiredSkills.length > 0 && (
                    <div className="relative flex flex-wrap gap-2 mb-6">
                      {post.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {post.requiredSkills.length > 3 && (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium">
                          +{post.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="relative flex items-center justify-between pt-5 border-t border-slate-200/50">
                    <div className="flex items-center gap-3">
                      {post.creator?.avatar ? (
                        <img 
                          src={post.creator.avatar} 
                          alt={post.creator.displayName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                          {post.creator?.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <span className="block text-sm font-medium text-slate-900">
                          {post.creator?.displayName || 'Unknown'}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {post.creator?.university || 'University'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

