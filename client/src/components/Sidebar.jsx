import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { activeRole, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [switching, setSwitching] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSwitchRole = async () => {
    setSwitching(true);
    const target = activeRole === 'talent-finder' ? 'talent-seeker' : 'talent-finder';
    await switchRole(target);
    setSwitching(false);
  };

  // Only show sidebar in talent-finder mode
  if (activeRole !== 'talent-finder') {
    return null;
  }

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-18'} shrink-0 min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
      <div className="flex flex-col flex-1 py-4 px-3">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition mb-4"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          {sidebarOpen && <span className="text-sm font-medium">Menu</span>}
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {sidebarOpen && <span className="text-sm">Dashboard</span>}
          </Link>

          {/* Create Post */}
          <Link
            to="/posts/create"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/posts/create')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/posts/create') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {sidebarOpen && <span className="text-sm">Create Post</span>}
          </Link>

          {/* Explore Opportunities */}
          <Link
            to="/posts"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/posts') && !location.search.includes('filter=my')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/posts') && !location.search.includes('filter=my') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {sidebarOpen && <span className="text-sm">Opportunities</span>}
          </Link>

          {/* My Applications */}
          <Link
            to="/my-applications"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/my-applications')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/my-applications') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="text-sm">Applications</span>}
          </Link>

          {/* Messages */}
          <Link
            to="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/chat')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/chat') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-12.375 0c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12z" />
            </svg>
            {sidebarOpen && <span className="text-sm">Messages</span>}
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className={`w-5 h-5 shrink-0 ${isActive('/profile') ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {sidebarOpen && <span className="text-sm">Profile</span>}
          </Link>

          {/* Divider */}
          <div className="my-3 border-t border-slate-200" />

          {/* Role Section */}
          {sidebarOpen ? (
            <div className="px-1">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider leading-none mb-0.5">Current Role</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {activeRole === 'talent-finder' ? 'Talent Finder' : 'Talent Seeker'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSwitchRole}
                  disabled={switching}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 disabled:opacity-50"
                >
                  {switching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Switching...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      Switch to {activeRole === 'talent-finder' ? 'Talent Seeker' : 'Talent Finder'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSwitchRole}
              disabled={switching}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
              title="Switch Role"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
          )}
        </nav>
      </div>
    </aside>
  );
}
