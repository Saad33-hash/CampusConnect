import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const RoleSwitcher = () => {
  const { activeRole, switchRole } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitch = async () => {
    const newRole = activeRole === 'talent-finder' ? 'talent-seeker' : 'talent-finder';
    setIsLoading(true);
    
    const result = await switchRole(newRole);
    setIsLoading(false);

    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message || 'Failed to switch role', 'error');
    }
  };

  const isFinder = activeRole === 'talent-finder';

  return (
    <button
      onClick={handleSwitch}
      disabled={isLoading}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition
        ${isFinder 
          ? 'bg-slate-900 text-white hover:bg-slate-800' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={`Switch to ${isFinder ? 'Talent Seeker' : 'Talent Finder'} mode`}
    >
      {isLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {isFinder ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <span className="hidden sm:inline">
            {isFinder ? 'Finding Talent' : 'Seeking Jobs'}
          </span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </>
      )}
    </button>
  );
};

export default RoleSwitcher;

