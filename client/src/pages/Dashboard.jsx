import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, activeRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header with gradient accent */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-8 rounded-full ${activeRole === 'talent-finder' ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
            </h1>
          </div>
          <p className="text-slate-500 ml-5">
            {activeRole === 'talent-finder' 
              ? 'Find talented students for your projects and opportunities' 
              : 'Discover jobs and opportunities that match your skills'}
          </p>
        </div>

        {/* Role-specific Dashboard */}
        {activeRole === 'talent-finder' ? (
          <TalentFinderDashboard user={user} />
        ) : (
          <TalentSeekerDashboard user={user} />
        )}
      </main>
    </div>
  );
};

// Talent Finder Dashboard - For posting jobs/opportunities
const TalentFinderDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Posts" value="0" icon="briefcase" color="amber" />
        <StatCard title="Total Applications" value="0" icon="users" color="blue" />
        <StatCard title="Views This Week" value="0" icon="eye" color="slate" />
        <StatCard title="Response Rate" value="0%" icon="chart" color="emerald" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Posts Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">My Posts</h2>
              <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </button>
            </div>
            
            {/* Empty State */}
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">No posts yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Create your first job posting to start finding talented students for your projects
              </p>
              <button className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium hover:text-amber-700 transition">
                Create your first post
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Applications</h2>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">0 new</span>
            </div>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No applications yet</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-2">
              <QuickActionButton icon="plus" label="Post a Job" color="amber" />
              <QuickActionButton icon="users" label="View Applicants" color="blue" />
              <QuickActionButton icon="message" label="Messages" color="slate" />
              <QuickActionButton icon="analytics" label="View Analytics" color="emerald" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Talent Seeker Dashboard - For browsing jobs
const TalentSeekerDashboard = ({ user }) => {
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
        <StatCard title="Applications Sent" value="0" icon="send" color="blue" />
        <StatCard title="Saved Jobs" value="0" icon="bookmark" color="amber" />
        <StatCard title="Profile Views" value="0" icon="eye" color="slate" />
        <StatCard title="Match Score Avg" value="--" icon="chart" color="emerald" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Listings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recommended for You</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Empty State */}
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">No jobs available yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Complete your profile to get personalized job recommendations
              </p>
              <button className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition">
                Browse all categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
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
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">0 active</span>
            </div>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No applications yet</p>
            </div>
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

// Quick Action Button Component
const QuickActionButton = ({ icon, label, color }) => {
  const colorClasses = {
    amber: 'hover:bg-amber-50 hover:text-amber-700',
    blue: 'hover:bg-blue-50 hover:text-blue-700',
    slate: 'hover:bg-slate-50 hover:text-slate-700',
    emerald: 'hover:bg-emerald-50 hover:text-emerald-700',
  };

  const iconColorClasses = {
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    slate: 'text-slate-400',
    emerald: 'text-emerald-500',
  };

  const icons = {
    plus: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    users: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    message: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    analytics: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 rounded-lg transition ${colorClasses[color]}`}>
      <span className={iconColorClasses[color]}>{icons[icon]}</span>
      <span className="font-medium">{label}</span>
    </button>
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
