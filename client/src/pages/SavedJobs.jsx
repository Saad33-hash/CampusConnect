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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading saved jobs...</p>
            </div>
          ) : savedPosts.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-linear-to-br from-rose-50 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2">No saved jobs yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Browse opportunities and click the bookmark icon to save jobs you're interested in
              </p>
              <Link 
                to="/posts" 
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
              >
                Browse Opportunities
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            /* Saved Posts List */
            <div className="divide-y divide-slate-100">
              {savedPosts.map((post) => (
                <Link 
                  key={post._id} 
                  to={`/posts/${post._id}`}
                  className="block p-5 hover:bg-slate-50 transition group"
                >
                  <div className="flex items-start gap-4">
                    {/* Post Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <span>{post.creator?.displayName || 'Unknown'}</span>
                            {post.creator?.university && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>{post.creator.university}</span>
                              </>
                            )}
                          </p>
                        </div>
                        
                        {/* Unsave Button */}
                        <button
                          onClick={(e) => handleUnsave(post._id, e)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove from saved"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {post.type?.replace('-', ' ') || 'Opportunity'}
                        </span>
                        {post.compensation?.type && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.compensation.type === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            post.compensation.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {post.compensation.type}
                          </span>
                        )}
                        {post.location?.type && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                            {post.location.type}
                          </span>
                        )}
                        {post.status !== 'open' && (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {post.status}
                          </span>
                        )}
                      </div>

                      {/* Skills Preview */}
                      {post.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {post.requiredSkills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {post.requiredSkills.length > 4 && (
                            <span className="px-2 py-0.5 text-slate-400 text-xs">
                              +{post.requiredSkills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer Info */}
                      <p className="text-xs text-slate-400 mt-3">
                        Posted {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

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

