import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // Generate DiceBear avatar URL using initials
  const getAvatarUrl = () => {
    if (user?.avatar && !user.avatar.includes('placeholder')) {
      return user.avatar;
    }
    // Use DiceBear initials API
    const name = user?.displayName || user?.email || 'User';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e293b&textColor=ffffff`;
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="text-xl font-semibold text-slate-900">
            {/* Add your logo or app name here */}
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              /* Logged in - Show avatar with dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-slate-200 hover:border-slate-300 transition"
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user?.displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - Show Login/Signup buttons */
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
