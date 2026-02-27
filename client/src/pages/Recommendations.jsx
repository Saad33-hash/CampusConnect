import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Icons
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TYPE_CONFIG = {
  'academic-project': { label: 'Academic', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-600' },
  'startup-gig': { label: 'Startup', gradient: 'from-orange-500 to-rose-500', bg: 'bg-orange-500/10', text: 'text-orange-600' },
  'part-time-job': { label: 'Part-time', gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/10', text: 'text-cyan-600' },
  'hackathon': { label: 'Hackathon', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
};

const getReasonIcon = (icon) => {
  switch (icon) {
    case 'check': return <CheckIcon />;
    case 'clock': return <ClockIcon />;
    case 'fire': return <FireIcon />;
    case 'heart': return <HeartIcon />;
    case 'building': return <BuildingIcon />;
    case 'alert': return <AlertIcon />;
    default: return <CheckIcon />;
  }
};

const RecommendationCard = ({ recommendation }) => {
  const { post, rankingScore, reasons } = recommendation;
  const typeConfig = TYPE_CONFIG[post.type] || TYPE_CONFIG['academic-project'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-amber-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <Link
      to={`/posts/${post._id}`}
      className="block bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-linear-to-r ${typeConfig.gradient}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.text} mb-2`}>
              {typeConfig.label}
            </span>
            <h3 className="font-semibold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
          
          {/* Ranking Score Circle */}
          <div className={`shrink-0 w-14 h-14 rounded-full bg-linear-to-br ${getScoreColor(rankingScore)} flex items-center justify-center shadow-md`}>
            <div className="text-center">
              <span className="text-white font-bold text-sm">{rankingScore}</span>
              <span className="text-white/80 text-[8px] block -mt-0.5">score</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm line-clamp-2 mb-3">
          {post.description}
        </p>

        {/* Skills */}
        {post.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                {skill}
              </span>
            ))}
            {post.requiredSkills.length > 4 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                +{post.requiredSkills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Recommendation Reasons */}
        {reasons?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            {reasons.map((reason, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  reason.type === 'urgent' ? 'bg-red-50 text-red-600' :
                  reason.type === 'trending' ? 'bg-orange-50 text-orange-600' :
                  reason.type === 'new' ? 'bg-green-50 text-green-600' :
                  reason.type === 'skills' ? 'bg-blue-50 text-blue-600' :
                  reason.type === 'campus' ? 'bg-purple-50 text-purple-600' :
                  'bg-slate-50 text-slate-600'
                }`}
              >
                {getReasonIcon(reason.icon)}
                {reason.text}
              </span>
            ))}
          </div>
        )}

        {/* Creator info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {post.creator?.avatar ? (
            <img src={post.creator.avatar} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className={`w-6 h-6 rounded-full bg-linear-to-br ${typeConfig.gradient} flex items-center justify-center text-white text-xs font-bold`}>
              {post.creator?.displayName?.[0] || '?'}
            </div>
          )}
          <span className="text-sm text-slate-600 truncate">{post.creator?.displayName}</span>
          {post.creator?.university && (
            <span className="text-xs text-slate-400 truncate hidden sm:inline">• {post.creator.university}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'top-matches', label: 'Best Matches' },
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'Just Posted' },
    { id: 'closing-soon', label: 'Closing Soon' },
  ];

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (activeCategory === 'all') {
        response = await recommendationsAPI.getRecommendations({ limit: 20 });
      } else {
        response = await recommendationsAPI.getCategoryRecommendations(activeCategory, 20);
      }
      
      setRecommendations(response.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Recommended for You
            </h1>
            <p className="text-slate-600">
              AI-powered recommendations based on your profile, skills, and activity
            </p>
          </div>

        {/* Profile completion prompt */}
        {user && (!user.skills?.length || !user.interests?.length) && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">Complete your profile for better recommendations</p>
                <p className="text-sm text-blue-700">Add skills and interests to get more accurate matches</p>
              </div>
              <Link
                to="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </Link>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-200">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No recommendations yet</h3>
            <p className="text-slate-600 mb-4">
              {activeCategory !== 'all' 
                ? 'Try a different category or check back later'
                : 'Complete your profile to get personalized recommendations'}
            </p>
            <Link
              to="/posts"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Opportunities
            </Link>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, idx) => (
              <RecommendationCard key={rec.post._id || idx} recommendation={rec} />
            ))}
          </div>
        )}

        {/* Score Legend */}
        {!loading && recommendations.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-3">How rankings work</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">80+ Excellent match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">60-79 Good match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-slate-600">40-59 Potential match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <span className="text-slate-600">&lt;40 Low match</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Scores are based on skills match (40%), behavior patterns (20%), post freshness (15%), profile fit (15%), and popularity (10%)
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

