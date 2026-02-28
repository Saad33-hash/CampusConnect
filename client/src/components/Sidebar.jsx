import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const { user, activeRole, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [switching, setSwitching] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSwitchRole = async () => {
    setSwitching(true);
    const target = activeRole === 'talent-finder' ? 'talent-seeker' : 'talent-finder';
    await switchRole(target);
    setSwitching(false);
  };

  // Calculate profile completion for seekers
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    const fields = [
      user.displayName,
      user.avatar && user.avatar !== 'https://via.placeholder.com/150',
      user.university,
      user.department,
      user.year,
      user.bio,
      user.skills && user.skills.length > 0,
      user.resumeUrl
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Finder navigation items
  const finderNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
    { path: '/posts/create', label: 'Create Post', icon: 'M12 4.5v15m7.5-7.5h-15' },
    { path: '/posts', label: 'Opportunities', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { path: '/my-applications', label: 'Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path: '/chat', label: 'Messages', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.97-4.03 9-9 9a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z' },
    { path: '/profile', label: 'Profile', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ];

  // Seeker navigation items
  const seekerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
    { path: '/posts', label: 'Browse Jobs', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
    { path: '/my-applications', label: 'My Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path: '/saved-jobs', label: 'Saved Jobs', icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z' },
    { path: '/chat', label: 'Messages', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.97-4.03 9-9 9a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z' },
    { path: '/profile', label: 'Profile', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ];

  const navItems = activeRole === 'talent-finder' ? finderNavItems : seekerNavItems;
  const isFinder = activeRole === 'talent-finder';

  // Finder theme colors (Royal Blue)
  const finderColors = {
    activeBg: 'bg-[#EBF1FF]',
    activeText: 'text-[#1152d4]',
    hoverBg: 'hover:bg-[#EBF1FF]',
    hoverText: 'hover:text-[#1152d4]',
  };

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-18'} shrink-0 min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isFinder ? 'finder-theme' : ''}`}>
      <div className="flex flex-col flex-1 py-4 px-3">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition mb-4`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          {sidebarOpen && <span className="text-sm font-medium">Menu</span>}
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? isFinder 
                    ? `${finderColors.activeBg} ${finderColors.activeText} font-semibold`
                    : 'bg-blue-50 text-blue-600 font-semibold'
                  : isFinder
                    ? `text-[#1E293B] ${finderColors.hoverBg} ${finderColors.hoverText}`
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className={`w-5 h-5 shrink-0 ${isActive(item.path) ? (isFinder ? 'text-[#1152d4]' : 'text-blue-600') : 'text-[#64748B]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-[#E2E8F0]" />

          {/* Profile Completion for Seekers */}
          {activeRole === 'talent-seeker' && sidebarOpen && (
            <Link to="/profile" className="px-1 mb-3">
              <div className="bg-[#EBF1FF] rounded-xl p-3 border border-[#1152d4]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#1E293B]">Profile Completion</span>
                  <span className="text-xs font-bold text-[#1152d4]">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-[#1152d4] rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 100 && (
                  <p className="text-xs text-[#64748B] mt-2">Complete your profile to get better matches!</p>
                )}
              </div>
            </Link>
          )}

          {/* Profile Completion icon for collapsed seeker sidebar */}
          {activeRole === 'talent-seeker' && !sidebarOpen && (
            <Link
              to="/profile"
              className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[#64748B] hover:text-[#1152d4] hover:bg-[#EBF1FF] transition"
              title={`Profile ${profileCompletion}% complete`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 1 2-1m0 0l2 1 2-1m-2 1v3m0-3V9m0 0L9 8m6-2l-3 2-3-2m6 2v3" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#1152d4] text-white text-[8px] flex items-center justify-center font-bold">
                  {Math.round(profileCompletion / 10)}
                </div>
              </div>
            </Link>
          )}

          {/* Role Section */}
          {sidebarOpen ? (
            <div className="px-1">
              <div className={`rounded-lg p-3 ${isFinder ? 'bg-[#F8FAFC]' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFinder ? 'bg-[#EBF1FF]' : 'bg-green-100'}`}>
                    <svg className={`w-4 h-4 ${isFinder ? 'text-[#1152d4]' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isFinder ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#64748B] uppercase tracking-wider leading-none mb-0.5">Current Mode</p>
                    <p className={`text-sm font-semibold truncate ${isFinder ? 'text-[#1E293B]' : 'text-slate-800'}`}>
                      {isFinder ? 'Talent Finder' : 'Talent Seeker'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSwitchRole}
                  disabled={switching}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border text-xs font-medium transition-all duration-200 disabled:opacity-50 ${
                    isFinder 
                      ? 'border-[#E2E8F0] text-[#1E293B] hover:bg-[#EBF1FF] hover:text-[#1152d4] hover:border-[#1152d4]'
                      : 'border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  {switching ? (
                    <>
                      <div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${isFinder ? 'border-[#1152d4]' : 'border-blue-400'}`} />
                      Switching...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      Switch to {isFinder ? 'Seeker' : 'Finder'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSwitchRole}
              disabled={switching}
              className={`w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-[#64748B] transition disabled:opacity-50 ${
                isFinder 
                  ? 'hover:text-[#1152d4] hover:bg-[#EBF1FF]'
                  : 'hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={`Switch to ${isFinder ? 'Talent Seeker' : 'Talent Finder'}`}
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
