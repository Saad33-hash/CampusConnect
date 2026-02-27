import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

// SVG Icons
const AllIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const AcademicIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StartupIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const HackathonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const POST_TYPES = [
  { value: '', label: 'All', Icon: AllIcon },
  { value: 'academic-project', label: 'Academic', Icon: AcademicIcon },
  { value: 'startup-gig', label: 'Startup', Icon: StartupIcon },
  { value: 'part-time-job', label: 'Part-time', Icon: BriefcaseIcon },
  { value: 'hackathon', label: 'Hackathon', Icon: HackathonIcon },
];



export default function Posts() {
  const { activeRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [type, setType] = useState(searchParams.get('type') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (type) params.type = type;
      if (search) params.search = search;

      const response = await postsAPI.getPosts(params);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [type, page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateSearchParams = (newParams) => {
    const params = { 
      type, 
      search, 
      page: '1',
      ...newParams
    };
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    updateSearchParams({ search });
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
    updateSearchParams({ type: newType });
  };

  const clearAllFilters = () => {
    setType('');
    setSearch('');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-8 rounded-full bg-blue-600"></div>
                <h1 className="text-2xl font-semibold text-slate-900">Explore Opportunities</h1>
              </div>
              <p className="text-slate-500 ml-5 text-sm">Discover projects and roles that match your expertise</p>
            </div>
          </div>

        {/* Sidebar + Content Layout */}
        <div className="flex gap-6 min-h-[calc(100vh-12rem)]">
          {/* Filter Sidebar (LEFT) */}
          <aside className="hidden lg:block w-64 shrink-0 self-stretch">
            <div className="sticky top-24 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-5 space-y-6 h-[calc(100vh-7rem)]">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FilterIcon />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
                </div>
                {type && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Opportunity Type */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</h4>
                <div className="space-y-1">
                  {POST_TYPES.map((postType) => {
                    const TypeIcon = postType.Icon;
                    const isActive = type === postType.value;
                    return (
                      <button
                        key={postType.value}
                        onClick={() => handleTypeChange(postType.value)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <TypeIcon />
                        {postType.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active filter indicator */}
              {type && (
                <>
                  <div className="border-t border-slate-100" />
                  <div className="bg-blue-50/60 rounded-xl px-3 py-2.5 text-center">
                    <p className="text-xs text-blue-600 font-medium">1 filter active</p>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Main Content (RIGHT) */}
          <div className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by title, skills, or keywords..."
                      className="w-full pl-12 pr-4 py-3.5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm"
                >
                  Search
                </button>
              </form>
            </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-all font-medium"
            >
              <FilterIcon />
              Filters
              {type && (
                <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">1</span>
              )}
            </button>
          </div>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
              <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</h4>
                    <div className="space-y-1">
                      {POST_TYPES.map((postType) => {
                        const MTypeIcon = postType.Icon;
                        const isActive = type === postType.value;
                        return (
                          <button
                            key={postType.value}
                            onClick={() => handleTypeChange(postType.value)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <MTypeIcon />
                            {postType.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {type && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full py-3 text-sm text-slate-500 hover:text-blue-600 font-medium border border-slate-200 rounded-xl transition-colors"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

            {/* Posts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No opportunities found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't find any posts matching your criteria. Try adjusting your filters.</p>
                {activeRole === 'talent-seeker' && (
                  <Link
                    to="/posts/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create the first post
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                              page === pageNum
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Results info */}
                <p className="text-center text-sm text-slate-400 mt-6">
                  Showing <span className="font-medium text-slate-600">{posts.length}</span> of <span className="font-medium text-slate-600">{pagination.total}</span> opportunities
                </p>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

