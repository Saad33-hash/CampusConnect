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
            <TalentSeekerDashboard user={user} />
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
const TalentSeekerDashboard = ({ user }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [appStats, setAppStats] = useState({ total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, statsRes, appsRes] = await Promise.all([
        postsAPI.getPosts({ limit: 5, status: 'open' }),
        applicationsAPI.getMyStats(),
        applicationsAPI.getMyApplications({ limit: 3 })
      ]);
      setRecentPosts(postsRes.posts || []);
      setAppStats(statsRes.stats || { total: 0, pending: 0, reviewing: 0, shortlisted: 0, accepted: 0, rejected: 0 });
      setRecentApps(appsRes.applications || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate profile completion
  const profileChecks = [
    { label: 'Add your skills', completed: user?.skills?.length > 0 },
    { label: 'Add your interests', completed: user?.interests?.length > 0 },
    { label: 'Upload resume', completed: !!user?.resumeUrl },
    { label: 'Add university info', completed: !!user?.university },
  ];
  const completedCount = profileChecks.filter(c => c.completed).length;
  const completionPercent = Math.round((completedCount / profileChecks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Applications" value={loading ? '-' : appStats.total || 0} icon="send" color="blue" />
        <StatCard title="In Review" value={loading ? '-' : (appStats.pending + appStats.reviewing) || 0} icon="eye" color="amber" />
        <StatCard title="Shortlisted" value={loading ? '-' : appStats.shortlisted || 0} icon="bookmark" color="emerald" />
        <StatCard title="Profile Complete" value={`${completionPercent}%`} icon="chart" color="slate" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Listings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Opportunities</h2>
              <Link to="/posts" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : recentPosts.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2">No opportunities available yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Check back soon for new opportunities
                </p>
                <Link to="/posts" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition">
                  Browse all opportunities
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              /* Posts List */
              <div className="divide-y divide-slate-100">
                {recentPosts.map((post) => (
                  <Link 
                    key={post._id} 
                    to={`/posts/${post._id}`}
                    className="block p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{post.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 capitalize">{post.type.replace('-', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.compensation?.type === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          post.compensation?.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {post.compensation?.type || 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="p-4 text-center border-t border-slate-100">
                  <Link to="/posts" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    Browse all opportunities
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Profile Completion</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                completionPercent === 100 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {completionPercent}%
              </span>
            </div>
            <div className="p-4">
              {/* Progress Bar */}
              <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="space-y-3">
                {profileChecks.map((item, index) => (
                  <ProfileCheckItem key={index} label={item.label} completed={item.completed} />
                ))}
              </div>
              <Link 
                to="/profile"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Complete Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* My Applications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">My Applications</h2>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{appStats.total || 0} total</span>
            </div>
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : recentApps.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No applications yet</p>
                <Link to="/posts" className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-2 inline-block">
                  Browse opportunities
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <Link
                    key={app._id}
                    to={`/posts/${app.post?._id}`}
                    className="block p-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{app.post?.title || 'Post'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                ))}
                <div className="p-3 text-center">
                  <Link to="/my-applications" className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View all applications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const bgClasses = {
    amber: 'bg-amber-50',
    blue: 'bg-blue-50',
    slate: 'bg-slate-100',
    emerald: 'bg-emerald-50',
  };

  const iconColorClasses = {
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    slate: 'text-slate-500',
    emerald: 'text-emerald-500',
  };

  const icons = {
    briefcase: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    eye: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    send: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    bookmark: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgClasses[color]} rounded-xl flex items-center justify-center ${iconColorClasses[color]}`}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
};

// Profile Check Item Component
const ProfileCheckItem = ({ label, completed }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        completed ? 'bg-emerald-100' : 'bg-slate-100'
      }`}>
        {completed ? (
          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        )}
      </div>
      <span className={`text-sm ${completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
  );
};

export default Dashboard;

