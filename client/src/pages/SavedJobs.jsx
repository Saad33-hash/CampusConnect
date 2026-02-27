import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { postsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

const SavedJobs = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const response = await postsAPI.getSavedPosts();
      setSavedPosts(response.posts || []);
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
      showToast('Failed to load saved jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await postsAPI.unsavePost(postId);
      setSavedPosts(prev => prev.filter(post => post._id !== postId));
      showToast('Removed from saved jobs', 'success');
    } catch (error) {
      console.error('Failed to unsave post:', error);
      showToast('Failed to remove from saved', 'error');
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 rounded-full bg-rose-500"></div>
              <h1 className="text-2xl font-semibold text-slate-900">Saved Jobs</h1>
            </div>
            <p className="text-slate-500 ml-5">
              Jobs and opportunities you've bookmarked for later
            </p>
          </div>

        {/* Content */}
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
        ) : savedPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-16 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-rose-100 to-rose-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold text-xl mb-3">No saved jobs yet</h3>
            <p className="text-slate-500 text-base mb-6 max-w-md mx-auto">
              Browse opportunities and click the bookmark icon to save jobs you're interested in
            </p>
            <Link 
              to="/posts" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
            >
              Browse Opportunities
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Saved Posts Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedPosts.map((post) => (
              <Link 
                key={post._id} 
                to={`/posts/${post._id}`}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-8 hover:bg-white/90 hover:border-slate-300/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                {/* Glassmorphism highlight */}
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Header with Type & Unsave */}
                <div className="relative flex items-center justify-between mb-5">
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                    {post.type?.replace('-', ' ') || 'Opportunity'}
                  </span>
                  <div className="flex items-center gap-2">
                    {post.compensation?.type === 'paid' && (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                        </svg>
                        Paid
                      </span>
                    )}
                    <button
                      onClick={(e) => handleUnsave(post._id, e)}
                      className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="relative text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                {/* Description Preview */}
                {post.description && (
                  <p className="relative text-base text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                    {post.description}
                  </p>
                )}

                {/* Skills Preview */}
                {post.requiredSkills?.length > 0 && (
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
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
          {savedPosts.length > 0 && (
            <div className="mt-4 text-center text-sm text-slate-500">
              {savedPosts.length} saved {savedPosts.length === 1 ? 'job' : 'jobs'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedJobs;

